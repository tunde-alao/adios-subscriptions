import type { Workout } from "./types";

export interface PreviousSet {
  weight: number;
  reps: number;
}

/**
 * Returns the sets performed for an exercise in the most recent workout that
 * contains it. Sets are indexed by position so callers can align them with the
 * current session's sets. Returns an empty array if the exercise has never been
 * logged before.
 */
export function getPreviousSets(
  workouts: Workout[],
  exerciseId: string
): PreviousSet[] {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  for (const workout of sorted) {
    const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      return exercise.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
      }));
    }
  }

  return [];
}

/** e.g. "80 kg × 10", or "—" when there is no previous set to show. */
export function formatPreviousSet(previous?: PreviousSet | null): string {
  if (!previous) return "—";
  return `${previous.weight} kg × ${previous.reps}`;
}
