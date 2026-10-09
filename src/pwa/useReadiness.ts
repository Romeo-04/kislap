// Drives the readiness state machine with the real browser: model cache, online status, download (issue #5).
import { useCallback, useEffect, useReducer } from 'react'
import { isModelCached, loadModel, warmUp } from '../asr/transcribe'
import { initialReadiness, readinessReducer, type Readiness } from './readiness'

/** Ask the browser not to evict our storage (the model) under pressure (ADR-0007). */
async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}

export function useReadiness(): { state: Readiness; download: () => Promise<void> } {
  const [state, dispatch] = useReducer(readinessReducer, initialReadiness)

  useEffect(() => {
    let cancelled = false
    isModelCached().then((modelCached) => {
      if (!cancelled) dispatch({ type: 'checked', modelCached, online: navigator.onLine })
    })
    const onOnline = () => dispatch({ type: 'online' })
    window.addEventListener('online', onOnline)
    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
    }
  }, [])

  const download = useCallback(async () => {
    dispatch({ type: 'download-start' })
    // The model has several files; progress events arrive per file, so sum them.
    const files = new Map<string, { loaded: number; total: number }>()
    try {
      await loadModel((p) => {
        files.set(p.file, { loaded: p.loaded, total: p.total })
        let loaded = 0
        let total = 0
        for (const f of files.values()) {
          loaded += f.loaded
          total += f.total
        }
        dispatch({ type: 'progress', loaded, total })
      })
      await requestPersistentStorage()
      await warmUp()
      dispatch({ type: 'download-done' })
    } catch (err) {
      dispatch({ type: 'download-failed', message: (err as Error).message })
    }
  }, [])

  return { state, download }
}
