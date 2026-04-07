import { PageKey } from "../../types";

const items: Array<{ key: PageKey; label: string }> = [
  { key: "dashboard", label: "대시보드" },
  { key: "holdings", label: "보유종목" },
  { key: "transactions", label: "거래" },
  { key: "notes", label: "노트" },
  { key: "settings", label: "설정" },
];

interface MobileTabsProps {
  activePage: PageKey;
  onChange: (page: PageKey) => void;
}

export function MobileTabs({ activePage, onChange }: MobileTabsProps) {
  return (
    <nav className="mobile-tabs">
      {items.map((item) => (
        <button
          key={item.key}
          className={activePage === item.key ? "active" : ""}
          onClick={() => onChange(item.key)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
