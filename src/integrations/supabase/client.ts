export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: import.meta.env.VITE_SUPABASE_URL ?? "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  };
}

export function isSupabaseConfigured() {
  const env = getSupabaseEnv();
  return Boolean(env.url && env.anonKey);
}
