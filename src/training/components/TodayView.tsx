import type { Program, WeightUnit, WorkoutDay, WorkoutSession } from '../types'
import { addDays, todayKey } from '../../utils/date'
import { WEEKDAY_SHORT, formatDuration, formatSeconds, formatTarget, formatWeight, sessionTotals, weekStartKey, weekStreak, weekdayOf } from '../utils'
import { GroupTag } from './GroupTag'
import { btnPrimary, btnSecondary, card, muted } from './ui'

interface TodayViewProps {
  program: Program
  sessions: WorkoutSession[]
  unit: WeightUnit
  onStart: (workoutId: string) => void
}

export function TodayView({ program, sessions, unit, onStart }: TodayViewProps) {
  const today = todayKey()
  const todayWeekday = weekdayOf(today)
  const weekStart = weekStartKey(today)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const programSessions = sessions.filter((s) => s.programId === program.id)

  const plannedPerWeek = program.workouts.reduce((n, w) => n + w.weekdays.length, 0)
  const doneThisWeek = programSessions.filter((s) => weekStartKey(s.date) === weekStart).length
  const streak = weekStreak(programSessions, today)

  const todays = program.workouts.filter((w) => w.weekdays.includes(todayWeekday))
  const doneToday = new Set(programSessions.filter((s) => s.date === today).map((s) => s.workoutId))
  const others = program.workouts.filter((w) => !w.weekdays.includes(todayWeekday))
  const lastSession = sessions[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="This week" value={plannedPerWeek > 0 ? `${doneThisWeek}/${plannedPerWeek}` : `${doneThisWeek}`} />
        <Stat label="Week streak" value={`${streak} 🔥`} />
        <Stat label="Total workouts" value={`${programSessions.length}`} />
      </div>

      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">This week</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((date) => {
            const wd = weekdayOf(date)
            const planned = program.workouts.filter((w) => w.weekdays.includes(wd))
            const done = programSessions.filter((s) => s.date === date)
            const isToday = date === today
            const missed = date < today && planned.length > 0 && done.length === 0
            return (
              <div
                key={date}
                className={`flex min-h-20 flex-col gap-1 rounded-xl border p-1.5 text-center ${
                  isToday ? 'border-violet-400 dark:border-violet-500/60' : 'border-neutral-100 dark:border-neutral-800'
                }`}
              >
                <span className={`text-[11px] font-semibold ${isToday ? 'text-violet-600 dark:text-violet-300' : 'text-neutral-400'}`}>
                  {WEEKDAY_SHORT[wd]}
                </span>
                {done.map((s) => (
                  <span key={s.id} className="truncate rounded bg-emerald-500 px-1 py-0.5 text-[10px] font-medium text-white" title={s.workoutName}>
                    ✓ {s.workoutName}
                  </span>
                ))}
                {planned
                  .filter((w) => !done.some((s) => s.workoutId === w.id))
                  .map((w) => (
                    <span
                      key={w.id}
                      title={w.name}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                        missed
                          ? 'bg-rose-100 text-rose-600 line-through dark:bg-rose-500/15 dark:text-rose-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {w.name}
                    </span>
                  ))}
                {planned.length === 0 && done.length === 0 && <span className="text-[10px] text-neutral-300 dark:text-neutral-600">Rest</span>}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Today — {WEEKDAY_SHORT[todayWeekday]}
        </h2>
        {todays.length === 0 && (
          <p className={`${card} ${muted}`}>
            Rest day. Recover well — or start any workout below if you want to train anyway.
          </p>
        )}
        {todays.map((w) => (
          <WorkoutPreview key={w.id} workout={w} unit={unit} done={doneToday.has(w.id)} onStart={() => onStart(w.id)} primary />
        ))}
      </section>

      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Other workouts</h2>
          {others.map((w) => (
            <WorkoutPreview key={w.id} workout={w} unit={unit} done={doneToday.has(w.id)} onStart={() => onStart(w.id)} />
          ))}
        </section>
      )}

      {lastSession && (
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
          Last workout: {lastSession.workoutName} on {lastSession.date}
          {lastSession.finishedAt && ` · ${formatDuration(lastSession.finishedAt - lastSession.startedAt)}`} ·{' '}
          {sessionTotals(lastSession).setsDone} sets
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${card} flex flex-col items-center gap-0.5 py-3`}>
      <span className="text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">{value}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
    </div>
  )
}

interface WorkoutPreviewProps {
  workout: WorkoutDay
  unit: WeightUnit
  done: boolean
  primary?: boolean
  onStart: () => void
}

function WorkoutPreview({ workout, unit, done, primary, onStart }: WorkoutPreviewProps) {
  return (
    <div className={`${card} flex flex-col gap-3`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {workout.name} {done && <span className="text-sm text-emerald-500">✓ done today</span>}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {workout.exercises.length} exercises ·{' '}
            {workout.exercises.reduce((n, e) => n + e.sets, 0)} sets
            {workout.weekdays.length > 0 && ` · ${workout.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={workout.exercises.length === 0}
          className={primary && !done ? btnPrimary : btnSecondary}
        >
          {done ? 'Train again' : 'Start'}
        </button>
      </div>
      {workout.exercises.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-neutral-400">
                <th className="py-1 pr-3 font-medium">Exercise</th>
                <th className="py-1 pr-3 font-medium">Sets × Target</th>
                <th className="py-1 pr-3 font-medium">Weight</th>
                <th className="py-1 pr-3 font-medium">Rest</th>
                <th className="py-1 font-medium">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {workout.exercises.map((e) => (
                <tr key={e.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-800 dark:text-neutral-100">{e.name || 'Untitled'}</span>
                      <GroupTag group={e.group} />
                    </div>
                    {e.notes && <div className="text-xs text-neutral-400">{e.notes}</div>}
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                    {e.sets} × {formatTarget(e.mode, e.targetMin, e.targetMax)}
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 text-neutral-600 dark:text-neutral-300">{formatWeight(e.weight, unit)}</td>
                  <td className="whitespace-nowrap py-1.5 pr-3 tabular-nums text-neutral-600 dark:text-neutral-300">{formatSeconds(e.restSeconds)}</td>
                  <td className="whitespace-nowrap py-1.5 text-neutral-600 dark:text-neutral-300">{e.tempo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
