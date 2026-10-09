// Offline readiness state machine (issue #5, docs/uml/state.md §3). Pure: the hook in useReadiness.ts drives it.

export type Readiness =
  | { status: 'checking' }
  | { status: 'ready' }
  | { status: 'needs-download'; error?: string }
  | { status: 'downloading'; progress: number }
  | { status: 'blocked' } // no model and no internet: "connect once"

export type ReadinessEvent =
  | { type: 'checked'; modelCached: boolean; online: boolean }
  | { type: 'online' }
  | { type: 'download-start' }
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'download-done' }
  | { type: 'download-failed'; message: string }
  | { type: 'evicted' }

export const initialReadiness: Readiness = { status: 'checking' }

export function readinessReducer(state: Readiness, event: ReadinessEvent): Readiness {
  switch (event.type) {
    case 'checked':
      if (event.modelCached) return { status: 'ready' }
      return event.online ? { status: 'needs-download' } : { status: 'blocked' }
    case 'online':
      return state.status === 'blocked' ? { status: 'needs-download' } : state
    case 'download-start':
      return { status: 'downloading', progress: 0 }
    case 'progress':
      if (state.status !== 'downloading') return state
      return { status: 'downloading', progress: event.total > 0 ? event.loaded / event.total : 0 }
    case 'download-done':
      return { status: 'ready' }
    case 'download-failed':
      return { status: 'needs-download', error: event.message }
    case 'evicted':
      return { status: 'needs-download' }
  }
}
