// Paper bush with sampaguita buds (Claude Design part 2, Home): cream edge, two greens, no outline.
export function Bush({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className={`k-bush ${className}`.trim()} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <path d="M6 78 Q-4 50 20 44 Q20 18 46 20 Q58 0 80 14 Q104 8 108 34 Q124 44 114 78 Z" fill="var(--edge)" />
      <path d="M12 74 Q4 52 24 48 Q24 24 46 25 Q58 7 78 19 Q100 14 103 37 Q116 46 108 74 Z" fill="#5FB548" />
      <path d="M60 74 Q70 52 92 50 Q100 38 103 37 Q116 46 108 74 Z" fill="#4E9A3C" />
      <g fill="var(--paper)">
        <circle cx="36" cy="40" r="4" />
        <circle cx="64" cy="30" r="4" />
        <circle cx="86" cy="44" r="4" />
        <circle cx="50" cy="58" r="3.5" />
      </g>
      <g fill="var(--glow)">
        <circle cx="36" cy="40" r="1.6" />
        <circle cx="64" cy="30" r="1.6" />
        <circle cx="86" cy="44" r="1.6" />
        <circle cx="50" cy="58" r="1.4" />
      </g>
    </svg>
  )
}
