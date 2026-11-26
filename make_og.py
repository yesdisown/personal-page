#!/usr/bin/env python3
"""Generate og.png (1200x630) from logo.svg + the site font. Needs: pip install pillow fonttools

Run only when you change the logo or the handle; the result (og.png) is committed.
"""
import io
import re
import sys
import tomllib
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
W, H = 1200, 630

site = tomllib.loads((ROOT / "site.toml").read_text(encoding="utf-8"))["site"]

# --- font: woff -> ttf in memory, so PIL can load it
f = TTFont(ROOT / "fonts" / "WebPlus_IBM_VGA_8x16.woff")
f.flavor = None
buf = io.BytesIO()
f.save(buf)
buf.seek(0)
font_big = ImageFont.truetype(buf, 64)
buf.seek(0)
font_small = ImageFont.truetype(buf, 32)

# --- background: black + soft purple glow at the top (same as the site)
img = Image.new("RGB", (W, H), "#000000")
glow = Image.new("RGB", (W, H), "#000000")
gd = ImageDraw.Draw(glow)
for r in range(420, 0, -6):
    a = int(40 * (1 - r / 420) ** 2)
    gd.ellipse((W / 2 - r * 1.6, -r, W / 2 + r * 1.6, r), fill=(156 * a // 255, 104 * a // 255, 224 * a // 255))
img = Image.blend(img, glow, 1.0)
d = ImageDraw.Draw(img)

# --- logo: parse the <path> data of logo.svg (only M/h/v/z with integers)
svg = (ROOT / "logo.svg").read_text(encoding="utf-8")
scale = 1.3
ox, oy = 90, (H - 384 * scale) / 2
for color, data in re.findall(r'<path fill="(#[0-9a-f]+)" d="([^"]+)"', svg):
    for x, y, w, h in re.findall(r"M(\d+) (\d+)h(\d+)v(\d+)h-\d+z", data):
        x, y, w, h = map(int, (x, y, w, h))
        d.rectangle(
            (ox + x * scale, oy + y * scale, ox + (x + w) * scale - 1, oy + (y + h) * scale - 1),
            fill=color,
        )

# --- text
tx = 640
d.text((tx, 230), "@" + site["handle"], font=font_big, fill="#9c68e0")
d.text((tx, 330), site["domain"], font=font_small, fill="#888888")

img.save(ROOT / "og.png", optimize=True)
print("wrote og.png", img.size)
