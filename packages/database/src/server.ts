import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

// Interface minimale attendue de next/headers cookies() ou du middleware — évite
// de dépendre de "next" directement dans ce package partagé.
export interface CookieAdapter {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
}

export function createServerClient(cookies: CookieAdapter) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
}
