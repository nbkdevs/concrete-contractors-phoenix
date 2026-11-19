"""Render the Saguaro Sunset Chrome theme images (procedural, no external assets) and zip the theme."""
import json, math, random, zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
IMG = SRC / "images"
IMG.mkdir(parents=True, exist_ok=True)
random.seed(7)

SKY = [(0.00, (43, 26, 74)), (0.30, (110, 40, 104)), (0.52, (214, 76, 92)), (0.70, (245, 135, 70)), (0.82, (252, 190, 98)), (1.0, (255, 222, 150))]

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def sky_color(t):
    for (t0, c0), (t1, c1) in zip(SKY, SKY[1:]):
        if t <= t1: return lerp(c0, c1, (t - t0) / (t1 - t0))
    return SKY[-1][1]

def ridge(w, base, amp, rough, seed):
    rnd = random.Random(seed)
    pts, y = [], base
    octs = [(rnd.uniform(0, 6.28), f, a) for f, a in ((1.3, 1.0), (3.1, 0.45), (7.7, 0.2), (17.0, 0.08))]
    for x in range(0, w + 1, 4):
        u = x / w
        v = sum(a * math.sin(u * f * 6.28 + p) for p, f, a in octs)
        pts.append((x, base - amp * v - rough * rnd.random()))
    return pts

def mesa(d, x0, w, top, ground, color):
    d.polygon([(x0, ground), (x0 + w * 0.12, top + 20), (x0 + w * 0.18, top), (x0 + w * 0.80, top), (x0 + w * 0.86, top + 18), (x0 + w, ground)], fill=color)

def saguaro(d, x, ground, h, color):
    w = h * 0.11
    d.rounded_rectangle([x - w / 2, ground - h, x + w / 2, ground], radius=w / 2, fill=color)
    for side, at, arm in ((-1, 0.55, 0.30), (1, 0.42, 0.36)):
        ay = ground - h * at
        ax = x + side * w * 1.6
        d.rounded_rectangle([min(x, ax) - w * 0.1, ay - w * 0.42, max(x, ax) + w * 0.1, ay + w * 0.42], radius=w * 0.4, fill=color)
        d.rounded_rectangle([ax - w * 0.42, ay - h * arm, ax + w * 0.42, ay + w * 0.3], radius=w * 0.42, fill=color)

def scene(W, H, with_land=True):
    im = Image.new("RGB", (W, H))
    px = im.load()
    for y in range(H):
        c = sky_color(min(1, y / (H * 0.78)))
        for x in range(W):
            px[x, y] = c
    # sun with glow
    sx, sy, r = int(W * 0.62), int(H * 0.66), int(H * 0.13)
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([sx - r * 2.6, sy - r * 2.6, sx + r * 2.6, sy + r * 2.6], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(r * 0.9))
    im = Image.composite(Image.new("RGB", (W, H), (255, 214, 140)), im, glow)
    d = ImageDraw.Draw(im)
    d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(255, 236, 180))
    # sun bands
    for i, k in enumerate((0.25, 0.42, 0.58, 0.72)):
        by = sy + r * k
        d.rectangle([sx - r, by, sx + r, by + r * (0.04 + 0.02 * i)], fill=sky_color(0.80))
    # wispy clouds
    cl = Image.new("L", (W, H), 0)
    cd = ImageDraw.Draw(cl)
    for _ in range(14):
        cx, cy = random.uniform(0, W), random.uniform(H * 0.12, H * 0.5)
        cw, ch = random.uniform(W * 0.08, W * 0.25), random.uniform(H * 0.008, H * 0.02)
        cd.ellipse([cx - cw, cy - ch, cx + cw, cy + ch], fill=random.randint(60, 120))
    cl = cl.filter(ImageFilter.GaussianBlur(H * 0.01))
    im = Image.composite(Image.new("RGB", (W, H), (255, 170, 150)), im, cl)
    if not with_land:
        return im
    d = ImageDraw.Draw(im)
    g = int(H * 0.80)
    far = ridge(W, H * 0.70, H * 0.04, H * 0.004, 1)
    d.polygon(far + [(W, H), (0, H)], fill=(150, 66, 96))
    mesa(d, W * 0.06, W * 0.22, H * 0.62, H * 0.76, (118, 48, 84))
    mesa(d, W * 0.74, W * 0.16, H * 0.655, H * 0.78, (118, 48, 84))
    mid = ridge(W, H * 0.77, H * 0.03, H * 0.006, 2)
    d.polygon(mid + [(W, H), (0, H)], fill=(84, 34, 66))
    near = ridge(W, g + H * 0.03, H * 0.015, H * 0.004, 3)
    d.polygon(near + [(W, H), (0, H)], fill=(48, 22, 46))
    for x, h in ((0.10, 0.20), (0.18, 0.12), (0.86, 0.24), (0.93, 0.13), (0.40, 0.08), (0.70, 0.07)):
        saguaro(d, W * x, g + H * 0.035, H * h, (36, 16, 36))
    return im

ntp = scene(2560, 1440)
ntp.save(IMG / "ntp.jpg", quality=90)
frame = scene(1280, 1440, with_land=False).crop((0, 300, 1280, 400)).resize((1280, 100))
frame.save(IMG / "frame.png")
toolbar = Image.new("RGB", (1280, 120), (74, 34, 72)); toolbar.save(IMG / "toolbar.png")

manifest = {
    "manifest_version": 3,
    "name": "Saguaro Sunset",
    "version": "1.0.0",
    "description": "A warm desert sunset theme: violet sky, glowing sun, layered mesas and saguaro silhouettes.",
    "theme": {
        "images": {"theme_frame": "images/frame.png", "theme_toolbar": "images/toolbar.png", "theme_ntp_background": "images/ntp.jpg"},
        "colors": {
            "frame": [92, 36, 92], "frame_inactive": [70, 30, 74],
            "toolbar": [74, 34, 72], "tab_text": [255, 236, 210], "tab_background_text": [235, 200, 190],
            "bookmark_text": [255, 230, 205], "ntp_background": [43, 26, 74], "ntp_text": [255, 236, 210],
            "ntp_link": [252, 190, 98], "button_background": [255, 255, 255, 0], "omnibox_background": [52, 24, 54], "omnibox_text": [255, 236, 210],
            "toolbar_button_icon": [252, 200, 140]
        },
        "tints": {"buttons": [0.08, 0.6, 0.85]},
        "properties": {"ntp_background_alignment": "bottom", "ntp_background_repeat": "no-repeat"}
    },
    "icons": {"128": "images/icon-128.png"}
}
icon = scene(512, 512).resize((128, 128), Image.LANCZOS)
mask = Image.new("L", (128, 128), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, 127, 127], radius=28, fill=255)
ic = Image.new("RGBA", (128, 128)); ic.paste(icon, (0, 0), mask); ic.save(IMG / "icon-128.png")
(SRC / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

out = ROOT / "dist" / "saguaro-sunset-theme-1.0.0.zip"
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(SRC.rglob("*")):
        if p.is_file():
            zi = zipfile.ZipInfo(p.relative_to(SRC).as_posix(), (2026, 11, 19, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(zi, p.read_bytes())
print("theme ->", out)
