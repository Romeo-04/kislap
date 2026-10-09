import './kit.css'

const COLORS = ['#FFC93C', '#F58A2B', '#8ACF4E', '#2E9A4E', '#FFFDF6', '#FFE79A']

// fixed seed: the burst looks the same every time and the server render matches the client
function pieces() {
  let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  return Array.from({ length: 34 }, (_, i) => {
    const kind = i % 3
    const a = rnd() * Math.PI * 2
    const d = 80 + rnd() * 220
    const size = kind === 2 ? 18 : kind === 1 ? 13 : 12
    return {
      kind,
      size,
      color: COLORS[i % COLORS.length],
      x: Math.round(Math.cos(a) * d * 1.3),
      y: Math.round(Math.sin(a) * d * 0.7 - 30),
      r: Math.round(rnd() * 540 - 270),
      delay: Math.round(rnd() * 120),
    }
  })
}

const PIECES = pieces()

/** One 900ms burst of paper bits and leaves, then they stay put. */
export function Confetti() {
  return (
    <div className="k-confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`k-confetti__bit k-confetti__bit--${p.kind}`}
          style={
            {
              width: p.size,
              height: p.kind === 0 ? 18 : p.size,
              marginLeft: -p.size / 2,
              background: p.color,
              '--x': `${p.x}px`,
              '--y': `${p.y}px`,
              '--r': `${p.r}deg`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
