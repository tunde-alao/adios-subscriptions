import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as Crypto from "expo-crypto";

/** Minimal shape needed to seed a draft exercise (from the catalog or a saved template). */
export interface DraftExerciseSeed {
  id: string;
  name: string;
  bodyPart?: string | null;
}

export interface DraftSet {
  weight: number;
  reps: number;
  /** Only meaningful during an active workout; ignored while editing templates. */
  completed?: boolean;
}

export interface DraftExercise {
  key: string;
  exerciseId: string;
  name: string;
  bodyPart?: string | null;
  restSeconds: number;
  sets: DraftSet[];
}

type TemplateDraftContextType = {
  name: string;
  exercises: DraftExercise[];
  setName: (name: string) => void;
  reset: () => void;
  addExercises: (exercises: DraftExerciseSeed[]) => void;
  removeExercise: (key: string) => void;
  addSet: (key: string) => void;
  removeSet: (key: string, index: number) => void;
  updateSet: (key: string, index: number, patch: Partial<DraftSet>) => void;
  updateRest: (key: string, restSeconds: number) => void;
};

const TemplateDraftContext = createContext<
  TemplateDraftContextType | undefined
>(undefined);

export function useTemplateDraft() {
  const context = useContext(TemplateDraftContext);
  if (context === undefined) {
    throw new Error(
      "useTemplateDraft must be used within a TemplateDraftProvider"
    );
  }
  return context;
}

export function TemplateDraftProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);

  const reset = useCallback(() => {
    setName("");
    setExercises([]);
  }, []);

  const addExercises = useCallback((toAdd: DraftExerciseSeed[]) => {
    setExercises((prev) => {
      const existingIds = new Set(prev.map((e) => e.exerciseId));
      const next = toAdd
        .filter((exercise) => !existingIds.has(exercise.id))
        .map((exercise) => ({
          key: Crypto.randomUUID(),
          exerciseId: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          restSeconds: 120,
          sets: [
            { weight: 0, reps: 10 },
            { weight: 0, reps: 10 },
            { weight: 0, reps: 10 },
          ],
        }));
      return [...prev, ...next];
    });
  }, []);

  const removeExercise = useCallback((key: string) => {
    setExercises((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const addSet = useCallback((key: string) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.key !== key) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [...exercise.sets, last ? { ...last } : { weight: 0, reps: 10 }],
        };
      })
    );
  }, []);

  const removeSet = useCallback((key: string, index: number) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.key !== key) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.filter((_, i) => i !== index),
        };
      })
    );
  }, []);

  const updateSet = useCallback(
    (key: string, index: number, patch: Partial<DraftSet>) => {
      setExercises((prev) =>
        prev.map((exercise) => {
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
    []
  );

  const updateRest = useCallback((key: string, restSeconds: number) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.key === key ? { ...exercise, restSeconds } : exercise
      )
    );
  }, []);

  const value = useMemo<TemplateDraftContextType>(
    () => ({
      name,
      exercises,
      setName,
      reset,
      addExercises,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      updateRest,
    }),
    [
      name,
      exercises,
      reset,
      addExercises,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      updateRest,
    ]
  );

  return (
    <TemplateDraftContext.Provider value={value}>
      {children}
    </TemplateDraftContext.Provider>
  );
}
