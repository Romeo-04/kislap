import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import { IconButton } from './Button'
import { goBack } from './goBack'
import './kit.css'

export function TopBar({ title, children }: { title?: ReactNode; children?: ReactNode }) {
  const { t } = useI18n()
  return (
    <header className="k-topbar">
      <IconButton icon="back" label={t('nav.back')} onClick={goBack} />
      {title && <h1 className="k-topbar__title">{title}</h1>}
      {children}
    </header>
  )
}
