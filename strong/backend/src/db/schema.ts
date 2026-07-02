import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  isOnboardingComplete: boolean("is_onboarding_complete")
    .default(false)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Templates
//
// A template is a reusable workout plan (e.g. "Pull 1"). It has an ordered list
// of exercises, and each exercise has an ordered list of target sets.
//
// Exercises come from a static catalog on the client, so we reference them by a
// stable slug (`exerciseId`) and snapshot the display name so templates keep
// rendering even if the catalog changes.
// ---------------------------------------------------------------------------

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateExercises = pgTable("template_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  name: text("name").notNull(),
  bodyPart: text("body_part"),
  position: integer("position").notNull().default(0),
  restSeconds: integer("rest_seconds").notNull().default(0),
});

export const templateSets = pgTable("template_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateExerciseId: uuid("template_exercise_id")
    .notNull()
    .references(() => templateExercises.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  weight: real("weight").notNull().default(0),
  reps: integer("reps").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Workout history
//
// A workout is a logged session. Mirrors the template structure but stores the
// actual performed values plus summary stats used by the History/Profile tabs.
// ---------------------------------------------------------------------------

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => templates.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  totalVolume: real("total_volume").notNull().default(0),
  prCount: integer("pr_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  name: text("name").notNull(),
  bodyPart: text("body_part"),
  position: integer("position").notNull().default(0),
});

export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutExerciseId: uuid("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  weight: real("weight").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  completed: boolean("completed").notNull().default(true),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const templatesRelations = relations(templates, ({ many }) => ({
  exercises: many(templateExercises),
}));

export const templateExercisesRelations = relations(
  templateExercises,
  ({ one, many }) => ({
    template: one(templates, {
      fields: [templateExercises.templateId],
      references: [templates.id],
    }),
    sets: many(templateSets),
  })
);

export const templateSetsRelations = relations(templateSets, ({ one }) => ({
  exercise: one(templateExercises, {
    fields: [templateSets.templateExerciseId],
    references: [templateExercises.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    sets: many(workoutSets),
  })
);

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  exercise: one(workoutExercises, {
    fields: [workoutSets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
