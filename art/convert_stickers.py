# Convert the v1 stickers (thick ink look) to the Claude Design part 2 paper look
# (docs/design/paper-puppet.md): same artwork, every colour from the paper tokens.
# - die-cut: a cream edge (--edge) with the token drop shadow (rgba(27,58,82,.18)); the edge is
#   thinner than the handoff's (dilate 4, not 8), per the team
# - printed lines: the cut line colour (--cut-line), opaque, so coloured strokes keep their colour
# - solid printed details (eyes, nostrils, wheels, the jeep's lettering): ink (--ink)
# - fills: leaf, cap and glow in place of the candy green, orange and yellow
# - locked: the same shapes in cream paper with a dashed cut line, never grey (paper-puppet.md §4, §8)
# The v1 sources live only in git history. To rebuild:
#   git archive 4121890 public/stickers | tar -x -C /tmp/v1
#   python art/convert_stickers.py /tmp/v1/public/stickers public/stickers
# Running it on its own output changes nothing.
import re, sys, pathlib

CUT = ('<filter id="kd-cut" x="-20%" y="-20%" width="140%" height="150%">'
       '<feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/>'
       '<feGaussianBlur in="d" stdDeviation="3" result="b"/><feOffset in="b" dy="5" result="o"/>'
       '<feFlood flood-color="#1B3A52" flood-opacity="0.18"/><feComposite in2="o" operator="in" result="sh"/>'
       '<feFlood flood-color="#FFF3D1"/><feComposite in2="d" operator="in" result="edge"/>'
       '<feMerge><feMergeNode in="sh"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
# locked: a cream edge with no shadow; LOCKED_STYLE turns every shape cream with a dashed cut line
GHOST = ('<filter id="kd-ghost" x="-20%" y="-20%" width="140%" height="140%">'
         '<feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/>'
         '<feFlood flood-color="#FFF3D1"/><feComposite in2="d" operator="in" result="edge"/>'
         '<feMerge><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
LOCKED_STYLE = ('<style>.kd-locked [fill]:not([fill="none"]){fill:#FFF8E7!important}'
                '.kd-locked *{stroke:#A08566!important;stroke-width:2!important;stroke-dasharray:5 4}</style>')

RECOLOUR = [
    ('stroke="#1E2B1F"', 'stroke="#A08566"'),
    ('fill="#1E2B1F"', 'fill="#3B2412"'),
    ('fill="#7CC35A"', 'fill="#8ACF4E"'),
    ('fill="#F07F2A"', 'fill="#F58A2B"'),
    ('fill="#FFC62E"', 'fill="#FFC93C"'),
]

def convert(svg: str) -> str:
    svg = re.sub(r'<metadata>.*?</metadata>', '', svg, flags=re.S)
    svg = svg.replace(' xmlns:c2pa="http://c2pa.org/manifest"', '')
    svg = re.sub(r'<filter id="kd-cut".*?</filter>', CUT, svg, flags=re.S)
    svg = re.sub(r'<filter id="kd-ghost".*?</filter>', GHOST, svg, flags=re.S)
    for old, new in RECOLOUR:
        svg = re.sub(re.escape(old), new, svg, flags=re.I)
    if 'url(#kd-ghost)' in svg and 'kd-locked' not in svg:
        svg = svg.replace('<defs>', '<defs>\n' + LOCKED_STYLE, 1)
        svg = svg.replace('<g filter="url(#kd-ghost)"', '<g class="kd-locked" filter="url(#kd-ghost)"', 1)
    if '#1e2b1f' in svg.lower():
        raise SystemExit('ink left in sticker')
    return svg

if __name__ == '__main__':
    src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/stickers')
    out = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else src
    for p in sorted(src.glob('sticker-*.svg')):
        dest = out / p.name
        dest.write_text(convert(p.read_text(encoding='utf8')), encoding='utf8', newline='\n')
        print(dest.name, dest.stat().st_size)
