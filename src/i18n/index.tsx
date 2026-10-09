import { createContext, useContext, useState, type ReactNode } from 'react'
import fil from './fil.json'
import en from './en.json'
import { loadProgress, saveProgress } from '../game/progress'

export type Lang = 'fil' | 'en'
export type MessageKey = keyof typeof fil

const MESSAGES: Record<Lang, Record<MessageKey, string>> = { fil, en }

interface I18n {
  lang: Lang
  setLang(lang: Lang): void
  t(key: MessageKey): string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadProgress().lang)
  const setLang = (next: Lang) => {
    setLangState(next)
    saveProgress({ ...loadProgress(), lang: next })
  }
  // Missing English text falls back to Filipino, then to the key itself.
  const t = (key: MessageKey) => MESSAGES[lang][key] ?? MESSAGES.fil[key] ?? key
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
