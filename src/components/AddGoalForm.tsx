import { useState } from 'react'
import type { Priority } from '../types'

interface AddGoalFormProps {
  onAdd: (text: string, priority: Priority) => void
  accentClass: string
}

export function AddGoalForm({ onAdd, accentClass }: AddGoalFormProps) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text, priority)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add an item…"
        className="min-w-0 flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="Priority"
        className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-1.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button
        type="submit"
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-white ${accentClass} disabled:opacity-40`}
        disabled={!text.trim()}
      >
        Add
      </button>
    </form>
  )
}
