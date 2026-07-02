import type { User } from "@supabase/supabase-js";

export type AppEnv = {
  Variables: {
    user: User;
  };
};
