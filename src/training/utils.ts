import type { LoggedExercise, PlannedExercise, TrackingMode, WeightUnit, WorkoutSession } from './types'
import { addDays } from '../utils/date'

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatTarget(mode: TrackingMode, min: number, max: number): string {
  const range = min === max ? `${min}` : `${min}–${max}`
  return mode === 'time' ? `${range}s` : `${range} reps`
}

export function formatWeight(weight: number, unit: WeightUnit): string {
  return weight > 0 ? `+${weight} ${unit}` : 'Bodyweight'
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Total reps (or seconds) completed in a logged exercise. */
export function exerciseVolume(ex: LoggedExercise): number {
  return ex.sets.filter((s) => s.done).reduce((sum, s) => sum + s.value, 0)
}

export function sessionTotals(session: WorkoutSession) {
  let setsDone = 0
  let setsTotal = 0
  let reps = 0
  let seconds = 0
  for (const ex of session.exercises) {
    for (const s of ex.sets) {
      setsTotal += 1
      if (!s.done) continue
      setsDone += 1
      if (ex.mode === 'time') seconds += s.value
      else reps += s.value
    }
  }
  return { setsDone, setsTotal, reps, seconds }
}

/** Best completed set: highest weight, then highest reps/seconds at that weight. */
export function bestSet(ex: LoggedExercise) {
  let best: { value: number; weight: number } | null = null
  for (const s of ex.sets) {
    if (!s.done) continue
    if (!best || s.weight > best.weight || (s.weight === best.weight && s.value > best.value)) {
      best = { value: s.value, weight: s.weight }
    }
  }
  return best
}

export type Suggestion =
  | { kind: 'progress'; message: string }
  | { kind: 'hold'; message: string }
  | { kind: 'regress'; message: string }

/**
 * Double-progression rule: if every set hit the top of the range, progress
 * (add weight, or move to the harder variation). If sets fell below the bottom
 * of the range, consider an easier variation. Otherwise keep working the range.
 */
export function progressionSuggestion(
  last: LoggedExercise | undefined,
  plan: PlannedExercise,
  harder: string | undefined,
  easier: string | undefined,
  unit: WeightUnit,
): Suggestion | null {
  if (!last) return null
  const done = last.sets.filter((s) => s.done)
  if (done.length === 0) return null
  const allTop = done.length >= plan.sets && done.every((s) => s.value >= plan.targetMax)
  const mostlyUnder = done.filter((s) => s.value < plan.targetMin).length > done.length / 2
  if (allTop) {
    if (plan.mode === 'time') {
      return {
        kind: 'progress',
        message: harder
          ? `You held the top of the range on every set — try ${harder} or add 5s.`
          : 'You held the top of the range on every set — add 5–10s to your target.',
      }
    }
    const step = unit === 'kg' ? 2.5 : 5
    return {
      kind: 'progress',
      message: harder
        ? `Every set hit ${plan.targetMax} reps — add ${step} ${unit} or move to ${harder}.`
        : `Every set hit ${plan.targetMax} reps — add ${step} ${unit} next time.`,
    }
  }
  if (mostlyUnder) {
    return {
      kind: 'regress',
      message: easier
        ? `Most sets were under ${plan.targetMin} — consider ${easier} to build volume.`
        : `Most sets were under ${plan.targetMin} — lower the weight or the target.`,
    }
  }
  return { kind: 'hold', message: 'Keep working this range and aim for one more rep per set.' }
}

/** Monday (YYYY-MM-DD) of the week containing `dateKey`. */
export function weekStartKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const offset = (date.getDay() + 6) % 7
  return addDays(dateKey, -offset)
}

export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** Consecutive weeks (ending this week, or last week if none yet this week) with at least one session. */
export function weekStreak(sessions: WorkoutSession[], today: string): number {
  const weeks = new Set(sessions.map((s) => weekStartKey(s.date)))
  let cursor = weekStartKey(today)
  if (!weeks.has(cursor)) cursor = addDays(cursor, -7)
  let count = 0
  while (weeks.has(cursor)) {
    count += 1
    cursor = addDays(cursor, -7)
  }
  return count
}
