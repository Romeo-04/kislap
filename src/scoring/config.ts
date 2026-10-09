// All scoring numbers in one place so the team can tune them (spec §8, ADR-0005).
export const SCORING = {
  /** similarity ≥ correct → 'correct'. 0.80: one wrong letter in a word of five or more still counts. */
  correct: 0.8,
  /** similarity ≥ unclear → 'unclear' (half credit) */
  unclear: 0.5,
  /**
   * How closely a joined or split word must match to count as a spacing error ("story time" heard as
   * "storytime"). Kept apart from `correct` on purpose: if it follows `correct`, loosening `correct`
   * lets a skipped short word like "ay" pass as a join with its long neighbour ("ningningay" vs
   * "ningning" is 0.80), and a word the child never said is marked correct.
   */
  spacing: 0.85,
  /** accuracy needed for 1, 2, 3 stars */
  stars: [0.5, 0.7, 0.9],
} as const