"""Compose store graphics from real renders (popup screenshots, app screenshots, theme images)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

SG = Path(__file__).resolve().parents[1]
REPO = SG.parent
F = "/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-"
def font(w, s): return ImageFont.truetype(F + w + ".ttf", s)

def gradient(w, h, top, bottom):
    im = Image.new("RGB", (w, h)); d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return im

def crop_content(path, pad=24):
    im = Image.open(path).convert("RGB")
    bg = Image.new("RGB", im.size, im.getpixel((5, im.height - 5)))
    l, t, r, b = ImageChops.difference(im, bg).getbbox()
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))

def shadowed(canvas, img, xy, radius=18):
    x, y = xy
    sh = Image.new("RGBA", (img.width + 80, img.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([40, 50, 40 + img.width, 50 + img.height], radius=radius, fill=(40, 20, 10, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(sh, (x - 40, y - 40), sh)
    mask = Image.new("L", img.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=radius, fill=255)
    canvas.paste(img, (x, y), mask)

def text_block(d, x, y, title, lines, color=(43, 26, 20), sub=(110, 84, 70), size=54, width=None):
    d.text((x, y), title, font=font("Bold", size), fill=color)
    yy = y + int(size * 1.35)
    for ln in lines:
        d.text((x, yy), ln, font=font("Regular", 26), fill=sub); yy += 40

# ---- extension screenshots (Edge, AMO; 1280x800) ----
ext = SG / "extension"; ext.mkdir(exist_ok=True)
shots = [
    ("slab", "Concrete for any slab", ["Driveways, patios and floors: cubic yards,", "order quantity and bags in one glance.", "Rebar or mesh for the same slab."]),
    ("column", "Columns and sonotubes", ["Round piers by diameter, depth and count.", "Know when bags beat a ready-mix truck."]),
    ("steps", "Steps and footings too", ["Solid steps from rise, run and width.", "Waste allowance you control.", "Works offline. No permissions."]),
]
for i, (s, title, lines) in enumerate(shots, 1):
    c = gradient(1280, 800, (251, 236, 214), (245, 200, 160))
    d = ImageDraw.Draw(c)
    pop = crop_content(SG / "_tools" / f"popup-{s}.png", pad=20)
    scale = 680 / pop.height
    pop = pop.resize((int(pop.width * scale), 680), Image.LANCZOS)
    shadowed(c, pop, (1280 - pop.width - 90, 60))
    text_block(d, 80, 250, title, lines)
    c.save(ext / f"screenshot-{i}-1280x800.png")
icon = Image.open(REPO / "extensions/_tools/logo-300.png").convert("RGBA")
logo = Image.new("RGBA", (300, 300), (0, 0, 0, 0)); logo.paste(icon, (0, 0), icon); logo.save(ext / "edge-logo-300x300.png")
icon.resize((128, 128), Image.LANCZOS).save(ext / "icon-128.png")
# small promo 440x280 (Edge optional)
p = gradient(440, 280, (251, 236, 214), (232, 150, 100)); d = ImageDraw.Draw(p)
p.paste(icon.resize((120, 120), Image.LANCZOS), (30, 80), icon.resize((120, 120), Image.LANCZOS))
d.text((165, 95), "Slab & Bag", font=font("Bold", 36), fill=(43, 26, 20)); d.text((165, 140), "Calculator", font=font("Bold", 36), fill=(43, 26, 20))
d.text((165, 192), "Yards, bags and rebar", font=font("Regular", 18), fill=(90, 60, 50))
p.save(ext / "promo-440x280.png")

# ---- theme (CWS) ----
th = SG / "theme"; th.mkdir(exist_ok=True)
ntp = Image.open(REPO / "themes/chrome/src/images/ntp.jpg").convert("RGB")
frame_c, toolbar_c = (92, 36, 92), (74, 34, 72)
for k, (w, h) in enumerate([(1280, 800)], 1):
    c = Image.new("RGB", (w, h), frame_c); d = ImageDraw.Draw(c)
    fr = Image.open(REPO / "themes/chrome/src/images/frame.png").convert("RGB").resize((w, 46)); c.paste(fr, (0, 0))
    d.rounded_rectangle([12, 8, 260, 46], radius=10, fill=toolbar_c)
    d.text((28, 15), "New Tab", font=font("Medium", 15), fill=(255, 236, 210))
    d.text((240, 14), "x", font=font("Regular", 15), fill=(235, 200, 190))
    d.text((280, 12), "+", font=font("Regular", 20), fill=(235, 200, 190))
    d.rectangle([0, 46, w, 92], fill=toolbar_c)
    for j, ch in enumerate(["<", ">", "C"]):
        d.text((18 + j * 34, 56), ch, font=font("Medium", 18), fill=(252, 200, 140))
    d.rounded_rectangle([120, 53, w - 80, 85], radius=16, fill=(52, 24, 54))
    d.text((140, 57), "Search or type a URL", font=font("Regular", 16), fill=(235, 200, 190))
    body = ntp.resize((w, int(ntp.height * w / ntp.width)), Image.LANCZOS)
    body = body.crop((0, body.height - (h - 92), w, body.height))
    c.paste(body, (0, 92))
    d.rounded_rectangle([w // 2 - 280, 300, w // 2 + 280, 348], radius=24, fill=(255, 255, 255))
    d.text((w // 2 - 255, 310), "Search the web", font=font("Regular", 18), fill=(120, 110, 110))
    c.save(th / f"screenshot-{k}-1280x800.png")
t = ntp.resize((440, int(ntp.height * 440 / ntp.width)), Image.LANCZOS).crop((0, 0, 440, 248))
tile = Image.new("RGB", (440, 280)); tile.paste(ntp.resize((498, 280), Image.LANCZOS).crop((29, 0, 469, 280)), (0, 0))
d = ImageDraw.Draw(tile)
d.text((24, 22), "Saguaro Sunset", font=font("Bold", 34), fill=(255, 240, 220))
d.text((26, 66), "Desert dusk theme", font=font("Regular", 18), fill=(255, 220, 190))
tile.save(th / "promo-440x280.png")
c.resize((640, 400), Image.LANCZOS).save(th / "screenshot-640x400.png")

# ---- Amazon feature graphic 1024x500 ----
am = SG / "amazon"
fg = gradient(1024, 500, (43, 26, 74), (232, 120, 70)); d = ImageDraw.Draw(fg)
appicon = Image.open(am / "icon-512.png").convert("RGBA").resize((150, 150), Image.LANCZOS)
m = Image.new("L", (150, 150), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 149, 149], radius=34, fill=255)
fg.paste(appicon, (60, 70), m)
d.text((60, 245), "Concrete Contractors", font=font("Bold", 44), fill=(255, 240, 220))
d.text((60, 300), "Estimator", font=font("Bold", 44), fill=(255, 240, 220))
d.text((62, 370), "Yards, bags, rebar, cost and pour-day plan", font=font("Regular", 22), fill=(255, 220, 190))
ph = Image.open(am / "screenshots/phone-1.png").convert("RGB").resize((243, 432), Image.LANCZOS)
ph2 = Image.open(am / "screenshots/phone-2.png").convert("RGB").resize((243, 432), Image.LANCZOS)
shadowed(fg, ph2, (735, 50), radius=22)
shadowed(fg, ph, (600, 34), radius=22)
fg.save(am / "feature-graphic-1024x500.png")
print("store graphics done")
