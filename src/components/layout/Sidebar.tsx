import { PageKey } from "../../types";

const items: Array<{ key: PageKey; label: string; description: string }> = [
  { key: "dashboard", label: "대시보드", description: "전체 자산 현황" },
  { key: "holdings", label: "보유종목", description: "포지션 관리" },
  { key: "transactions", label: "거래내역", description: "매수·매도 기록" },
  { key: "notes", label: "투자노트", description: "판단 근거 정리" },
  { key: "settings", label: "설정", description: "백업 및 초기화" },
];

interface SidebarProps {
  activePage: PageKey;
  onChange: (page: PageKey) => void;
}

export function Sidebar({ activePage, onChange }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="brand-card">
        <span className="brand-badge">로컬 버전</span>
        <h2>My Portfolio OS</h2>
        <p>직접 기록하고 직접 관리하는 개인 투자 운영 시스템</p>
      </div>

      <nav className="nav-list">
        {items.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => onChange(item.key)}
            type="button"
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
