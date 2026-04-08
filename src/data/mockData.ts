import { PortfolioData } from "../types";

export const emptyPortfolioData: PortfolioData = {
  holdings: [],
  transactions: [],
  notes: [],
  allocationTargets: [],
};

export const samplePortfolioData: PortfolioData = {
  holdings: [
    {
      id: "holding-aapl",
      name: "Apple",
      ticker: "AAPL",
      assetType: "US Stock",
      quantity: 12,
      averagePrice: 182,
      currentPrice: 196.5,
      targetPrice: 220,
      stopLossPrice: 168,
      memo: "Core growth position",
    },
    {
      id: "holding-kodex200",
      name: "KODEX 200",
      ticker: "069500",
      assetType: "ETF",
      quantity: 25,
      averagePrice: 34.8,
      currentPrice: 36.15,
      targetPrice: 39,
      stopLossPrice: 33,
      memo: "Index tracking ETF sample",
    },
    {
      id: "holding-btc",
      name: "Bitcoin",
      ticker: "BTC",
      assetType: "Crypto",
      quantity: 0.18,
      averagePrice: 87500,
      currentPrice: 94400,
      targetPrice: 110000,
      stopLossPrice: 82000,
      memo: "High volatility sample asset",
    },
    {
      id: "holding-cash",
      name: "Cash Reserve",
      ticker: "CASH",
      assetType: "Cash",
      quantity: 1,
      averagePrice: 2500,
      currentPrice: 2500,
      targetPrice: 2500,
      stopLossPrice: 2500,
      memo: "Liquidity reserve",
    }
  ],
  transactions: [
    {
      id: "tx-1",
      type: "Deposit",
      date: "2026-03-15",
      holdingId: "holding-cash",
      name: "Cash Reserve",
      quantity: 1,
      price: 5000,
      fee: 0,
      memo: "Initial funding",
    },
    {
      id: "tx-2",
      type: "Buy",
      date: "2026-03-18",
      holdingId: "holding-aapl",
      name: "Apple",
      quantity: 4,
      price: 188,
      fee: 1.2,
      memo: "Sample buy transaction",
    }
  ],
  notes: [
    {
      id: "note-aapl",
      holdingId: "holding-aapl",
      title: "Apple sample note",
      reasonToBuy: "Strong ecosystem and cash flow",
      addCondition: "Add on valuation pullback",
      sellCondition: "Trim if thesis weakens",
      riskFactors: "Platform concentration risk",
      reviewMemo: "Monitor services growth",
      updatedAt: "2026-04-05T09:00:00.000Z",
    }
  ],
  allocationTargets: [
    { assetType: "US Stock", targetRatio: 35 },
    { assetType: "KR Stock", targetRatio: 10 },
    { assetType: "ETF", targetRatio: 20 },
    { assetType: "Crypto", targetRatio: 10 },
    { assetType: "Cash", targetRatio: 20 },
    { assetType: "Deposit", targetRatio: 5 },
  ],
};

export const mockPortfolioData: PortfolioData = emptyPortfolioData;
