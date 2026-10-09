// Privacy meter (issue #6, ADR-0007): counts the page's own network requests while the Reading screen is open.
// Resource Timing reports bytes received, not sent, and hides cross-origin sizes, so the meter counts
// *requests*: every cross-origin request, and every same-origin request not served from the cache.

export interface ResourceLike {
  name: string
  transferSize: number
}

export interface PrivacySummary {
  requests: number
  bytes: number
  urls: string[]
}

export function summarize(entries: ResourceLike[], origin: string): PrivacySummary {
  const out: PrivacySummary = { requests: 0, bytes: 0, urls: [] }
  for (const e of entries) {
    if (e.name.startsWith('blob:') || e.name.startsWith('data:')) continue
    const sameOrigin = e.name.startsWith(`${origin}/`) || e.name === origin
    if (sameOrigin && e.transferSize === 0) continue // served from the cache / service worker
    out.requests++
    out.bytes += e.transferSize
    out.urls.push(e.name)
  }
  return out
}

export interface PrivacyMeter {
  snapshot(): PrivacySummary
  onChange(cb: (s: PrivacySummary) => void): () => void
  /** For requests the page cannot see, e.g. from the model worker. Not wired yet: nothing calls it. */
  report(entry: ResourceLike): void
  stop(): void
}

export function startPrivacyMeter(): PrivacyMeter {
  const seen: ResourceLike[] = []
  const listeners = new Set<(s: PrivacySummary) => void>()
  const snapshot = () => summarize(seen, location.origin)
  const add = (entries: ResourceLike[]) => {
    seen.push(...entries.map(({ name, transferSize }) => ({ name, transferSize })))
    const s = snapshot()
    listeners.forEach((cb) => cb(s))
  }
  // Only entries created after start count; earlier page loading is not part of the session.
  const observer = typeof PerformanceObserver === 'undefined' ? undefined : new PerformanceObserver((list) => add(list.getEntries() as PerformanceResourceTiming[]))
  observer?.observe({ type: 'resource', buffered: false })
  return {
    snapshot,
    onChange(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    report: (entry) => add([entry]),
    stop: () => observer?.disconnect(),
  }
}
