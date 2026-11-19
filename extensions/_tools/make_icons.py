"""Draw the extension icon (a poured slab with a bag) at 16/32/48/96/128 px."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "_shared" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

def icon(size):
    s = 512
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([16, 16, s - 16, s - 16], radius=110, fill=(200, 85, 61))
    # slab (isometric block)
    d.polygon([(96, 330), (300, 260), (430, 310), (226, 380)], fill=(236, 230, 222))
    d.polygon([(96, 330), (226, 380), (226, 420), (96, 370)], fill=(190, 182, 172))
    d.polygon([(226, 380), (430, 310), (430, 350), (226, 420)], fill=(160, 152, 143))
    # bag
    d.rounded_rectangle([250, 96, 400, 270], radius=26, fill=(233, 160, 59))
    d.rectangle([250, 96, 400, 126], fill=(205, 130, 40))
    d.rounded_rectangle([282, 160, 368, 222], radius=10, fill=(255, 246, 232))
    return im.resize((size, size), Image.LANCZOS)

for n in (16, 32, 48, 96, 128):
    icon(n).save(OUT / f"icon-{n}.png")
icon(300).save(OUT.parent.parent / "_tools" / "logo-300.png")
print("icons ->", OUT)
