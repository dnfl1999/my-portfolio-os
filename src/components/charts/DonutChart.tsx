import { AssetAllocation } from "../../types";
import { formatPercent } from "../../utils/formatters";

const palette = ["#2563eb", "#0891b2", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

interface DonutChartProps {
  allocations: AssetAllocation[];
}

export function DonutChart({ allocations }: DonutChartProps) {
  const filtered = allocations.filter((item) => item.marketValue > 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let progress = 0;

  return (
    <div className="donut-chart-wrap">
      <svg viewBox="0 0 120 120" className="donut-chart" aria-label="자산 비중 차트">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
        {filtered.length === 1 ? (
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={palette[0]}
            strokeWidth="16"
            transform="rotate(-90 60 60)"
          />
        ) : (
          filtered.map((item, index) => {
            const length = circumference * (item.currentRatio / 100);
            const dashoffset = circumference - progress;
            progress += length;

            return (
              <circle
                key={item.assetType}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={dashoffset}
                strokeWidth="16"
                transform="rotate(-90 60 60)"
              />
            );
          })
        )}
        <text x="60" y="54" textAnchor="middle" className="donut-center-label">
          비중
        </text>
        <text x="60" y="70" textAnchor="middle" className="donut-center-value">
          {filtered.length}개
        </text>
      </svg>
      <div className="donut-legend">
        {filtered.map((item, index) => (
          <div key={item.assetType} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <span>{item.assetType}</span>
            <strong>{formatPercent(item.currentRatio)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
