import { ChangeEvent } from "react";
import { Card } from "../components/common/Card";
import { isSupabaseConfigured } from "../integrations/supabase/client";
import { formatCurrency, formatPercent } from "../utils/formatters";

interface SettingsPageProps {
  store: ReturnType<typeof import("../hooks/usePortfolioStore").usePortfolioStore>;
}

export function SettingsPage({ store }: SettingsPageProps) {
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await store.importData(file);
      window.alert("데이터를 가져왔습니다.");
    } catch {
      window.alert("JSON 파일을 읽지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="page-grid">
      <Card
        title="데이터 소스"
        description="현재는 localStorage가 기본이며, 이후 Supabase 저장소로 자연스럽게 전환할 수 있습니다."
      >
        <div className="settings-summary">
          <div className="summary-row">
            <strong>요청된 저장소</strong>
            <span>{store.requestedDataProvider}</span>
          </div>
          <div className="summary-row">
            <strong>현재 사용 중인 저장소</strong>
            <span>{store.dataProvider}</span>
          </div>
          <div className="summary-row">
            <strong>저장 상태</strong>
            <span>{store.isSaving ? "저장 중" : "대기 중"}</span>
          </div>
          <div className="summary-row">
            <strong>Supabase 환경 변수</strong>
            <span>{isSupabaseConfigured() ? "설정 완료" : "미설정"}</span>
          </div>
        </div>
      </Card>

      <Card
        title="자산 비중 목표"
        description="현재 비중과 목표 비중 차이를 보면서 리밸런싱 기준을 관리합니다."
      >
        <div className="allocation-targets">
          {store.summary.allocation.map((item) => (
            <label key={item.assetType} className="target-row">
              <div>
                <strong>{item.assetType}</strong>
                <p>
                  현재 {formatPercent(item.currentRatio)} · 평가금액 {formatCurrency(item.marketValue)}
                </p>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={item.targetRatio}
                onChange={(e) =>
                  store.updateAllocationTarget(item.assetType, Number(e.target.value))
                }
              />
            </label>
          ))}
        </div>
      </Card>

      <Card
        title="데이터 관리"
        description="저장 데이터를 내보내기, 가져오기, 빈 포트폴리오 상태로 초기화할 수 있습니다."
      >
        <div className="settings-actions">
          <button className="button primary" onClick={store.exportData} type="button">
            전체 데이터 JSON 내보내기
          </button>
          <label className="button secondary file-button">
            JSON 가져오기
            <input type="file" accept="application/json" onChange={importFile} />
          </label>
          <button
            className="button danger"
            onClick={() => {
              if (window.confirm("모든 데이터를 삭제하고 빈 포트폴리오 상태로 초기화할까요?")) {
                store.resetAll();
              }
            }}
            type="button"
          >
            전체 초기화
          </button>
        </div>
      </Card>
    </div>
  );
}
