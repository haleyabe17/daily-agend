import type { Program } from '../types'
import { PROGRAM_TEMPLATES, blankProgram } from '../templates'
import { btnSecondary, card, muted } from './ui'

interface ProgramPickerProps {
  onCreate: (draft: Omit<Program, 'id' | 'createdAt'>) => void
}

export function ProgramPicker({ onCreate }: ProgramPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Create a program</h2>
        <p className={muted}>
          Start from a template and tweak it, or build your own from scratch. You can edit every
          exercise, set, rep range, weight and rest time afterwards.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROGRAM_TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onCreate(t.build())}
            className={`${card} text-left transition-colors hover:border-violet-400 dark:hover:border-violet-500`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-semibold text-neutral-900 dark:text-white">{t.name}</span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                {t.level}
              </span>
            </div>
            <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">{t.daysPerWeek} days / week</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{t.description}</p>
          </button>
        ))}
      </div>
      <div>
        <button type="button" onClick={() => onCreate(blankProgram())} className={btnSecondary}>
          + Start from scratch
        </button>
      </div>
    </div>
  )
}
