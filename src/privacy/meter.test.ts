import { describe, expect, it } from 'vitest'
import { summarize, type ResourceLike } from './meter'

const ORIGIN = 'https://kislap.vercel.app'
const entry = (name: string, transferSize: number): ResourceLike => ({ name, transferSize })

describe('summarize', () => {
  it('reports nothing for an empty session', () => {
    expect(summarize([], ORIGIN)).toEqual({ requests: 0, bytes: 0, urls: [] })
  })

  it('ignores same-origin files served from the cache (transferSize 0)', () => {
    expect(summarize([entry(`${ORIGIN}/sounds/pop.mp3`, 0)], ORIGIN).requests).toBe(0)
  })

  it('counts same-origin files fetched from the network', () => {
    const s = summarize([entry(`${ORIGIN}/assets/index.js`, 1200)], ORIGIN)
    expect(s).toEqual({ requests: 1, bytes: 1200, urls: [`${ORIGIN}/assets/index.js`] })
  })

  it('always counts cross-origin requests, even when the browser hides their size', () => {
    const s = summarize([entry('https://example-analytics.com/collect', 0)], ORIGIN)
    expect(s.requests).toBe(1)
    expect(s.urls).toEqual(['https://example-analytics.com/collect'])
  })

  it('ignores blob: and data: URLs, which never leave the device', () => {
    const s = summarize([entry('blob:https://kislap.vercel.app/1234', 0), entry('data:audio/wav;base64,AAAA', 0)], ORIGIN)
    expect(s.requests).toBe(0)
  })

  it('adds up several requests', () => {
    const s = summarize(
      [entry(`${ORIGIN}/a.js`, 100), entry('https://huggingface.co/model.onnx', 5000), entry(`${ORIGIN}/b.css`, 0)],
      ORIGIN,
    )
    expect(s.requests).toBe(2)
    expect(s.bytes).toBe(5100)
  })
})
