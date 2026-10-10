import stories from './stories.json'

export type Level = 'easy' | 'medium' | 'hard'

export interface Sentence {
  text: string
  hint?: string
  audio?: string // echo reading clip, issue #46
}

export interface Story {
  id: string
  title: { fil: string; en: string }
  level: Level
  sentences: Sentence[]
  /** a teacher's own story, saved on this device */
  custom?: true
}

export const STORIES = stories as Story[]

/** localStorage key for teachers' own stories (see customStories.ts). */
export const CUSTOM_KEY = 'kislap.stories.v1'

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id) ?? customStory(id)
}

// Teachers' stories live in localStorage; read here without importing customStories (no cycle).
function customStory(id: string): Story | undefined {
  if (!id.startsWith('custom-')) return undefined
  try {
    const list: unknown = JSON.parse(globalThis.localStorage?.getItem(CUSTOM_KEY) ?? '[]')
    return Array.isArray(list) ? (list as Story[]).find((s) => s?.id === id) : undefined
  } catch {
    return undefined
  }
}
