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

function requireEnv(value, key) {
  if (!value) {
    throw new Error(`${key} 값이 비어 있습니다.`);
  }

  return value;
}

function loadPayload() {
  const payloadPath = resolve(process.cwd(), "scripts", "portfolio-default-payload.json");
  const source = readFileSync(payloadPath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(source);
}

function summarize(payload) {
  const totalValue = payload.holdings.reduce(
    (sum, holding) => sum + holding.quantity * holding.currentPrice,
    0,
  );
  const totalInvested = payload.holdings.reduce(
    (sum, holding) => sum + holding.quantity * holding.averagePrice,
    0,
  );

  console.log(`보유종목 수: ${payload.holdings.length}`);
  console.log(`총 평가금액: ${totalValue.toFixed(2)} USD`);
  console.log(`총 원금: ${totalInvested.toFixed(2)} USD`);
  console.log(`총 손익: ${(totalValue - totalInvested).toFixed(2)} USD`);
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

async function main() {
  const env = loadEnvFile();
  const supabaseUrl = requireEnv(env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL");
  const supabaseKey = requireEnv(env.VITE_SUPABASE_ANON_KEY, "VITE_SUPABASE_ANON_KEY");
  const payload = loadPayload();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  await saveSnapshot(supabase, payload);
  summarize(payload);
  console.log("Supabase default portfolio payload synced.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
