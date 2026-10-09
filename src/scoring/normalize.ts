// Keep this list narrow: spelling variants, not general translation or stemming.
const variants = new Map<string, string>([
  ['zero', '0'], ['sero', '0'],
  ['isa', '1'], ['dalawa', '2'], ['tatlo', '3'], ['apat', '4'], ['lima', '5'],
  ['anim', '6'], ['pito', '7'], ['walo', '8'], ['siyam', '9'], ['sampu', '10'],
  ['kamusta', 'kumusta'], ['favourite', 'favorite'], ['basketbol', 'basketball'],
  ['nagbasketbol', 'nagbasketball'],
])

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
