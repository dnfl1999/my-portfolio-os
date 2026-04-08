import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { MobileTabs } from "./components/layout/MobileTabs";
import { Sidebar } from "./components/layout/Sidebar";
import { usePortfolioStore } from "./hooks/usePortfolioStore";
import { DashboardPage } from "./pages/DashboardPage";
import { HoldingsPage } from "./pages/HoldingsPage";
import { NotesPage } from "./pages/NotesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { PageKey } from "./types";

const pageTitles: Record<PageKey, string> = {
  dashboard: "대시보드",
  holdings: "보유종목",
  transactions: "거래내역",
  notes: "투자노트",
  settings: "설정",
};

function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);
  const store = usePortfolioStore();

  useEffect(() => {
    const handleUpdateReady = (
      event: CustomEvent<{
        applyUpdate: () => void;
      }>,
    ) => {
      setApplyUpdate(() => event.detail.applyUpdate);
    };

    window.addEventListener("pwa-update-ready", handleUpdateReady as EventListener);

    return () => {
      window.removeEventListener("pwa-update-ready", handleUpdateReady as EventListener);
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage store={store} onNavigate={setActivePage} />;
      case "holdings":
        return <HoldingsPage store={store} />;
      case "transactions":
        return <TransactionsPage store={store} />;
      case "notes":
        return <NotesPage store={store} />;
      case "settings":
        return <SettingsPage store={store} />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      sidebar={<Sidebar activePage={activePage} onChange={setActivePage} />}
      mobileTabs={<MobileTabs activePage={activePage} onChange={setActivePage} />}
      title={pageTitles[activePage]}
      subtitle="엑셀을 대체하는 개인 투자 대시보드"
    >
      {applyUpdate && (
        <div className="status-banner update-banner">
          <div>
            <strong>새 버전이 준비되었습니다</strong>
            <p>홈 화면 앱에서도 바로 최신 버전으로 갱신할 수 있습니다.</p>
          </div>
          <button
            className="button primary small"
            onClick={() => applyUpdate()}
            type="button"
          >
            지금 업데이트
          </button>
        </div>
      )}

      {store.saveError && (
        <div className="status-banner error-banner" role="alert">
          <div>
            <strong>저장 오류</strong>
            <p>{store.saveError}</p>
          </div>
          <button className="button ghost small" onClick={store.clearSaveError} type="button">
            닫기
          </button>
        </div>
      )}

      {!store.saveError && store.isSaving && (
        <div className="status-banner info-banner">
          <div>
            <strong>저장 중</strong>
            <p>변경 사항을 {store.dataProvider} 저장소에 반영하고 있습니다.</p>
          </div>
        </div>
      )}

      {store.isReady ? (
        renderPage()
      ) : (
        <div className="card loading-card">
          <h3>데이터를 불러오는 중입니다</h3>
          <p>저장소 설정을 확인하고 포트폴리오를 준비하고 있습니다.</p>
        </div>
      )}
    </AppShell>
  );
}

export default App;
