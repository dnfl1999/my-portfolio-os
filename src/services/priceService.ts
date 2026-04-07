import { Holding } from "../types";

export function generateMockPriceUpdates(holdings: Holding[]): Holding[] {
  return holdings.map((holding, index) => {
    if (holding.assetType === "현금" || holding.assetType === "예금") {
      return holding;
    }

    const drift = ((index % 4) - 1.5) * 0.012;
    const random = (Math.random() - 0.5) * 0.05;
    const nextPrice = Math.max(
      1,
      Math.round(holding.currentPrice * (1 + drift + random)),
    );

    return {
      ...holding,
      currentPrice: nextPrice,
    };
  });
}
