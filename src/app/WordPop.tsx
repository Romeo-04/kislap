import { useState } from 'react'
import { useI18n } from '../i18n'
import { loadProgress } from '../game/progress'
import { Ningning } from '../ui/Ningning'
import { GameIcon } from '../ui/GameIcon'

export function WordPop() {
  const { t, lang } = useI18n()
  const [words] = useState(() => loadProgress().practiceWords)
  const [selected, setSelected] = useState(0)
  const fil = lang === 'fil'
  return (
    <section className="stack center">
      <h1>{t('wordpop.title')}</h1>
      <Ningning mood="encouraging" size={140} />
      {words.length ? <>
        <p>{fil ? 'Pumili ng salita at basahin ito nang malakas.' : 'Pick a word and practice saying it aloud.'}</p>
        <div className="practice-words">{words.map((word, index) => <button className="practice-word" key={word} aria-pressed={index === selected} onClick={() => setSelected(index)}>{word}</button>)}</div>
        <p className="practice-prompt" aria-live="polite">{t('wordpop.together').replace('{word}', words[selected])}</p>
        <button className="candy-button" onClick={() => setSelected((selected + 1) % words.length)}>{fil ? 'Susunod na salita' : 'Next word'}<GameIcon name="arrow" /></button>
      </> : <>
        <h2>{fil ? 'Dito tutubo ang iyong galing!' : 'A little practice, a little sparkle!'}</h2>
        <p>{fil ? 'Magbasa muna ng kuwento. Makikita rito ang mga salitang maaari mo pang sanayin.' : 'Read a story first. Words you can practice will be waiting for you here.'}</p>
      </>}
      <a className={words.length ? 'text-link' : 'candy-button'} href="#/map"><GameIcon name="book" />{t('result.more')}</a>
    </section>
  )
}
