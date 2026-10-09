/** Normalized Levenshtein similarity, with Unicode characters counted once. */
export function similarity(a: string, b: string): number {
  const left = Array.from(a.normalize('NFC'))
  const right = Array.from(b.normalize('NFC'))
  const length = Math.max(left.length, right.length)
  if (length === 0) return 1

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    for (let j = 1; j <= right.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
    }
    previous = current
  }
  return 1 - previous[right.length] / length
}

/** Align normalized words in order. A null index denotes a gap on that side. */
export function align(expected: string[], heard: string[]): Array<[number | null, number | null]> {
  const costs = Array.from({ length: expected.length + 1 }, () => Array<number>(heard.length + 1).fill(0))
  const steps = Array.from({ length: expected.length + 1 }, () => Array<'pair' | 'skip' | 'extra'>(heard.length + 1))
  for (let i = 1; i <= expected.length; i++) {
    costs[i][0] = i
    steps[i][0] = 'skip'
  }
  for (let j = 1; j <= heard.length; j++) {
    costs[0][j] = j
    steps[0][j] = 'extra'
  }

  for (let i = 1; i <= expected.length; i++) {
    for (let j = 1; j <= heard.length; j++) {
      const paired = costs[i - 1][j - 1] + 1 - similarity(expected[i - 1], heard[j - 1])
      const skipped = costs[i - 1][j] + 1
      const extra = costs[i][j - 1] + 1
      costs[i][j] = Math.min(paired, skipped, extra)
      // Prefer a pair on ties so equal-cost paths are deterministic.
      steps[i][j] = paired <= skipped && paired <= extra ? 'pair' : skipped <= extra ? 'skip' : 'extra'
    }
  }

  const pairs: Array<[number | null, number | null]> = []
  let i = expected.length
  let j = heard.length
  while (i > 0 || j > 0) {
    const step = steps[i][j]
    if (step === 'pair') pairs.push([--i, --j])
    else if (step === 'skip') pairs.push([--i, null])
    else pairs.push([null, --j])
  }
  return pairs.reverse()
}
