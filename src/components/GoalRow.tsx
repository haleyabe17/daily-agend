import { useState } from 'react'
import type { Goal, Priority } from '../types'
import { PRIORITY_LABEL } from '../types'

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-sky-500',
}

interface GoalRowProps {
  goal: Goal
  onToggle: () => void
  onRemove: () => void
  onCyclePriority: () => void
  draggable: boolean
  isDragging: boolean
  isDropTarget: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDragEnter: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
}

export function GoalRow({
  goal,
  onToggle,
  onRemove,
  onCyclePriority,
  draggable,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop,
}: GoalRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors
        ${isDragging ? 'opacity-40' : ''}
        ${isDropTarget ? 'bg-violet-50 dark:bg-violet-500/10 ring-1 ring-violet-300 dark:ring-violet-500/40' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'}
      `}
    >
      <span
        className="cursor-grab select-none text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        ⠿
      </span>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={goal.done}
        aria-label={goal.done ? 'Mark goal incomplete' : 'Mark goal complete'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors
          ${goal.done
            ? 'border-violet-500 bg-violet-500 text-white'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-violet-400'}
        `}
      >
        {goal.done && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
            <path
              d="M2 6l2.5 2.5L10 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm leading-snug break-words ${
          goal.done
            ? 'text-neutral-400 dark:text-neutral-600 line-through'
            : 'text-neutral-800 dark:text-neutral-100'
        }`}
      >
        {goal.text}
      </span>

      <button
        type="button"
        onClick={onCyclePriority}
        title={`Priority: ${PRIORITY_LABEL[goal.priority]} (click to change)`}
        className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 shrink-0"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[goal.priority]}`} />
        <span className="hidden sm:inline">{PRIORITY_LABEL[goal.priority]}</span>
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Delete goal"
        className={`shrink-0 rounded-md p-1 text-neutral-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-opacity ${
          hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
