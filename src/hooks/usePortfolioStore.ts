import { useEffect, useMemo, useState } from "react";
import {
  createPortfolioRepository,
  getDataProvider,
  getResolvedDataProvider,
} from "../config/dataSource";
import { useRef } from "react";
import { emptyPortfolioData } from "../data/mockData";
import { getSupabaseClient, isSupabaseConfigured } from "../integrations/supabase/client";
import { MarketPriceQuote } from "../services/marketDataService";
import {
  AllocationTarget,
  Holding,
  InvestmentNote,
  LivePriceSettings,
  PortfolioData,
  Transaction,
} from "../types";
import {
  applyTransactionToHoldings,
  calculateDashboardSummary,
  reverseTransactionFromHoldings,
} from "../utils/calculations";
import { createId } from "../utils/id";
import { exportPortfolioData, importPortfolioData } from "../utils/storage";

export function usePortfolioStore() {
  const requestedDataProvider = useMemo(() => getDataProvider(), []);
  const dataProvider = useMemo(() => getResolvedDataProvider(), []);
  const repository = useMemo(() => createPortfolioRepository(), []);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const latestWriteIdRef = useRef(0);
  const pendingWriteCountRef = useRef(0);
  const [data, setData] = useState<PortfolioData>(emptyPortfolioData);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    repository
      .load()
      .then((loaded) => {
        if (!mounted) {
          return;
        }

        setData(loaded);
      })
      .catch((error) => {
        console.error("[My Portfolio OS] 저장소 로드 실패:", error);
        if (mounted) {
          setSaveError(
            error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [repository]);

  useEffect(() => {
    if (dataProvider !== "supabase" || !isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("portfolio-snapshots-default")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_snapshots",
          filter: "portfolio_key=eq.default",
        },
        async () => {
          try {
            const latest = await repository.load();
            setData(latest);
            setSaveError(null);
          } catch (error) {
            console.error("[My Portfolio OS] 실시간 동기화 실패:", error);
            setSaveError(
              error instanceof Error
                ? error.message
                : "실시간 동기화 중 오류가 발생했습니다.",
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [dataProvider, repository]);

  const summary = useMemo(() => calculateDashboardSummary(data), [data]);

  const enqueueWrite = (
    task: () => Promise<void>,
    fallbackMessage: string,
    nextData?: PortfolioData,
  ) => {
    if (nextData) {
      setData(nextData);
    }

    const writeId = latestWriteIdRef.current + 1;
    latestWriteIdRef.current = writeId;
    pendingWriteCountRef.current += 1;
    setIsSaving(true);
    setSaveError(null);

    const queuedWrite = saveQueueRef.current
      .catch((error) => {
        console.error("[My Portfolio OS] 이전 저장 작업 실패:", error);
      })
      .then(task);

    saveQueueRef.current = queuedWrite;

    void queuedWrite
      .catch((error) => {
        console.error("[My Portfolio OS] 저장 실패:", error);

        if (writeId === latestWriteIdRef.current) {
          setSaveError(error instanceof Error ? error.message : fallbackMessage);
        }
      })
      .finally(() => {
        pendingWriteCountRef.current -= 1;
        if (pendingWriteCountRef.current === 0) {
          setIsSaving(false);
        }
      });
  };

  const persist = (nextData: PortfolioData) => {
    enqueueWrite(
      () => repository.save(nextData),
      "데이터 저장 중 오류가 발생했습니다.",
      nextData,
    );
  };

  const addHolding = (payload: Omit<Holding, "id">) => {
    persist({
      ...data,
      holdings: [{ ...payload, id: createId("holding") }, ...data.holdings],
    });
  };

  const updateHolding = (holdingId: string, payload: Omit<Holding, "id">) => {
    persist({
      ...data,
      holdings: data.holdings.map((item) =>
        item.id === holdingId ? { ...payload, id: holdingId } : item,
      ),
    });
  };

  const deleteHolding = (holdingId: string) => {
    persist({
      ...data,
      holdings: data.holdings.filter((item) => item.id !== holdingId),
      notes: data.notes.filter((item) => item.holdingId !== holdingId),
      transactions: data.transactions.filter((item) => item.holdingId !== holdingId),
    });
  };

  const addTransaction = (payload: Omit<Transaction, "id">) => {
    const nextTransaction = { ...payload, id: createId("tx") };
    const nextTransactions = [nextTransaction, ...data.transactions];
    const nextHoldings = applyTransactionToHoldings(data.holdings, nextTransaction);

    persist({
      ...data,
      transactions: nextTransactions,
      holdings: nextHoldings,
    });
  };

  const deleteTransaction = (transactionId: string) => {
    const target = data.transactions.find((item) => item.id === transactionId);
    if (!target) {
      return;
    }

    const nextTransactions = data.transactions.filter((item) => item.id !== transactionId);
    const nextHoldings = reverseTransactionFromHoldings(data.holdings, target);

    persist({
      ...data,
      transactions: nextTransactions,
      holdings: nextHoldings,
    });
  };

  const saveNote = (
    payload: Omit<InvestmentNote, "id" | "updatedAt">,
    noteId?: string,
  ) => {
    const note = {
      ...payload,
      id: noteId ?? createId("note"),
      updatedAt: new Date().toISOString(),
    };

    const exists = data.notes.some((item) => item.id === note.id);
    persist({
      ...data,
      notes: exists
        ? data.notes.map((item) => (item.id === note.id ? note : item))
        : [note, ...data.notes],
    });
  };

  const deleteNote = (noteId: string) => {
    persist({
      ...data,
      notes: data.notes.filter((item) => item.id !== noteId),
    });
  };

  const updateAllocationTarget = (
    assetType: AllocationTarget["assetType"],
    targetRatio: number,
  ) => {
    const exists = data.allocationTargets.some((item) => item.assetType === assetType);
    const allocationTargets = exists
      ? data.allocationTargets.map((item) =>
          item.assetType === assetType ? { ...item, targetRatio } : item,
        )
      : [...data.allocationTargets, { assetType, targetRatio }];

    persist({ ...data, allocationTargets });
  };

  const updateLivePriceSettings = (settings: Partial<LivePriceSettings>) => {
    persist({
      ...data,
      marketData: {
        ...data.marketData,
        settings: {
          ...data.marketData.settings,
          ...settings,
        },
      },
    });
  };

  const markLivePriceRefreshAttempt = () => {
    setData((current) => ({
      ...current,
      marketData: {
        ...current.marketData,
        lastAttemptAt: new Date().toISOString(),
        lastError: null,
      },
    }));
  };

  const setLivePriceError = (message: string) => {
    setData((current) => ({
      ...current,
      marketData: {
        ...current.marketData,
        lastAttemptAt: new Date().toISOString(),
        lastError: message,
      },
    }));
  };

  const applyLivePriceSnapshot = (quotes: MarketPriceQuote[]) => {
    const timestamp = new Date().toISOString();
    const quoteMap = new Map(quotes.map((quote) => [quote.ticker.toUpperCase(), quote]));

    const nextData = {
      ...data,
      holdings: data.holdings.map((holding) => {
        const quote = quoteMap.get(holding.ticker.trim().toUpperCase());

        if (!quote) {
          return holding;
        }

        return {
          ...holding,
          currentPrice: quote.price,
        };
      }),
      marketData: {
        ...data.marketData,
        lastAttemptAt: timestamp,
        lastUpdatedAt: quotes.length > 0 ? timestamp : data.marketData.lastUpdatedAt,
        lastError: null,
        priceCache: {
          ...data.marketData.priceCache,
          ...Object.fromEntries(quotes.map((quote) => [quote.ticker, quote])),
        },
      },
    };

    if (nextData.marketData.settings.persistPriceCache) {
      persist(nextData);
      return;
    }

    setData(nextData);
  };

  const handleExport = () => exportPortfolioData(data);

  const handleImport = async (file: File) => {
    const imported = await importPortfolioData(file);
    persist(imported);
  };

  const resetAll = () => {
    enqueueWrite(
      async () => {
        await repository.clear();
        await repository.save(emptyPortfolioData);
      },
      "초기화 중 오류가 발생했습니다.",
      emptyPortfolioData,
    );
  };

  return {
    data,
    isReady,
    isSaving,
    saveError,
    requestedDataProvider,
    dataProvider,
    summary,
    addHolding,
    updateHolding,
    deleteHolding,
    addTransaction,
    deleteTransaction,
    saveNote,
    deleteNote,
    updateAllocationTarget,
    updateLivePriceSettings,
    markLivePriceRefreshAttempt,
    setLivePriceError,
    applyLivePriceSnapshot,
    exportData: handleExport,
    importData: handleImport,
    resetAll,
    clearSaveError: () => setSaveError(null),
  };
}
