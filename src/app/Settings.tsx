// Settings (Claude Design layer 6): language, Sound, Gabi (night), and the way to the mic check.
import { useState } from 'react'
import { useI18n, type Lang } from '../i18n'
import { loadSettings, saveSettings, type Settings as SettingsData } from '../game/settings'
import { Ningning } from '../ui/Ningning'
import { TopBar } from '../ui/TopBar'
import { ChevronIcon, MicIcon } from '../ui/icons'
import { applyTheme } from '../ui/theme'
import './screens.css'

// each language is written in its own words, so a reader of either can find it
const LANGS: { id: Lang; name: string }[] = [
  { id: 'fil', name: 'Filipino' },
  { id: 'en', name: 'English' },
]

function SwitchRow({ label, on, onToggle, onWord, offWord }: { label: string; on: boolean; onToggle: () => void; onWord: string; offWord: string }) {
  return (
    <button type="button" className="st-card st-row" role="switch" aria-checked={on} onClick={onToggle}>
      <span className="st-label">{label}</span>
      <span className="st-state">
        <span className="st-word">{on ? onWord : offWord}</span>
        <span className={on ? 'st-track st-track--on' : 'st-track'} aria-hidden="true">
          <span className="st-knob" />
        </span>
      </span>
    </button>
  )
}

export function Settings() {
  const { t, lang, setLang } = useI18n()
  const [settings, setSettings] = useState<SettingsData>(loadSettings)

  const update = (next: SettingsData) => {
    setSettings(next)
    saveSettings(next)
    applyTheme(next.theme)
  }

  return (
    <section className="st-screen">
      <TopBar title={t('settings.title')} />
      <div className="st-list">
        <div className="st-card">
          <span className="st-label">{t('settings.language')}</span>
          <div className="st-pills">
            {LANGS.map((l) => (
              <button key={l.id} type="button" lang={l.id} className="st-pill" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
        <SwitchRow
          label={t('settings.sound')}
          on={settings.sound}
          onToggle={() => update({ ...settings, sound: !settings.sound })}
          onWord={t('settings.on')}
          offWord={t('settings.off')}
        />
        <SwitchRow
          label={t('settings.night')}
          on={settings.theme === 'gabi'}
          onToggle={() => update({ ...settings, theme: settings.theme === 'gabi' ? 'day' : 'gabi' })}
          onWord={t('settings.on')}
          offWord={t('settings.off')}
        />
        <a className="st-mic" href="#/miccheck">
          <MicIcon size={26} />
          <span>{t('miccheck.title')}</span>
          <ChevronIcon />
        </a>
      </div>
      <div className="st-mascot">
        <Ningning mood="idle" glow={settings.theme === 'gabi' ? 1 : 0.6} size={130} />
      </div>
    </section>
  )
}
