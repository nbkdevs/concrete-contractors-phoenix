"""App icon: a sun over a poured slab with a measuring grid. Writes Android mipmaps and store icons."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

APP = Path(__file__).resolve().parents[1]
REPO = APP.parent

def draw(size=1024):
    s = 1024
    im = Image.new("RGBA", (s, s))
    d = ImageDraw.Draw(im)
    for y in range(s):  # sky gradient
        t = y / s
        c = (int(56 + 190 * t), int(30 + 90 * t), int(80 - 20 * t))
        d.line([(0, y), (s, y)], fill=c)
    glow = Image.new("L", (s, s), 0)
    ImageDraw.Draw(glow).ellipse([292, 180, 732, 620], fill=200)
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    im = Image.composite(Image.new("RGBA", (s, s), (255, 210, 130, 255)), im, glow)
    d = ImageDraw.Draw(im)
    d.ellipse([382, 270, 642, 530], fill=(255, 238, 190))
    # slab
    d.polygon([(120, 700), (512, 560), (904, 700), (512, 840)], fill=(232, 226, 218))
    d.polygon([(120, 700), (512, 840), (512, 910), (120, 770)], fill=(178, 170, 160))
    d.polygon([(512, 840), (904, 700), (904, 770), (512, 910)], fill=(150, 142, 133))
    # rebar grid on the slab
    for i in range(1, 6):
        t = i / 6
        a = (120 + (512 - 120) * t, 700 - 140 * t); b = (512 + (904 - 512) * t, 840 - 140 * t)
        d.line([a, b], fill=(200, 85, 61), width=10)
        a2 = (120 + (512 - 120) * t, 700 + 140 * t); b2 = (512 + (904 - 512) * t, 560 + 140 * t)
        d.line([a2, b2], fill=(200, 85, 61), width=10)
    return im.resize((size, size), Image.LANCZOS)

master = draw(1024)
(APP / "assets").mkdir(exist_ok=True)
master.save(APP / "assets" / "icon-1024.png")
for folder, px in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    master.resize((px, px), Image.LANCZOS).save(APP / f"android/app/src/main/res/mipmap-{folder}/ic_launcher.png")
sg = REPO / "store-graphics" / "amazon"
sg.mkdir(parents=True, exist_ok=True)
master.resize((512, 512), Image.LANCZOS).save(sg / "icon-512.png")
master.resize((114, 114), Image.LANCZOS).save(sg / "icon-114.png")
for n in (192, 512):
    master.resize((n, n), Image.LANCZOS).save(APP / f"web/icons/Icon-{n}.png")
master.resize((32, 32), Image.LANCZOS).save(APP / "web/favicon.png")
print("icons done")
