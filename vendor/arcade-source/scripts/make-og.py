#!/usr/bin/env python3
"""Generate the 1200x630 social-share images in assets/img/og-*.png.

Needs `rsvg-convert` (librsvg) and the Inter font. Run from the repo root:
    python3 scripts/make-og.py
The PNGs are committed, so you only need this when a title or thumbnail changes.
"""
import re, subprocess, tempfile, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
IMG = os.path.join(ROOT, 'assets', 'img')
INK, CLOUD, BUTTER, PINK, MINT, MUTED = '#0E0B2E', '#F4F2FF', '#FFD23F', '#FF6FC4', '#52F0B8', '#B6B1F2'

PAGES = [
    ('home', ['Free arcade games', 'in your browser'], ['Starfall, Brick Rally, Serpentine,', 'Lightmerge and more, in 3D too.'], None, PINK),
    ('starfall', ['Starfall'], ['A free space shooter with waves,', 'power-ups and boss fights.'], 'thumb-starfall.svg', PINK),
    ('brick-rally', ['Brick Rally'], ['A free brick-breaker with five', 'levels and wild power-ups.'], 'thumb-brick-rally.svg', '#5A5CFF'),
    ('serpentine', ['Serpentine'], ['A smooth, glowing snake game', 'with combos and bonus fruit.'], 'thumb-serpentine.svg', MINT),
    ('skyhop', ['Skyhop'], ['A one-tap flyer through a world', 'that turns from dawn to night.'], 'thumb-skyhop.svg', BUTTER),
]

def inner(name):
    s = open(os.path.join(IMG, name)).read()
    return re.sub(r'^<svg[^>]*>|</svg>\s*$', '', s.strip())

def thumb(name, x, y, w, h, rot=0, shadow=BUTTER):
    cx, cy = x + w / 2, y + h / 2
    return (f'<g transform="rotate({rot} {cx} {cy})">'
            f'<rect x="{x + 14}" y="{y + 14}" width="{w}" height="{h}" rx="26" fill="{shadow}"/>'
            f'<rect x="{x - 6}" y="{y - 6}" width="{w + 12}" height="{h + 12}" rx="30" fill="{INK}"/>'
            f'<clipPath id="c{abs(hash((name, x)))}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="24"/></clipPath>'
            f'<g clip-path="url(#c{abs(hash((name, x)))})"><svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 640 400">{inner(name)}</svg></g></g>')

SHIP = ('<path d="M-6 18 L0 30 L6 18 Z" fill="#FF9F55"/><path d="M-8 -2 L-23 17 L-23 23 L-7 17 Z" fill="#FF6FC4"/>'
        '<path d="M8 -2 L23 17 L23 23 L7 17 Z" fill="#FF6FC4"/><path d="M0 -25 L10 8 L8 21 L-8 21 L-10 8 Z" fill="#FFD23F"/>'
        '<ellipse cx="0" cy="-1" rx="3.8" ry="7.5" fill="#0E0B2E"/>')

def page_svg(key, title, lines, thumb_name, accent):
    big = 112 if len(title) == 1 and len(title[0]) < 12 else 92
    if key == 'home':
        big = 76
    t = ''.join(f'<text x="72" y="{300 + i * (big + 8) - (len(title) - 1) * 40}" font-family="Inter" font-weight="800" font-size="{big}" letter-spacing="-3" fill="{CLOUD}">{l}</text>' for i, l in enumerate(title))
    sub_y = 300 + (len(title) - 1) * (big + 8) - (len(title) - 1) * 40 + 70
    sub = ''.join(f'<text x="76" y="{sub_y + i * 46}" font-family="Inter" font-weight="500" font-size="33" fill="{MUTED}">{l}</text>' for i, l in enumerate(lines))
    if thumb_name:
        art = thumb(thumb_name, 640, 150, 484, 302, 3, accent)
    else:
        art = (thumb('thumb-starfall.svg', 790, 120, 190, 119, -4, PINK) + thumb('thumb-brick-rally.svg', 990, 150, 160, 100, 3, '#5A5CFF') +
               thumb('thumb-serpentine.svg', 800, 290, 160, 100, 3, MINT) + thumb('thumb-skyhop.svg', 985, 300, 170, 106, -3, BUTTER))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="a"><stop offset="0" stop-color="#2B2DDB" stop-opacity=".9"/><stop offset="1" stop-color="#2B2DDB" stop-opacity="0"/></radialGradient>
<radialGradient id="b"><stop offset="0" stop-color="{accent}" stop-opacity=".45"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="{INK}"/>
<circle cx="260" cy="120" r="520" fill="url(#a)"/><circle cx="960" cy="420" r="420" fill="url(#b)"/>
<rect y="618" width="1200" height="12" fill="{BUTTER}"/>
<g transform="translate(104 98)"><rect x="-32" y="-34" width="64" height="64" rx="16" fill="#2B2DDB"/><g transform="translate(0 1) scale(1.05)">{SHIP}</g></g>
<text x="152" y="108" font-family="Inter" font-weight="700" font-size="34" fill="{CLOUD}">Kanwar Arcade</text>
{t}{sub}
<rect x="72" y="{sub_y + len(lines) * 46 + 10}" width="360" height="52" rx="26" fill="{BUTTER}"/>
<text x="252" y="{sub_y + len(lines) * 46 + 45}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="26" fill="{INK}">Free to play in your browser</text>
{art}
</svg>'''

for key, title, lines, tn, accent in PAGES:
    svg = page_svg(key, title, lines, tn, accent)
    with tempfile.NamedTemporaryFile('w', suffix='.svg', delete=False) as f:
        f.write(svg)
        tmp = f.name
    out = os.path.join(IMG, f'og-{key}.png')
    subprocess.run(['rsvg-convert', '-w', '1200', tmp, '-o', out], check=True)
    os.unlink(tmp)
    print('wrote', out)
