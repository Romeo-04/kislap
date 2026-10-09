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
}

export const STORIES = stories as Story[]

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id)
}
