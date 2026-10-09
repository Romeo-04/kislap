// PLACEHOLDER screen — design: issue #10 (designer); real wiring: issue #3 (lead).
// Runs on the fake recorder and fake model: the fake "hears" the sentence minus its last word.
import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { getStory } from '../content/stories'
import { createRecorder } from '../asr/audio'
import { setFakeHeard, transcribe } from '../asr/transcribe'
import { scoreReading, type WordResult } from '../scoring/score'
import { createSession } from '../game/session'
import { addPracticeWords, loadProgress, saveProgress } from '../game/progress'
import { moodFor, type MascotMood } from '../game/mascot'
import { go } from './router'

type Phase = 'ready' | 'listening' | 'thinking' | 'reviewed'

export function Reading({ storyId }: { storyId: string }) {
  const { t } = useI18n()
  const story = getStory(storyId)
  const recorder = useMemo(() => createRecorder(), [])
  const session = useMemo(() => createSession(storyId), [storyId])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [words, setWords] = useState<WordResult[]>([])
  const [mood, setMood] = useState<MascotMood>('idle')

  if (!story) return <p>Story not found.</p>
  const sentence = story.sentences[index]

  const onMic = async () => {
    if (phase === 'listening') {
      setPhase('thinking')
      setMood(moodFor('mic-off'))
      const pcm = await recorder.stop()
      setFakeHeard(sentence.text.split(' ').slice(0, -1).join(' '))
      const { text } = await transcribe(pcm)
      const scored = scoreReading(sentence.text, text)
      session.attempts.push({ sentenceIndex: index, heard: text, ...scored })
      setWords(scored.words)
      setMood(moodFor('scored', scored.accuracy))
      setPhase('reviewed')
    } else {
      await recorder.start()
      setWords([])
      setMood(moodFor('mic-on'))
      setPhase('listening')
    }
  }

  const onNext = () => {
    if (index + 1 < story.sentences.length) {
      setIndex(index + 1)
      setWords([])
      setPhase('ready')
      setMood('idle')
    } else {
      saveProgress(addPracticeWords(loadProgress(), session.practiceWords()))
      sessionStorage.setItem(`kislap.result.${storyId}`, String(session.accuracy()))
      go(`result/${storyId}`)
    }
  }

  return (
    <section className="stack">
      <p className="muted">
        {index + 1} / {story.sentences.length} · Ningning: {mood}
      </p>
      <p className="sentence">
        {words.length
          ? words.map((w, i) => <span key={i} className={`word ${w.status}`}>{w.word} </span>)
          : sentence.text}
      </p>
      <button className="big mic" onClick={onMic} disabled={phase === 'thinking'}>
        {phase === 'listening' ? '⏹' : '🎤'}
      </button>
      <p className="muted">
        {phase === 'listening' ? t('reading.listening') : phase === 'thinking' ? t('reading.thinking') : t('reading.tapMic')}
      </p>
      {phase === 'reviewed' && (
        <div className="row">
          <button onClick={onMic}>{t('reading.retry')}</button>
          <button className="big" onClick={onNext}>{t('reading.next')}</button>
        </div>
      )}
    </section>
  )
}
