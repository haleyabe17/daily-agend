export type CategoryId = 'goals' | 'health' | 'life' | 'work'

export type Priority = 'high' | 'medium' | 'low'

export interface Goal {
  id: string
  text: string
  done: boolean
  priority: Priority
  createdAt: number
}

export type CategoryGoals = Record<CategoryId, Goal[]>

export interface DayData {
  date: string
  categories: CategoryGoals
}

export type DashboardData = Record<string, DayData>

export interface CategoryMeta {
  id: CategoryId
  label: string
  emoji: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'goals', label: 'Daily Goals & Plans', emoji: '🎯' },
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'life', label: 'Life', emoji: '🌱' },
  { id: 'work', label: 'Work', emoji: '💼' },
]

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}
