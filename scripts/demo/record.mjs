// Records the D4 demo video (issue #28) from a production build. Docs: docs/demo-video.md.
//
//   node scripts/demo/record.mjs                    simulated speech (`?fake`), says so on screen
//   node scripts/demo/record.mjs --voice <dir>      a teammate's golden clips through the real model
//
// Needs ffmpeg on PATH and a Chromium for Playwright (`npx playwright install chromium`, or
// CHROME_PATH). The first run downloads the speech model into scripts/demo/.profile, not recorded.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const VOICE_DIR = arg('--voice')
if (args.includes('--voice') && (!VOICE_DIR || VOICE_DIR.startsWith('--') || !existsSync(VOICE_DIR))) {
  throw new Error('--voice needs a folder of clips: --voice <folder>')
}
const OUT = resolve(arg('--out') ?? 'docs/demo')
const PORT = 4173
const URL = `http://localhost:${PORT}/`
const PROFILE = resolve('scripts/demo/.profile')
const TMP = resolve('scripts/demo/.tmp')
const SIZE = { width: 1280, height: 720 }
const STORY = 'story-1'
// the middle sentences play this many times faster in the cut; the real model thinks for seconds per sentence
const FAST = VOICE_DIR ? 8 : 4

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...m) => console.log('[demo]', ...m)
const launch = (opts = {}) =>
  chromium.launchPersistentContext(PROFILE, {
    executablePath: process.env.CHROME_PATH || undefined,
    viewport: SIZE,
    permissions: ['microphone'],
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
    ...opts,
  })

// ---------- clips: the teammate's golden recordings, as wav so Chromium can decode any source format ----------

function loadClips() {
  if (!VOICE_DIR) return null
  mkdirSync(TMP, { recursive: true })
  const clips = {}
  for (const name of readdirSync(VOICE_DIR)) {
    const id = name.match(/^(story-\d+-\d+)_/)?.[1]
    if (!id || id.split('-')[1] !== STORY.split('-')[1]) continue
    const wav = join(TMP, `${id}.wav`)
    const done = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(VOICE_DIR, name), '-ac', '1', '-ar', '16000', wav])
    if (done.status !== 0) throw new Error(`ffmpeg could not read ${name}`)
    clips[Number(id.split('-')[2])] = readFileSync(wav).toString('base64')
  }
  if (!Object.keys(clips).length) throw new Error(`no ${STORY}-K_<reader> clips in ${VOICE_DIR}`)
  return clips
}

// runs in the page: the app's one shared mic stream becomes a silent local stream that plays a clip on cue
function injectVoice() {
  const ctx = new AudioContext()
  const dest = ctx.createMediaStreamDestination()
  const buffers = {}
  window.__demoVoice = {
    async add(index, base64) {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      buffers[index] = await ctx.decodeAudioData(bytes.buffer)
    },
    play(index) {
      const buffer = buffers[index]
      if (!buffer) return 0
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(dest)
      src.start()
      return buffer.duration
    },
  }
  navigator.mediaDevices.getUserMedia = async () => {
    await ctx.resume()
    return dest.stream
  }
}

// ---------- on-screen text, drawn into the page so the recording carries it ----------

const CARD_CSS = `
  html,body{margin:0;height:100%;background:#7cc6ea;font-family:"Baloo 2","Andika",system-ui,sans-serif;color:#3a2a18}
  .card{height:100%;display:flex;flex-direction:column;justify-content:center;gap:28px;padding:0 120px;box-sizing:border-box}
  .slip{align-self:flex-start;max-width:900px;background:#fffaf0;border:6px solid #fff3d6;border-radius:32px;padding:32px 40px;box-shadow:0 6px 0 #e5c88f,0 14px 28px rgba(27,58,82,.18)}
  h1{margin:0;font-size:64px;line-height:1.05;font-weight:800}
  p{margin:0;font-size:32px;line-height:1.3;font-weight:700}
  small{display:block;margin-top:14px;font-size:20px;font-weight:600;opacity:.75}`

async function card(page, html, ms) {
  await page.setContent(`<style>${CARD_CSS}</style><div class="card">${html}</div>`)
  await sleep(ms)
}

// `top` keeps the caption off a panel at the bottom that the caption itself points at
async function caption(page, text, at = 'bottom') {
  await page.evaluate(([text, at]) => {
    let el = document.getElementById('demo-caption')
    if (!el) {
      el = document.createElement('div')
      el.id = 'demo-caption'
      el.style.cssText =
        'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;max-width:880px;padding:12px 24px;' +
        'border-radius:18px;background:rgba(32,24,14,.88);color:#fff;font:700 24px/1.3 "Baloo 2",system-ui,sans-serif;' +
        'text-align:center;pointer-events:none'
      document.body.appendChild(el)
    }
    el.textContent = text
    el.style.display = text ? 'block' : 'none'
    el.style.top = at === 'top' ? '84px' : 'auto'
    el.style.bottom = at === 'top' ? 'auto' : '28px'
  }, [text, at])
}

// a corner tag that stays on: what is real and what is simulated in this cut, and the live request count
async function tag(page, text) {
  await page.evaluate((text) => {
    let el = document.getElementById('demo-tag')
    if (!el) {
      el = document.createElement('div')
      el.id = 'demo-tag'
      el.style.cssText =
        'position:fixed;right:16px;top:16px;z-index:99999;padding:6px 14px;border-radius:999px;background:rgba(32,24,14,.82);' +
        'color:#fff;font:600 16px/1.3 system-ui,sans-serif;pointer-events:none;white-space:pre'
      document.body.appendChild(el)
    }
    el.textContent = text
  }, text)
}

// ---------- the run ----------

function build() {
  log('building')
  const r = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true })
  if (r.status !== 0) throw new Error('build failed')
}

// shell: true starts vite through a shell; on Windows only a tree kill stops vite itself
function stop(proc) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(proc.pid), '/t', '/f'])
  else proc.kill()
}

async function serve() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true })
  let exited = false
  server.on('exit', () => (exited = true))
  for (let i = 0; i < 60; i++) {
    // a server already on the port would answer for an old build; --strictPort makes ours exit then
    if (exited) throw new Error(`vite preview exited: is something else on port ${PORT}?`)
    try {
      if ((await fetch(URL)).ok) return server
    } catch {
      await sleep(500)
    }
  }
  stop(server)
  throw new Error('vite preview did not start')
}

// one time, not recorded: the model goes into the profile's cache, so "Works offline" is real
async function prepare() {
  const ctx = await launch()
  const page = ctx.pages()[0] ?? (await ctx.newPage())
  await page.goto(URL)
  const badge = page.locator('[data-status]')
  await badge.first().waitFor({ timeout: 30_000 })
  if ((await badge.first().getAttribute('data-status')) !== 'ready') {
    log('downloading the speech model once (about 77 MB)')
    await page.getByRole('button', { name: /download for offline|i-download/i }).click()
    await page.locator('[data-status="ready"]').waitFor({ timeout: 10 * 60_000 })
  }
  // every run starts like a new child: no stars, stickers or practice words from an earlier run
  await page.evaluate(() => ['kislap.progress.v1', 'kislap.today.v1', 'kislap.welcomeBack'].forEach((k) => localStorage.removeItem(k)))
  log('model cached, offline ready, save cleared')
  await ctx.close()
}

async function record(clips) {
  rmSync(join(OUT, 'raw'), { recursive: true, force: true })
  const ctx = await launch({ recordVideo: { dir: join(OUT, 'raw'), size: SIZE } })
  const page = ctx.pages()[0] ?? (await ctx.newPage())
  const t0 = Date.now()
  const marks = {}
  const mark = (name) => (marks[name] = (Date.now() - t0) / 1000)
  const offDevice = []
  let counting = false
  // the context also sees what the service worker and workers fetch, not only the page
  ctx.on('request', (r) => {
    const u = r.url()
    if (counting && !u.startsWith(URL) && !u.startsWith('data:') && !u.startsWith('blob:')) offDevice.push(u)
  })
  if (clips) await page.addInitScript(injectVoice)

  const realOrSim = clips ? 'Real voice, real on-device model' : 'Speech input simulated in this cut'
  const q = clips ? '' : '?fake'
  const mic = page.locator('.k-mic')

  // 1. the problem
  await card(page, `<h1>Kislap</h1><div class="slip"><p>91 percent of 10-year-olds in the Philippines cannot read and understand an age-appropriate text.</p><small>World Bank, April 2026</small></div>`, 7000)
  await card(page, `<div class="slip"><p>Kislap is a reading game. A child reads a Filipino story aloud, and a speech model on the child's own device listens.</p></div>`, 5000)

  // 2. Home, really offline-ready
  await page.goto(`${URL}${q}#/`)
  await page.locator('[data-status="ready"]').waitFor({ timeout: 30_000 })
  await tag(page, realOrSim)
  await caption(page, 'The speech model downloads once. The badge says Kislap now works offline.')
  await sleep(4500)

  // 3. internet off
  await ctx.setOffline(true)
  counting = true
  await tag(page, `${realOrSim}\nInternet: OFF`)
  await caption(page, 'Internet off. From here on, everything runs on this laptop.')
  await sleep(4000)

  // 4. read a story
  await page.goto(`${URL}${q}#/map`)
  await tag(page, `${realOrSim}\nInternet: OFF`)
  await caption(page, 'Pick a story.')
  await sleep(2500)
  await page.goto(`${URL}${q}#/reading/${STORY}`)
  await mic.waitFor()
  if (clips) for (const [i, b64] of Object.entries(clips)) await page.evaluate(([i, b]) => window.__demoVoice.add(Number(i), b), [i, b64])
  const sentences = await page.locator('.rd-dot').count()
  const missing = clips ? Array.from({ length: sentences }, (_, i) => i + 1).filter((n) => !clips[n]) : []
  if (missing.length) throw new Error(`--voice needs a clip for every sentence; missing ${missing.map((n) => `${STORY}-${n}`).join(', ')}`)
  for (let i = 0; i < sentences; i++) {
    await tag(page, `${realOrSim}\nInternet: OFF · requests sent: ${offDevice.length}`)
    if (i === 0) await caption(page, 'The child taps the mic and reads one sentence aloud.')
    if (i === 2) {
      mark('fastStart')
      await caption(page, `Sentences 3 to ${sentences - 1}, sped up`)
    }
    if (i === sentences - 1) {
      mark('fastEnd')
      await caption(page, 'Last sentence.')
    }
    await mic.click()
    const seconds = clips ? await page.evaluate((n) => window.__demoVoice.play(n), i + 1) : 0
    await sleep(Math.max(1400, seconds * 1000 + 400))
    if (await page.locator('.k-mic[aria-pressed="true"]').count()) await mic.click() // auto-stop may already have fired
    await page.getByRole('button', { name: /^(next|susunod)$/i }).waitFor({ timeout: 60_000 })
    if (i === 0) {
      await caption(
        page,
        clips
          ? 'Whisper ran in the browser. Each word is marked: green line, wavy line, or dashed ring.'
          : 'Each word is marked: green line, wavy line, or dashed ring. Live, Whisper does this in the browser.',
      )
      await sleep(3500)
      const chip = page.locator('button.k-word--missed, button.k-word--unclear').first()
      if (await chip.count()) {
        await chip.click()
        await caption(page, 'Tap a word for its syllables and what Ningning heard. It never says wrong.', 'top')
        await sleep(4000)
      }
      await page.locator('.privacy-meter summary').click()
      const meter = await page.locator('.privacy-meter').getAttribute('data-requests')
      if (meter !== '0') throw new Error(`the privacy meter reads ${meter}, not 0: the demo cannot claim 0 requests`)
      await caption(page, `The privacy meter: ${meter} requests. The recorder counted ${offDevice.length} requests leaving the device.`, 'top')
      await sleep(5000)
    } else await sleep(1200)
    await page.getByRole('button', { name: /^(next|susunod)$/i }).click()
  }

  // 5. result
  await page.waitForURL(/#\/result/, { timeout: 30_000 })
  await caption(page, 'Stars for the reading, and a sticker for every finished story.')
  await sleep(8000)

  // 6. Word Pop: the missed words come back
  await page.goto(`${URL}${q}#/wordpop`)
  await tag(page, `${realOrSim}\nInternet: OFF`)
  await caption(page, 'Missed words come back in Word Pop.')
  await sleep(2500)
  const bubbles = await page.locator('button.wp-bubble').count() // a perfect read leaves none
  if (bubbles) {
    await page.locator('button.wp-bubble').first().click()
    await caption(page, 'Tap a bubble to see its syllables.')
    await sleep(2500)
  }
  if (bubbles && !clips) {
    await caption(page, 'Say the word to pop the bubble.')
    for (let n = 0; n < 2 && (await page.locator('button.wp-bubble').count()); n++) {
      await mic.click()
      await sleep(1300)
      await mic.click()
      await sleep(2200)
    }
  }

  // 7. the jar
  await page.goto(`${URL}${q}#/progress`)
  await tag(page, `${realOrSim}\nInternet: OFF`)
  await caption(page, 'Stickers fill the firefly jar. No account, no server.')
  await sleep(6000)

  // 8. why local
  await card(page, `<div class="slip"><p>Why local? A child's voice is sensitive data. Kislap keeps it on the device, and it keeps working where the signal is weak.</p></div><p>kislap.vercel.app · open source on GitHub</p>`, 8000)

  counting = false
  const video = page.video()
  await ctx.close()
  const raw = await video.path()
  log('requests that tried to leave the device, from internet off to the end:', offDevice.length, offDevice)
  if (offDevice.length) throw new Error('requests left the device: the video cannot claim 0')
  return { raw, marks, offDevice: offDevice.length }
}

// the middle sentences play FAST times faster; the rest at normal speed
function cut(raw, marks, name) {
  const out = join(OUT, name)
  const a = marks.fastStart
  const b = marks.fastEnd
  const filter =
    a && b
      ? `[0:v]trim=0:${a},setpts=PTS-STARTPTS[v0];[0:v]trim=${a}:${b},setpts=(PTS-STARTPTS)/${FAST}[v1];` +
        `[0:v]trim=${b},setpts=PTS-STARTPTS[v2];[v0][v1][v2]concat=n=3:v=1[v]`
      : '[0:v]setpts=PTS-STARTPTS[v]'
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-filter_complex', filter, '-map', '[v]', '-r', '30', '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error('ffmpeg failed')
  return out
}

const clips = loadClips()
mkdirSync(OUT, { recursive: true })
if (!args.includes('--no-build')) build()
const server = await serve()
try {
  await prepare()
  const { raw, marks, offDevice } = await record(clips)
  const out = cut(raw, marks, clips ? 'kislap-demo.mp4' : 'kislap-demo-backup.mp4')
  writeFileSync(join(OUT, 'last-run.json'), JSON.stringify({ voice: !!clips, marks, requestsLeavingDevice: offDevice }, null, 2) + '\n')
  rmSync(join(OUT, 'raw'), { recursive: true, force: true })
  log('wrote', out)
} finally {
  stop(server)
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
}
