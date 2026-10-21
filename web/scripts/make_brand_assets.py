"""
Generates the reversed (dark-background) ASP Aero Tech logo from the original
full-colour artwork, which ships as an opaque RGB PNG on white.

  1. Flood-fill the white background from the image corners -> transparent.
  2. Soften the 2px edge band with a colour-to-alpha pass against white.
  3. Lift the navy lettering / icon to near-white so it reads on dark UI.
     Saffron and green are untouched.

Run from the web/ folder:  python scripts/make_brand_assets.py
Requires Pillow. The outputs are committed, so this only needs re-running
when the source logo changes. Ask your designer for an official reversed
logo when one exists and drop it into public/brand/ instead.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "attached_assets" / "ASP_FINAL_LOGO_1788509296182.png"
OUT_DIR = ROOT / "web" / "public" / "brand"

SENTINEL = (255, 0, 255)
LIGHT = (234, 241, 251)  # near-white with a cool tint, matches --color-fg


def is_navy(r: int, g: int, b: int) -> bool:
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return lum < 120 and b >= r and b >= g * 0.85


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    w, h = src.size

    # 1) background mask via flood fill from every corner
    filled = src.copy()
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(filled, xy, SENTINEL, thresh=22)
    diff = ImageChops.difference(filled, Image.new("RGB", (w, h), SENTINEL)).convert("L")
    bg = diff.point(lambda v: 255 if v < 2 else 0)  # 255 = background

    # 2) 2px band just inside the artwork edge, for soft anti-aliasing
    band = ImageChops.subtract(bg.filter(ImageFilter.MaxFilter(5)), bg)

    src_px, bg_px, band_px = src.load(), bg.load(), band.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_px = out.load()
    # same artwork with its original navy lettering, for light backgrounds
    light = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    light_px = light.load()

    for y in range(h):
        for x in range(w):
            if bg_px[x, y]:
                continue
            r, g, b = src_px[x, y]
            a = 255
            if band_px[x, y]:
                # colour-to-alpha against white: minimal alpha that explains the pixel
                a = max(255 - r, 255 - g, 255 - b)
                if a <= 4:
                    continue
                f = 255.0 / a
                r = int(min(255, max(0, 255 - (255 - r) * f)))
                g = int(min(255, max(0, 255 - (255 - g) * f)))
                b = int(min(255, max(0, 255 - (255 - b) * f)))
            light_px[x, y] = (r, g, b, a)
            if is_navy(r, g, b):
                r, g, b = LIGHT
            out_px[x, y] = (r, g, b, a)

    # crop to the artwork with a little breathing room
    bbox = out.getbbox()
    pad = 12
    out = out.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))

    light = light.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out.save(OUT_DIR / "asp-logo-reversed.png", optimize=True)

    # compact variant for the navbar / loader (keeps file size small)
    nav_w = 520
    nav = out.resize((nav_w, round(out.height * nav_w / out.width)), Image.LANCZOS)
    nav.save(OUT_DIR / "asp-logo-reversed-sm.png", optimize=True)
    light.resize((nav_w, round(light.height * nav_w / light.width)), Image.LANCZOS).save(OUT_DIR / "asp-logo-sm.png", optimize=True)

    # original artwork (white background) for structured data / OG fallbacks
    src.save(OUT_DIR / "asp-logo.png", optimize=True)
    print("wrote", sorted(p.name for p in OUT_DIR.iterdir()), out.size, nav.size)


if __name__ == "__main__":
    main()
