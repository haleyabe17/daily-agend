import { useState } from 'react'
import { AgendaView } from './components/AgendaView'
import { TrainingApp } from './training/components/TrainingApp'

type View = 'agenda' | 'training'

const VIEW_KEY = 'daily-agend:view'

function loadView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'training' ? 'training' : 'agenda'
  } catch {
    return 'agenda'
  }
}

function App() {
  const [view, setView] = useState<View>(loadView)

  const switchView = (next: View) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // storage unavailable
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <nav className="mb-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-800" aria-label="App sections">
          {(
            [
              { id: 'agenda', label: '📋 Agenda' },
              { id: 'training', label: '🤸 Training' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchView(t.id)}
              aria-current={view === t.id ? 'page' : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                view === t.id
                  ? 'border-violet-500 text-violet-600 dark:text-violet-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {view === 'agenda' ? <AgendaView /> : <TrainingApp />}
      </main>
    </div>
  )
}

export default App
