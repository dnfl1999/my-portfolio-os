import { AssetAllocation } from "../../types";
import { formatCurrency, formatPercent } from "../../utils/formatters";

interface AllocationBarListProps {
  allocations: AssetAllocation[];
}

export function AllocationBarList({ allocations }: AllocationBarListProps) {
  return (
    <div className="allocation-list">
      {allocations.map((item) => (
        <div key={item.assetType} className="allocation-item">
          <div className="allocation-row">
            <strong>{item.assetType}</strong>
            <span>
              {formatPercent(item.currentRatio)} / 목표 {formatPercent(item.targetRatio)}
            </span>
          </div>
          <div className="allocation-bar">
            <div
              className="allocation-fill"
              style={{ width: `${Math.min(100, item.currentRatio)}%` }}
            />
          </div>
          <div className="allocation-row compact">
            <span>{formatCurrency(item.marketValue)}</span>
            <span className={item.gapRatio > 0 ? "negative" : "positive"}>
              {item.gapRatio > 0 ? "과대" : "과소"} {formatPercent(Math.abs(item.gapRatio))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
