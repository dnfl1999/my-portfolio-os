import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TABLE_NAME = "portfolio_snapshots";
const SNAPSHOT_KEY = "default";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  const source = readFileSync(envPath, "utf8");
  const values = {};

  for (const line of source.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

function assertEnv(value, key) {
  if (!value) {
    throw new Error(`${key} 값이 비어 있습니다.`);
  }

  return value;
}

async function saveSnapshot(supabase, payload) {
  const updatedAt = new Date().toISOString();
  const { data: updatedRows, error: updateError } = await supabase
    .from(TABLE_NAME)
    .update({
      payload,
      updated_at: updatedAt,
    })
    .eq("portfolio_key", SNAPSHOT_KEY)
    .select("id")
    .limit(1);

  if (updateError) {
    throw new Error(`update 실패: ${updateError.message}`);
  }

  if ((updatedRows?.length ?? 0) > 0) {
    return;
  }

  const { error: insertError } = await supabase.from(TABLE_NAME).insert({
    portfolio_key: SNAPSHOT_KEY,
    payload,
    updated_at: updatedAt,
  });

  if (!insertError) {
    return;
  }

  if (insertError.code === "23505") {
    const { error: retryError } = await supabase
      .from(TABLE_NAME)
      .update({
        payload,
        updated_at: new Date().toISOString(),
      })
      .eq("portfolio_key", SNAPSHOT_KEY);

    if (!retryError) {
      return;
    }

    throw new Error(`retry update 실패: ${retryError.message}`);
  }

  throw new Error(`insert 실패: ${insertError.message}`);
}

async function loadSnapshot(supabase) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, payload, updated_at")
    .eq("portfolio_key", SNAPSHOT_KEY)
    .maybeSingle();

  if (error) {
    throw new Error(`snapshot 조회 실패: ${error.message}`);
  }

  if (!data?.payload) {
    throw new Error("default snapshot payload가 없습니다.");
  }

  return data;
}

async function main() {
  const env = loadEnvFile();
  const supabaseUrl = assertEnv(env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL");
  const supabaseKey = assertEnv(env.VITE_SUPABASE_ANON_KEY, "VITE_SUPABASE_ANON_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const original = await loadSnapshot(supabase);
  const holding = original.payload.holdings?.[0];

  if (!holding) {
    throw new Error("검증할 보유종목이 없습니다.");
  }

  const marker = `[verify ${new Date().toISOString()}]`;
  const nextPayload = structuredClone(original.payload);
  nextPayload.holdings[0].memo = `${holding.memo} ${marker}`.trim();

  console.log(`대상 종목: ${holding.name} (${holding.ticker})`);
  console.log(`검증 마커 추가: ${marker}`);

  await saveSnapshot(supabase, nextPayload);
  const afterSave = await loadSnapshot(supabase);
  const savedMemo = afterSave.payload.holdings?.[0]?.memo ?? "";

  if (!savedMemo.includes(marker)) {
    throw new Error("저장 후 재조회 payload에 검증 마커가 없습니다.");
  }

  console.log(`저장 확인 완료: ${afterSave.updated_at}`);

  await saveSnapshot(supabase, original.payload);
  const restored = await loadSnapshot(supabase);
  const restoredMemo = restored.payload.holdings?.[0]?.memo ?? "";

  if (restoredMemo !== holding.memo) {
    throw new Error("원복 후 메모 값이 원본과 다릅니다.");
  }

  console.log(`원복 확인 완료: ${restored.updated_at}`);
  console.log("Supabase round-trip verification passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
