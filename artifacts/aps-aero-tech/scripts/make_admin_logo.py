"""
Builds every ASP logo file from the repo-root asp.png (navy artwork on a
transparent background):

  artifacts/aps-aero-tech/public/asp-logo.png        public site header/footer
  artifacts/aps-aero-tech/public/brand/asp-logo*.png  admin console (light + reversed)
  web/public/brand/asp-logo*.png                      Next.js site (light + reversed, full + sm)

"Reversed" lifts the navy lettering to near-white for dark backgrounds; saffron,
white and green in the swoosh are untouched. Run from the repo root:
  py artifacts/aps-aero-tech/scripts/make_admin_logo.py   (requires Pillow)
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "asp.png"
VITE = ROOT / "artifacts" / "aps-aero-tech" / "public"
WEB = ROOT / "web" / "public" / "brand"
LIGHT = (236, 242, 250)

# (output path, width in px, reversed?)
OUTPUTS = [
    (VITE / "asp-logo.png", 1200, False),
    (VITE / "brand" / "asp-logo.png", 900, False),
    (VITE / "brand" / "asp-logo-reversed.png", 900, True),
    (WEB / "asp-logo.png", 1536, False),
    (WEB / "asp-logo-reversed.png", 1318, True),
    (WEB / "asp-logo-sm.png", 520, False),
    (WEB / "asp-logo-reversed-sm.png", 520, True),
]


def is_navy(r: int, g: int, b: int) -> bool:
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return lum < 140 and b >= r and b >= g * 0.85


def reverse(image: Image.Image) -> Image.Image:
    out = image.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and is_navy(r, g, b):
                px[x, y] = (*LIGHT, a)
    return out


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    # drop near-invisible fringe pixels so the crop hugs the artwork
    alpha = src.getchannel("A").point(lambda a: 0 if a < 24 else a)
    src.putalpha(alpha)
    bbox = alpha.getbbox()
    pad = 8
    src = src.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(src.width, bbox[2] + pad), min(src.height, bbox[3] + pad)))

    for path, width, reversed_ in OUTPUTS:
        height = round(src.height * width / src.width)
        image = src.resize((width, height), Image.LANCZOS)
        if reversed_:
            image = reverse(image)
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path, optimize=True)
        print(f"{width}x{height}  {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
