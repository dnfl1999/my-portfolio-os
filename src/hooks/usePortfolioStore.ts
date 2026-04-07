import { useEffect, useMemo, useState } from "react";
import {
  createPortfolioRepository,
  getDataProvider,
  getResolvedDataProvider,
} from "../config/dataSource";
import { mockPortfolioData } from "../data/mockData";
import { generateMockPriceUpdates } from "../services/priceService";
import {
  AllocationTarget,
  Holding,
  InvestmentNote,
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
  const [data, setData] = useState<PortfolioData>(mockPortfolioData);
  const [isReady, setIsReady] = useState(false);

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

  const summary = useMemo(() => calculateDashboardSummary(data), [data]);

  const persist = (nextData: PortfolioData) => {
    setData(nextData);
    void repository.save(nextData);
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

  const refreshMockPrices = () => {
    persist({
      ...data,
      holdings: generateMockPriceUpdates(data.holdings),
    });
  };

  const handleExport = () => exportPortfolioData(data);

  const handleImport = async (file: File) => {
    const imported = await importPortfolioData(file);
    persist(imported);
  };

  const resetAll = () => {
    void repository.clear();
    persist(mockPortfolioData);
  };

  return {
    data,
    isReady,
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
    refreshMockPrices,
    exportData: handleExport,
    importData: handleImport,
    resetAll,
  };
}
