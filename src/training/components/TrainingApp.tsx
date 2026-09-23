import { useRef, useState } from 'react'
import { useTrainingData } from '../useTrainingData'
import { todayKey } from '../../utils/date'
import { ProgramPicker } from './ProgramPicker'
import { ProgramEditor } from './ProgramEditor'
import { SessionView } from './SessionView'
import { TodayView } from './TodayView'
import { HistoryView } from './HistoryView'
import { ProgressView } from './ProgressView'
import { btnDanger, btnSecondary, card, input, label } from './ui'

type Tab = 'today' | 'program' | 'history' | 'progress'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'program', label: 'Program' },
  { id: 'history', label: 'History' },
  { id: 'progress', label: 'Progress' },
]

export function TrainingApp() {
  const api = useTrainingData()
  const { data, activeProgram, history } = api
  const [tab, setTab] = useState<Tab>('today')
  const [creating, setCreating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (data.activeSession) {
    const program = data.programs.find((p) => p.id === data.activeSession?.programId)
    const workout = program?.workouts.find((w) => w.id === data.activeSession?.workoutId)
    return <SessionView session={data.activeSession} workout={workout} unit={data.unit} api={api} />
  }

  if (!activeProgram || creating) {
    return (
      <div className="flex flex-col gap-4">
        {creating && (
          <button type="button" onClick={() => setCreating(false)} className={`${btnSecondary} self-start`}>
            ← Back
          </button>
        )}
        <ProgramPicker
          onCreate={(draft) => {
            api.addProgram(draft)
            setCreating(false)
            setTab('program')
          }}
        />
      </div>
    )
  }

  const exportBackup = () => {
    const blob = new Blob([api.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (file: File) => {
    if (!window.confirm('Replace all training data with this backup?')) return
    const ok = api.importJson(await file.text())
    if (!ok) window.alert("That file doesn't look like a training backup.")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-neutral-900 dark:text-white">{activeProgram.name}</h2>
          {activeProgram.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{activeProgram.description}</p>
          )}
        </div>
        <nav className="flex rounded-full border border-neutral-200 p-0.5 dark:border-neutral-700" aria-label="Training sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'today' && (
        <TodayView
          program={activeProgram}
          sessions={history}
          unit={data.unit}
          onStart={(id) => {
            api.startSession(id)
            window.scrollTo({ top: 0 })
          }}
        />
      )}

      {tab === 'program' && (
        <>
          <ProgramEditor program={activeProgram} unit={data.unit} onChange={api.updateProgram} />

          <section className={`${card} flex flex-col gap-3`}>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Programs & settings</h3>
            <div className="flex flex-wrap items-end gap-3">
              {data.programs.length > 1 && (
                <label className="flex flex-col gap-1">
                  <span className={label}>Active program</span>
                  <select value={activeProgram.id} onChange={(e) => api.setActiveProgram(e.target.value)} className={input}>
                    {data.programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className={label}>Weight unit</span>
                <select value={data.unit} onChange={(e) => api.setUnit(e.target.value as 'kg' | 'lb')} className={input}>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </label>
              <button type="button" className={btnSecondary} onClick={() => setCreating(true)}>
                + New program
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  const copy = structuredClone(activeProgram)
                  api.addProgram({ ...copy, name: `${copy.name} (copy)` })
                }}
              >
                Duplicate
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() =>
                  window.confirm(`Delete "${activeProgram.name}"? Logged workouts stay in your history.`) &&
                  api.deleteProgram(activeProgram.id)
                }
              >
                Delete program
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <button type="button" className={btnSecondary} onClick={exportBackup}>
                Export backup
              </button>
              <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>
                Import backup
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void importBackup(file)
                  e.target.value = ''
                }}
              />
            </div>
          </section>
        </>
      )}

      {tab === 'history' && <HistoryView sessions={history} unit={data.unit} onDelete={api.deleteSession} />}
      {tab === 'progress' && <ProgressView sessions={history} unit={data.unit} />}
    </div>
  )
}
