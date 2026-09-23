import { useEffect, useRef, useState } from 'react'
import type { LoggedExercise, LoggedSet, PlannedExercise, WeightUnit, WorkoutDay, WorkoutSession } from '../types'
import type { TrainingApi } from '../useTrainingData'
import { findLibraryExercise } from '../exerciseLibrary'
import { formatDuration, formatSeconds, formatTarget, formatWeight, progressionSuggestion, sessionTotals } from '../utils'
import { signal, useNow } from '../useNow'
import { ProgressBar } from '../../components/ProgressBar'
import { GroupTag } from './GroupTag'
import { NumberField } from './NumberField'
import { btnDanger, btnPrimary, btnSecondary, card, input, label, muted } from './ui'

interface SessionViewProps {
  session: WorkoutSession
  workout: WorkoutDay | undefined
  unit: WeightUnit
  api: TrainingApi
}

interface RestState {
  endsAt: number
  total: number
}

export function SessionView({ session, workout, unit, api }: SessionViewProps) {
  const now = useNow()
  const [rest, setRest] = useState<RestState | null>(null)
  const signalled = useRef(false)
  const totals = sessionTotals(session)
  const percent = totals.setsTotal === 0 ? 0 : Math.round((totals.setsDone / totals.setsTotal) * 100)

  const restLeft = rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : 0
  useEffect(() => {
    if (rest && restLeft === 0 && !signalled.current) {
      signalled.current = true
      signal()
    }
  }, [rest, restLeft])

  const startRest = (seconds: number) => {
    if (seconds <= 0) return
    signalled.current = false
    setRest({ endsAt: Date.now() + seconds * 1000, total: seconds })
  }

  const updateExercise = (index: number, updater: (ex: LoggedExercise) => LoggedExercise) =>
    api.updateActiveSession((s) => ({ ...s, exercises: s.exercises.map((e, i) => (i === index ? updater(e) : e)) }))

  const finish = () => {
    if (totals.setsDone === 0 && !window.confirm('No sets are checked off. Finish anyway?')) return
    api.finishSession()
  }

  const discard = () => {
    if (window.confirm('Discard this workout? Nothing will be saved.')) api.discardSession()
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      <section className={`${card} flex flex-col gap-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{session.workoutName}</h2>
            <p className={muted}>
              In progress · {formatDuration(now - session.startedAt)} · {totals.setsDone}/{totals.setsTotal} sets
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={discard} className={btnDanger}>
              Discard
            </button>
            <button type="button" onClick={finish} className={btnPrimary}>
              Finish workout
            </button>
          </div>
        </div>
        <ProgressBar percent={percent} colorClass="bg-violet-500" heightClass="h-2.5" />
      </section>

      {session.exercises.map((ex, i) => {
        const plan = workout?.exercises.find((p) => p.id === ex.plannedId)
        return (
          <ExerciseLogCard
            key={`${ex.plannedId}-${i}`}
            exercise={ex}
            plan={plan}
            unit={unit}
            previous={api.lastLoggedFor(ex.plannedId, ex.name)}
            onChange={(updater) => updateExercise(i, updater)}
            onSetCompleted={() => startRest(plan?.restSeconds ?? 90)}
          />
        )
      })}

      <section className={`${card} flex flex-col gap-3`}>
        <div className="flex flex-col gap-1">
          <span className={label}>How hard was it? (RPE 1–10)</span>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => api.updateActiveSession((s) => ({ ...s, rpe: s.rpe === n ? null : n }))}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${
                  session.rpe === n
                    ? 'bg-violet-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1">
          <span className={label}>Session notes</span>
          <textarea
            rows={2}
            value={session.notes}
            placeholder="Energy, sleep, anything that felt off…"
            onChange={(e) => api.updateActiveSession((s) => ({ ...s, notes: e.target.value }))}
            className={input}
          />
        </label>
        <button type="button" onClick={finish} className={`${btnPrimary} self-start`}>
          Finish workout
        </button>
      </section>

      {rest && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <span>{restLeft === 0 ? 'Rest over — next set!' : 'Rest'}</span>
                <span className="text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">
                  {formatSeconds(restLeft)}
                </span>
              </div>
              <ProgressBar
                percent={(restLeft / rest.total) * 100}
                colorClass={restLeft === 0 ? 'bg-emerald-500' : 'bg-violet-500'}
              />
            </div>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                signalled.current = false
                setRest((r) => (r ? { endsAt: Math.max(r.endsAt, Date.now()) + 15000, total: r.total + 15 } : r))
              }}
            >
              +15s
            </button>
            <button type="button" className={btnSecondary} onClick={() => setRest(null)}>
              {restLeft === 0 ? 'Close' : 'Skip'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ExerciseLogCardProps {
  exercise: LoggedExercise
  plan: PlannedExercise | undefined
  unit: WeightUnit
  previous: LoggedExercise | undefined
  onChange: (updater: (ex: LoggedExercise) => LoggedExercise) => void
  onSetCompleted: () => void
}

function ExerciseLogCard({ exercise, plan, unit, previous, onChange, onSetCompleted }: ExerciseLogCardProps) {
  const lib = findLibraryExercise(exercise.name)
  const suggestion = plan ? progressionSuggestion(previous, plan, lib?.harder, lib?.easier, unit) : null
  const allDone = exercise.sets.length > 0 && exercise.sets.every((s) => s.done)

  const updateSet = (index: number, patch: Partial<LoggedSet>) =>
    onChange((ex) => ({ ...ex, sets: ex.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)) }))

  return (
    <section className={`${card} flex flex-col gap-3 ${allDone ? 'border-emerald-300 dark:border-emerald-600/50' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white">{exercise.name}</h3>
            {plan && <GroupTag group={plan.group} />}
            {allDone && <span className="text-emerald-500">✓</span>}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {exercise.sets.length} × {formatTarget(exercise.mode, exercise.targetMin, exercise.targetMax)}
            {plan && ` · ${formatWeight(plan.weight, unit)} · Rest ${formatSeconds(plan.restSeconds)}`}
            {plan?.tempo && ` · Tempo ${plan.tempo}`}
          </p>
          {plan?.notes && <p className="text-xs italic text-neutral-500 dark:text-neutral-400">{plan.notes}</p>}
        </div>
      </div>

      {previous && previous.sets.some((s) => s.done) && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium">Last time:</span>{' '}
          {previous.sets
            .filter((s) => s.done)
            .map((s) => `${s.value}${previous.mode === 'time' ? 's' : ''}${s.weight > 0 ? ` @${s.weight}${unit}` : ''}`)
            .join(' · ')}
        </p>
      )}
      {suggestion && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            suggestion.kind === 'progress'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : suggestion.kind === 'regress'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
          }`}
        >
          {suggestion.kind === 'progress' ? '⬆ ' : suggestion.kind === 'regress' ? '⬇ ' : '→ '}
          {suggestion.message}
        </p>
      )}

      <div className="flex max-w-md flex-col gap-1.5">
        <div className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem] items-center gap-2 text-xs font-medium text-neutral-400">
          <span>Set</span>
          <span>{exercise.mode === 'time' ? 'Seconds' : 'Reps'}</span>
          <span>+{unit}</span>
          <span className="text-center">Done</span>
        </div>
        {exercise.sets.map((set, si) => (
          <SetRow
            key={si}
            index={si}
            set={set}
            mode={exercise.mode}
            onChange={(patch) => updateSet(si, patch)}
            onComplete={() => {
              updateSet(si, { done: true })
              onSetCompleted()
            }}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={btnSecondary}
          onClick={() =>
            onChange((ex) => {
              const last = ex.sets[ex.sets.length - 1]
              return {
                ...ex,
                sets: [...ex.sets, { value: last?.value ?? ex.targetMin, weight: last?.weight ?? 0, done: false }],
              }
            })
          }
        >
          + Set
        </button>
        {exercise.sets.length > 1 && (
          <button
            type="button"
            className={btnSecondary}
            onClick={() => onChange((ex) => ({ ...ex, sets: ex.sets.slice(0, -1) }))}
          >
            − Set
          </button>
        )}
      </div>
    </section>
  )
}

interface SetRowProps {
  index: number
  set: LoggedSet
  mode: LoggedExercise['mode']
  onChange: (patch: Partial<LoggedSet>) => void
  onComplete: () => void
}

function SetRow({ index, set, mode, onChange, onComplete }: SetRowProps) {
  const [holdStart, setHoldStart] = useState<number | null>(null)
  const now = useNow(holdStart !== null, 250)
  const holding = holdStart !== null
  const heldSeconds = holding ? Math.max(0, Math.floor((now - holdStart) / 1000)) : 0

  return (
    <div
      className={`grid grid-cols-[2.5rem_1fr_1fr_2.5rem] items-center gap-2 rounded-lg ${
        set.done ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''
      }`}
    >
      <span className="pl-1 text-sm font-semibold text-neutral-500">{index + 1}</span>
      <div className="flex items-center gap-1">
        {holding ? (
          <span className="w-16 text-center text-sm font-semibold tabular-nums text-violet-600 dark:text-violet-300">
            {heldSeconds}s
          </span>
        ) : (
          <NumberField ariaLabel={`Set ${index + 1} ${mode === 'time' ? 'seconds' : 'reps'}`} value={set.value} onChange={(v) => onChange({ value: v })} />
        )}
        {mode === 'time' && !set.done && (
          <button
            type="button"
            aria-label={holding ? 'Stop hold timer' : 'Start hold timer'}
            onClick={() => {
              if (holding) {
                onChange({ value: heldSeconds })
                setHoldStart(null)
                signal()
              } else {
                setHoldStart(Date.now())
              }
            }}
            className="rounded-md px-1.5 py-1 text-xs text-violet-600 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10"
          >
            {holding ? '■' : '▶'}
          </button>
        )}
      </div>
      <NumberField ariaLabel={`Set ${index + 1} weight`} step={0.5} value={set.weight} onChange={(v) => onChange({ weight: v })} />
      <button
        type="button"
        aria-label={set.done ? `Undo set ${index + 1}` : `Complete set ${index + 1}`}
        aria-pressed={set.done}
        onClick={() => (set.done ? onChange({ done: false }) : onComplete())}
        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
          set.done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-neutral-300 text-transparent hover:border-emerald-400 dark:border-neutral-600'
        }`}
      >
        ✓
      </button>
    </div>
  )
}
