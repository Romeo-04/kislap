import { useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { Ningning } from '../ui/Ningning'
import { GameIcon } from '../ui/GameIcon'

export function WordPop() {
  const { t } = useI18n()
  const [words] = useState(() => loadProgress().practiceWords)
  const [selected, setSelected] = useState(0)
  return (
    <section className="stack center">
      <h1>{t('wordpop.title')}</h1>
      <Ningning mood="encouraging" size={140} />
      {words.length ? <>
        <p>{t('wordpop.pick')}</p>
        <div className="practice-words">{words.map((word, index) => <button className="practice-word" key={word} aria-pressed={index === selected} onClick={() => setSelected(index)}>{word}</button>)}</div>
        <p className="practice-prompt" aria-live="polite">{t('wordpop.together').replace('{word}', words[selected])}</p>
        <button className="candy-button" onClick={() => setSelected((selected + 1) % words.length)}>{t('wordpop.next')}<GameIcon name="arrow" /></button>
      </> : <>
        <h2>{t('wordpop.emptyTitle')}</h2>
        <p>{t('wordpop.emptyBody')}</p>
      </>}
      <a className={words.length ? 'text-link' : 'candy-button'} href="#/map"><GameIcon name="book" />{t('result.more')}</a>
    </section>
  )
}
