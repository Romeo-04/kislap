# Convert the merged v1 stickers (thick ink look) to the Claude Design part 2 paper look:
# same artwork, details printed in soft brown at 60% instead of ink, a cream die-cut edge with a
# soft blue shadow instead of the white + ink double edge. The edge is thinner than the handoff's
# (dilate 4, not 8), per the team.
import re, sys, pathlib

CUT = ('<filter id="kd-cut" x="-20%" y="-20%" width="140%" height="150%">'
       '<feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/>'
       '<feGaussianBlur in="d" stdDeviation="3" result="b"/><feOffset in="b" dy="5" result="o"/>'
       '<feFlood flood-color="#1B3A52" flood-opacity="0.26"/><feComposite in2="o" operator="in" result="sh"/>'
       '<feFlood flood-color="#FFF3D1"/><feComposite in2="d" operator="in" result="edge"/>'
       '<feMerge><feMergeNode in="sh"/><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
GHOST = ('<filter id="kd-ghost" x="-20%" y="-20%" width="140%" height="140%">'
         '<feMorphology in="SourceAlpha" operator="dilate" radius="4" result="o"/>'
         '<feFlood flood-color="#56634F" flood-opacity="0.2"/><feComposite in2="o" operator="in"/></filter>')

def convert(svg: str) -> str:
    svg = re.sub(r'<metadata>.*?</metadata>', '', svg, flags=re.S)
    svg = svg.replace(' xmlns:c2pa="http://c2pa.org/manifest"', '')
    svg = re.sub(r'<filter id="kd-cut".*?</filter>', CUT, svg, flags=re.S)
    svg = re.sub(r'<filter id="kd-ghost".*?</filter>', GHOST, svg, flags=re.S)
    # printed details: soft brown at 60%, not ink
    svg = svg.replace('stroke="#1E2B1F"', 'stroke="#8A6236" stroke-opacity="0.6"')
    # solid printed details (eyes, wheels, windows): dark brown, as the part 2 assets do
    svg = svg.replace('fill="#1E2B1F"', 'fill="#4A2E17"')
    assert '#1E2B1F' not in svg, 'ink left in sticker'
    return svg

if __name__ == '__main__':
    d = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/stickers')
    for p in sorted(d.glob('sticker-*.svg')):
        p.write_text(convert(p.read_text(encoding='utf8')), encoding='utf8')
        print(p.name, p.stat().st_size)
