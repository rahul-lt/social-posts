# Renders an animated story page to a looping GIF.
# The page must define render(t) for t in [0, 1). Usage: python3 scripts/news/gif.py <anim.html> <out.gif>
import sys, io, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

FRAMES, MS, HOLD_MS = 30, 90, 1600  # last frame holds so the final state can be read
W, H = 960, 1200  # 30 frames x 1.15M px stays under LinkedIn's 36.15M pixel cap

src, out = pathlib.Path(sys.argv[1]).resolve(), pathlib.Path(sys.argv[2])
frames = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": W, "height": H})
    page.goto(src.as_uri())
    page.wait_for_load_state("networkidle")
    page.evaluate("document.fonts.ready")
    for i in range(FRAMES):
        page.evaluate(f"render({i / (FRAMES - 1)})")
        frames.append(Image.open(io.BytesIO(page.screenshot())).convert("RGB"))
    b.close()

pal = frames[-1].quantize(colors=128, method=Image.Quantize.MEDIANCUT)
gif = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
gif[0].save(out, save_all=True, append_images=gif[1:], loop=0, optimize=True,
            duration=[MS] * (FRAMES - 1) + [HOLD_MS], disposal=1)
print(f"{out}: {FRAMES} frames, {out.stat().st_size / 1e6:.2f} MB")
