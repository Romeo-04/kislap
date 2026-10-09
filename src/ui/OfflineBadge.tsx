import { useI18n } from '../i18n'
import { CheckIcon } from './icons'
import './kit.css'

type Props = { ready: true; progress?: never } | { ready?: false; progress: number }

/** Ready is a check and words, not a dot. Downloading is a bar that fills, not a spinner. */
export function OfflineBadge(props: Props) {
  const { t } = useI18n()
  if (props.ready) {
    return (
      <p className="k-offline k-offline--ready">
        <CheckIcon />
        {t('home.offlineReady')}
      </p>
    )
  }
  const pct = Math.round(Math.min(1, Math.max(0, props.progress)) * 100)
  return (
    <div className="k-offline k-offline--loading">
      <div className="k-offline__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="k-offline__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="k-offline__label">
        <span>{t('home.preparing')}</span>
        <b>{pct}%</b>
      </p>
    </div>
  )
}
