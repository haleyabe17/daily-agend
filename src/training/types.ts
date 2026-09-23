export type WeightUnit = 'kg' | 'lb'

/** How an exercise is measured: counted reps, or a timed hold in seconds. */
export type TrackingMode = 'reps' | 'time'

export type MuscleGroup = 'push' | 'pull' | 'legs' | 'core' | 'skill' | 'mobility'

export interface LibraryExercise {
  id: string
  name: string
  group: MuscleGroup
  mode: TrackingMode
  /** Name of the easier variation, if any. */
  easier?: string
  /** Name of the harder variation, if any. */
  harder?: string
  cue?: string
}

/** One exercise as prescribed inside a workout. */
export interface PlannedExercise {
  id: string
  name: string
  group: MuscleGroup
  mode: TrackingMode
  sets: number
  /** Lower end of the target range (reps, or seconds for holds). */
  targetMin: number
  /** Upper end of the target range. When hit on every set, it's time to progress. */
  targetMax: number
  /** Added load (weight vest, belt, dumbbell). 0 = bodyweight. */
  weight: number
  restSeconds: number
  /** e.g. "3-1-1-0" (eccentric-pause-concentric-pause). */
  tempo: string
  notes: string
}

export interface WorkoutDay {
  id: string
  name: string
  /** 0 = Sunday … 6 = Saturday. Empty means unscheduled. */
  weekdays: number[]
  exercises: PlannedExercise[]
}

export interface Program {
  id: string
  name: string
  description: string
  workouts: WorkoutDay[]
  createdAt: number
}

export interface LoggedSet {
  /** Reps done, or seconds held. */
  value: number
  weight: number
  done: boolean
}

export interface LoggedExercise {
  plannedId: string
  name: string
  mode: TrackingMode
  targetMin: number
  targetMax: number
  sets: LoggedSet[]
  notes: string
}

export interface WorkoutSession {
  id: string
  programId: string
  workoutId: string
  workoutName: string
  /** YYYY-MM-DD */
  date: string
  startedAt: number
  finishedAt: number | null
  exercises: LoggedExercise[]
  /** Rate of perceived exertion for the whole session, 1-10. */
  rpe: number | null
  notes: string
}

export interface TrainingData {
  programs: Program[]
  activeProgramId: string | null
  sessions: WorkoutSession[]
  /** Session currently in progress, if any. */
  activeSession: WorkoutSession | null
  unit: WeightUnit
}
