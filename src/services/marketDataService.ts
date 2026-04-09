import { AssetType, Holding, LivePriceCacheEntry, MarketDataProvider } from "../types";

const NON_QUOTED_ASSET_TYPES: AssetType[] = ["Cash", "Deposit"];
const INTERNAL_PRICES_ENDPOINT = "/api/prices";

export interface MarketPriceQuote extends LivePriceCacheEntry {}

export interface FetchMarketPricesOptions {
  holdings: Holding[];
  provider: MarketDataProvider;
  signal?: AbortSignal;
}

interface MarketDataProviderClient {
  fetchPrices(holdings: Holding[], signal?: AbortSignal): Promise<MarketPriceQuote[]>;
}

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase();
}

function isQuotedHolding(holding: Holding) {
  return !NON_QUOTED_ASSET_TYPES.includes(holding.assetType);
}

function createDeterministicOffset(seed: string) {
  const hash = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  const phase = hash % 11;

  return (phase - 5) * 0.004;
}

class MockMarketDataProvider implements MarketDataProviderClient {
  async fetchPrices(holdings: Holding[]): Promise<MarketPriceQuote[]> {
    const timestamp = new Date().toISOString();

    return holdings.filter(isQuotedHolding).map((holding) => {
      const normalizedTicker = normalizeTicker(holding.ticker);
      const drift = createDeterministicOffset(normalizedTicker);
      const swing = Math.sin(Date.now() / 30000 + normalizedTicker.length) * 0.01;
      const nextPrice = Math.max(0.01, holding.currentPrice * (1 + drift + swing));

      return {
        ticker: normalizedTicker,
        price: Number(nextPrice.toFixed(4)),
        updatedAt: timestamp,
        source: "mock",
        currency: "USD",
      };
    });
  }
}

class ApiMarketDataProvider implements MarketDataProviderClient {
  async fetchPrices(holdings: Holding[], signal?: AbortSignal): Promise<MarketPriceQuote[]> {
    const tickers = Array.from(
      new Set(holdings.filter(isQuotedHolding).map((holding) => normalizeTicker(holding.ticker))),
    );

    if (tickers.length === 0) {
      return [];
    }

    const apiBaseUrl = import.meta.env.VITE_MARKET_DATA_API_BASE_URL?.trim();
    const endpoint = apiBaseUrl
      ? `${apiBaseUrl.replace(/\/$/, "")}${INTERNAL_PRICES_ENDPOINT}`
      : INTERNAL_PRICES_ENDPOINT;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickers }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`가격 API 요청에 실패했습니다. (${response.status})`);
    }

    const payload = (await response.json()) as {
      prices?: Array<Partial<MarketPriceQuote> & { ticker: string; price: number }>;
    };

    const timestamp = new Date().toISOString();

    return (payload.prices ?? [])
      .filter((item) => typeof item.ticker === "string" && typeof item.price === "number")
      .map((item) => ({
        ticker: normalizeTicker(item.ticker),
        price: item.price,
        updatedAt: item.updatedAt ?? timestamp,
        source: "api",
        currency: item.currency ?? "USD",
      }));
  }
}

function createProvider(provider: MarketDataProvider): MarketDataProviderClient {
  if (provider === "api") {
    return new ApiMarketDataProvider();
  }

  return new MockMarketDataProvider();
}

export async function fetchMarketPrices({
  holdings,
  provider,
  signal,
}: FetchMarketPricesOptions): Promise<MarketPriceQuote[]> {
  return createProvider(provider).fetchPrices(holdings, signal);
}

export function getQuotedTickers(holdings: Holding[]) {
  return Array.from(
    new Set(holdings.filter(isQuotedHolding).map((holding) => normalizeTicker(holding.ticker))),
  );
}
