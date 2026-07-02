import type { CreateTemplateInput } from "@/lib/types";
import { EXERCISES_BY_ID } from "./exercises";

export interface ExampleTemplate {
  id: string;
  name: string;
  exerciseIds: string[];
}

/**
 * Read-only starter templates shown in the "Example Templates" section of the
 * Start Workout tab. Users can copy them into their own templates.
 */
export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: "example-legs",
    name: "Legs",
    exerciseIds: ["squat-barbell", "leg-press-machine", "leg-extension-machine", "seated-leg-curl-machine", "calf-raise-machine"],
  },
  {
    id: "example-chest-triceps",
    name: "Chest and Triceps",
    exerciseIds: ["bench-press-barbell", "incline-bench-press-dumbbell", "chest-press-machine", "tricep-pushdown-cable", "overhead-tricep-extension-dumbbell"],
  },
  {
    id: "example-back-biceps",
    name: "Back and Biceps",
    exerciseIds: ["deadlift-barbell", "lat-pulldown-cable", "seated-row-cable", "bicep-curl-dumbbell", "hammer-curl-dumbbell"],
  },
  {
    id: "example-chest-back",
    name: "Chest and Back",
    exerciseIds: ["bench-press-barbell", "bent-over-row-barbell", "incline-bench-press-barbell", "seated-row-machine"],
  },
  {
    id: "example-shoulders",
    name: "Shoulders",
    exerciseIds: ["overhead-press-barbell", "lateral-raise-dumbbell", "rear-delt-fly-machine", "face-pull", "shrug-dumbbell"],
  },
];

export function exampleTemplateDescription(template: ExampleTemplate): string {
  return template.exerciseIds
    .map((id) => EXERCISES_BY_ID[id]?.name)
    .filter(Boolean)
    .join(", ");
}

export function exampleTemplateToInput(
  template: ExampleTemplate
): CreateTemplateInput {
  return {
    name: template.name,
    exercises: template.exerciseIds
      .map((id) => EXERCISES_BY_ID[id])
      .filter((exercise): exercise is NonNullable<typeof exercise> => !!exercise)
      .map((exercise) => ({
        exerciseId: exercise.id,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        restSeconds: 0,
        sets: [
          { weight: 0, reps: 0 },
          { weight: 0, reps: 0 },
          { weight: 0, reps: 0 },
        ],
      })),
  };
}
