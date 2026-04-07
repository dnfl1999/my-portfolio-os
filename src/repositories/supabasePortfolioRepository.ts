import { PortfolioData } from "../types";
import { isSupabaseConfigured } from "../integrations/supabase/client";
import { PortfolioRepository } from "./portfolioRepository";

export class SupabasePortfolioRepository implements PortfolioRepository {
  async load(): Promise<PortfolioData> {
    throw new Error(this.message());
  }

  async save(_data: PortfolioData): Promise<void> {
    throw new Error(this.message());
  }

  async clear(): Promise<void> {
    throw new Error(this.message());
  }

  private message() {
    if (!isSupabaseConfigured()) {
      return "Supabase 환경 변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 추가해 주세요.";
    }

    return "Supabase 저장소 구현은 아직 연결 전입니다. src/repositories/supabasePortfolioRepository.ts에 실제 CRUD를 붙이면 됩니다.";
  }
}
