"""Build the 1200x630 link-preview card for apollonpapas.com.

A one-off tool, NOT part of `npm run build`. The card it produces is committed
at public/images/og-apollon-papas.jpg; run this again only when the portrait or
the wording on it changes.

A 4:5 portrait cannot fill a 1.91:1 frame without becoming a face-only crop
with the top of the head cut off, so the portrait keeps its own proportions on
the right and the site's aurora glow fills the left behind the name.

Colours and type are the site's own tokens (src/styles/site.css) and the same
Manrope/Inter used on the page. Pillow cannot read woff2, so the fonts have to
be unpacked out of node_modules first:

    python3 -m venv --system-site-packages /tmp/ogvenv
    /tmp/ogvenv/bin/pip install fonttools brotli pillow
    /tmp/ogvenv/bin/python - <<'EOF'
    from fontTools.ttLib import TTFont
    for n, s in [('manrope', 'manrope-latin-wght-normal'),
                 ('inter', 'inter-latin-wght-normal')]:
        f = TTFont(f'node_modules/@fontsource-variable/{n}/files/{s}.woff2')
        f.flavor = None
        f.save(f'/tmp/ogvenv/{n}.ttf')
    EOF
    /tmp/ogvenv/bin/python scripts/make-og-image.py \\
        /tmp/ogvenv . public/images/og-apollon-papas.jpg

Usage: make-og-image.py <dir holding manrope.ttf and inter.ttf> <repo root> <out>
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SCRATCH, REPO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

W, H = 1200, 630
BG = (0x0A, 0x0A, 0x0C)
TEXT = (0xF7, 0xF7, 0xF6)
DIM = (0x8B, 0x8B, 0x92)
GOLD = (0xF2, 0xC1, 0x4E)

card = Image.new('RGB', (W, H), BG)

# --- aurora: the site's signature, warm core with cooler bleed, heavily blurred
glow = Image.new('RGB', (W, H), BG)
gd = ImageDraw.Draw(glow)
for cx, cy, r, colour in [
    (300, 150, 250, (0xF2, 0xC1, 0x4E)),   # gold, the warm core
    (140, 330, 250, (0xFF, 0x7A, 0x3C)),   # orange
    (380, 500, 175, (0xE8, 0x5C, 0xCB)),   # magenta, cooler bleed at the edge
    (40, 590, 165, (0x5B, 0x7C, 0xF5)),    # blue
]:
    gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=colour)
glow = glow.filter(ImageFilter.GaussianBlur(150))
card = Image.blend(card, glow, 0.34)

# --- portrait, right side, full bleed height
PW = 470
portrait = Image.open(f'{REPO}/public/images/apollo-portrait.jpg').convert('RGB')
pw, ph = portrait.size
# Crop to the panel's aspect before scaling, so nothing is squashed. The face
# sits a touch right of centre in the source, hence the 0.54 bias.
target = PW / H
crop_w = min(pw, int(ph * target))
left = int((pw - crop_w) * 0.54)
portrait = portrait.crop((left, 0, left + crop_w, ph)).resize((PW, H), Image.LANCZOS)

# Feather the inner edge so the photo dissolves into the field instead of
# ending on a hard vertical seam.
mask = Image.new('L', (PW, H), 255)
md = ImageDraw.Draw(mask)
FEATHER = 150
for x in range(FEATHER):
    md.line((x, 0, x, H), fill=int(255 * (x / FEATHER) ** 1.4))
card.paste(portrait, (W - PW, 0), mask)

# --- type
manrope = ImageFont.truetype(f'{SCRATCH}/manrope.ttf', 76)
manrope.set_variation_by_axes([800])
inter = ImageFont.truetype(f'{SCRATCH}/inter.ttf', 26)
inter.set_variation_by_axes([400])
label = ImageFont.truetype(f'{SCRATCH}/inter.ttf', 17)
label.set_variation_by_axes([500])

d = ImageDraw.Draw(card)
x = 78
# The portrait starts at 730 and feathers in over 150px. Text stops short of it.
COLUMN = 700 - x


def tracked(draw, xy, text, font, fill, spacing):
    """Draw with letter-spacing. The site's .label rule tracks out at 0.06em,
    which has no equivalent in Pillow, and padding the string with spaces
    overshoots badly once the line is 35 characters long."""
    cx, cy = xy
    for ch in text:
        draw.text((cx, cy), ch, font=font, fill=fill)
        cx += font.getlength(ch) + spacing
    return cx - xy[0] - spacing


def wrap(text, font, width):
    """Greedy wrap measured against the real font rather than a guessed
    characters-per-line, so a copy change cannot silently run under the photo."""
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if font.getlength(trial) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


# Gold dot plus eyebrow, the site's own pairing.
d.ellipse((x, 176, x + 9, 185), fill=GOLD)
tracked(d, (x + 20, 169), 'EXECUTIVE COACH & GROWTH STRATEGIST', label, DIM, 1.6)

d.text((x, 214), 'Apollon', font=manrope, fill=TEXT)
d.text((x, 296), 'Papas', font=manrope, fill=TEXT)

TAGLINE = 'Helping founders and organizations scale with systems, and strategic execution.'
for i, line in enumerate(wrap(TAGLINE, inter, COLUMN)):
    d.text((x, 412 + i * 36), line, font=inter, fill=DIM)

card.save(OUT, quality=88, optimize=True, progressive=True)
print('wrote', OUT, card.size)
