import { LivePriceCacheEntry, LivePriceSettings, MarketDataState, PortfolioData } from "../types";

const configuredMarketDataProvider = import.meta.env.VITE_MARKET_DATA_PROVIDER;
const defaultProvider = configuredMarketDataProvider === "api" ? "api" : "mock";

const defaultLivePriceSettings: LivePriceSettings = {
  enabled: true,
  intervalSeconds: 30,
  provider: defaultProvider,
  persistPriceCache: false,
};

const defaultMarketDataState: MarketDataState = {
  settings: defaultLivePriceSettings,
  lastUpdatedAt: null,
  lastAttemptAt: null,
  lastError: null,
  priceCache: {},
};

export function createDefaultMarketDataState(): MarketDataState {
  return {
    settings: { ...defaultLivePriceSettings },
    lastUpdatedAt: defaultMarketDataState.lastUpdatedAt,
    lastAttemptAt: defaultMarketDataState.lastAttemptAt,
    lastError: defaultMarketDataState.lastError,
    priceCache: {},
  };
}

function normalizePriceCache(
  value: Record<string, LivePriceCacheEntry> | undefined,
): Record<string, LivePriceCacheEntry> {
  if (!value) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, LivePriceCacheEntry] => {
      const [, item] = entry;

      return Boolean(
        item &&
          typeof item.ticker === "string" &&
          typeof item.price === "number" &&
          typeof item.updatedAt === "string" &&
          (item.source === "mock" || item.source === "api"),
      );
    }),
  );
}

export function normalizePortfolioData(value: Partial<PortfolioData> | null | undefined): PortfolioData {
  return {
    holdings: value?.holdings ?? [],
    transactions: value?.transactions ?? [],
    notes: value?.notes ?? [],
    allocationTargets: value?.allocationTargets ?? [],
    marketData: {
      settings: {
        enabled: value?.marketData?.settings?.enabled ?? defaultLivePriceSettings.enabled,
        intervalSeconds:
          value?.marketData?.settings?.intervalSeconds ?? defaultLivePriceSettings.intervalSeconds,
        provider: value?.marketData?.settings?.provider ?? defaultLivePriceSettings.provider,
        persistPriceCache:
          value?.marketData?.settings?.persistPriceCache ??
          defaultLivePriceSettings.persistPriceCache,
      },
      lastUpdatedAt: value?.marketData?.lastUpdatedAt ?? null,
      lastAttemptAt: value?.marketData?.lastAttemptAt ?? null,
      lastError: value?.marketData?.lastError ?? null,
      priceCache: normalizePriceCache(value?.marketData?.priceCache),
    },
  };
}
