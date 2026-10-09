import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup as html } from 'react-dom/server'
import { I18nProvider } from '../i18n'
import { TopBar } from './TopBar'
import { goUp } from './goBack'

vi.mock('./goBack', () => ({ goUp: vi.fn() }))
// SSR runs no clicks: keep the back button's handler so the test can press it
let press: () => void = () => {}
vi.mock('./Button', () => ({
  IconButton: ({ onClick }: { onClick: () => void }) => {
    press = onClick
    return <button type="button" />
  },
}))

describe('TopBar back', () => {
  it('goes up to Home unless told otherwise', () => {
    html(<I18nProvider><TopBar title="Map" /></I18nProvider>)
    press()
    expect(goUp).toHaveBeenLastCalledWith('#/')
  })

  it('goes up to the parent it is given, e.g. Mic check to Settings', () => {
    html(<I18nProvider><TopBar title="Mic" up="#/settings" /></I18nProvider>)
    press()
    expect(goUp).toHaveBeenLastCalledWith('#/settings')
  })
})
