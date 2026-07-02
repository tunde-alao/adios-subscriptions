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
import { useAuth } from "./AuthProvider";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

type TasksContextType = {
  items: Task[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTask: (task: Task) => void;
  toggleTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [items, setItems] = useState<Task[]>(() => {
    return Cache.get<Task[]>(CACHE_KEYS.TASKS) ?? [];
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await api.api.tasks.$get();
      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }
      const data = await response.json();
      setItems(data.items);
      Cache.set(CACHE_KEYS.TASKS, data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const addTask = useCallback((task: Task) => {
    setItems((prev) => {
      const next = [task, ...prev.filter((t) => t.id !== task.id)];
      Cache.set(CACHE_KEYS.TASKS, next);
      return next;
    });
  }, []);

  const toggleTask = useCallback(async (taskId: string) => {
    const target = items.find((t) => t.id === taskId);
    if (!target) return;

    const optimisticCompleted = !target.completed;
    setItems((prev) => {
      const next = prev.map((t) =>
        t.id === taskId ? { ...t, completed: optimisticCompleted } : t
      );
      Cache.set(CACHE_KEYS.TASKS, next);
      return next;
    });

    try {
      const response = await api.api.tasks[":id"].$patch({
        param: { id: taskId },
        json: { completed: optimisticCompleted },
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      setItems((prev) => {
        const next = prev.map((t) =>
          t.id === taskId ? { ...t, completed: target.completed } : t
        );
        Cache.set(CACHE_KEYS.TASKS, next);
        return next;
      });
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }, [items]);

  const removeTask = useCallback(async (taskId: string) => {
    const previous = items;
    setItems((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      Cache.set(CACHE_KEYS.TASKS, next);
      return next;
    });

    try {
      const response = await api.api.tasks[":id"].$delete({
        param: { id: taskId },
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      setItems(previous);
      Cache.set(CACHE_KEYS.TASKS, previous);
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }, [items]);

  useEffect(() => {
    if (status !== "authenticated") {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [status, refresh]);

  const value: TasksContextType = {
    items,
    loading,
    refreshing,
    error,
    refresh,
    addTask,
    toggleTask,
    removeTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
