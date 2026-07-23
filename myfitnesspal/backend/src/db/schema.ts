import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  numeric,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  isOnboardingComplete: boolean("is_onboarding_complete")
    .default(false)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type MealType = (typeof meals)[number];

export const foodEntries = pgTable("food_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"),
  meal: text("meal", { enum: meals }).notNull(),
  servingLabel: text("serving_label").notNull(),
  numberOfServings: numeric("number_of_servings", {
    precision: 10,
    scale: 3,
  })
    .default("1")
    .notNull(),
  caloriesPerServing: numeric("calories_per_serving", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  carbsPerServing: numeric("carbs_per_serving", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  fatPerServing: numeric("fat_per_serving", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  proteinPerServing: numeric("protein_per_serving", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  loggedDate: date("logged_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
