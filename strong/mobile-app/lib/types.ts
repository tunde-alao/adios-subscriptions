// Shared domain types used across providers, screens and components.

export interface TemplateSet {
  id?: string;
  weight: number;
  reps: number;
}

export interface TemplateExercise {
  id?: string;
  exerciseId: string;
  name: string;
  bodyPart?: string | null;
  restSeconds: number;
  sets: TemplateSet[];
}

export interface Template {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  exercises: TemplateExercise[];
}

export interface CreateTemplateInput {
  name: string;
  exercises: {
    exerciseId: string;
    name: string;
    bodyPart?: string;
    restSeconds: number;
    sets: { weight: number; reps: number }[];
  }[];
}

export interface WorkoutBestSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  bodyPart?: string | null;
  setCount: number;
  bestSet: WorkoutBestSet | null;
  sets: {
    id: string;
    weight: number;
    reps: number;
    completed: boolean;
  }[];
}

export interface Workout {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  totalVolume: number;
  prCount: number;
  createdAt: string;
  exercises: WorkoutExercise[];
}

export interface CreateWorkoutInput {
  name: string;
  templateId?: string | null;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  totalVolume: number;
  prCount: number;
  exercises: {
    exerciseId: string;
    name: string;
    bodyPart?: string | null;
    sets: { weight: number; reps: number; completed: boolean }[];
  }[];
}
