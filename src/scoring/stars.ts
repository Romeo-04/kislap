import { SCORING } from './config'

export type Stars = 0 | 1 | 2 | 3

export function starsFor(accuracy: number): Stars {
  const [one, two, three] = SCORING.stars
  if (accuracy >= three) return 3
  if (accuracy >= two) return 2
  if (accuracy >= one) return 1
  return 0
}
