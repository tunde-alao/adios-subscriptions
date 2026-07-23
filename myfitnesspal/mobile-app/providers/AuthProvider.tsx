import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Cache, CACHE_KEYS } from "@/lib/cache";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  isOnboardingComplete: boolean;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
  session: Session | null;
  status: AuthStatus;
  user: UserProfile | null;
  userLoading: boolean;
  userError: string | null;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    return Cache.get<UserProfile>(CACHE_KEYS.USER_PROFILE);
  });
  const [userLoading, setUserLoading] = useState(
    () => !Cache.get<UserProfile>(CACHE_KEYS.USER_PROFILE)
  );
  const [userError, setUserError] = useState<string | null>(null);

  const status: AuthStatus = userLoading
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const fetchUser = useCallback(async () => {
    try {
      setUserError(null);
      const response = await api.api.me.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser(data);
      Cache.set(CACHE_KEYS.USER_PROFILE, data);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setUserLoading(false);
    }
  }, []);

  const handleSession = useCallback(
    async (newSession: Session | null) => {
      setSession(newSession);

      if (newSession) {
        const hasCachedUser = !!Cache.get<UserProfile>(CACHE_KEYS.USER_PROFILE);
        if (!hasCachedUser) {
          setUserLoading(true);
        }
        try {
          await api.api.signin.$post();
        } catch (err) {
          console.error("Failed to call post-signin:", err);
        }
        fetchUser();
      } else {
        setUser(null);
        setUserLoading(false);
        setUserError(null);
        Cache.clearAll();
      }
    },
    [fetchUser]
  );

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value: AuthContextType = {
    session,
    status,
    user,
    userLoading,
    userError,
    signOut,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
