// Keep this list narrow: spelling variants, not general translation or stemming.
const variants = new Map<string, string>([
  ['kamusta', 'kumusta'], ['favourite', 'favorite'], ['basketbol', 'basketball'],
  ['nagbasketbol', 'nagbasketball'],
])

// Whisper may write a number as a digit, a bare word, or the linked form (-ng) in the story.
// They share one canonical form; the scorer also keeps the spelling, so a near miss still counts.
const NUMBER_WORDS: Array<[number, string[]]> = [
  [0, ['zero', 'sero']], [1, ['isa', 'isang']], [2, ['dalawa', 'dalawang']], [3, ['tatlo', 'tatlong']],
  [4, ['apat']], [5, ['lima', 'limang']], [6, ['anim']], [7, ['pito', 'pitong']], [8, ['walo', 'walong']],
  [9, ['siyam']], [10, ['sampu', 'sampung']],
]
const numbers = new Map<string, string>(
  NUMBER_WORDS.flatMap(([n, words]) => [[String(n), `#${n}`], ...words.map((w): [string, string] => [w, `#${n}`])]),
)

/** The number a word stands for (`#3`), or the word itself. */
export function canonical(normalized: string): string {
  return numbers.get(normalized) ?? normalized
}

/** Shared boundaries keep each displayed word paired with its normalized form. */
export function tokenize(text: string): Array<{ word: string; normalized: string }> {
  const source = text.normalize('NFC')
  const words = Array.from(source.matchAll(/[\p{L}\p{M}\p{N}]+(?:[-'’][\p{L}\p{M}\p{N}]+)*/gu))
  return words.map((match, index) => {
    // Internal hyphens and apostrophes vary in ASR output; ñ and accents remain.
    const cleaned = match[0].toLowerCase().replace(/[-'’]/g, '')
    // Retain surrounding punctuation in the displayed story, not in comparisons.
    const start = index === 0 ? 0 : match.index
    const end = words[index + 1]?.index ?? source.length
    return { word: source.slice(start, end).trim(), normalized: variants.get(cleaned) ?? cleaned }
  })
}

export function normalize(text: string): string[] {
  return tokenize(text).map((word) => word.normalized)
}
