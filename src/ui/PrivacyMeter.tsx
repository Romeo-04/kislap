// On-screen Privacy meter (issue #6). Styling: designer (#8). Shows requests that left the device this session.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { startPrivacyMeter, type PrivacySummary } from '../privacy/meter'

export function PrivacyMeter() {
  const { t } = useI18n()
  const [summary, setSummary] = useState<PrivacySummary>({ requests: 0, bytes: 0, urls: [] })

  useEffect(() => {
    const meter = startPrivacyMeter()
    const off = meter.onChange(setSummary)
    return () => {
      off()
      meter.stop()
    }
  }, [])

  const clean = summary.requests === 0
  return (
    <details className={`privacy-meter ${clean ? 'clean' : 'leak'}`} data-requests={summary.requests}>
      <summary>
        {clean ? '🔒' : '⚠️'} {t(clean ? 'privacy.clean' : 'privacy.leak').replace('{n}', String(summary.requests))}
      </summary>
      <p>{t('privacy.explain')}</p>
      {summary.urls.length > 0 && (
        <ul>
          {summary.urls.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
      )}
    </details>
  )
}
