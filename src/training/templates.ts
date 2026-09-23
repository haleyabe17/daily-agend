import type { PlannedExercise, Program, WorkoutDay } from './types'
import { findLibraryExercise } from './exerciseLibrary'
import { makeId } from './utils'

type ExerciseSpec = [name: string, sets: number, min: number, max: number, rest: number, notes?: string]

function planned([name, sets, min, max, rest, notes = '']: ExerciseSpec): PlannedExercise {
  const lib = findLibraryExercise(name)
  return {
    id: makeId(),
    name,
    group: lib?.group ?? 'push',
    mode: lib?.mode ?? 'reps',
    sets,
    targetMin: min,
    targetMax: max,
    weight: 0,
    restSeconds: rest,
    tempo: '',
    notes: notes || lib?.cue || '',
  }
}

function workout(name: string, weekdays: number[], specs: ExerciseSpec[]): WorkoutDay {
  return { id: makeId(), name, weekdays, exercises: specs.map(planned) }
}

export interface ProgramTemplate {
  key: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  daysPerWeek: number
  description: string
  build: () => Omit<Program, 'id' | 'createdAt'>
}

// Weekday numbers: 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    key: 'beginner-full-body',
    name: 'Beginner Full Body',
    level: 'Beginner',
    daysPerWeek: 3,
    description: 'Full-body sessions on alternating days. Builds the base for push-ups, pull-ups and squats.',
    build: () => ({
      name: 'Beginner Full Body',
      description: '3x per week, full body. Rest at least one day between sessions.',
      workouts: [
        workout('Full Body A', [1, 5], [
          ['Incline Push-up', 3, 8, 12, 90],
          ['Inverted Row', 3, 6, 10, 90],
          ['Bodyweight Squat', 3, 12, 20, 60],
          ['Glute Bridge', 3, 12, 15, 60],
          ['Plank', 3, 20, 45, 60],
        ]),
        workout('Full Body B', [3], [
          ['Knee Push-up', 3, 8, 12, 90],
          ['Negative Pull-up', 3, 3, 5, 120, '3-5 second lowering'],
          ['Reverse Lunge', 3, 8, 12, 60, 'Reps per leg'],
          ['Bench Dip', 3, 8, 12, 90],
          ['Dead Hang', 3, 20, 40, 60],
        ]),
      ],
    }),
  },
  {
    key: 'push-pull-legs',
    name: 'Push / Pull / Legs',
    level: 'Intermediate',
    daysPerWeek: 6,
    description: 'Classic split run twice a week. Great once you can do a few pull-ups and dips.',
    build: () => {
      const push = (): ExerciseSpec[] => [
        ['Parallel Bar Dip', 4, 6, 10, 120],
        ['Pike Push-up', 3, 6, 10, 120],
        ['Diamond Push-up', 3, 8, 15, 90],
        ['Pseudo Planche Push-up', 3, 6, 10, 90],
        ['Hollow Body Hold', 3, 20, 40, 60],
      ]
      const pull = (): ExerciseSpec[] => [
        ['Pull-up', 4, 5, 8, 150],
        ['Chin-up', 3, 6, 10, 120],
        ['Inverted Row', 3, 10, 15, 90],
        ['Hanging Leg Raise', 3, 8, 12, 90],
      ]
      const legs = (): ExerciseSpec[] => [
        ['Bulgarian Split Squat', 4, 8, 12, 90, 'Reps per leg'],
        ['Nordic Curl', 3, 3, 6, 120],
        ['Single-leg Glute Bridge', 3, 10, 15, 60, 'Reps per leg'],
        ['Single-leg Calf Raise', 3, 12, 20, 60],
        ['Side Plank', 2, 30, 45, 45, 'Each side'],
      ]
      return {
        name: 'Push / Pull / Legs',
        description: 'Six days per week, Sunday off.',
        workouts: [
          workout('Push', [1, 4], push()),
          workout('Pull', [2, 5], pull()),
          workout('Legs', [3, 6], legs()),
        ],
      }
    },
  },
  {
    key: 'upper-lower',
    name: 'Upper / Lower',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'Four days, with a strength day and a volume day for each half.',
    build: () => ({
      name: 'Upper / Lower',
      description: '4x per week. Strength days use lower reps; add weight when you top the range.',
      workouts: [
        workout('Upper Strength', [1], [
          ['Pull-up', 5, 3, 5, 180, 'Add weight once 5x5 is easy'],
          ['Parallel Bar Dip', 5, 3, 5, 180],
          ['Elevated Pike Push-up', 3, 5, 8, 120],
          ['L-sit', 3, 10, 20, 90],
        ]),
        workout('Lower Strength', [2], [
          ['Shrimp Squat', 4, 4, 6, 150, 'Reps per leg'],
          ['Nordic Curl', 4, 3, 5, 150],
          ['Jump Squat', 3, 5, 8, 90],
          ['Hanging Leg Raise', 3, 6, 10, 90],
        ]),
        workout('Upper Volume', [4], [
          ['Chin-up', 4, 8, 12, 90],
          ['Push-up', 4, 15, 25, 90],
          ['Inverted Row', 3, 12, 15, 60],
          ['Diamond Push-up', 3, 10, 15, 60],
          ['Hollow Body Hold', 3, 30, 45, 60],
        ]),
        workout('Lower Volume', [5], [
          ['Bulgarian Split Squat', 4, 10, 15, 90, 'Reps per leg'],
          ['Single-leg Glute Bridge', 3, 12, 15, 60, 'Reps per leg'],
          ['Single-leg Calf Raise', 3, 15, 25, 45],
          ['Deep Squat Hold', 2, 45, 60, 30],
        ]),
      ],
    }),
  },
  {
    key: 'skills-strength',
    name: 'Skills & Strength',
    level: 'Advanced',
    daysPerWeek: 4,
    description: 'Static-skill work (handstand, planche, front lever) paired with weighted basics.',
    build: () => ({
      name: 'Skills & Strength',
      description: 'Practice skills first while fresh, then strength work.',
      workouts: [
        workout('Push + Planche', [1, 4], [
          ['Freestanding Handstand', 5, 15, 30, 90],
          ['Tuck Planche', 5, 8, 15, 120],
          ['Ring Dip', 4, 5, 8, 150],
          ['Wall Handstand Push-up', 3, 3, 6, 150],
          ['Archer Push-up', 3, 5, 8, 90, 'Reps per side'],
        ]),
        workout('Pull + Front Lever', [2, 5], [
          ['Tuck Front Lever', 5, 8, 15, 120],
          ['Muscle-up', 4, 2, 5, 180],
          ['Pull-up', 4, 5, 8, 150, 'Weighted'],
          ['Archer Pull-up', 3, 3, 5, 150, 'Reps per side'],
          ['Toes to Bar', 3, 8, 12, 90],
        ]),
      ],
    }),
  },
]

export function blankProgram(): Omit<Program, 'id' | 'createdAt'> {
  return {
    name: 'My Program',
    description: '',
    workouts: [{ id: makeId(), name: 'Workout A', weekdays: [], exercises: [] }],
  }
}
