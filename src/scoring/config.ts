// All scoring numbers in one place so the team can tune them (spec §8, ADR-0005).
export const SCORING = {
  /** similarity ≥ correct → 'correct' */
  correct: 0.85,
  /** similarity ≥ unclear → 'unclear' (half credit) */
  unclear: 0.6,
  /** accuracy needed for 1, 2, 3 stars */
  stars: [0.5, 0.7, 0.9],
} as const
