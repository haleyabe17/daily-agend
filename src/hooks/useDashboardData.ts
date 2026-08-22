import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CategoryGoals, CategoryId, DashboardData, DayData, Goal, Priority } from '../types'
import { CATEGORIES } from '../types'
import { addDays, todayKey } from '../utils/date'

const STORAGE_KEY = 'daily-agend:data:v1'

function emptyCategories(): CategoryGoals {
  return { goals: [], health: [], life: [], work: [] }
}

function emptyDay(date: string): DayData {
  return { date, categories: emptyCategories() }
}

function loadData(): DashboardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as DashboardData
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface DayStats {
  total: number
  done: number
  percent: number
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(() => loadData())
  const [activeDate, setActiveDate] = useState<string>(() => todayKey())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage unavailable (e.g. private mode quota) — silently skip persistence
    }
  }, [data])

  const day = useMemo<DayData>(() => data[activeDate] ?? emptyDay(activeDate), [data, activeDate])

  const updateDay = useCallback(
    (dateKey: string, updater: (day: DayData) => DayData) => {
      setData((prev) => {
        const current = prev[dateKey] ?? emptyDay(dateKey)
        return { ...prev, [dateKey]: updater(current) }
      })
    },
    [],
  )

  const addGoal = useCallback(
    (category: CategoryId, text: string, priority: Priority) => {
      const trimmed = text.trim()
      if (!trimmed) return
      updateDay(activeDate, (d) => ({
        ...d,
        categories: {
          ...d.categories,
          [category]: [
            ...d.categories[category],
            { id: makeId(), text: trimmed, done: false, priority, createdAt: Date.now() },
          ],
        },
      }))
    },
    [activeDate, updateDay],
  )

  const toggleGoal = useCallback(
    (category: CategoryId, goalId: string) => {
      updateDay(activeDate, (d) => ({
        ...d,
        categories: {
          ...d.categories,
          [category]: d.categories[category].map((g) =>
            g.id === goalId ? { ...g, done: !g.done } : g,
          ),
        },
      }))
    },
    [activeDate, updateDay],
  )

  const removeGoal = useCallback(
    (category: CategoryId, goalId: string) => {
      updateDay(activeDate, (d) => ({
        ...d,
        categories: {
          ...d.categories,
          [category]: d.categories[category].filter((g) => g.id !== goalId),
        },
      }))
    },
    [activeDate, updateDay],
  )

  const setPriority = useCallback(
    (category: CategoryId, goalId: string, priority: Priority) => {
      updateDay(activeDate, (d) => ({
        ...d,
        categories: {
          ...d.categories,
          [category]: d.categories[category].map((g) => (g.id === goalId ? { ...g, priority } : g)),
        },
      }))
    },
    [activeDate, updateDay],
  )

  const reorderGoals = useCallback(
    (category: CategoryId, fromId: string, toId: string) => {
      if (fromId === toId) return
      updateDay(activeDate, (d) => {
        const list = [...d.categories[category]]
        const fromIndex = list.findIndex((g) => g.id === fromId)
        const toIndex = list.findIndex((g) => g.id === toId)
        if (fromIndex === -1 || toIndex === -1) return d
        const [moved] = list.splice(fromIndex, 1)
        list.splice(toIndex, 0, moved)
        return { ...d, categories: { ...d.categories, [category]: list } }
      })
    },
    [activeDate, updateDay],
  )

  const copyFromYesterday = useCallback(() => {
    const yesterdayKey = addDays(activeDate, -1)
    const yesterday = data[yesterdayKey]
    if (!yesterday) return
    updateDay(activeDate, (d) => {
      const categories = { ...d.categories }
      for (const cat of CATEGORIES) {
        const existingText = new Set(categories[cat.id].map((g) => g.text))
        const carried = yesterday.categories[cat.id]
          .filter((g) => !existingText.has(g.text))
          .map((g) => ({ ...g, id: makeId(), done: false, createdAt: Date.now() }))
        categories[cat.id] = [...categories[cat.id], ...carried]
      }
      return { ...d, categories }
    })
  }, [activeDate, data, updateDay])

  const goToDate = useCallback((dateKey: string) => setActiveDate(dateKey), [])
  const goToToday = useCallback(() => setActiveDate(todayKey()), [])
  const shiftDate = useCallback((delta: number) => setActiveDate((d) => addDays(d, delta)), [])

  const getDayStats = useCallback(
    (dateKey: string): DayStats => {
      const d = data[dateKey]
      if (!d) return { total: 0, done: 0, percent: 0 }
      let total = 0
      let done = 0
      for (const cat of CATEGORIES) {
        for (const g of d.categories[cat.id]) {
          total += 1
          if (g.done) done += 1
        }
      }
      return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
    },
    [data],
  )

  const categoryStats = useCallback(
    (categoryGoals: Goal[]): DayStats => {
      const total = categoryGoals.length
      const done = categoryGoals.filter((g) => g.done).length
      return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
    },
    [],
  )

  const streak = useMemo(() => {
    let count = 0
    let cursor = todayKey()
    const todayStats = getDayStats(cursor)
    if (todayStats.total === 0 || todayStats.percent < 100) {
      cursor = addDays(cursor, -1)
    }
    while (true) {
      const stats = getDayStats(cursor)
      if (stats.total > 0 && stats.percent === 100) {
        count += 1
        cursor = addDays(cursor, -1)
      } else {
        break
      }
    }
    return count
  }, [getDayStats])

  const last7Days = useMemo(() => {
    const days: { date: string; stats: DayStats }[] = []
    let cursor = todayKey()
    for (let i = 0; i < 7; i++) {
      days.unshift({ date: cursor, stats: getDayStats(cursor) })
      cursor = addDays(cursor, -1)
    }
    return days
  }, [getDayStats])

  return {
    activeDate,
    day,
    addGoal,
    toggleGoal,
    removeGoal,
    setPriority,
    reorderGoals,
    copyFromYesterday,
    hasYesterdayData: Boolean(data[addDays(activeDate, -1)]),
    goToDate,
    goToToday,
    shiftDate,
    getDayStats,
    categoryStats,
    streak,
    last7Days,
  }
}
