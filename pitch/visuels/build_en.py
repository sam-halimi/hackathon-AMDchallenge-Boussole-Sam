# Génère charts.html : un graphique par bloc .c, rendu ensuite en PNG par render.mjs.
import glob, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = glob.glob('/home/sam/hackathon-AMDchallenge-Samsam/app/node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2')[0]
D = json.load(open(os.path.join(HERE, '..', 'recherche', 'projections_ancien.json')))

INK, INK2, VIOLET, VIOLET_L, CORAL_INK, CORAL_L, SKY, SAGE, WARN = '#2D2440', '#514964', '#6A4CE0', '#B7A8F0', '#A63D1B', '#E8A48C', '#1F5FA8', '#1E6F54', '#8F4E0A'
charts = []

def chart(cid, w, h, body):
    charts.append(f'<div class="c" id="{cid}" style="width:{w}px;height:{h}px"><svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg></div>')

def t(x, y, s, size=26, weight=700, fill=INK, anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>'

def r(x, y, w, h, fill, rx=10):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>'

# 1. Entonnoir judiciaire (Statistique Canada, 2015-2019, pour 1 000 affaires déclarées)
rows = [(1000, '1,000 sexual assaults reported to police', INK, '#FFF9F3'), (360, 'lead to a charge', VIOLET, '#FFF9F3'),
        (219, 'reach a court', '#8A73E8', '#FFF9F3'), (104, 'end in a conviction', VIOLET_L, INK), (52, 'in a prison sentence', '#FF8A65', INK)]
b = ''
for i, (n, label, col, tc) in enumerate(rows):
    y = 10 + i * 118
    w = max(64, n * 0.9)
    b += r(0, y, w, 92, col, 18)
    if n == 1000:
        b += t(28, y + 58, label, 32, 800, tc)
    else:
        b += t(w + 24, y + 42, str(n), 40, 800, CORAL_INK if n == 52 else INK)
        b += t(w + 24 + (len(str(n)) * 26 + 18), y + 42, label, 28, 700, INK)
b += t(0, 640, '640 cases out of 1,000 end without any charge.', 26, 700, INK2)
chart('entonnoir', 960, 660, b)

# 2. Qui signale
items = [('Physical assaults, to police', 36, '#C9C2D6', INK2), ('Sexual assaults, to police', 6, CORAL_INK, CORAL_INK),
         ('University students, to their university', 9.6, CORAL_INK, CORAL_INK), ('Students, to their school', 8, CORAL_INK, CORAL_INK), ('CEGEP students, to their CEGEP', 6.5, CORAL_INK, CORAL_INK)]
b = t(0, 30, 'Share of victims who report what happened', 26, 800, INK2)
for i, (label, v, col, tc) in enumerate(items):
    y = 70 + i * 92
    b += t(0, y + 34, label, 26, 700)
    b += r(470, y + 6, v * 12, 42, col, 8)
    b += t(470 + v * 12 + 16, y + 38, f'{v:g}%', 30, 800, tc)
chart('signalement', 1000, 540, b)

# 3. Fenêtres de temps (heures) : x0 = 420, 1 h = 6,5 px
X0, K = 420, 6.5
b = ''
for hh, lab in [(0, '0 h'), (24, '24 h'), (48, '48 h'), (72, '72 h'), (120, '5 days'), (168, '7 days')]:
    x = X0 + hh * K
    b += f'<line x1="{x}" y1="36" x2="{x}" y2="520" stroke="#D8CFE0" stroke-width="2"/>' + t(x, 560, lab, 24, 700, INK2, 'middle')
bars = [('GHB (drug)', [(0, 12, CORAL_INK)], '12 h', CORAL_INK),
        ('Drugs in blood', [(0, 24, CORAL_INK), (24, 48, CORAL_L)], '24 to 48 h', CORAL_INK),
        ('HIV prevention', [(0, 24, SKY), (24, 72, '#9CBDE6')], '72 h, ideally 24 h', SKY),
        ('Sperm DNA', [(0, 72, VIOLET)], '72 h', VIOLET),
        ('Drugs in urine', [(0, 120, CORAL_INK)], '5 days', CORAL_INK),
        ('Emergency contraception', [(0, 120, SAGE)], '5 days', SAGE),
        ('Forensic kit', [(0, 120, INK), (120, 168, '#8E86A0')], '5 to 7 days', INK)]
for i, (label, segs, val, col) in enumerate(bars):
    y = 46 + i * 68
    b += t(0, y + 30, label, 26, 700)
    for a, z, c in segs:
        b += r(X0 + a * K, y, (z - a) * K, 40, c, 8)
    b += t(X0 + segs[-1][1] * K + 14, y + 30, val, 26, 800, col)
chart('fenetres', 1680, 580, b)

# 4. Jordan et stress post-traumatique (barres verticales)
def duo(cid, title, a, b_, la, lb, ca, cb, k, base=440):
    s = t(0, 30, title, 26, 800, INK2) + f'<line x1="0" y1="{base}" x2="620" y2="{base}" stroke="{INK}" stroke-width="3"/>'
    for x, v, lab, c in [(90, a, la, ca), (360, b_, lb, cb)]:
        s += r(x, base - v * k, 170, v * k, c, 10) + t(x + 85, base - v * k - 18, f'{v:g}%', 44, 800, c if c != VIOLET_L else INK2, 'middle') + t(x + 85, base + 40, lab, 26, 700, INK, 'middle')
    chart(cid, 640, 500, s)
duo('jordan', 'Sexual assault cases past the Jordan deadlines', 15.1, 30.4, '2016-2017', '2022-2023', VIOLET_L, CORAL_INK, 11)
duo('tspt', 'Victims with post-traumatic stress', 75, 41, 'after 1 month', 'after 1 year', CORAL_INK, CORAL_L, 4.4)

# 5. Marché : acheteurs comptés, et taux déclaré
b = ''
for i, (label, n, shown, col) in enumerate([('Colleges and universities', 144, '144', VIOLET), ('Designated centres', 80, '80+', SKY), ('Specialized court districts', 36, '36', WARN), ('CAVAC', 17, '17', WARN)]):
    y = 24 + i * 100
    b += t(0, y + 32, label, 26, 700) + r(450, y, n * 2.6, 46, col, 8) + t(450 + n * 2.6 + 16, y + 36, shown, 36, 800, col)
chart('acheteurs', 920, 420, b)
s = t(0, 30, 'Reported sexual offences, Quebec', 26, 800, INK2) + t(0, 64, 'per 100,000 people', 24, 600, INK2) + f'<line x1="0" y1="400" x2="620" y2="400" stroke="{INK}" stroke-width="3"/>'
for x, v, lab, c in [(90, 66.3, '2013', VIOLET_L), (360, 139.2, '2023', VIOLET)]:
    s += r(x, 400 - v * 2, 170, v * 2, c, 10) + t(x + 85, 400 - v * 2 - 16, f'{round(v)}', 44, 800, INK2 if c == VIOLET_L else VIOLET, 'middle') + t(x + 85, 440, lab, 26, 700, INK, 'middle')
chart('taux', 640, 460, s)

# 6. Revenus projetés et coûts (base) : x 2027..2031, 1 k$ = 0,238 px, 0 $ à y = 560
X = [150, 390, 630, 870, 1110]
Y = lambda v: round(560 - v / 1000 * 0.238, 1)
s = ''
for v, lab in [(0, '0'), (500000, '0,5 M$'), (1000000, '1 M$'), (1500000, '1,5 M$'), (2000000, '2 M$')]:
    s += f'<line x1="120" y1="{Y(v)}" x2="1150" y2="{Y(v)}" stroke="#D8CFE0" stroke-width="2"/>' + t(0, Y(v) + 8, lab, 24, 700, INK2)
for x, yr in zip(X, range(2027, 2032)):
    s += t(x, 606, str(yr), 26, 800, INK, 'middle')
pts = lambda vals: ' '.join(f'{x},{Y(v)}' for x, v in zip(X, vals))
s += f'<line x1="630" y1="80" x2="630" y2="560" stroke="{SAGE}" stroke-width="3" stroke-dasharray="6 8"/>' + t(644, 104, 'Rentable (base)', 26, 800, SAGE)
s += f'<polyline points="{pts(D["base"]["cost"])}" fill="none" stroke="{CORAL_INK}" stroke-width="5" stroke-dasharray="14 10"/>'
cols = {'prudent': VIOLET_L, 'base': VIOLET, 'ambitieux': INK}
for k in ['prudent', 'ambitieux', 'base']:
    s += f'<polyline points="{pts(D[k]["rev"])}" fill="none" stroke="{cols[k]}" stroke-width="{8 if k == "base" else 6}" stroke-linejoin="round" stroke-linecap="round"/>'
    s += ''.join(f'<circle cx="{x}" cy="{Y(v)}" r="{9 if k == "base" else 7}" fill="{cols[k]}"/>' for x, v in zip(X, D[k]['rev']))
fm = lambda v: f'{v / 1e6:.2f}'.replace('.', ',') + ' M$'
s += t(1134, Y(D['ambitieux']['rev'][4]) + 9, f'Ambitieux {fm(D["ambitieux"]["rev"][4])}', 26, 800, INK)
s += t(1134, Y(D['base']['rev'][4]) - 6, f'Base {fm(D["base"]["rev"][4])}', 26, 800, VIOLET)
s += t(1134, Y(D['base']['cost'][4]) + 34, 'Coûts (base)', 26, 800, CORAL_INK)
s += t(1134, Y(D['prudent']['rev'][4]) + 9, f'Prudent {fm(D["prudent"]["rev"][4])}', 26, 800, '#7C66D9')
chart('revenus', 1480, 630, s)

# 7. Seuil d'appel d'offres
k = 860 / 150
s = r(0, 96, 860, 60, '#EADFD4', 30) + r(0, 96, 111 * k, 60, VIOLET, 30) + f'<line x1="{139 * k}" y1="64" x2="{139 * k}" y2="190" stroke="{CORAL_INK}" stroke-width="6"/>'
s += t(24, 136, 'Pilot: $111,000', 30, 800, '#FFF9F3') + t(139 * k, 46, 'Public tender threshold: $139,000', 28, 800, CORAL_INK, 'end')
s += t(0, 236, '6 designated centres for 18 months: direct purchase allowed', 26, 700, INK2)
chart('seuil', 900, 260, s)

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'Nunito'; src: url('file://{FONT}') format('woff2'); font-weight: 200 1000; }}
body {{ margin: 0; font-family: 'Nunito', sans-serif; background: transparent; }}
.c {{ display: inline-block; margin: 20px; }} text {{ font-family: 'Nunito', sans-serif; }}
</style></head><body>{''.join(charts)}</body></html>'''
open(os.path.join(HERE, 'charts_en.html'), 'w', encoding='utf-8').write(html)
print(len(charts), 'graphiques')
