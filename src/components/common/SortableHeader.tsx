interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}

export function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: SortableHeaderProps) {
  return (
    <button className={`sort-button ${active ? "active" : ""}`} onClick={onClick} type="button">
      {label}
      <span>{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );
}
