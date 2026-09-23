import { useMemo } from 'react'
import type { TrackingMode, WeightUnit, WorkoutSession } from '../types'
import { bestSet, exerciseVolume } from '../utils'
import { card, muted } from './ui'

interface ProgressViewProps {
  /** Newest first. */
  sessions: WorkoutSession[]
  unit: WeightUnit
}

interface Entry {
  date: string
  best: { value: number; weight: number }
  volume: number
}

interface ExerciseProgress {
  name: string
  mode: TrackingMode
  entries: Entry[] // newest first
  record: { value: number; weight: number; date: string }
}

function beats(a: { value: number; weight: number }, b: { value: number; weight: number }) {
  return a.weight > b.weight || (a.weight === b.weight && a.value > b.value)
}

export function ProgressView({ sessions, unit }: ProgressViewProps) {
  const rows = useMemo(() => {
    const map = new Map<string, ExerciseProgress>()
    for (const s of sessions) {
      for (const ex of s.exercises) {
        const best = bestSet(ex)
        if (!best) continue
        const key = ex.name.trim().toLowerCase()
        let row = map.get(key)
        if (!row) {
          row = { name: ex.name, mode: ex.mode, entries: [], record: { ...best, date: s.date } }
          map.set(key, row)
        }
        row.entries.push({ date: s.date, best, volume: exerciseVolume(ex) })
        if (beats(best, row.record)) row.record = { ...best, date: s.date }
      }
    }
    return [...map.values()]
  }, [sessions])

  if (rows.length === 0) {
    return <p className={`${card} ${muted}`}>Log a few workouts to see your progress and personal records here.</p>
  }

  const fmt = (mode: TrackingMode, b: { value: number; weight: number }) =>
    `${b.value}${mode === 'time' ? 's' : ''}${b.weight > 0 ? ` @${b.weight}${unit}` : ''}`

  return (
    <section className={`${card} overflow-x-auto`}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-neutral-400">
            <th className="py-1.5 pr-3 font-medium">Exercise</th>
            <th className="py-1.5 pr-3 font-medium">Sessions</th>
            <th className="py-1.5 pr-3 font-medium">Personal record</th>
            <th className="py-1.5 pr-3 font-medium">Latest best set</th>
            <th className="py-1.5 pr-3 font-medium">Change vs first</th>
            <th className="py-1.5 font-medium">Recent best sets (old → new)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const latest = r.entries[0]
            const first = r.entries[r.entries.length - 1]
            const sameWeight = latest.best.weight === first.best.weight
            const diff = sameWeight ? latest.best.value - first.best.value : latest.best.weight - first.best.weight
            const diffLabel =
              r.entries.length < 2
                ? '—'
                : `${diff > 0 ? '+' : ''}${diff}${sameWeight ? (r.mode === 'time' ? 's' : ' reps') : ` ${unit}`}`
            const recent = r.entries.slice(0, 6).reverse()
            return (
              <tr key={r.name} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="py-2 pr-3 text-neutral-800 dark:text-neutral-100">{r.name}</td>
                <td className="py-2 pr-3 tabular-nums text-neutral-600 dark:text-neutral-300">{r.entries.length}</td>
                <td className="whitespace-nowrap py-2 pr-3 font-semibold tabular-nums text-amber-600 dark:text-amber-300">
                  🏆 {fmt(r.mode, r.record)}
                  <div className="text-[11px] font-normal text-neutral-400">{r.record.date}</div>
                </td>
                <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-neutral-600 dark:text-neutral-300">{fmt(r.mode, latest.best)}</td>
                <td
                  className={`whitespace-nowrap py-2 pr-3 tabular-nums font-medium ${
                    r.entries.length < 2 || diff === 0
                      ? 'text-neutral-400'
                      : diff > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {diffLabel}
                </td>
                <td className="whitespace-nowrap py-2 tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                  {recent.map((e) => fmt(r.mode, e.best)).join(' → ')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
