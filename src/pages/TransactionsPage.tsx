import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { SortableHeader } from "../components/common/SortableHeader";
import { TransactionForm } from "../components/forms/TransactionForm";
import { useSortableData } from "../hooks/useSortableData";
import { formatCurrency, formatDate, formatNumber } from "../utils/formatters";

interface TransactionsPageProps {
  store: ReturnType<typeof import("../hooks/usePortfolioStore").usePortfolioStore>;
}

export function TransactionsPage({ store }: TransactionsPageProps) {
  const { sortedItems, sortKey, direction, toggleSort } = useSortableData(
    store.data.transactions,
    "date",
  );

  return (
    <div className="page-grid">
      <Card title="거래 입력" description="매수, 매도, 입출금, 배당 기록 시 보유수량과 평균단가를 자동 반영합니다.">
        <TransactionForm
          holdings={store.data.holdings}
          onSubmit={(value) => {
            try {
              store.addTransaction(value);
            } catch (error) {
              window.alert(
                error instanceof Error
                  ? error.message
                  : "거래 저장 중 오류가 발생했습니다.",
              );
            }
          }}
        />
      </Card>

      <Card title="거래 내역" description="최신 순으로 정렬하고 필요한 컬럼을 다시 정렬할 수 있습니다.">
        {sortedItems.length === 0 ? (
          <EmptyState
            title="거래 내역이 없습니다."
            description="첫 거래를 추가하면 포트폴리오가 자동으로 계산됩니다."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><SortableHeader label="날짜" active={sortKey === "date"} direction={direction} onClick={() => toggleSort("date")} /></th>
                  <th><SortableHeader label="구분" active={sortKey === "type"} direction={direction} onClick={() => toggleSort("type")} /></th>
                  <th><SortableHeader label="종목명" active={sortKey === "name"} direction={direction} onClick={() => toggleSort("name")} /></th>
                  <th><SortableHeader label="수량" active={sortKey === "quantity"} direction={direction} onClick={() => toggleSort("quantity")} /></th>
                  <th><SortableHeader label="단가" active={sortKey === "price"} direction={direction} onClick={() => toggleSort("price")} /></th>
                  <th><SortableHeader label="수수료" active={sortKey === "fee"} direction={direction} onClick={() => toggleSort("fee")} /></th>
                  <th>메모</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.type}</td>
                    <td>{item.name}</td>
                    <td>{formatNumber(item.quantity)}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.fee)}</td>
                    <td>{item.memo || "-"}</td>
                    <td>
                      <button
                        className="button danger small"
                        onClick={() => store.deleteTransaction(item.id)}
                        type="button"
                      >
                        삭제
                      </button>
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
