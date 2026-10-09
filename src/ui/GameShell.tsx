import { useEffect, useRef, useState, type ReactNode, useReducer } from 'react'
import { STORIES } from '../content/stories'
import { useI18n } from '../i18n'
import { loadProgress, PROGRESS_SAVED } from '../game/progress'
import { loadSettings, saveSettings } from '../game/settings'
import { GearIcon, SpeakerIcon } from './icons'
import { GameIcon } from './GameIcon'
import { OfflineBadge } from './OfflineBadge'

/** Screens already drawn in the paper puppet look (Claude Design part 2): they bring their own
 * paper scene and header, so the older candy header, tab bar and footer stay off. */
export const PAPER_ROUTES = new Set(['home', 'map', 'reading', 'result', 'progress', 'settings', 'miccheck', 'wordpop'])

export function GameShell({ children, route }: { children: ReactNode; route: string }) {
  const { t, lang, setLang } = useI18n()
  // Remember the screen the sheet was opened on: going anywhere else closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  // Leaving the screen forgets the sheet, so coming back does not reopen it.
  if (openedOn !== null && openedOn !== route) setOpenedOn(null)
  const settingsOpen = openedOn === route
  const setSettingsOpen = (open: boolean) => setOpenedOn(open ? route : null)
  const [settings, setSettings] = useState(loadSettings)
  // the Settings screen saves on its own; pick its changes up when the child moves on
  const [syncedRoute, setSyncedRoute] = useState(route)
  if (syncedRoute !== route) {
    setSyncedRoute(route)
    setSettings(loadSettings())
  }
  // Re-render when progress is saved (Result saves after it renders), so the star count is current.
  const [, progressSaved] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    window.addEventListener(PROGRESS_SAVED, progressSaved)
    return () => window.removeEventListener(PROGRESS_SAVED, progressSaved)
  }, [])
  const progress = loadProgress()
  const stars = Object.values(progress.stars).reduce<number>((sum, n) => sum + n, 0)
  const fil = lang === 'fil'
  const adventure = route === 'home' || route === 'map'
  // Phones: the tab bar shows on the three places a child browses; task screens (reading, result,
  // checks) hide it and show a back arrow instead, like a native app.
  const tabRoute = adventure || route === 'progress'
  const backHref = route === 'reading' || route === 'result' ? '#/map' : '#/'
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    saveSettings(settings)
    // The Android status bar follows the app background (day and gabi).
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [settings])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  // While open: focus moves into the sheet, Escape closes it from anywhere, focus returns to the gear.
  const gearRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!settingsOpen) return
    closeRef.current?.focus()
    const gear = gearRef.current
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenedOn(null) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      gear?.focus()
    }
  }, [settingsOpen])
  // On phones the sheet is modal: the page behind it is inert.
  const sheetModal = settingsOpen && typeof matchMedia !== 'undefined' && matchMedia('(max-width: 768px)').matches
  if (PAPER_ROUTES.has(route)) return <main id="main-content" className="paper-main" tabIndex={-1}>{children}</main>
  return <div className={`game-shell ${adventure ? 'game-shell--adventure' : 'game-shell--quiet'} ${tabRoute ? 'game-shell--tabs' : 'game-shell--task'}`}>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>{t('shell.skip')}</a>
    <header className="game-header" onClick={(event) => { if ((event.target as Element).closest('a')) setSettingsOpen(false) }}>
      {!tabRoute && <a className="app-back round-button" href={backHref} aria-label={t('nav.back')}><GameIcon name="back" /></a>}
      <a className="brand" href="#/" aria-label="Kislap"><span className="brand-spark"><GameIcon name="sparkle" size={30} /></span><span>kislap<span className="brand-dot">.</span></span></a>
      <nav className="main-nav" aria-label={t('shell.headerNav')}>
        <a href="#/map" aria-current={route === 'map' ? 'page' : undefined}><GameIcon name="map" />{t('shell.storyMap')}</a>
        <a href="#/progress" aria-current={route === 'progress' ? 'page' : undefined}><GameIcon name="star" />{t('progress.stickers')}</a>
      </nav>
      <div className="header-tools">
        <span className="stat-pill" title={t('result.stars')}><GameIcon name="star" /><b>{stars}</b><span className="stat-total">{t('shell.starsTotal').replace('{n}', String(STORIES.length * 3))}</span></span>
        <button className="language-button" onClick={() => setLang(fil ? 'en' : 'fil')} aria-label={t('settings.language')}>{fil ? 'EN' : 'FIL'}</button>
        <button ref={gearRef} className="round-button" aria-label={t('settings.title')} aria-expanded={settingsOpen} aria-controls="game-settings" onClick={() => setSettingsOpen(!settingsOpen)}><GearIcon /></button>
      </div>
    </header>
    {settingsOpen && <button className="sheet-scrim" aria-label={t('shell.close')} tabIndex={-1} onClick={() => setSettingsOpen(false)} />}
    {settingsOpen && <section id="game-settings" className="settings-panel" aria-label={t('settings.title')} {...(sheetModal ? { role: 'dialog', 'aria-modal': true } : {})}>
      <div className="section-heading"><h2>{t('settings.title')}</h2><button ref={closeRef} className="round-button" aria-label={t('shell.close')} onClick={() => setSettingsOpen(false)}><GameIcon name="close" /></button></div>
      <button className="setting-row" aria-pressed={settings.sound} onClick={() => setSettings({ ...settings, sound: !settings.sound })}><SpeakerIcon />{t('settings.sound')}<b>{t(settings.sound ? 'settings.on' : 'settings.off')}</b></button>
      <button className="setting-row" aria-pressed={settings.theme === 'gabi'} onClick={() => setSettings({ ...settings, theme: settings.theme === 'day' ? 'gabi' : 'day' })}><GameIcon name="moon" />{t('settings.night')}<b>{t(settings.theme === 'gabi' ? 'settings.on' : 'settings.off')}</b></button>
      <a className="setting-row" href="#/miccheck" onClick={() => setSettingsOpen(false)}>{t('miccheck.title')}<GameIcon name="arrow" /></a>
      <OfflineBadge />
      <p className="sheet-privacy"><GameIcon name="shield" size={18} />{t('shell.privacy')}</p>
    </section>}
    <main inert={sheetModal || undefined} id="main-content" className={`screen ${adventure ? 'screen--adventure' : 'screen--quiet'}`} tabIndex={-1}>{children}</main>
    {tabRoute && <nav inert={sheetModal || undefined} className="tab-bar" aria-label={t('shell.tabNav')}>
      <a href="#/" aria-current={route === 'home' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="home" /></span>{t('shell.tabHome')}</a>
      <a href="#/map" aria-current={route === 'map' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="map" /></span>{t('shell.tabStories')}</a>
      <a href="#/progress" aria-current={route === 'progress' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="star" /></span>{t('progress.stickers')}</a>
    </nav>}
    <footer className="game-footer"><span><GameIcon name="shield" size={18} />{t('shell.privacy')}</span><span>{t('app.tagline')}</span></footer>
  </div>
}
