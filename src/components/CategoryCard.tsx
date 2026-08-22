import { useState } from 'react'
import type { CategoryMeta, Goal, Priority } from '../types'
import { CATEGORY_ACCENTS, PRIORITY_CYCLE } from '../constants'
import { GoalRow } from './GoalRow'
import { AddGoalForm } from './AddGoalForm'
import { ProgressBar } from './ProgressBar'

interface CategoryCardProps {
  meta: CategoryMeta
  goals: Goal[]
  onAdd: (text: string, priority: Priority) => void
  onToggle: (goalId: string) => void
  onRemove: (goalId: string) => void
  onSetPriority: (goalId: string, priority: Priority) => void
  onReorder: (fromId: string, toId: string) => void
  stats: { total: number; done: number; percent: number }
}

export function CategoryCard({
  meta,
  goals,
  onAdd,
  onToggle,
  onRemove,
  onSetPriority,
  onReorder,
  stats,
}: CategoryCardProps) {
  const accent = CATEGORY_ACCENTS[meta.id]
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {meta.emoji}
          </span>
          <h2 className={`text-sm font-semibold ${accent.text}`}>{meta.label}</h2>
        </div>
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          {stats.done}/{stats.total}
        </span>
      </header>

      <ProgressBar percent={stats.percent} colorClass={accent.bar} />

      <div className="mt-3 flex flex-col gap-0.5 min-h-[2rem]">
        {goals.length === 0 && (
          <p className="py-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
            Nothing here yet — add your first item below.
          </p>
        )}
        {goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            onToggle={() => onToggle(goal.id)}
            onRemove={() => onRemove(goal.id)}
            onCyclePriority={() => onSetPriority(goal.id, PRIORITY_CYCLE[goal.priority])}
            draggable
            isDragging={draggingId === goal.id}
            isDropTarget={dropTargetId === goal.id && draggingId !== goal.id}
            onDragStart={(e) => {
              setDraggingId(goal.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => {
              setDraggingId(null)
              setDropTargetId(null)
            }}
            onDragEnter={() => {
              if (draggingId && draggingId !== goal.id) setDropTargetId(goal.id)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) onReorder(draggingId, goal.id)
              setDraggingId(null)
              setDropTargetId(null)
            }}
          />
        ))}
      </div>

      <div className="mt-3 border-t border-neutral-100 dark:border-neutral-800 pt-3">
        <AddGoalForm onAdd={onAdd} accentClass={accent.bg} />
      </div>
    </section>
  )
}
