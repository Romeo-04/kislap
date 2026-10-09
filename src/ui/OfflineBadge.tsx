// Offline readiness on the Home screen (issue #5), drawn as the part 2 paper slip (#10).
import { useI18n } from '../i18n'
import { useReadiness } from '../pwa/useReadiness'
import { OfflineStatus } from './OfflineStatus'
import { Button } from './Button'
import './kit.css'

export function OfflineBadge() {
  const { t } = useI18n()
  const { state, download } = useReadiness()

  switch (state.status) {
    case 'checking':
      return null
    case 'ready':
      return <div data-status="ready"><OfflineStatus ready /></div>
    case 'downloading':
      return <div data-status="downloading"><OfflineStatus progress={state.progress} /></div>
    case 'needs-download':
      return (
        <div className="k-offline-need" data-status="needs-download">
          {state.error && <p className="k-offline" role="alert">{t('offline.failed')}</p>}
          <Button variant="secondary" onClick={download}>{t('offline.download')}</Button>
        </div>
      )
    case 'blocked':
      return <p className="k-offline k-offline--note" data-status="blocked" role="status">{t('offline.connectOnce')}</p>
  }
}
