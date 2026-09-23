import type { MuscleGroup } from '../types'
import { GROUP_META } from '../exerciseLibrary'

export function GroupTag({ group }: { group: MuscleGroup }) {
  const meta = GROUP_META[group]
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  )
}
