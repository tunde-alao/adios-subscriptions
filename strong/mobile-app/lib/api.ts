import { hc } from "hono/client";
import type { AppType } from "@backend/app";
import { supabase } from "./supabase";

// Initialize the typed Hono RPC client
export const api = hc<AppType>(process.env.EXPO_PUBLIC_API_URL ?? "", {
  async fetch(input: RequestInfo | URL, init?: RequestInit) {
    // Get the current session token to include in requests
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers(init?.headers);
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  },
});
