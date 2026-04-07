import { useMemo, useState } from "react";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { SortableHeader } from "../components/common/SortableHeader";
import { HoldingForm } from "../components/forms/HoldingForm";
import { useSortableData } from "../hooks/useSortableData";
import { Holding } from "../types";
import { calculateHoldingMetrics } from "../utils/calculations";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

interface HoldingsPageProps {
  store: ReturnType<typeof import("../hooks/usePortfolioStore").usePortfolioStore>;
}

export function HoldingsPage({ store }: HoldingsPageProps) {
  const [editing, setEditing] = useState<Holding | null>(null);
  const metrics = useMemo(
    () => store.data.holdings.map(calculateHoldingMetrics),
    [store.data.holdings],
  );
  const { sortedItems, sortKey, direction, toggleSort } = useSortableData(metrics, "marketValue");

  return (
    <div className="page-grid">
      <Card
        title={editing ? "보유 종목 수정" : "보유 종목 추가"}
        description="수동 입력 기반으로 현재 포지션을 빠르게 등록합니다."
        action={
          <button className="button secondary" onClick={store.refreshMockPrices} type="button">
            더미 현재가 업데이트
          </button>
        }
      >
        <HoldingForm
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              store.updateHolding(editing.id, value);
              setEditing(null);
              return;
            }
            store.addHolding(value);
          }}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </Card>

      <Card title="보유 종목 목록" description="정렬 가능한 표로 수익률과 목표가를 함께 관리합니다.">
        {sortedItems.length === 0 ? (
          <EmptyState
            title="보유 종목이 없습니다."
            description="첫 종목을 추가하면 포트폴리오 요약이 자동으로 채워집니다."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><SortableHeader label="종목명" active={sortKey === "name"} direction={direction} onClick={() => toggleSort("name")} /></th>
                  <th><SortableHeader label="자산유형" active={sortKey === "assetType"} direction={direction} onClick={() => toggleSort("assetType")} /></th>
                  <th><SortableHeader label="수량" active={sortKey === "quantity"} direction={direction} onClick={() => toggleSort("quantity")} /></th>
                  <th><SortableHeader label="평균단가" active={sortKey === "averagePrice"} direction={direction} onClick={() => toggleSort("averagePrice")} /></th>
                  <th><SortableHeader label="현재가" active={sortKey === "currentPrice"} direction={direction} onClick={() => toggleSort("currentPrice")} /></th>
                  <th><SortableHeader label="평가금액" active={sortKey === "marketValue"} direction={direction} onClick={() => toggleSort("marketValue")} /></th>
                  <th><SortableHeader label="손익" active={sortKey === "profit"} direction={direction} onClick={() => toggleSort("profit")} /></th>
                  <th><SortableHeader label="수익률" active={sortKey === "returnRate"} direction={direction} onClick={() => toggleSort("returnRate")} /></th>
                  <th>전략</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <p className="cell-subtitle">{item.ticker}</p>
                    </td>
                    <td>{item.assetType}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>{formatCurrency(item.averagePrice)}</td>
                    <td>{formatCurrency(item.currentPrice)}</td>
                    <td>{formatCurrency(item.marketValue)}</td>
                    <td className={item.profit >= 0 ? "positive" : "negative"}>{formatCurrency(item.profit)}</td>
                    <td className={item.returnRate >= 0 ? "positive" : "negative"}>{formatPercent(item.returnRate)}</td>
                    <td>
                      <p>목표 {formatCurrency(item.targetPrice)}</p>
                      <p className="cell-subtitle">손절 {formatCurrency(item.stopLossPrice)}</p>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="button ghost small" onClick={() => setEditing(item)} type="button">
                          수정
                        </button>
                        <button className="button danger small" onClick={() => store.deleteHolding(item.id)} type="button">
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
