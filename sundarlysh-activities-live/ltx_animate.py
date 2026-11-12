"""Animate still images into short clips with LTX-Video 2B distilled (image-to-video, CPU, bf16).

phase 1:  ltx_animate.py encode  <motion_prompts.json> <embeds.pt>
phase 2:  ltx_animate.py animate <motion_prompts.json> <embeds.pt> <stills_dir> <out_dir> [name,name,...]
env: LTX_CKPT (single-file .safetensors), LTX_CFG (diffusers-format config dir, 0.9.5), T5_FILE (t5xxl safetensors)
"""
import sys, os, json, time, subprocess
import torch
torch.set_num_threads(os.cpu_count())
NEG = "worst quality, inconsistent motion, blurry, jittery, distorted face, deformed hands, morphing, text, watermark"
W, H, FRAMES, FPS = 512, 896, 49, 24

def encode(prompts_file, out):
    from transformers import T5EncoderModel, T5Tokenizer, T5Config
    from safetensors.torch import load_file
    cfg = os.environ["LTX_CFG"]
    tok = T5Tokenizer.from_pretrained(cfg, subfolder="tokenizer")
    config = T5Config.from_pretrained(cfg, subfolder="text_encoder")
    with torch.device("meta"):
        te = T5EncoderModel(config)
    sd = {k: v.to(torch.bfloat16) for k, v in load_file(os.environ["T5_FILE"]).items()}
    if "encoder.embed_tokens.weight" not in sd and "shared.weight" in sd:
        sd["encoder.embed_tokens.weight"] = sd["shared.weight"]
    missing, unexpected = te.load_state_dict(sd, strict=False, assign=True)
    print("missing:", [m for m in missing][:8], "unexpected:", unexpected[:8], flush=True)
    te = te.to(torch.bfloat16).eval()
    P = json.load(open(prompts_file)); res = {}
    for name, p in list(P.items()) + [("__neg__", NEG)]:
        ids = tok(p, padding="max_length", max_length=128, truncation=True, add_special_tokens=True, return_tensors="pt")
        with torch.inference_mode():
            e = te(ids.input_ids, attention_mask=ids.attention_mask)[0]
        res[name] = (e.to(torch.bfloat16), ids.attention_mask)
        print("encoded", name, flush=True)
    torch.save(res, out)

def animate(prompts_file, embeds_file, stills, out_dir, only=None):
    from diffusers import LTXConditionPipeline, LTXVideoTransformer3DModel, AutoencoderKLLTXVideo, FlowMatchEulerDiscreteScheduler
    from diffusers.pipelines.ltx.pipeline_ltx_condition import LTXVideoCondition
    from PIL import Image
    import numpy as np
    ckpt, cfg = os.environ["LTX_CKPT"], os.environ["LTX_CFG"]
    tr = LTXVideoTransformer3DModel.from_single_file(ckpt, config=cfg, subfolder="transformer", torch_dtype=torch.bfloat16)
    vae = AutoencoderKLLTXVideo.from_single_file(ckpt, config=cfg, subfolder="vae", torch_dtype=torch.bfloat16)
    sch = FlowMatchEulerDiscreteScheduler.from_pretrained(cfg, subfolder="scheduler")
    pipe = LTXConditionPipeline(scheduler=sch, vae=vae, text_encoder=None, tokenizer=None, transformer=tr)
    pipe.set_progress_bar_config(disable=True)
    E = torch.load(embeds_file); P = json.load(open(prompts_file)); os.makedirs(out_dir, exist_ok=True)
    names = only or list(P)
    for name in names:
        f = os.path.join(out_dir, f"{name}.mp4")
        if os.path.exists(f): continue
        img = Image.open(next(os.path.join(stills, x) for x in os.listdir(stills) if os.path.splitext(x)[0] == name)).convert("RGB").resize((W, H), Image.LANCZOS)
        pe, pm = E[name]
        t0 = time.time()
        with torch.inference_mode():
            frames = pipe(conditions=[LTXVideoCondition(image=img, frame_index=0)],
                          prompt_embeds=pe, prompt_attention_mask=pm,
                          width=W, height=H, num_frames=FRAMES, frame_rate=FPS,
                          timesteps=[1000, 993, 987, 981, 975, 909, 725, 0.03], guidance_scale=1.0,
                          decode_timestep=0.05, decode_noise_scale=0.025, image_cond_noise_scale=0.0,
                          generator=torch.Generator().manual_seed(42), output_type="np").frames[0]
        arr = (np.clip(frames, 0, 1) * 255).astype(np.uint8)
        ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                               "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", f], stdin=subprocess.PIPE)
        ff.stdin.write(arr.tobytes()); ff.stdin.close(); ff.wait()
        print(f"{name} {time.time() - t0:.0f}s", flush=True)

if __name__ == "__main__":
    if sys.argv[1] == "encode": encode(sys.argv[2], sys.argv[3])
    else: animate(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6].split(",") if len(sys.argv) > 6 else None)
