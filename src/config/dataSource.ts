import { isSupabaseConfigured } from "../integrations/supabase/client";
import { LocalPortfolioRepository } from "../repositories/localPortfolioRepository";
import { PortfolioRepository } from "../repositories/portfolioRepository";
import { SupabasePortfolioRepository } from "../repositories/supabasePortfolioRepository";

export type DataProvider = "local" | "supabase";

export function getDataProvider(): DataProvider {
  const value = import.meta.env.VITE_APP_DATA_PROVIDER;
  return value === "supabase" ? "supabase" : "local";
}

export function createPortfolioRepository(): PortfolioRepository {
  const provider = getResolvedDataProvider();

  if (provider === "supabase") {
    return new SupabasePortfolioRepository();
  }

  return new LocalPortfolioRepository();
}

export function getResolvedDataProvider(): DataProvider {
  const provider = getDataProvider();

  if (provider === "supabase" && !isSupabaseConfigured()) {
    console.warn(
      "[My Portfolio OS] Supabase 설정이 없어 localStorage 저장소로 대체합니다.",
    );
    return "local";
  }

  return provider;
}
