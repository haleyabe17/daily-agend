import type { LibraryExercise, MuscleGroup } from './types'

export const GROUP_META: Record<MuscleGroup, { label: string; color: string }> = {
  push: { label: 'Push', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  pull: { label: 'Pull', color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  legs: { label: 'Legs', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  core: { label: 'Core', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  skill: { label: 'Skill', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  mobility: { label: 'Mobility', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700/50 dark:text-neutral-300' },
}

export const MUSCLE_GROUPS = Object.keys(GROUP_META) as MuscleGroup[]

/** Common calisthenics movements, grouped into progression chains (easier → harder). */
export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Push
  { id: 'wall-pushup', name: 'Wall Push-up', group: 'push', mode: 'reps', harder: 'Incline Push-up' },
  { id: 'incline-pushup', name: 'Incline Push-up', group: 'push', mode: 'reps', easier: 'Wall Push-up', harder: 'Knee Push-up' },
  { id: 'knee-pushup', name: 'Knee Push-up', group: 'push', mode: 'reps', easier: 'Incline Push-up', harder: 'Push-up' },
  { id: 'pushup', name: 'Push-up', group: 'push', mode: 'reps', easier: 'Knee Push-up', harder: 'Diamond Push-up', cue: 'Body in a straight line, elbows ~45°' },
  { id: 'diamond-pushup', name: 'Diamond Push-up', group: 'push', mode: 'reps', easier: 'Push-up', harder: 'Archer Push-up' },
  { id: 'archer-pushup', name: 'Archer Push-up', group: 'push', mode: 'reps', easier: 'Diamond Push-up', harder: 'One-arm Push-up' },
  { id: 'one-arm-pushup', name: 'One-arm Push-up', group: 'push', mode: 'reps', easier: 'Archer Push-up' },
  { id: 'pike-pushup', name: 'Pike Push-up', group: 'push', mode: 'reps', harder: 'Elevated Pike Push-up' },
  { id: 'elevated-pike-pushup', name: 'Elevated Pike Push-up', group: 'push', mode: 'reps', easier: 'Pike Push-up', harder: 'Wall Handstand Push-up' },
  { id: 'wall-hspu', name: 'Wall Handstand Push-up', group: 'push', mode: 'reps', easier: 'Elevated Pike Push-up' },
  { id: 'bench-dip', name: 'Bench Dip', group: 'push', mode: 'reps', harder: 'Parallel Bar Dip' },
  { id: 'dip', name: 'Parallel Bar Dip', group: 'push', mode: 'reps', easier: 'Bench Dip', harder: 'Ring Dip', cue: 'Shoulders below elbows at the bottom' },
  { id: 'ring-dip', name: 'Ring Dip', group: 'push', mode: 'reps', easier: 'Parallel Bar Dip' },
  { id: 'pseudo-planche-pushup', name: 'Pseudo Planche Push-up', group: 'push', mode: 'reps' },

  // Pull
  { id: 'dead-hang', name: 'Dead Hang', group: 'pull', mode: 'time', harder: 'Scapular Pull-up' },
  { id: 'scap-pullup', name: 'Scapular Pull-up', group: 'pull', mode: 'reps', easier: 'Dead Hang', harder: 'Negative Pull-up' },
  { id: 'inverted-row', name: 'Inverted Row', group: 'pull', mode: 'reps', harder: 'Negative Pull-up', cue: 'Squeeze shoulder blades, chest to bar' },
  { id: 'negative-pullup', name: 'Negative Pull-up', group: 'pull', mode: 'reps', easier: 'Inverted Row', harder: 'Pull-up' },
  { id: 'chinup', name: 'Chin-up', group: 'pull', mode: 'reps', easier: 'Negative Pull-up', harder: 'Pull-up' },
  { id: 'pullup', name: 'Pull-up', group: 'pull', mode: 'reps', easier: 'Negative Pull-up', harder: 'L-sit Pull-up', cue: 'Full hang to chin over bar' },
  { id: 'l-sit-pullup', name: 'L-sit Pull-up', group: 'pull', mode: 'reps', easier: 'Pull-up', harder: 'Archer Pull-up' },
  { id: 'archer-pullup', name: 'Archer Pull-up', group: 'pull', mode: 'reps', easier: 'L-sit Pull-up', harder: 'One-arm Pull-up Negative' },
  { id: 'one-arm-pullup-negative', name: 'One-arm Pull-up Negative', group: 'pull', mode: 'reps', easier: 'Archer Pull-up' },
  { id: 'muscle-up', name: 'Muscle-up', group: 'pull', mode: 'reps', easier: 'Pull-up' },

  // Legs
  { id: 'squat', name: 'Bodyweight Squat', group: 'legs', mode: 'reps', harder: 'Bulgarian Split Squat' },
  { id: 'lunge', name: 'Reverse Lunge', group: 'legs', mode: 'reps', harder: 'Bulgarian Split Squat' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', group: 'legs', mode: 'reps', easier: 'Bodyweight Squat', harder: 'Shrimp Squat' },
  { id: 'shrimp-squat', name: 'Shrimp Squat', group: 'legs', mode: 'reps', easier: 'Bulgarian Split Squat', harder: 'Pistol Squat' },
  { id: 'pistol-squat', name: 'Pistol Squat', group: 'legs', mode: 'reps', easier: 'Shrimp Squat' },
  { id: 'glute-bridge', name: 'Glute Bridge', group: 'legs', mode: 'reps', harder: 'Single-leg Glute Bridge' },
  { id: 'sl-glute-bridge', name: 'Single-leg Glute Bridge', group: 'legs', mode: 'reps', easier: 'Glute Bridge' },
  { id: 'nordic-curl', name: 'Nordic Curl', group: 'legs', mode: 'reps' },
  { id: 'calf-raise', name: 'Single-leg Calf Raise', group: 'legs', mode: 'reps' },
  { id: 'jump-squat', name: 'Jump Squat', group: 'legs', mode: 'reps' },

  // Core
  { id: 'plank', name: 'Plank', group: 'core', mode: 'time', harder: 'Hollow Body Hold' },
  { id: 'hollow-hold', name: 'Hollow Body Hold', group: 'core', mode: 'time', easier: 'Plank', cue: 'Lower back pressed into the floor' },
  { id: 'side-plank', name: 'Side Plank', group: 'core', mode: 'time' },
  { id: 'knee-raise', name: 'Hanging Knee Raise', group: 'core', mode: 'reps', harder: 'Hanging Leg Raise' },
  { id: 'leg-raise', name: 'Hanging Leg Raise', group: 'core', mode: 'reps', easier: 'Hanging Knee Raise', harder: 'Toes to Bar' },
  { id: 'toes-to-bar', name: 'Toes to Bar', group: 'core', mode: 'reps', easier: 'Hanging Leg Raise' },
  { id: 'l-sit', name: 'L-sit', group: 'core', mode: 'time', cue: 'Depress shoulders, lock knees' },
  { id: 'dragon-flag-negative', name: 'Dragon Flag Negative', group: 'core', mode: 'reps' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', group: 'core', mode: 'reps' },

  // Skills
  { id: 'wall-handstand', name: 'Wall Handstand', group: 'skill', mode: 'time', harder: 'Freestanding Handstand' },
  { id: 'freestanding-handstand', name: 'Freestanding Handstand', group: 'skill', mode: 'time', easier: 'Wall Handstand' },
  { id: 'crow-pose', name: 'Crow Pose', group: 'skill', mode: 'time' },
  { id: 'tuck-planche', name: 'Tuck Planche', group: 'skill', mode: 'time', harder: 'Advanced Tuck Planche' },
  { id: 'adv-tuck-planche', name: 'Advanced Tuck Planche', group: 'skill', mode: 'time', easier: 'Tuck Planche' },
  { id: 'tuck-front-lever', name: 'Tuck Front Lever', group: 'skill', mode: 'time', harder: 'Advanced Tuck Front Lever' },
  { id: 'adv-tuck-front-lever', name: 'Advanced Tuck Front Lever', group: 'skill', mode: 'time', easier: 'Tuck Front Lever' },
  { id: 'back-lever-tuck', name: 'Tuck Back Lever', group: 'skill', mode: 'time' },

  // Mobility
  { id: 'deep-squat-hold', name: 'Deep Squat Hold', group: 'mobility', mode: 'time' },
  { id: 'shoulder-dislocate', name: 'Shoulder Dislocates', group: 'mobility', mode: 'reps' },
  { id: 'pancake-stretch', name: 'Pancake Stretch', group: 'mobility', mode: 'time' },
  { id: 'bridge-hold', name: 'Bridge Hold', group: 'mobility', mode: 'time' },
]

export function findLibraryExercise(name: string): LibraryExercise | undefined {
  const needle = name.trim().toLowerCase()
  return EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === needle)
}
