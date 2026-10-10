// Teachers' own stories: paste a short text, read it with the same scoring, syllables and stars.
// Saved only on this device (customStories.ts); nothing is uploaded.
import { useState } from 'react'
import { useI18n } from '../i18n'
import { loadCustomStories, makeStory, saveCustomStories, toSentences } from '../content/customStories'
import type { Level, Story } from '../content/stories'
import { Button } from '../ui/Button'
import { TopBar } from '../ui/TopBar'
import { PaperScene } from '../ui/PaperScene'
import { ParentGate } from '../ui/ParentGate'
import './screens.css'

const LEVELS: Level[] = ['easy', 'medium', 'hard']

export function MyStory() {
  const { t } = useI18n()
  const [stories, setStories] = useState<Story[]>(loadCustomStories)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [level, setLevel] = useState<Level>('easy')
  const [error, setError] = useState(false)
  const count = toSentences(text).length

  const save = () => {
    const story = makeStory(title, text, level)
    if (!story) return setError(true)
    const next = [...stories, story]
    saveCustomStories(next)
    setStories(next)
    setTitle('')
    setText('')
    setError(false)
  }

  const remove = (id: string) => {
    const next = stories.filter((s) => s.id !== id)
    saveCustomStories(next)
    setStories(next)
  }

  return (
    <section className="ms-screen paper-stage">
      <PaperScene hills="low" />
      <TopBar title={t('mystory.title')} />
      <ParentGate>
      <div className="ms-card">
        <p className="ms-intro">{t('mystory.intro')}</p>
        <label className="ms-field">
          <span>{t('mystory.name')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} lang="fil" />
        </label>
        <label className="ms-field">
          <span>{t('mystory.level')}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{t(`level.${l}`)}</option>
            ))}
          </select>
        </label>
        <label className="ms-field">
          <span>{t('mystory.text')}</span>
          <textarea value={text} onChange={(e) => { setText(e.target.value); setError(false) }} rows={7} lang="fil" />
        </label>
        <p className="ms-count" aria-live="polite">{t('mystory.preview').replace('{n}', String(count))}</p>
        {error && <p className="ms-error" role="alert">{t('mystory.empty')}</p>}
        <Button onClick={save}>{t('mystory.save')}</Button>
      </div>
      {stories.length > 0 && (
        <div className="ms-card">
          <h2 className="ms-h2">{t('mystory.saved')}</h2>
          <ul className="ms-list">
            {stories.map((s) => (
              <li key={s.id} className="ms-item">
                <span className="ms-item__title" lang="fil">{s.title.fil}</span>
                <span className="ms-item__meta">{t(`level.${s.level}`)} · {t('mystory.preview').replace('{n}', String(s.sentences.length))}</span>
                <a className="ms-read" href={`#/reading/${s.id}`}>{t('mystory.read')}</a>
                <button type="button" className="ms-delete" onClick={() => remove(s.id)}>{t('mystory.delete')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      </ParentGate>
    </section>
  )
}
