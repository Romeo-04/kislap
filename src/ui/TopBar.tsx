import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import { IconButton } from './Button'
import { goUp } from './goBack'
import './kit.css'

/** `up` is the parent screen Back returns to (Home unless said otherwise). */
export function TopBar({ title, up = '#/', children }: { title?: ReactNode; up?: string; children?: ReactNode }) {
  const { t } = useI18n()
  return (
    <header className="k-topbar">
      <IconButton icon="back" label={t('nav.back')} onClick={() => goUp(up)} />
      {title && <h1 className="k-topbar__title">{title}</h1>}
      {children}
    </header>
  )
}
