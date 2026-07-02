import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { Cache, CACHE_KEYS } from "@/lib/cache";
import type { CreateWorkoutInput, Workout } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type WorkoutsContextType = {
  items: Workout[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createWorkout: (input: CreateWorkoutInput) => Promise<Workout>;
  removeWorkout: (workoutId: string) => Promise<void>;
};

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(
  undefined
);

export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (context === undefined) {
    throw new Error("useWorkouts must be used within a WorkoutsProvider");
  }
  return context;
}

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [items, setItems] = useState<Workout[]>(
    () => Cache.get<Workout[]>(CACHE_KEYS.WORKOUTS) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await api.api.workouts.$get();
      if (!response.ok) {
        throw new Error("Failed to load workouts");
      }
      const data = await response.json();
      setItems(data.items as Workout[]);
      Cache.set(CACHE_KEYS.WORKOUTS, data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workouts");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const createWorkout = useCallback(async (input: CreateWorkoutInput) => {
    const response = await api.api.workouts.$post({ json: input });
    if (!response.ok) {
      throw new Error(`Failed to save workout (${response.status})`);
    }
    const created = (await response.json()) as Workout;
    setItems((prev) => {
      const next = [created, ...prev.filter((w) => w.id !== created.id)];
      Cache.set(CACHE_KEYS.WORKOUTS, next);
      return next;
    });
    return created;
  }, []);

  const removeWorkout = useCallback(
    async (workoutId: string) => {
      const previous = items;
      setItems((prev) => {
        const next = prev.filter((w) => w.id !== workoutId);
        Cache.set(CACHE_KEYS.WORKOUTS, next);
        return next;
      });
      try {
        const response = await api.api.workouts[":id"].$delete({
          param: { id: workoutId },
        });
        if (!response.ok) {
          throw new Error("Failed to delete workout");
        }
      } catch (err) {
        setItems(previous);
        Cache.set(CACHE_KEYS.WORKOUTS, previous);
        setError(
          err instanceof Error ? err.message : "Failed to delete workout"
        );
      }
    },
    [items]
  );

  useEffect(() => {
    if (status !== "authenticated") {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [status, refresh]);

  const value: WorkoutsContextType = {
    items,
    loading,
    refreshing,
    error,
    refresh,
    createWorkout,
    removeWorkout,
  };

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}
