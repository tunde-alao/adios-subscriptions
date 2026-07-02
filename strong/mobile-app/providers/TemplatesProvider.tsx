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
import type { CreateTemplateInput, Template } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type TemplatesContextType = {
  items: Template[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTemplate: (input: CreateTemplateInput) => Promise<Template>;
  removeTemplate: (templateId: string) => Promise<void>;
};

const TemplatesContext = createContext<TemplatesContextType | undefined>(
  undefined
);

export function useTemplates() {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplatesProvider");
  }
  return context;
}

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [items, setItems] = useState<Template[]>(
    () => Cache.get<Template[]>(CACHE_KEYS.TEMPLATES) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await api.api.templates.$get();
      if (!response.ok) {
        throw new Error("Failed to load templates");
      }
      const data = await response.json();
      setItems(data.items as Template[]);
      Cache.set(CACHE_KEYS.TEMPLATES, data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (input: CreateTemplateInput) => {
    const response = await api.api.templates.$post({ json: input });
    if (!response.ok) {
      throw new Error(`Failed to create template (${response.status})`);
    }
    const created = (await response.json()) as Template;
    setItems((prev) => {
      const next = [created, ...prev.filter((t) => t.id !== created.id)];
      Cache.set(CACHE_KEYS.TEMPLATES, next);
      return next;
    });
    return created;
  }, []);

  const removeTemplate = useCallback(
    async (templateId: string) => {
      const previous = items;
      setItems((prev) => {
        const next = prev.filter((t) => t.id !== templateId);
        Cache.set(CACHE_KEYS.TEMPLATES, next);
        return next;
      });
      try {
        const response = await api.api.templates[":id"].$delete({
          param: { id: templateId },
        });
        if (!response.ok) {
          throw new Error("Failed to delete template");
        }
      } catch (err) {
        setItems(previous);
        Cache.set(CACHE_KEYS.TEMPLATES, previous);
        setError(
          err instanceof Error ? err.message : "Failed to delete template"
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

  const value: TemplatesContextType = {
    items,
    loading,
    refreshing,
    error,
    refresh,
    createTemplate,
    removeTemplate,
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
}
