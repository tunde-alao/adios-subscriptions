import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as Crypto from "expo-crypto";
import type { CreateWorkoutInput, Template } from "@/lib/types";
import type {
  DraftExercise,
  DraftExerciseSeed,
  DraftSet,
} from "@/providers/TemplateDraftProvider";

interface ActiveSession {
  name: string;
  templateId: string | null;
  startedAt: string;
  exercises: DraftExercise[];
}

type WorkoutSessionContextType = {
  session: ActiveSession | null;
  startFromTemplate: (template: Template) => void;
  startEmpty: () => void;
  addExercises: (exercises: DraftExerciseSeed[]) => void;
  addSet: (key: string) => void;
  removeExercise: (key: string) => void;
  updateSet: (key: string, index: number, patch: Partial<DraftSet>) => void;
  toggleComplete: (key: string, index: number) => void;
  /** Whether the session has logged (reps > 0) sets that aren't marked complete. */
  hasUnfinishedSets: boolean;
  /**
   * Serializes the current session into the payload the API expects. Only
   * completed sets are persisted. When `completeUnfinished` is set, every valid
   * set (reps > 0) is treated as complete.
   */
  buildPayload: (options?: {
    completeUnfinished?: boolean;
  }) => CreateWorkoutInput | null;
  finish: () => void;
  discard: () => void;
};

const WorkoutSessionContext = createContext<
  WorkoutSessionContextType | undefined
>(undefined);

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutSession must be used within a WorkoutSessionProvider"
    );
  }
  return context;
}

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null);

  const startFromTemplate = useCallback((template: Template) => {
    setSession({
      name: template.name,
      templateId: template.id,
      startedAt: new Date().toISOString(),
      exercises: template.exercises.map((exercise) => ({
        key: Crypto.randomUUID(),
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        restSeconds: exercise.restSeconds,
        sets: exercise.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          completed: false,
        })),
      })),
    });
  }, []);

  const startEmpty = useCallback(() => {
    setSession({
      name: "Workout",
      templateId: null,
      startedAt: new Date().toISOString(),
      exercises: [],
    });
  }, []);

  const updateExercises = useCallback(
    (updater: (exercises: DraftExercise[]) => DraftExercise[]) => {
      setSession((prev) =>
        prev ? { ...prev, exercises: updater(prev.exercises) } : prev
      );
    },
    []
  );

  const addExercises = useCallback(
    (toAdd: DraftExerciseSeed[]) => {
      updateExercises((exercises) => {
        const existingIds = new Set(exercises.map((e) => e.exerciseId));
        const next = toAdd
          .filter((exercise) => !existingIds.has(exercise.id))
          .map((exercise) => ({
            key: Crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            restSeconds: 120,
            sets: [{ weight: 0, reps: 10, completed: false }],
          }));
        return [...exercises, ...next];
      });
    },
    [updateExercises]
  );

  const addSet = useCallback(
    (key: string) => {
      updateExercises((exercises) =>
        exercises.map((exercise) => {
          if (exercise.key !== key) return exercise;
          const last = exercise.sets[exercise.sets.length - 1];
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              last
                ? { weight: last.weight, reps: last.reps, completed: false }
                : { weight: 0, reps: 10, completed: false },
            ],
          };
        })
      );
    },
    [updateExercises]
  );

  const removeExercise = useCallback(
    (key: string) => {
      updateExercises((exercises) => exercises.filter((e) => e.key !== key));
    },
    [updateExercises]
  );

  const updateSet = useCallback(
    (key: string, index: number, patch: Partial<DraftSet>) => {
      updateExercises((exercises) =>
        exercises.map((exercise) => {
          if (exercise.key !== key) return exercise;
          return {
            ...exercise,
            sets: exercise.sets.map((set, i) =>
              i === index ? { ...set, ...patch } : set
            ),
          };
        })
      );
    },
    [updateExercises]
  );

  const toggleComplete = useCallback(
    (key: string, index: number) => {
      updateExercises((exercises) =>
        exercises.map((exercise) => {
          if (exercise.key !== key) return exercise;
          return {
            ...exercise,
            sets: exercise.sets.map((set, i) =>
              i === index ? { ...set, completed: !set.completed } : set
            ),
          };
        })
      );
    },
    [updateExercises]
  );

  const hasUnfinishedSets = useMemo(() => {
    if (!session) return false;
    return session.exercises.some((exercise) =>
      exercise.sets.some((set) => set.reps > 0 && !set.completed)
    );
  }, [session]);

  const buildPayload = useCallback(
    (options?: { completeUnfinished?: boolean }): CreateWorkoutInput | null => {
      if (!session) return null;

      const completeUnfinished = options?.completeUnfinished ?? false;
      const completedAt = new Date();
      const startedAt = new Date(session.startedAt);
      const durationSeconds = Math.max(
        0,
        Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
      );

      let totalVolume = 0;
      const exercises = session.exercises
        .map((exercise) => {
          const sets = exercise.sets
            .filter(
              (set) =>
                set.completed || (completeUnfinished && set.reps > 0)
            )
            .map((set) => {
              totalVolume += set.weight * set.reps;
              return { weight: set.weight, reps: set.reps, completed: true };
            });
          return {
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets,
          };
        })
        .filter((exercise) => exercise.sets.length > 0);

      return {
        name: session.name,
        templateId: session.templateId,
        startedAt: session.startedAt,
        completedAt: completedAt.toISOString(),
        durationSeconds,
        totalVolume,
        prCount: 0,
        exercises,
      };
    },
    [session]
  );

  const finish = useCallback(() => {
    setSession(null);
  }, []);

  const discard = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<WorkoutSessionContextType>(
    () => ({
      session,
      startFromTemplate,
      startEmpty,
      addExercises,
      addSet,
      removeExercise,
      updateSet,
      toggleComplete,
      hasUnfinishedSets,
      buildPayload,
      finish,
      discard,
    }),
    [
      session,
      startFromTemplate,
      startEmpty,
      addExercises,
      addSet,
      removeExercise,
      updateSet,
      toggleComplete,
      hasUnfinishedSets,
      buildPayload,
      finish,
      discard,
    ]
  );

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}
