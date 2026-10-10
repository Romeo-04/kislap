// Offline readiness (issue #5), drawn as the part 2 paper slip (#10). Home shows it only while it
// needs the child (download, progress, connect once); Settings always shows it as a status.
import { useI18n } from '../i18n'
import { useReadiness } from '../pwa/useReadiness'
import { OfflineStatus } from './OfflineStatus'
import { Button } from './Button'
import './kit.css'

export function OfflineBadge({ hideWhenReady = false }: { hideWhenReady?: boolean }) {
  const { t } = useI18n()
  const { state, download } = useReadiness()

  switch (state.status) {
    case 'checking':
      return null
    case 'ready':
      return hideWhenReady ? null : <div data-status="ready"><OfflineStatus ready /></div>
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
