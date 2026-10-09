// Golden recordings check page (/#/golden) for issue #18.
// Record the clips listed in fixtures/expected.json with any recorder, name them <clip id>__<reader>.<ext>,
// load them here, pick setups, and see the heard text per clip. Copy the table for the scorer owner.
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
  const [status, setStatus] = useState('Load your clip files, pick setups, then transcribe.')
  const [files, setFiles] = useState<File[]>([])
  const [picked, setPicked] = useState<boolean[]>(SETUPS.map((_, i) => i === 0))
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)

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

      <ul>
        {CLIPS.map((c) => (
          <li key={c.id}>
            <strong>{c.id}</strong>: {c.text} <em>({c.variant})</em>
          </li>
        ))}
      </ul>

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
