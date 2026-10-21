"""
Builds the admin console logos from the repo-root asp.png (navy artwork on a
transparent background).

  public/brand/asp-logo.png           navy lettering, for light backgrounds
  public/brand/asp-logo-reversed.png  lettering lifted to near-white, for dark backgrounds

Saffron, white and green in the swoosh are left untouched. Run from the repo
root:  py artifacts/aps-aero-tech/scripts/make_admin_logo.py  (requires Pillow)
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "asp.png"
OUT_DIR = ROOT / "artifacts" / "aps-aero-tech" / "public" / "brand"
WIDTH = 900
LIGHT = (236, 242, 250)


def is_navy(r: int, g: int, b: int) -> bool:
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return lum < 140 and b >= r and b >= g * 0.85


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    # drop near-invisible fringe pixels so the crop hugs the artwork
    alpha = src.getchannel("A").point(lambda a: 0 if a < 24 else a)
    src.putalpha(alpha)
    bbox = alpha.getbbox()
    pad = 8
    src = src.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(src.width, bbox[2] + pad), min(src.height, bbox[3] + pad)))
    height = round(src.height * WIDTH / src.width)
    light = src.resize((WIDTH, height), Image.LANCZOS)

    dark = light.copy()
    px = dark.load()
    for y in range(dark.height):
        for x in range(dark.width):
            r, g, b, a = px[x, y]
            if a and is_navy(r, g, b):
                px[x, y] = (*LIGHT, a)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    light.save(OUT_DIR / "asp-logo.png", optimize=True)
    dark.save(OUT_DIR / "asp-logo-reversed.png", optimize=True)
    print(f"wrote {WIDTH}x{height} logos to {OUT_DIR}")


if __name__ == "__main__":
    main()
