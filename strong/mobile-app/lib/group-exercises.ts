import type { Exercise } from "@/data/exercises";

export interface ExerciseSection {
  title: string;
  data: Exercise[];
}

/**
 * Filters the catalog by search text / body part / category, then groups the
 * result into alphabetically-titled sections for a SectionList.
 */
export function groupExercises(
  exercises: Exercise[],
  {
    search,
    bodyPart,
    category,
  }: { search?: string; bodyPart?: string | null; category?: string | null } = {}
): ExerciseSection[] {
  const query = search?.trim().toLowerCase() ?? "";

  const filtered = exercises.filter((exercise) => {
    if (query && !exercise.name.toLowerCase().includes(query)) return false;
    if (bodyPart && exercise.bodyPart !== bodyPart) return false;
    if (category && exercise.category !== category) return false;
    return true;
  });

  const map = new Map<string, Exercise[]>();
  for (const exercise of filtered) {
    const letter = exercise.name.charAt(0).toUpperCase();
    const bucket = map.get(letter);
    if (bucket) {
      bucket.push(exercise);
    } else {
      map.set(letter, [exercise]);
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}
