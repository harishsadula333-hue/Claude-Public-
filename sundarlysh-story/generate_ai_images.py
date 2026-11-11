"""Generate AI wedding images with SDXL base + SDXL-Lightning 4-step UNet (CPU, bf16).
usage: gen.py <out_dir> <name>[,<name>...] [seeds_per_prompt]
"""
import sys, os, time, torch
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file

OUT = sys.argv[1]; NAMES = sys.argv[2].split(","); NSEED = int(sys.argv[3]) if len(sys.argv) > 3 else 2
os.makedirs(OUT, exist_ok=True)
STYLE = ", candid wedding photography, 85mm, natural skin, soft light, photorealistic"
PROMPTS = {
 "ai_hook1": "South Indian bride and groom at a temple wedding ceremony, foreheads gently touching, eyes closed, "
             "both wearing thick jasmine and red rose garlands, bride in maroon silk kanjeevaram saree with gold temple jewellery, "
             "groom in cream silk veshti and shirt, warm golden lamps and ornate carved temple background",
 "ai_hook2": "Indian groom tenderly kissing his bride's forehead, bride smiling softly with eyes closed, "
             "bride in embroidered green lehenga with kundan jewellery and braided hair with flowers, groom in dark green bandhgala, "
             "outdoor garden at golden hour, warm bokeh trees behind",
 "ai_r1":    "joyful Indian bride and groom smiling at each other, holding colourful flower garlands, "
             "bride in red bridal lehenga with gold embroidery and veil, groom in ivory sherwani and red turban, "
             "lavish pink floral wedding stage decor behind them",
 "ai_dance": "Indian bride in a yellow embroidered lehenga twirling and dancing with groom in a pastel sherwani at a sangeet night, "
             "laughing, warm fairy lights and hanging flower decor, joyful motion",
 "ai_petals":"Indian bride and groom laughing as they walk down an outdoor aisle while smiling guests shower them with pink rose petals, "
             "bride in pastel pink lehenga, groom in white sherwani, bright daylight, flowers everywhere",
 "ai_payoff":"happy Indian bride and groom embracing and laughing together, bride in pink and gold silk saree with jasmine flowers in her hair, "
             "groom in cream silk kurta and cream turban, lush green garden background",
 "ai_stress1":"young Indian woman sitting at a desk overwhelmed by wedding planning, hand on forehead, open planner notebook, laptop, "
             "fabric swatches and wedding invitation samples scattered on the desk, soft window light, home interior",
 "ai_stress2":"young Indian woman talking on her phone looking stressed, holding a wedding checklist and pen, "
             "sticky notes on the wall behind, soft natural light, home interior",
}
NEG = "cartoon, illustration, painting, deformed, extra fingers, bad hands, text, watermark, logo, blurry, lowres"

torch.set_num_threads(os.cpu_count())
base = os.environ['SDXL_DIR']
unet = UNet2DConditionModel.from_config(UNet2DConditionModel.load_config(base, subfolder="unet")).to(torch.bfloat16)
unet.load_state_dict(load_file(hf_hub_download("ByteDance/SDXL-Lightning", "sdxl_lightning_4step_unet.safetensors")))
pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.bfloat16, variant="fp16")
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing")
pipe.set_progress_bar_config(disable=True)
for name in NAMES:
    for s in range(NSEED):
        seed = 1000 + s * 7919
        f = os.path.join(OUT, f"{name}_s{seed}.png")
        if os.path.exists(f): continue
        t = time.time()
        with torch.inference_mode():
            im = pipe(PROMPTS[name] + STYLE, negative_prompt=NEG, num_inference_steps=4, guidance_scale=0,
                      width=768, height=1344, generator=torch.Generator().manual_seed(seed)).images[0]
        im.save(f); print(f"{name} seed {seed}: {time.time()-t:.0f}s", flush=True)
