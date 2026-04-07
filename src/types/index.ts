export type AssetType =
  | "미국주식"
  | "한국주식"
  | "ETF"
  | "코인"
  | "현금"
  | "예금";

export type TransactionType = "매수" | "매도" | "입금" | "출금" | "배당";

export type PageKey =
  | "dashboard"
  | "holdings"
  | "transactions"
  | "notes"
  | "settings";

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

export interface PortfolioData {
  holdings: Holding[];
  transactions: Transaction[];
  notes: InvestmentNote[];
  allocationTargets: AllocationTarget[];
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
