import { AllocationBarList } from "../components/charts/AllocationBarList";
import { LastUpdatedBadge } from "../components/LastUpdatedBadge";
import { DonutChart } from "../components/charts/DonutChart";
import { Card } from "../components/common/Card";
import { MetricCard } from "../components/common/MetricCard";
import { SectionTitle } from "../components/common/SectionTitle";
import { useSortableData } from "../hooks/useSortableData";
import { PageKey } from "../types";
import { calculateHoldingMetrics } from "../utils/calculations";
import { formatCurrency, formatDate, formatPercent } from "../utils/formatters";

interface DashboardPageProps {
  store: ReturnType<typeof import("../hooks/usePortfolioStore").usePortfolioStore>;
  livePrices: ReturnType<typeof import("../hooks/useLivePrices").useLivePrices>;
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ store, livePrices, onNavigate }: DashboardPageProps) {
  const metrics = store.data.holdings.map(calculateHoldingMetrics);
  const topItems = [...metrics].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);
  const { sortedItems } = useSortableData(topItems, "marketValue");

  return (
    <div className="page-grid">
      <SectionTitle title="포트폴리오 요약" description="핵심 숫자를 한 화면에서 빠르게 확인합니다." />
      <div className="live-price-toolbar">
        <LastUpdatedBadge
          value={livePrices.lastUpdatedAt}
          tone={livePrices.lastError ? "error" : "default"}
        />
        <div className="banner-actions">
          {livePrices.lastError && (
            <span className="inline-error">{livePrices.lastError}</span>
          )}
          <button
            className="button ghost small"
            disabled={!livePrices.hasQuotedHoldings || livePrices.isRefreshing}
            onClick={() => {
              void livePrices.refreshNow();
            }}
            type="button"
          >
            {livePrices.isRefreshing ? "현재가 확인 중..." : "현재가 다시 조회"}
          </button>
        </div>
      </div>
      <div className="metrics-grid">
        <MetricCard label="총 투자원금" value={formatCurrency(store.summary.totalInvested)} />
        <MetricCard label="총 평가금액" value={formatCurrency(store.summary.totalValue)} />
        <MetricCard
          label="총 손익"
          value={formatCurrency(store.summary.totalProfit)}
          tone={store.summary.totalProfit >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="총 수익률"
          value={formatPercent(store.summary.totalReturnRate)}
          tone={store.summary.totalReturnRate >= 0 ? "positive" : "negative"}
        />
        <MetricCard label="현금 비중" value={formatPercent(store.summary.cashRatio)} />
      </div>

      <div className="dashboard-grid">
        <Card title="자산 비중" description="현재 비중과 목표 비중을 함께 봅니다.">
          <DonutChart allocations={store.summary.allocation} />
        </Card>
        <Card
          title="비중 갭"
          description="목표 대비 과대/과소 비중을 바로 확인합니다."
          action={
            <button className="button ghost" type="button" onClick={() => onNavigate("settings")}>
              목표 비중 수정
            </button>
          }
        >
          <AllocationBarList allocations={store.summary.allocation} />
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card
          title="최근 거래내역"
          description="가장 최근 5개 기록"
          action={
            <button className="button ghost" type="button" onClick={() => onNavigate("transactions")}>
              전체 보기
            </button>
          }
        >
          <div className="list-table">
            {store.summary.recentTransactions.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.type}</strong>
                  <p>{item.name}</p>
                </div>
                <div>
                  <strong>{formatCurrency(item.price)}</strong>
                  <p>{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card
          title="상위 보유 자산"
          description="평가금액 기준 상위 종목"
          action={
            <button className="button ghost" type="button" onClick={() => onNavigate("holdings")}>
              보유종목 보기
            </button>
          }
        >
          <div className="list-table">
            {sortedItems.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.ticker} · {item.assetType}
                  </p>
                </div>
                <div>
                  <strong>{formatCurrency(item.marketValue)}</strong>
                  <p className={item.profit >= 0 ? "positive" : "negative"}>
                    {formatPercent(item.returnRate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
