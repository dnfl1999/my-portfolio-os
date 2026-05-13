import { useEffect, useMemo, useRef, useState } from "react";
import { fetchMarketPrices, getQuotedTickers } from "../services/marketDataService";

interface UseLivePricesOptions {
  store: ReturnType<typeof import("./usePortfolioStore").usePortfolioStore>;
}

export function useLivePrices({ store }: UseLivePricesOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inFlightRef = useRef<AbortController | null>(null);
  const tickers = useMemo(() => getQuotedTickers(store.data.holdings), [store.data.holdings]);
  const intervalSeconds = store.data.marketData.settings.intervalSeconds;
  const autoRefreshEnabled = store.data.marketData.settings.enabled;
  const provider = store.data.marketData.settings.provider;
  const latestHoldingsRef = useRef(store.data.holdings);
  const latestProviderRef = useRef(provider);

  useEffect(() => {
    latestHoldingsRef.current = store.data.holdings;
  }, [store.data.holdings]);

  useEffect(() => {
    latestProviderRef.current = provider;
  }, [provider]);

  const refreshNow = async () => {
    const currentHoldings = latestHoldingsRef.current;
    const currentTickers = getQuotedTickers(currentHoldings);

    if (inFlightRef.current || currentTickers.length === 0) {
      return;
    }

    const controller = new AbortController();
    inFlightRef.current = controller;
    setIsRefreshing(true);
    store.markLivePriceRefreshAttempt();

    try {
      const quotes = await fetchMarketPrices({
        holdings: currentHoldings,
        provider: latestProviderRef.current,
        signal: controller.signal,
      });

      store.applyLivePriceSnapshot(quotes);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      store.setLivePriceError(
        error instanceof Error ? error.message : "현재가를 불러오지 못했습니다.",
      );
    } finally {
      if (inFlightRef.current === controller) {
        inFlightRef.current = null;
      }
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!store.isReady || !autoRefreshEnabled || tickers.length === 0) {
      return;
    }

    void refreshNow();

    const timer = window.setInterval(() => {
      void refreshNow();
    }, intervalSeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoRefreshEnabled, intervalSeconds, provider, store.isReady, tickers.join("|")]);

  useEffect(() => {
    return () => {
      inFlightRef.current?.abort();
    };
  }, []);

  return {
    isRefreshing,
    hasQuotedHoldings: tickers.length > 0,
    lastUpdatedAt: store.data.marketData.lastUpdatedAt,
    lastError: store.data.marketData.lastError,
    intervalSeconds,
    autoRefreshEnabled,
    refreshNow,
  };
}
