import {
  AllocationTarget,
  AssetAllocation,
  DashboardSummary,
  Holding,
  HoldingMetrics,
  PortfolioData,
  Transaction,
} from "../types";

const assetTypes = ["미국주식", "한국주식", "ETF", "코인", "현금", "예금"] as const;

export function calculateHoldingMetrics(holding: Holding): HoldingMetrics {
  const investedAmount = holding.averagePrice * holding.quantity;
  const marketValue = holding.currentPrice * holding.quantity;
  const profit = marketValue - investedAmount;
  const returnRate = investedAmount === 0 ? 0 : (profit / investedAmount) * 100;

  return {
    ...holding,
    investedAmount,
    marketValue,
    profit,
    returnRate,
  };
}

export function calculateAllocation(
  holdings: Holding[],
  targets: AllocationTarget[],
): AssetAllocation[] {
  const metrics = holdings.map(calculateHoldingMetrics);
  const totalValue = metrics.reduce((sum, item) => sum + item.marketValue, 0);

  return assetTypes.map((assetType) => {
    const marketValue = metrics
      .filter((item) => item.assetType === assetType)
      .reduce((sum, item) => sum + item.marketValue, 0);
    const targetRatio =
      targets.find((item) => item.assetType === assetType)?.targetRatio ?? 0;
    const currentRatio = totalValue === 0 ? 0 : (marketValue / totalValue) * 100;

    return {
      assetType,
      marketValue,
      currentRatio,
      targetRatio,
      gapRatio: currentRatio - targetRatio,
    };
  });
}

export function calculateDashboardSummary(data: PortfolioData): DashboardSummary {
  const metrics = data.holdings.map(calculateHoldingMetrics);
  const totalInvested = metrics.reduce((sum, item) => sum + item.investedAmount, 0);
  const totalValue = metrics.reduce((sum, item) => sum + item.marketValue, 0);
  const totalProfit = totalValue - totalInvested;
  const totalReturnRate = totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;
  const cashValue = metrics
    .filter((item) => item.assetType === "현금" || item.assetType === "예금")
    .reduce((sum, item) => sum + item.marketValue, 0);

  return {
    totalInvested,
    totalValue,
    totalProfit,
    totalReturnRate,
    cashRatio: totalValue === 0 ? 0 : (cashValue / totalValue) * 100,
    allocation: calculateAllocation(data.holdings, data.allocationTargets),
    recentTransactions: [...data.transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
  };
}

export function applyTransactionToHoldings(
  holdings: Holding[],
  transaction: Transaction,
): Holding[] {
  const nextHoldings = [...holdings];
  const index = nextHoldings.findIndex((item) => item.id === transaction.holdingId);

  if (index === -1 || !transaction.holdingId) {
    return nextHoldings;
  }

  const holding = nextHoldings[index];

  if (transaction.type === "매수") {
    const currentCost = holding.averagePrice * holding.quantity;
    const nextQuantity = holding.quantity + transaction.quantity;
    const buyCost = transaction.price * transaction.quantity + transaction.fee;
    const averagePrice = nextQuantity === 0 ? 0 : (currentCost + buyCost) / nextQuantity;

    nextHoldings[index] = {
      ...holding,
      quantity: nextQuantity,
      averagePrice,
    };
  }

  if (transaction.type === "매도") {
    const nextQuantity = holding.quantity - transaction.quantity;
    if (nextQuantity < 0) {
      throw new Error("매도 수량이 보유 수량보다 많습니다.");
    }

    nextHoldings[index] = {
      ...holding,
      quantity: nextQuantity,
      averagePrice: nextQuantity === 0 ? 0 : holding.averagePrice,
    };
  }

  if (transaction.type === "입금" || transaction.type === "배당") {
    const nextCash = holding.currentPrice + transaction.price;
    nextHoldings[index] = {
      ...holding,
      currentPrice: nextCash,
      averagePrice: nextCash,
    };
  }

  if (transaction.type === "출금") {
    const nextCash = Math.max(0, holding.currentPrice - transaction.price);
    nextHoldings[index] = {
      ...holding,
      currentPrice: nextCash,
      averagePrice: nextCash,
    };
  }

  return nextHoldings.filter(
    (item) => item.quantity > 0 || item.assetType === "현금" || item.assetType === "예금",
  );
}

export function reverseTransactionFromHoldings(
  holdings: Holding[],
  transaction: Transaction,
): Holding[] {
  const nextHoldings = [...holdings];
  const index = nextHoldings.findIndex((item) => item.id === transaction.holdingId);

  if (index === -1 || !transaction.holdingId) {
    return nextHoldings;
  }

  const holding = nextHoldings[index];

  if (transaction.type === "매수") {
    const previousQuantity = holding.quantity - transaction.quantity;
    if (previousQuantity < 0) {
      throw new Error("매수 거래를 되돌릴 수 없습니다.");
    }

    const previousCost =
      holding.averagePrice * holding.quantity -
      (transaction.price * transaction.quantity + transaction.fee);

    nextHoldings[index] = {
      ...holding,
      quantity: previousQuantity,
      averagePrice: previousQuantity === 0 ? 0 : previousCost / previousQuantity,
    };
  }

  if (transaction.type === "매도") {
    nextHoldings[index] = {
      ...holding,
      quantity: holding.quantity + transaction.quantity,
    };
  }

  if (transaction.type === "입금" || transaction.type === "배당") {
    const nextCash = Math.max(0, holding.currentPrice - transaction.price);
    nextHoldings[index] = {
      ...holding,
      currentPrice: nextCash,
      averagePrice: nextCash,
    };
  }

  if (transaction.type === "출금") {
    const nextCash = holding.currentPrice + transaction.price;
    nextHoldings[index] = {
      ...holding,
      currentPrice: nextCash,
      averagePrice: nextCash,
    };
  }

  return nextHoldings.filter(
    (item) => item.quantity > 0 || item.assetType === "현금" || item.assetType === "예금",
  );
}
