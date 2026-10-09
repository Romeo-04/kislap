// Filipino syllables (pantig) for syllable help: tap a word to see "ba · ta" (issue #21).
// Rules (Ortograpiyang Pambansa): "ng" is one consonant; one consonant between vowels starts the
// next syllable (ba-ta); two split between them (ak-lat); in longer clusters a valid onset such as
// "pl" or "tr" moves to the next syllable (eks-per-to, tra-ba-ho). English words in Taglish follow
// the same rules, so their syllables are an approximation.

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])
const ONSETS = new Set(['bl', 'br', 'dr', 'gl', 'gr', 'kl', 'kr', 'pl', 'pr', 'tr', 'ts', 'sw', 'sy', 'dy', 'ky', 'py'])

const base = (ch: string) => ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const isVowel = (unit: string) => VOWELS.has(base(unit))

/** Letters grouped into sound units: "ng" stays together. */
function units(word: string): string[] {
  const out: string[] = []
  for (let i = 0; i < word.length; i++) {
    if (base(word[i]) === 'n' && base(word[i + 1] ?? '') === 'g') {
      out.push(word.slice(i, i + 2))
      i++
    } else out.push(word[i])
  }
  return out
}

/** How many consonants in a cluster between two vowels stay with the earlier syllable. */
function keepLeft(cluster: string[]): number {
  if (cluster.length <= 1) return 0
  if (cluster.length === 2) return 1
  const lastTwo = cluster.slice(-2).map(base).join('')
  return ONSETS.has(lastTwo) ? cluster.length - 2 : cluster.length - 1
}

function syllabifyPart(part: string): string[] {
  const u = units(part)
  const vowelAt = u.flatMap((x, i) => (isVowel(x) ? [i] : []))
  if (vowelAt.length <= 1) return part ? [part] : []
  const cuts: number[] = []
  for (let v = 0; v < vowelAt.length - 1; v++) {
    const cluster = u.slice(vowelAt[v] + 1, vowelAt[v + 1])
    cuts.push(vowelAt[v] + 1 + keepLeft(cluster))
  }
  const out: string[] = []
  let start = 0
  for (const cut of cuts) {
    out.push(u.slice(start, cut).join(''))
    start = cut
  }
  out.push(u.slice(start).join(''))
  return out
}

/** Syllables of one word, without punctuation; a hyphenated word is split at the hyphen first. */
export function syllabify(word: string): string[] {
  return word
    .split('-')
    .map((part) => part.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean)
    .flatMap(syllabifyPart)
}
