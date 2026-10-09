// Offline readiness on the Home screen (issue #5). Styling: designer (#8).
import { useI18n } from '../i18n'
import { useReadiness } from '../pwa/useReadiness'

export function OfflineBadge() {
  const { t } = useI18n()
  const { state, download } = useReadiness()

  switch (state.status) {
    case 'checking':
      return null
    case 'ready':
      return <p className="offline-badge ready" data-status="ready">✅ {t('home.offlineReady')}</p>
    case 'downloading':
      return (
        <div className="offline-badge" data-status="downloading">
          <p>{t('home.preparing')}</p>
          <progress max={1} value={state.progress} aria-label={t('home.preparing')} />
          <p className="muted">{Math.round(state.progress * 100)}%</p>
        </div>
      )
    case 'needs-download':
      return (
        <div className="offline-badge" data-status="needs-download">
          {state.error && <p role="alert">{t('offline.failed')}</p>}
          <button onClick={download}>⬇️ {t('offline.download')}</button>
        </div>
      )
    case 'blocked':
      return <p className="offline-badge" data-status="blocked" role="status">📶 {t('offline.connectOnce')}</p>
  }
}
