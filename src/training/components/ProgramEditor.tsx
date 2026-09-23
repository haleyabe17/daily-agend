import { useState, type ReactNode } from 'react'
import type { MuscleGroup, PlannedExercise, Program, WeightUnit, WorkoutDay } from '../types'
import { EXERCISE_LIBRARY, GROUP_META, MUSCLE_GROUPS, findLibraryExercise } from '../exerciseLibrary'
import { WEEKDAY_SHORT, formatSeconds, makeId } from '../utils'
import { NumberField } from './NumberField'
import { btnDanger, btnPrimary, btnSecondary, card, input, label, muted } from './ui'

interface ProgramEditorProps {
  program: Program
  unit: WeightUnit
  onChange: (program: Program) => void
}

function newExercise(): PlannedExercise {
  return {
    id: makeId(),
    name: '',
    group: 'push',
    mode: 'reps',
    sets: 3,
    targetMin: 8,
    targetMax: 12,
    weight: 0,
    restSeconds: 90,
    tempo: '',
    notes: '',
  }
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function ProgramEditor({ program, unit, onChange }: ProgramEditorProps) {
  const updateWorkout = (workoutId: string, updater: (w: WorkoutDay) => WorkoutDay) =>
    onChange({ ...program, workouts: program.workouts.map((w) => (w.id === workoutId ? updater(w) : w)) })

  const addWorkout = () => {
    const letter = String.fromCharCode(65 + program.workouts.length)
    onChange({
      ...program,
      workouts: [...program.workouts, { id: makeId(), name: `Workout ${letter}`, weekdays: [], exercises: [] }],
    })
  }

  const removeWorkout = (workoutId: string) => {
    if (!window.confirm('Delete this workout and all its exercises?')) return
    onChange({ ...program, workouts: program.workouts.filter((w) => w.id !== workoutId) })
  }

  return (
    <div className="flex flex-col gap-4">
      <datalist id="exercise-library">
        {EXERCISE_LIBRARY.map((e) => (
          <option key={e.id} value={e.name} />
        ))}
      </datalist>

      <section className={`${card} flex flex-col gap-3`}>
        <label className="flex flex-col gap-1">
          <span className={label}>Program name</span>
          <input
            value={program.name}
            onChange={(e) => onChange({ ...program, name: e.target.value })}
            className={`${input} text-base font-semibold`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={label}>Description / goals</span>
          <textarea
            value={program.description}
            rows={2}
            onChange={(e) => onChange({ ...program, description: e.target.value })}
            className={input}
            placeholder="e.g. Get my first muscle-up by summer"
          />
        </label>
      </section>

      {program.workouts.map((workout, wi) => (
        <WorkoutEditor
          key={workout.id}
          workout={workout}
          unit={unit}
          canMoveUp={wi > 0}
          canMoveDown={wi < program.workouts.length - 1}
          onMove={(dir) => onChange({ ...program, workouts: move(program.workouts, wi, wi + dir) })}
          onChange={(updater) => updateWorkout(workout.id, updater)}
          onRemove={() => removeWorkout(workout.id)}
        />
      ))}

      <div>
        <button type="button" onClick={addWorkout} className={btnSecondary}>
          + Add workout day
        </button>
      </div>
    </div>
  )
}

interface WorkoutEditorProps {
  workout: WorkoutDay
  unit: WeightUnit
  canMoveUp: boolean
  canMoveDown: boolean
  onMove: (dir: -1 | 1) => void
  onChange: (updater: (w: WorkoutDay) => WorkoutDay) => void
  onRemove: () => void
}

function WorkoutEditor({ workout, unit, canMoveUp, canMoveDown, onMove, onChange, onRemove }: WorkoutEditorProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleDay = (day: number) =>
    onChange((w) => ({
      ...w,
      weekdays: w.weekdays.includes(day)
        ? w.weekdays.filter((d) => d !== day)
        : [...w.weekdays, day].sort((a, b) => a - b),
    }))

  const updateExercise = (exId: string, patch: Partial<PlannedExercise>) =>
    onChange((w) => ({ ...w, exercises: w.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) }))

  return (
    <section className={`${card} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand workout' : 'Collapse workout'}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          {collapsed ? '▸' : '▾'}
        </button>
        <input
          value={workout.name}
          onChange={(e) => onChange((w) => ({ ...w, name: e.target.value }))}
          className={`${input} min-w-0 flex-1 font-semibold`}
          aria-label="Workout name"
        />
        <div className="flex items-center gap-1">
          <button type="button" disabled={!canMoveUp} onClick={() => onMove(-1)} className={btnSecondary} aria-label="Move workout up">
            ↑
          </button>
          <button type="button" disabled={!canMoveDown} onClick={() => onMove(1)} className={btnSecondary} aria-label="Move workout down">
            ↓
          </button>
          <button type="button" onClick={onRemove} className={btnDanger}>
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${label} mr-1`}>Train on</span>
        {WEEKDAY_SHORT.map((d, i) => {
          const on = workout.weekdays.includes(i)
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              aria-pressed={on}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                on
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>

      {!collapsed && (
        <>
          {workout.exercises.length === 0 && <p className={muted}>No exercises yet — add one below.</p>}
          <ol className="flex flex-col gap-3">
            {workout.exercises.map((ex, i) => (
              <li
                key={ex.id}
                className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-5 text-xs font-semibold text-neutral-400">{i + 1}.</span>
                  <input
                    list="exercise-library"
                    value={ex.name}
                    placeholder="Exercise (type or pick)"
                    aria-label="Exercise name"
                    onChange={(e) => {
                      const name = e.target.value
                      const lib = findLibraryExercise(name)
                      updateExercise(ex.id, lib ? { name, group: lib.group, mode: lib.mode } : { name })
                    }}
                    className={`${input} min-w-40 flex-1`}
                  />
                  <select
                    value={ex.group}
                    onChange={(e) => updateExercise(ex.id, { group: e.target.value as MuscleGroup })}
                    className={input}
                    aria-label="Category"
                  >
                    {MUSCLE_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {GROUP_META[g].label}
                      </option>
                    ))}
                  </select>
                  <div className="flex overflow-hidden rounded-lg border border-neutral-200 text-xs dark:border-neutral-700">
                    {(['reps', 'time'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateExercise(ex.id, { mode: m })}
                        className={`px-2.5 py-1.5 font-medium ${
                          ex.mode === m
                            ? 'bg-violet-600 text-white'
                            : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {m === 'reps' ? 'Reps' : 'Hold'}
                      </button>
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      aria-label="Move exercise up"
                      onClick={() => onChange((w) => ({ ...w, exercises: move(w.exercises, i, i - 1) }))}
                      className="px-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === workout.exercises.length - 1}
                      aria-label="Move exercise down"
                      onClick={() => onChange((w) => ({ ...w, exercises: move(w.exercises, i, i + 1) }))}
                      className="px-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label="Remove exercise"
                      onClick={() => onChange((w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== ex.id) }))}
                      className="px-1.5 text-neutral-400 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 pl-7">
                  <Field title="Sets">
                    <NumberField ariaLabel="Sets" min={1} value={ex.sets} onChange={(v) => updateExercise(ex.id, { sets: Math.max(1, Math.round(v)) })} />
                  </Field>
                  <Field title={ex.mode === 'time' ? 'Hold (sec)' : 'Reps'}>
                    <div className="flex items-center gap-1">
                      <NumberField
                        ariaLabel="Target minimum"
                        value={ex.targetMin}
                        onChange={(v) => updateExercise(ex.id, { targetMin: v, targetMax: Math.max(v, ex.targetMax) })}
                      />
                      <span className="text-neutral-400">–</span>
                      <NumberField
                        ariaLabel="Target maximum"
                        value={ex.targetMax}
                        onChange={(v) => updateExercise(ex.id, { targetMax: v, targetMin: Math.min(v, ex.targetMin) })}
                      />
                    </div>
                  </Field>
                  <Field title={`Added weight (${unit})`}>
                    <NumberField ariaLabel="Added weight" step={0.5} className="w-20" value={ex.weight} onChange={(v) => updateExercise(ex.id, { weight: v })} />
                  </Field>
                  <Field title={`Rest (${formatSeconds(ex.restSeconds)})`}>
                    <NumberField ariaLabel="Rest seconds" step={15} className="w-20" value={ex.restSeconds} onChange={(v) => updateExercise(ex.id, { restSeconds: Math.round(v) })} />
                  </Field>
                  <Field title="Tempo">
                    <input
                      value={ex.tempo}
                      placeholder="3-1-1-0"
                      aria-label="Tempo"
                      onChange={(e) => updateExercise(ex.id, { tempo: e.target.value })}
                      className={`${input} w-24`}
                    />
                  </Field>
                </div>
                <div className="pl-7">
                  <input
                    value={ex.notes}
                    placeholder="Notes / form cues (optional)"
                    aria-label="Notes"
                    onChange={(e) => updateExercise(ex.id, { notes: e.target.value })}
                    className={`${input} w-full`}
                  />
                </div>
              </li>
            ))}
          </ol>
          <div>
            <button
              type="button"
              onClick={() => onChange((w) => ({ ...w, exercises: [...w.exercises, newExercise()] }))}
              className={btnPrimary}
            >
              + Add exercise
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={label}>{title}</span>
      {children}
    </div>
  )
}
