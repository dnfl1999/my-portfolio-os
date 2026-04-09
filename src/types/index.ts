export type AssetType =
  | "US Stock"
  | "KR Stock"
  | "ETF"
  | "Crypto"
  | "Cash"
  | "Deposit";

export type TransactionType = "Buy" | "Sell" | "Deposit" | "Withdraw" | "Dividend";

export type PageKey =
  | "dashboard"
  | "holdings"
  | "transactions"
  | "notes"
  | "settings";

export type MarketDataProvider = "mock" | "api";
export type LivePriceInterval = 15 | 30 | 60;

export interface Holding {
  id: string;
  name: string;
  ticker: string;
  assetType: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  memo: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  holdingId: string | null;
  name: string;
  quantity: number;
  price: number;
  fee: number;
  memo: string;
}

export interface InvestmentNote {
  id: string;
  holdingId: string | null;
  title: string;
  reasonToBuy: string;
  addCondition: string;
  sellCondition: string;
  riskFactors: string;
  reviewMemo: string;
  updatedAt: string;
}

export interface AllocationTarget {
  assetType: AssetType;
  targetRatio: number;
}

export interface LivePriceSettings {
  enabled: boolean;
  intervalSeconds: LivePriceInterval;
  provider: MarketDataProvider;
  persistPriceCache: boolean;
}

export interface LivePriceCacheEntry {
  ticker: string;
  price: number;
  updatedAt: string;
  source: MarketDataProvider;
  currency: string;
}

export interface MarketDataState {
  settings: LivePriceSettings;
  lastUpdatedAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
  priceCache: Record<string, LivePriceCacheEntry>;
}

export interface PortfolioData {
  holdings: Holding[];
  transactions: Transaction[];
  notes: InvestmentNote[];
  allocationTargets: AllocationTarget[];
  marketData: MarketDataState;
}

export interface HoldingMetrics extends Holding {
  investedAmount: number;
  marketValue: number;
  profit: number;
  returnRate: number;
}

export interface AssetAllocation {
  assetType: AssetType;
  marketValue: number;
  currentRatio: number;
  targetRatio: number;
  gapRatio: number;
}

export interface DashboardSummary {
  totalInvested: number;
  totalValue: number;
  totalProfit: number;
  totalReturnRate: number;
  cashRatio: number;
  allocation: AssetAllocation[];
  recentTransactions: Transaction[];
}
