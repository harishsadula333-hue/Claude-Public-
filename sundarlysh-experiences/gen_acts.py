"""usage: gen_acts.py <prompts.json> <out_dir> <seeds_per_prompt>  (env SDXL_DIR)"""
import sys, os, json, time, torch
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
P = json.load(open(sys.argv[1])); OUT = sys.argv[2]; N = int(sys.argv[3]); os.makedirs(OUT, exist_ok=True)
STYLE = ", professional lifestyle photography, natural light, shallow depth of field, photorealistic"
NEG = "cartoon, illustration, deformed, extra fingers, bad hands, text, watermark, logo, blurry, lowres"
torch.set_num_threads(os.cpu_count()); base = os.environ["SDXL_DIR"]
unet = UNet2DConditionModel.from_config(UNet2DConditionModel.load_config(base, subfolder="unet")).to(torch.bfloat16)
unet.load_state_dict(load_file(hf_hub_download("ByteDance/SDXL-Lightning", "sdxl_lightning_4step_unet.safetensors")))
pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.bfloat16, variant="fp16")
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing")
pipe.set_progress_bar_config(disable=True)
for s in range(N):
    for name, prompt in P.items():
        seed = 2000 + s * 7919; f = os.path.join(OUT, f"{name}_s{seed}.png")
        if os.path.exists(f): continue
        t = time.time()
        with torch.inference_mode():
            im = pipe(prompt + STYLE, negative_prompt=NEG, num_inference_steps=4, guidance_scale=0, width=768, height=1344,
                      generator=torch.Generator().manual_seed(seed)).images[0]
        im.save(f); print(f"{name} {seed} {time.time()-t:.0f}s", flush=True)
