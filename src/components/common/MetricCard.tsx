interface MetricCardProps {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  caption?: string;
}

export function MetricCard({
  label,
  value,
  tone = "default",
  caption,
}: MetricCardProps) {
  return (
    <div className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {caption && <small>{caption}</small>}
    </div>
  );
}
