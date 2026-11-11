export interface AdvancedTechnique {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  stepByStep: string[];
  restInterval: string;
  scientificPurpose: string;
  exampleFromWorkout: string;
  safetyTips: string;
  videoUrl?: string;
}

export interface ExerciseVideoItem {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl: string;
  youtubeId?: string;
  notes?: string;
}

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  advancedTechniqueId?: string;
  advancedTechniqueNotes?: string;
  order: number;
  defaultRestSeconds?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;
  name: string;
  targetMuscles: string;
  dayOrder: number;
  restIntervalText: string;
  restIntervalSeconds: number;
  exercises: RoutineExercise[];
  aerobics?: {
    postWorkoutMin: number;
    restDayMin: number;
  };
}

export interface WorkoutWeek {
  id: string;
  number: number;
  name: string;
  description?: string;
  createdAt: string;
  routines: Routine[];
}

export interface SetLog {
  setNumber: number;
  weightKg: number;
  repsCompleted: number;
  completed: boolean;
  techniqueApplied?: boolean;
}

export interface ExerciseLogEntry {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  advancedTechniqueId?: string;
  advancedTechniqueNotes?: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  weekId?: string;
  weekName?: string;
  routineId: string;
  routineCode: string;
  routineName: string;
  targetMuscles: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  entries: ExerciseLogEntry[];
  totalTonnageKg: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface ExerciseProgressionPoint {
  date: string;
  formattedDate: string;
  maxWeightKg: number;
  avgWeightKg: number;
  totalVolumeKg: number;
  setsCount: number;
  repsSummary: string;
  technique?: string;
}

export interface ActiveWorkoutDraft {
  routineId: string;
  weekId?: string;
  sessionStartTime: string;
  elapsedSeconds?: number;
  isTimerRunning?: boolean;
  exerciseLogs: Record<string, SetLog[]>;
  exerciseNotes: Record<string, string>;
  updatedAt: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  color?: string;
  avatarInitial?: string;
  createdAt: string;
}
