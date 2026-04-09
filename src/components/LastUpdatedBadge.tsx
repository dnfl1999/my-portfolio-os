import { formatDateTime } from "../utils/formatters";

interface LastUpdatedBadgeProps {
  value: string | null;
  tone?: "default" | "error";
}

export function LastUpdatedBadge({
  value,
  tone = "default",
}: LastUpdatedBadgeProps) {
  return (
    <div className={`last-updated-badge ${tone === "error" ? "error" : ""}`}>
      <strong>마지막 업데이트</strong>
      <span>{formatDateTime(value)}</span>
    </div>
  );
}
