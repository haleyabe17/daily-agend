import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LoggedExercise, Program, TrainingData, WeightUnit, WorkoutSession } from './types'
import { makeId } from './utils'
import { todayKey } from '../utils/date'

const STORAGE_KEY = 'daily-agend:training:v1'

function emptyData(): TrainingData {
  return { programs: [], activeProgramId: null, sessions: [], activeSession: null, unit: 'kg' }
}

function isTrainingData(value: unknown): value is TrainingData {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<TrainingData>
  return Array.isArray(v.programs) && Array.isArray(v.sessions)
}

function loadData(): TrainingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed: unknown = JSON.parse(raw)
    return isTrainingData(parsed) ? { ...emptyData(), ...parsed } : emptyData()
  } catch {
    return emptyData()
  }
}

export function useTrainingData() {
  const [data, setData] = useState<TrainingData>(() => loadData())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage unavailable — skip persistence
    }
  }, [data])

  const activeProgram = useMemo(
    () => data.programs.find((p) => p.id === data.activeProgramId) ?? null,
    [data.programs, data.activeProgramId],
  )

  /** Completed sessions, newest first. */
  const history = useMemo(
    () => [...data.sessions].sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt)),
    [data.sessions],
  )

  /** Most recent logged performance for an exercise, matched by plan id, then by name. */
  const lastLoggedFor = useCallback(
    (plannedId: string, name: string): LoggedExercise | undefined => {
      for (const s of history) {
        const match = s.exercises.find((e) => e.plannedId === plannedId)
        if (match) return match
      }
      const lower = name.toLowerCase()
      for (const s of history) {
        const match = s.exercises.find((e) => e.name.toLowerCase() === lower)
        if (match) return match
      }
      return undefined
    },
    [history],
  )

  const addProgram = useCallback((draft: Omit<Program, 'id' | 'createdAt'>) => {
    const program: Program = { ...draft, id: makeId(), createdAt: Date.now() }
    setData((prev) => ({ ...prev, programs: [...prev.programs, program], activeProgramId: program.id }))
    return program.id
  }, [])

  const updateProgram = useCallback((program: Program) => {
    setData((prev) => ({
      ...prev,
      programs: prev.programs.map((p) => (p.id === program.id ? program : p)),
    }))
  }, [])

  const deleteProgram = useCallback((programId: string) => {
    setData((prev) => {
      const programs = prev.programs.filter((p) => p.id !== programId)
      const activeProgramId =
        prev.activeProgramId === programId ? (programs[0]?.id ?? null) : prev.activeProgramId
      return { ...prev, programs, activeProgramId }
    })
  }, [])

  const setActiveProgram = useCallback((programId: string) => {
    setData((prev) => ({ ...prev, activeProgramId: programId }))
  }, [])

  const startSession = useCallback(
    (workoutId: string) => {
      if (!activeProgram) return
      const workout = activeProgram.workouts.find((w) => w.id === workoutId)
      if (!workout) return
      const session: WorkoutSession = {
        id: makeId(),
        programId: activeProgram.id,
        workoutId: workout.id,
        workoutName: workout.name,
        date: todayKey(),
        startedAt: Date.now(),
        finishedAt: null,
        rpe: null,
        notes: '',
        exercises: workout.exercises.map((plan) => {
          const last = lastLoggedFor(plan.id, plan.name)
          return {
            plannedId: plan.id,
            name: plan.name,
            mode: plan.mode,
            targetMin: plan.targetMin,
            targetMax: plan.targetMax,
            notes: '',
            sets: Array.from({ length: plan.sets }, (_, i) => {
              const prevSet = last?.sets[i]
              return {
                value: prevSet?.done ? prevSet.value : plan.targetMin,
                weight: plan.weight,
                done: false,
              }
            }),
          }
        }),
      }
      setData((prev) => ({ ...prev, activeSession: session }))
    },
    [activeProgram, lastLoggedFor],
  )

  const updateActiveSession = useCallback((updater: (s: WorkoutSession) => WorkoutSession) => {
    setData((prev) => (prev.activeSession ? { ...prev, activeSession: updater(prev.activeSession) } : prev))
  }, [])

  const finishSession = useCallback(() => {
    setData((prev) => {
      if (!prev.activeSession) return prev
      const finished = { ...prev.activeSession, finishedAt: Date.now() }
      return { ...prev, sessions: [...prev.sessions, finished], activeSession: null }
    })
  }, [])

  const discardSession = useCallback(() => {
    setData((prev) => ({ ...prev, activeSession: null }))
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setData((prev) => ({ ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) }))
  }, [])

  const setUnit = useCallback((unit: WeightUnit) => {
    setData((prev) => ({ ...prev, unit }))
  }, [])

  const exportJson = useCallback(() => JSON.stringify(data, null, 2), [data])

  const importJson = useCallback((json: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(json)
      if (!isTrainingData(parsed)) return false
      setData({ ...emptyData(), ...parsed })
      return true
    } catch {
      return false
    }
  }, [])

  return {
    data,
    activeProgram,
    history,
    lastLoggedFor,
    addProgram,
    updateProgram,
    deleteProgram,
    setActiveProgram,
    startSession,
    updateActiveSession,
    finishSession,
    discardSession,
    deleteSession,
    setUnit,
    exportJson,
    importJson,
  }
}

export type TrainingApi = ReturnType<typeof useTrainingData>
