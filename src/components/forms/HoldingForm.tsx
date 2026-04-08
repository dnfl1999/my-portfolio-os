import { useEffect, useState } from "react";
import { AssetType, Holding } from "../../types";

const assetTypes: AssetType[] = ["US Stock", "KR Stock", "ETF", "Crypto", "Cash", "Deposit"];

const emptyForm: Omit<Holding, "id"> = {
  name: "",
  ticker: "",
  assetType: "US Stock",
  quantity: 0,
  averagePrice: 0,
  currentPrice: 0,
  targetPrice: 0,
  stopLossPrice: 0,
  memo: "",
};

interface HoldingFormProps {
  initialValue?: Holding | null;
  onSubmit: (value: Omit<Holding, "id">) => void;
  onCancel?: () => void;
}

export function HoldingForm({ initialValue, onSubmit, onCancel }: HoldingFormProps) {
  const [form, setForm] = useState<Omit<Holding, "id">>(initialValue ?? emptyForm);

  useEffect(() => {
    setForm(initialValue ?? emptyForm);
  }, [initialValue]);

  const handleChange = <K extends keyof Omit<Holding, "id">>(
    key: K,
    value: Omit<Holding, "id">[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
    setForm(emptyForm);
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        종목명
        <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
      </label>
      <label>
        티커
        <input value={form.ticker} onChange={(e) => handleChange("ticker", e.target.value)} required />
      </label>
      <label>
        자산유형
        <select value={form.assetType} onChange={(e) => handleChange("assetType", e.target.value as AssetType)}>
          {assetTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        보유수량
        <input
          type="number"
          min="0"
          step="0.0001"
          value={form.quantity}
          onChange={(e) => handleChange("quantity", Number(e.target.value))}
          required
        />
      </label>
      <label>
        평균단가
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.averagePrice}
          onChange={(e) => handleChange("averagePrice", Number(e.target.value))}
          required
        />
      </label>
      <label>
        현재가
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.currentPrice}
          onChange={(e) => handleChange("currentPrice", Number(e.target.value))}
          required
        />
      </label>
      <label>
        목표가
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.targetPrice}
          onChange={(e) => handleChange("targetPrice", Number(e.target.value))}
        />
      </label>
      <label>
        손절가
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.stopLossPrice}
          onChange={(e) => handleChange("stopLossPrice", Number(e.target.value))}
        />
      </label>
      <label className="full-span">
        투자 메모
        <textarea value={form.memo} onChange={(e) => handleChange("memo", e.target.value)} rows={3} />
      </label>
      <div className="form-actions full-span">
        {onCancel && (
          <button type="button" className="button ghost" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="button primary">
          {initialValue ? "종목 수정" : "종목 추가"}
        </button>
      </div>
    </form>
  );
}
