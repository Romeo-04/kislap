import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { WordPopView } from './WordPop'
import { PAPER_ROUTES } from '../ui/GameShell'
import { initialWordPop, wordPopReducer, type WordPopEvent, type WordPopState } from '../game/wordPop'
import fil from '../i18n/fil.json'
import { savedFilipino } from '../test/lang'

// the real syllable splitter is #21; the view only has to show what it returns
vi.mock('../content/syllables', () => ({ syllabify: (w: string) => (w === 'bata' ? ['ba', 'ta'] : [w]) }))

savedFilipino()

const noop = () => {}
const run = (words: string[], ...events: WordPopEvent[]) => events.reduce(wordPopReducer, initialWordPop(words))
const said = (text: string): WordPopEvent[] => [{ type: 'mic-started' }, { type: 'stopped' }, { type: 'heard', text }]
const view = (state: WordPopState, over: Partial<React.ComponentProps<typeof WordPopView>> = {}) =>
  html(
    <I18nProvider>
      <WordPopView state={state} mood="idle" beat={0} level={0} open={undefined} onPick={noop} onMic={noop} onSkip={noop} onAgain={noop} {...over} />
    </I18nProvider>,
  )
const count = (s: string, sub: string) => s.split(sub).length - 1

describe('Word Pop screen', () => {
  it('is a paper route', () => {
    expect(PAPER_ROUTES.has('wordpop')).toBe(true)
  })

  it('floats one bubble per practice word on the paper stage, the current one pressed', () => {
    const out = view(run(['bata', 'pusa', 'aso']))
    expect(out).toContain('paper-stage')
    expect(count(out, 'class="wp-bubble')).toBe(3)
    expect(out).toMatch(/aria-pressed="true"[^>]*>[\s\S]*?bata/)
    expect(out).toContain('k-mic')
    expect(out).toContain(fil['wordpop.hint'])
  })

  it('shows how many bubbles have popped', () => {
    const out = view(run(['bata', 'pusa'], ...said('bata')))
    expect(out).toContain(fil['wordpop.count'].replace('{n}', '1').replace('{total}', '2'))
    expect(out).toMatch(/wp-bubble--popped[^>]*>[\s\S]*?bata/)
  })

  it('shows the syllables of the open bubble', () => {
    expect(view(run(['bata', 'pusa']), { open: 0 })).toMatch(/role="status"[^>]*>ba · ta</)
    expect(view(run(['bata', 'pusa']))).not.toContain('ba · ta')
  })

  it('says a kind line after each try', () => {
    expect(view(run(['bata', 'pusa'], ...said('bata')))).toContain(fil['wordpop.said'])
    expect(view(run(['bata', 'pusa'], ...said('aso')))).toContain(fil['wordpop.missed'])
    expect(view(run(['bata', 'pusa'], ...said('aso'), ...said('aso')))).toContain(fil['wordpop.helped'])
    expect(view(run(['bata'], { type: 'mic-started' }, { type: 'stopped' }, { type: 'silence' }))).toContain(fil['reading.silence'])
  })

  it('offers Skip only when the model cannot run', () => {
    expect(view(run(['bata']))).not.toContain(fil['reading.skip'])
    expect(view(run(['bata'], { type: 'model-unavailable' }))).toContain(fil['reading.skip'])
  })

  it('hides the mic when there is no model, so nothing starts a download', () => {
    const out = view(run(['bata'], { type: 'model-unavailable' }))
    expect(out).not.toContain('k-mic')
    expect(out).toContain(fil['reading.skip'])
  })

  it('keeps the stop control when the model goes missing mid-recording', () => {
    expect(view(run(['bata'], { type: 'mic-started' }, { type: 'model-unavailable' }))).toContain('k-mic')
  })

  it('promises syllables only when a bubble really splits', () => {
    expect(view(run(['bata', 'pusa']))).toContain(fil['wordpop.tap'])
    const out = view(run(['pusa', 'aso']), { open: 0 })
    expect(out).not.toContain(fil['wordpop.tap'])
    expect(out).not.toContain('aria-expanded')
  })

  it('celebrates when every bubble has popped, with no mic', () => {
    const out = view(run(['bata'], ...said('bata')), { mood: 'celebrating' })
    expect(out).toContain(fil['wordpop.doneTitle'])
    expect(out).toContain(fil['wordpop.again'])
    expect(out).toMatch(/href="#\/map"/)
    expect(out).not.toContain('k-mic')
  })

  it('keeps the empty state when there are no practice words', () => {
    const out = view(run([]))
    expect(out).toContain(fil['wordpop.emptyTitle'])
    expect(out).not.toContain('k-mic')
  })
})
