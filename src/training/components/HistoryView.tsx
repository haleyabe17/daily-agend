import { useState } from 'react'
import type { WeightUnit, WorkoutSession } from '../types'
import { formatDateKey } from '../../utils/date'
import { formatDuration, sessionTotals } from '../utils'
import { btnDanger, card, muted } from './ui'

interface HistoryViewProps {
  sessions: WorkoutSession[]
  unit: WeightUnit
  onDelete: (sessionId: string) => void
}

export function HistoryView({ sessions, unit, onDelete }: HistoryViewProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (sessions.length === 0) {
    return <p className={`${card} ${muted}`}>No workouts logged yet. Finish a workout and it will show up here.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s) => {
        const totals = sessionTotals(s)
        const open = openId === s.id
        return (
          <section key={s.id} className={card}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : s.id)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={open}
            >
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">{s.workoutName}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDateKey(s.date, 'weekday')}, {formatDateKey(s.date)}
                  {s.finishedAt && ` · ${formatDuration(s.finishedAt - s.startedAt)}`}
                </div>
              </div>
              <div className="flex items-center gap-3 text-right text-xs text-neutral-500 dark:text-neutral-400">
                <div>
                  <div className="font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
                    {totals.setsDone}/{totals.setsTotal} sets
                  </div>
                  <div className="tabular-nums">
                    {totals.reps} reps{totals.seconds > 0 && ` · ${totals.seconds}s held`}
                    {s.rpe !== null && ` · RPE ${s.rpe}`}
                  </div>
                </div>
                <span className="text-neutral-400">{open ? '▾' : '▸'}</span>
              </div>
            </button>

            {open && (
              <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                {s.exercises.map((ex, i) => (
                  <div key={`${ex.plannedId}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="text-neutral-800 dark:text-neutral-100">{ex.name}</span>
                    <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                      {ex.sets
                        .map((set) =>
                          set.done
                            ? `${set.value}${ex.mode === 'time' ? 's' : ''}${set.weight > 0 ? ` @${set.weight}${unit}` : ''}`
                            : '–',
                        )
                        .join(' · ')}
                    </span>
                  </div>
                ))}
                {s.notes && <p className="text-sm italic text-neutral-500 dark:text-neutral-400">“{s.notes}”</p>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className={btnDanger}
                    onClick={() => window.confirm('Delete this workout from your history?') && onDelete(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
