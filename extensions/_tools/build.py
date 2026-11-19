"""Build the Edge and Firefox packages from _shared/ into edge/, firefox/ and dist/*.zip (deterministic)."""
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAME = "Slab & Bag Calculator"
VERSION = "1.0.0"
DESCRIPTION = "Concrete volume for slabs, footings, columns and steps in cubic yards, with 80, 60 and 40 lb bag counts and rebar. Works offline."
GECKO_ID = "slab-bag-calculator@nbkdevs.github.io"  # neutral id, no site or brand


def manifest(browser):
    m = {
        "manifest_version": 3,
        "name": NAME,
        "short_name": "Slab & Bag",
        "version": VERSION,
        "description": DESCRIPTION,
        "icons": {"16": "icons/icon-16.png", "32": "icons/icon-32.png", "48": "icons/icon-48.png", "96": "icons/icon-96.png", "128": "icons/icon-128.png"},
        "action": {"default_title": NAME, "default_popup": "popup.html",
                   "default_icon": {"16": "icons/icon-16.png", "32": "icons/icon-32.png", "48": "icons/icon-48.png"}},
        "permissions": [],
    }
    if browser == "firefox":
        m["browser_specific_settings"] = {
            "gecko": {"id": GECKO_ID, "strict_min_version": "140.0", "data_collection_permissions": {"required": ["none"]}},
            "gecko_android": {"strict_min_version": "142.0"},
        }
    return m


def zip_dir(src, out):
    files = sorted((p for p in src.rglob("*") if p.is_file()), key=lambda p: (p.name != "manifest.json", str(p)))
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            zi = zipfile.ZipInfo(p.relative_to(src).as_posix(), (2026, 11, 19, 0, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.external_attr = 0o644 << 16
            z.writestr(zi, p.read_bytes())


for browser in ("edge", "firefox"):
    out = ROOT / browser
    keep = [p for p in out.glob("*.md")] if out.exists() else []
    saved = {p.name: p.read_text() for p in keep}
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "_shared", out)
    for n, t in saved.items():
        (out / n).write_text(t)
    (out / "manifest.json").write_text(json.dumps(manifest(browser), indent=2, ensure_ascii=False) + "\n")
    tmp = ROOT / "dist" / f".{browser}"
    if tmp.exists():
        shutil.rmtree(tmp)
    shutil.copytree(out, tmp, ignore=shutil.ignore_patterns("*.md"))
    zip_dir(tmp, ROOT / "dist" / f"slab-bag-calculator-{browser}-{VERSION}.zip")
    shutil.rmtree(tmp)
    print("built", browser)
