import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { Settings } from './Settings'
import { MicCheck, MicCheckView } from './MicCheck'
import { initialMicCheck } from '../game/micCheck'
import fil from '../i18n/fil.json'

const wrap = (el: React.ReactElement) => html(<I18nProvider>{el}</I18nProvider>)
const count = (s: string, sub: string) => s.split(sub).length - 1

describe('Settings', () => {
  it('names each language in its own words and marks the chosen one', () => {
    const out = wrap(<Settings />)
    expect(out).toContain('>Filipino<')
    expect(out).toContain('>English<')
    expect(out).toMatch(/aria-pressed="true"[^>]*>Filipino</)
  })

  it('says each switch state in a word, not only colour', () => {
    const out = wrap(<Settings />)
    expect(count(out, 'role="switch"')).toBe(2)
    expect(out).toContain('aria-checked="true"') // sound on by default
    expect(out).toContain(fil['settings.on'])
    expect(out).toContain(fil['settings.off']) // night off by default
  })

  it('links to the mic check', () => {
    expect(wrap(<Settings />)).toContain('href="#/miccheck"')
  })
})

describe('MicCheck', () => {
  it('measures the room first, with a ten-segment bar and no phrase to say yet', () => {
    const out = wrap(<MicCheck />)
    expect(out).toContain(fil['miccheck.say'])
    expect(out).not.toContain('Kumusta, Ningning!')
    expect(count(out, 'class="mc-seg')).toBe(10)
  })

  it('asks the child to say hello once it is listening', () => {
    expect(wrap(<MicCheckView state={{ ...initialMicCheck, phase: 'listening' }} fill={0} />)).toContain('Kumusta, Ningning!')
  })

  it('says so when there is no microphone, with a way to try again', () => {
    const out = wrap(<MicCheckView state={{ ...initialMicCheck, phase: 'unavailable' }} fill={0} />)
    expect(out).toContain('Hindi mahanap ni Ningning ang mikropono')
    expect(out).toContain('Ulitin')
    expect(count(out, 'class="mc-step"')).toBe(0)
  })

  it('offers the read button only after hearing the child', () => {
    expect(wrap(<MicCheckView state={initialMicCheck} fill={0} />)).not.toContain('Tara, magbasa na!')
    expect(wrap(<MicCheckView state={{ ...initialMicCheck, phase: 'heard' }} fill={1} />)).toContain('Tara, magbasa na!')
  })

  it('shows three steps when the mic is not allowed', () => {
    const out = wrap(<MicCheckView state={{ ...initialMicCheck, phase: 'denied' }} fill={0} />)
    expect(out).toContain('Kailangan ni Ningning ang mikropono')
    expect(count(out, 'class="mc-step"')).toBe(3)
  })

  it('tells a noisy room apart from the child', () => {
    const out = wrap(<MicCheckView state={{ ...initialMicCheck, phase: 'noisy' }} fill={0.7} />)
    expect(out).toContain('Medyo maingay dito')
    expect(out).toContain('mc-bar--noise')
  })
})
