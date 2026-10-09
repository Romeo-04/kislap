import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { BackIcon, GearIcon } from './icons'
import './kit.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  icon?: ReactNode
}

/** Primary is yellow and appears once per screen. Secondary is white. */
export function Button({ variant = 'primary', icon, className = '', children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`k-btn k-btn--${variant} ${className}`.trim()} {...rest}>
      {icon}
      {children}
    </button>
  )
}

const ICONS = { back: BackIcon, settings: GearIcon }

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: keyof typeof ICONS
  label: string
}

export function IconButton({ icon, label, className = '', ...rest }: IconButtonProps) {
  const Icon = ICONS[icon]
  return (
    <button type="button" className={`k-icon-btn k-icon-btn--${icon} ${className}`.trim()} aria-label={label} {...rest}>
      <Icon />
    </button>
  )
}
