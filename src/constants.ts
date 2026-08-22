import type { CategoryId, Priority } from './types'

interface Accent {
  bg: string
  text: string
  bar: string
  ring: string
}

export const CATEGORY_ACCENTS: Record<CategoryId, Accent> = {
  goals: {
    bg: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
  },
  health: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
  },
  life: {
    bg: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
  },
  work: {
    bg: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    bar: 'bg-sky-500',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
  },
}

export const PRIORITY_CYCLE: Record<Priority, Priority> = {
  high: 'medium',
  medium: 'low',
  low: 'high',
}
