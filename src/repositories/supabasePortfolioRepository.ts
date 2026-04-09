import { mockPortfolioData } from "../data/mockData";
import { getSupabaseClient, isSupabaseConfigured } from "../integrations/supabase/client";
import { PortfolioData } from "../types";
import { normalizePortfolioData } from "../utils/portfolioData";
import { PortfolioRepository } from "./portfolioRepository";

const TABLE_NAME = "portfolio_snapshots";
const SNAPSHOT_KEY = "default";

interface PortfolioSnapshotRow {
  id: string;
  portfolio_key: string;
  payload: PortfolioData;
  created_at: string;
  updated_at: string;
}

export class SupabasePortfolioRepository implements PortfolioRepository {
  async load(): Promise<PortfolioData> {
    if (!isSupabaseConfigured()) {
      throw new Error(this.message());
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id, portfolio_key, payload, created_at, updated_at")
      .eq("portfolio_key", SNAPSHOT_KEY)
      .maybeSingle<PortfolioSnapshotRow>();

    if (error) {
      throw new Error(`Supabase 데이터 로드에 실패했습니다: ${error.message}`);
    }

    return normalizePortfolioData(data?.payload ?? mockPortfolioData);
  }

  async save(data: PortfolioData): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error(this.message());
    }

    const supabase = getSupabaseClient();
    const updatedAt = new Date().toISOString();
    const { data: updatedRows, error: updateError } = await supabase
      .from(TABLE_NAME)
      .update({
        payload: data,
        updated_at: updatedAt,
      })
      .eq("portfolio_key", SNAPSHOT_KEY)
      .select("id")
      .limit(1);

    if (updateError) {
      throw new Error(`Supabase 데이터 저장에 실패했습니다: ${updateError.message}`);
    }

    if ((updatedRows?.length ?? 0) > 0) {
      return;
    }

    const { error: insertError } = await supabase.from(TABLE_NAME).insert({
      portfolio_key: SNAPSHOT_KEY,
      payload: data,
      updated_at: updatedAt,
    });

    if (!insertError) {
      return;
    }

    if (insertError.code === "23505") {
      const { error: retryError } = await supabase
        .from(TABLE_NAME)
        .update({
          payload: data,
          updated_at: new Date().toISOString(),
        })
        .eq("portfolio_key", SNAPSHOT_KEY);

      if (!retryError) {
        return;
      }

      throw new Error(`Supabase 데이터 저장에 실패했습니다: ${retryError.message}`);
    }

    throw new Error(`Supabase 데이터 저장에 실패했습니다: ${insertError.message}`);
  }

  async clear(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error(this.message());
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("portfolio_key", SNAPSHOT_KEY);

    if (error) {
      throw new Error(`Supabase 데이터 삭제에 실패했습니다: ${error.message}`);
    }
  }

  private message() {
    if (!isSupabaseConfigured()) {
      return "Supabase 환경 변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 추가해 주세요.";
    }

    return "Supabase 저장소를 사용하려면 환경 변수와 테이블 스키마를 먼저 설정해 주세요.";
  }
}
