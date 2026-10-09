// Golden recordings page (/#/golden) for issue #18.
// 1. Record: tap a clip, read the sentence, a file named <clip>__<reader>.webm downloads. Put it in fixtures/.
// 2. Check: load the clip files, pick setups, and see the heard text per clip. Copy the table for the scorer owner.
// Audio stays on this device. The files are gitignored.
import { useState } from 'react'
import expected from '../../fixtures/expected.json'
import { openSession, SETUPS, toPcm } from '../asr/devkit'

interface Clip {
  id: string
  storyId: string
  sentence: number
  variant: string
  text: string
}

const CLIPS = expected.clips as Clip[]
const RECORD_MS = 8000

interface Row {
  clip: string
  reader: string
  setup: string
  heard: string
  ms: number | string
}

/** "s1-01-clean__marcus.webm" -> { clip: "s1-01-clean", reader: "marcus" } */
function parseName(name: string): { clip: string; reader: string } {
  const base = name.replace(/\.[^.]+$/, '')
  const [clip, reader = 'unknown'] = base.split('__')
  return { clip, reader }
}

export function Golden() {
  const [reader, setReader] = useState('')
  const [status, setStatus] = useState('Step 1: type your name, then record each sentence.')
  const [files, setFiles] = useState<File[]>([])
  const [picked, setPicked] = useState<boolean[]>(SETUPS.map((_, i) => i === 0))
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)

  const record = async (clip: Clip) => {
    if (!reader.trim()) return setStatus('Type your name first. It goes in the file name.')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => chunks.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop())
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))
        a.download = `${clip.id}__${reader.trim().toLowerCase().replace(/\s+/g, '-')}.webm`
        a.click()
        setStatus(`Saved ${a.download}. Move it into the fixtures folder.`)
      }
      rec.start()
      setStatus(`Recording ${RECORD_MS / 1000} s. Read: "${clip.text}" (${clip.variant})`)
      setTimeout(() => rec.stop(), RECORD_MS)
    } catch (err) {
      setStatus(`mic error: ${(err as Error).message}`)
    }
  }

  const run = async () => {
    setBusy(true)
    setRows([])
    for (const [i, setup] of SETUPS.entries()) {
      if (!picked[i]) continue
      try {
        setStatus(`Loading ${setup.label}…`)
        const session = await openSession(setup, setStatus)
        for (const file of files) {
          const { clip, reader: who } = parseName(file.name)
          setStatus(`${setup.label}: ${file.name}`)
          const out = await session.transcribe(await toPcm(file))
          setRows((r) => [...r, { clip, reader: who, setup: setup.label, heard: out.text, ms: out.ms }])
        }
        session.close()
      } catch (err) {
        setRows((r) => [...r, { clip: '–', reader: '–', setup: setup.label, heard: `ERROR: ${(err as Error).message}`, ms: '–' }])
      }
    }
    setStatus('Done. Copy the table and send it to the scorer owner.')
    setBusy(false)
  }

  const textOf = (id: string) => CLIPS.find((c) => c.id === id)?.text ?? '(unknown clip)'
  const table = [
    '| Clip | Reader | Setup | Expected | Heard | ms |',
    '|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.clip} | ${r.reader} | ${r.setup} | ${textOf(r.clip)} | ${r.heard} | ${r.ms} |`),
  ].join('\n')

  return (
    <section className="stack">
      <h1>Golden recordings</h1>
      <p>{status}</p>

      <h2>1. Record</h2>
      <label>
        Your name <input value={reader} onChange={(e) => setReader(e.target.value)} />
      </label>
      <ul>
        {CLIPS.map((c) => (
          <li key={c.id}>
            <button onClick={() => record(c)} disabled={busy}>🎤 {c.id}</button> {c.text} <em>({c.variant})</em>
          </li>
        ))}
      </ul>

      <h2>2. Check</h2>
      <input type="file" accept="audio/*" multiple onChange={(e) => setFiles([...(e.target.files ?? [])])} />
      <p>{files.length} clip file(s) loaded.</p>
      {SETUPS.map((s, i) => (
        <label key={s.label} style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={picked[i]}
            onChange={() => setPicked((p) => p.map((v, j) => (j === i ? !v : v)))}
          />{' '}
          {s.label}
        </label>
      ))}
      <button className="big" onClick={run} disabled={busy || files.length === 0 || !picked.some(Boolean)}>
        Transcribe clips
      </button>
      {rows.length > 0 && <textarea readOnly rows={10} value={table} style={{ width: '100%' }} />}
      <a href="#/">Back</a>
    </section>
  )
}
