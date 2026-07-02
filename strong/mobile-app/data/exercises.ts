/**
 * Static exercise catalog.
 *
 * This is the single source of truth for the exercises shown in the Exercises
 * tab and available when building templates / logging workouts. Each exercise
 * has a stable `id` (slug) that templates and workouts reference.
 */

export type BodyPart =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Legs"
  | "Arms"
  | "Core"
  | "Cardio"
  | "Full Body"
  | "Olympic";

export type ExerciseCategory =
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Cardio"
  | "Reps Only"
  | "Duration";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  category: ExerciseCategory;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function make(
  name: string,
  bodyPart: BodyPart,
  category: ExerciseCategory
): Exercise {
  return { id: slugify(name), name, bodyPart, category };
}

const RAW_EXERCISES: Exercise[] = [
  // Core
  make("Ab Wheel", "Core", "Bodyweight"),
  make("Cable Crunch", "Core", "Cable"),
  make("Crunch", "Core", "Bodyweight"),
  make("Hanging Leg Raise", "Core", "Bodyweight"),
  make("Plank", "Core", "Duration"),
  make("Russian Twist", "Core", "Bodyweight"),
  make("Sit Up", "Core", "Bodyweight"),
  make("Ball Slams", "Core", "Reps Only"),

  // Cardio
  make("Aerobics", "Cardio", "Cardio"),
  make("Cycling", "Cardio", "Cardio"),
  make("Elliptical Trainer", "Cardio", "Cardio"),
  make("Rowing Machine", "Cardio", "Cardio"),
  make("Running", "Cardio", "Cardio"),
  make("Stair Machine", "Cardio", "Cardio"),
  make("Walking", "Cardio", "Cardio"),

  // Shoulders
  make("Arnold Press (Dumbbell)", "Shoulders", "Dumbbell"),
  make("Face Pull", "Shoulders", "Cable"),
  make("Front Raise (Dumbbell)", "Shoulders", "Dumbbell"),
  make("Lateral Raise (Cable)", "Shoulders", "Cable"),
  make("Lateral Raise (Dumbbell)", "Shoulders", "Dumbbell"),
  make("Overhead Press (Barbell)", "Shoulders", "Barbell"),
  make("Rear Delt Fly (Machine)", "Shoulders", "Machine"),
  make("Shoulder Press (Machine)", "Shoulders", "Machine"),
  make("Shrug (Dumbbell)", "Shoulders", "Dumbbell"),
  make("Shrug (Smith Machine)", "Shoulders", "Machine"),
  make("Upright Row (Barbell)", "Shoulders", "Barbell"),

  // Chest
  make("Around the World", "Chest", "Dumbbell"),
  make("Bench Press (Barbell)", "Chest", "Barbell"),
  make("Bench Press (Dumbbell)", "Chest", "Dumbbell"),
  make("Cable Fly Crossovers", "Chest", "Cable"),
  make("Chest Dip", "Chest", "Bodyweight"),
  make("Chest Press (Machine)", "Chest", "Machine"),
  make("Incline Bench Press (Barbell)", "Chest", "Barbell"),
  make("Incline Bench Press (Dumbbell)", "Chest", "Dumbbell"),
  make("Incline Bench Press (Smith Machine)", "Chest", "Machine"),
  make("Push Up", "Chest", "Bodyweight"),

  // Back
  make("Back Extension", "Back", "Bodyweight"),
  make("Back Extension (Machine)", "Back", "Machine"),
  make("Bent Over Row (Barbell)", "Back", "Barbell"),
  make("Deadlift (Barbell)", "Back", "Barbell"),
  make("Lat Pulldown (Cable)", "Back", "Cable"),
  make("Lat Pulldown Close Grip (Cable)", "Back", "Cable"),
  make("Pull Up", "Back", "Bodyweight"),
  make("Seated Row (Cable)", "Back", "Cable"),
  make("Seated Row (Machine)", "Back", "Machine"),
  make("T Bar Row", "Back", "Barbell"),

  // Arms
  make("Bicep Curl (Barbell)", "Arms", "Barbell"),
  make("Bicep Curl (Dumbbell)", "Arms", "Dumbbell"),
  make("Bicep Curl Seated (Dumbbell)", "Arms", "Dumbbell"),
  make("Hammer Curl (Dumbbell)", "Arms", "Dumbbell"),
  make("Preacher Curl (Machine)", "Arms", "Machine"),
  make("Tricep Extension (Cable)", "Arms", "Cable"),
  make("Tricep Pushdown (Cable)", "Arms", "Cable"),
  make("Skullcrusher (Barbell)", "Arms", "Barbell"),
  make("Overhead Tricep Extension (Dumbbell)", "Arms", "Dumbbell"),

  // Legs
  make("Bulgarian Split Squat", "Legs", "Dumbbell"),
  make("Calf Raise (Machine)", "Legs", "Machine"),
  make("Front Squat (Barbell)", "Legs", "Barbell"),
  make("Hip Thrust (Barbell)", "Legs", "Barbell"),
  make("Leg Extension (Machine)", "Legs", "Machine"),
  make("Leg Press (Machine)", "Legs", "Machine"),
  make("Lunge (Dumbbell)", "Legs", "Dumbbell"),
  make("Romanian Deadlift (Barbell)", "Legs", "Barbell"),
  make("Romanian Deadlift (Smith Machine)", "Legs", "Machine"),
  make("Seated Leg Curl (Machine)", "Legs", "Machine"),
  make("Squat (Barbell)", "Legs", "Barbell"),
  make("Standing Calf Raise (Barbell)", "Legs", "Barbell"),

  // Olympic / Full Body
  make("Clean and Jerk (Barbell)", "Olympic", "Barbell"),
  make("Snatch (Barbell)", "Olympic", "Barbell"),
  make("Burpee", "Full Body", "Bodyweight"),
  make("Kettlebell Swing", "Full Body", "Reps Only"),
  make("Thruster (Barbell)", "Full Body", "Barbell"),
];

export const EXERCISES: Exercise[] = [...RAW_EXERCISES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((exercise) => [exercise.id, exercise])
);

export const BODY_PARTS: BodyPart[] = [
  "Arms",
  "Back",
  "Cardio",
  "Chest",
  "Core",
  "Full Body",
  "Legs",
  "Olympic",
  "Shoulders",
];

export const CATEGORIES: ExerciseCategory[] = [
  "Barbell",
  "Bodyweight",
  "Cable",
  "Cardio",
  "Dumbbell",
  "Duration",
  "Machine",
  "Reps Only",
];
