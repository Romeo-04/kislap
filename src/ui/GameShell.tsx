import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { loadSettings, saveSettings } from '../game/settings'
import { GearIcon, SpeakerIcon } from './icons'
import { GameIcon } from './GameIcon'
import { OfflineBadge } from './OfflineBadge'

export function GameShell({ children, route }: { children: ReactNode; route: string }) {
  const { t, lang, setLang } = useI18n()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(loadSettings)
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
  return <div className={`game-shell ${adventure ? 'game-shell--adventure' : 'game-shell--quiet'} ${tabRoute ? 'game-shell--tabs' : 'game-shell--task'}`}>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>{fil ? 'Pumunta sa nilalaman' : 'Skip to content'}</a>
    <header className="game-header" onClick={(event) => { if ((event.target as Element).closest('a')) setSettingsOpen(false) }}>
      {!tabRoute && <a className="app-back round-button" href={backHref} aria-label={t('nav.back')}><GameIcon name="back" /></a>}
      <a className="brand" href="#/" aria-label="Kislap"><span className="brand-spark"><GameIcon name="sparkle" size={30} /></span><span>kislap<span className="brand-dot">.</span></span></a>
      <nav className="main-nav" aria-label={fil ? 'Pangunahing menu' : 'Main navigation'}>
        <a href="#/map" aria-current={adventure ? 'page' : undefined}><GameIcon name="map" />{fil ? 'Mga kuwento' : 'Story map'}</a>
        <a href="#/progress" aria-current={route === 'progress' ? 'page' : undefined}><GameIcon name="star" />{t('progress.stickers')}</a>
      </nav>
      <div className="header-tools">
        <span className="stat-pill" title={t('result.stars')}><GameIcon name="star" /><b>{stars}</b><span className="stat-total">/ 9</span></span>
        <button className="language-button" onClick={() => setLang(fil ? 'en' : 'fil')} aria-label={t('settings.language')}>{fil ? 'EN' : 'FIL'}</button>
        <button className="round-button" aria-label={t('settings.title')} aria-expanded={settingsOpen} aria-controls="game-settings" onClick={() => setSettingsOpen(!settingsOpen)}><GearIcon /></button>
      </div>
    </header>
    {settingsOpen && <button className="sheet-scrim" aria-label={fil ? 'Isara' : 'Close'} tabIndex={-1} onClick={() => setSettingsOpen(false)} />}
    {settingsOpen && <section id="game-settings" className="settings-panel" aria-label={t('settings.title')} onKeyDown={(event) => { if (event.key === 'Escape') setSettingsOpen(false) }}>
      <div className="section-heading"><h2>{t('settings.title')}</h2><button className="round-button" aria-label={fil ? 'Isara' : 'Close'} onClick={() => setSettingsOpen(false)}><GameIcon name="close" /></button></div>
      <button className="setting-row" aria-pressed={settings.sound} onClick={() => setSettings({ ...settings, sound: !settings.sound })}><SpeakerIcon />{t('settings.sound')}<b>{t(settings.sound ? 'settings.on' : 'settings.off')}</b></button>
      <button className="setting-row" aria-pressed={settings.theme === 'gabi'} onClick={() => setSettings({ ...settings, theme: settings.theme === 'day' ? 'gabi' : 'day' })}><GameIcon name="moon" />{t('settings.night')}<b>{t(settings.theme === 'gabi' ? 'settings.on' : 'settings.off')}</b></button>
      <a className="setting-row" href="#/miccheck" onClick={() => setSettingsOpen(false)}>{t('miccheck.title')}<GameIcon name="arrow" /></a>
      <OfflineBadge />
      <p className="sheet-privacy"><GameIcon name="shield" size={18} />{fil ? 'Ang boses mo, sa device mo lang.' : 'Your voice stays on your device.'}</p>
    </section>}
    <main id="main-content" className={`screen ${adventure ? 'screen--adventure' : 'screen--quiet'}`} tabIndex={-1}>{children}</main>
    {tabRoute && <nav className="tab-bar" aria-label={fil ? 'Pangunahing menu' : 'Main navigation'}>
      <a href="#/" aria-current={route === 'home' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="home" /></span>{fil ? 'Simula' : 'Home'}</a>
      <a href="#/map" aria-current={route === 'map' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="map" /></span>{fil ? 'Kuwento' : 'Stories'}</a>
      <a href="#/progress" aria-current={route === 'progress' ? 'page' : undefined}><span className="tab-icon"><GameIcon name="star" /></span>{t('progress.stickers')}</a>
    </nav>}
    <footer className="game-footer"><span><GameIcon name="shield" size={18} />{fil ? 'Ang boses mo, sa device mo lang.' : 'Your voice stays on your device.'}</span><span>{t('app.tagline')}</span></footer>
  </div>
}
