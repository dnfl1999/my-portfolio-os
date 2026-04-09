import { mapUpstreamPrices } from "./_lib/marketDataMapper";

type PriceApiRequest = {
  tickers?: string[];
};

const DEFAULT_UPSTREAM_PATH = "/quotes";
const DEFAULT_ALLOWED_METHODS = "POST, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "Content-Type";

function json(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = process.env.MARKET_DATA_ALLOWED_ORIGIN?.trim() || "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? "*" : origin ?? allowedOrigin,
    "Access-Control-Allow-Methods": DEFAULT_ALLOWED_METHODS,
    "Access-Control-Allow-Headers": DEFAULT_ALLOWED_HEADERS,
    Vary: "Origin",
  };
}

function normalizeTickers(body: PriceApiRequest) {
  return Array.from(
    new Set(
      (body.tickers ?? [])
        .filter((ticker): ticker is string => typeof ticker === "string")
        .map((ticker) => ticker.trim().toUpperCase())
        .filter(Boolean),
    ),
  );
}

function createAuthHeaders() {
  const apiKey = process.env.PRICE_API_KEY?.trim();
  const apiKeyHeader = process.env.PRICE_API_KEY_HEADER?.trim() || "Authorization";
  const apiKeyPrefix = process.env.PRICE_API_KEY_PREFIX?.trim() || "Bearer";

  if (!apiKey) {
    return {};
  }

  return {
    [apiKeyHeader]: apiKeyPrefix ? `${apiKeyPrefix} ${apiKey}` : apiKey,
  };
}

function createUpstreamUrl(tickers: string[]) {
  const upstreamBaseUrl = process.env.PRICE_UPSTREAM_URL?.trim();

  if (!upstreamBaseUrl) {
    throw new Error("PRICE_UPSTREAM_URL이 설정되지 않았습니다.");
  }

  const queryParamName = process.env.PRICE_UPSTREAM_SYMBOLS_PARAM?.trim() || "symbols";
  const upstreamPath = process.env.PRICE_UPSTREAM_PATH?.trim() || DEFAULT_UPSTREAM_PATH;
  const url = new URL(upstreamPath, upstreamBaseUrl);
  url.searchParams.set(queryParamName, tickers.join(","));

  return url;
}

function exampleResponse(tickers: string[]) {
  const timestamp = new Date().toISOString();
  const samplePrices = {
    TLRY: 1.82,
    PFE: 27.46,
    NVTS: 3.11,
  } as const;

  return {
    prices: tickers
      .filter((ticker) => ticker in samplePrices)
      .map((ticker) => ({
        ticker,
        price: samplePrices[ticker as keyof typeof samplePrices],
        updatedAt: timestamp,
        currency: "USD",
      })),
  };
}

export default async function handler(request: Request) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return json({ message: "Method Not Allowed" }, 405, corsHeaders);
  }

  let body: PriceApiRequest;

  try {
    body = (await request.json()) as PriceApiRequest;
  } catch {
    return json({ message: "JSON body를 읽지 못했습니다." }, 400, corsHeaders);
  }

  const tickers = normalizeTickers(body);

  if (tickers.length === 0) {
    return json({ message: "tickers 배열이 필요합니다." }, 400, corsHeaders);
  }

  if (process.env.PRICE_PROVIDER_MODE?.trim() === "example") {
    return json(exampleResponse(tickers), 200, corsHeaders);
  }

  try {
    const upstreamUrl = createUpstreamUrl(tickers);
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: createAuthHeaders(),
    });

    if (!upstreamResponse.ok) {
      return json(
        {
          message: "Upstream market data request failed",
          status: upstreamResponse.status,
        },
        upstreamResponse.status,
        corsHeaders,
      );
    }

    const upstreamPayload = await upstreamResponse.json();
    const prices = mapUpstreamPrices(upstreamPayload);

    return json({ prices }, 200, corsHeaders);
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : "가격 데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.",
      },
      500,
      corsHeaders,
    );
  }
}
