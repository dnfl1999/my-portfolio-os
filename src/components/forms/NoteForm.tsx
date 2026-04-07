import { useEffect, useState } from "react";
import { Holding, InvestmentNote } from "../../types";

interface NoteFormProps {
  holdings: Holding[];
  initialValue?: InvestmentNote | null;
  onSubmit: (value: Omit<InvestmentNote, "id" | "updatedAt">) => void;
  onCancel?: () => void;
}

const createEmpty = (holdings: Holding[]): Omit<InvestmentNote, "id" | "updatedAt"> => ({
  holdingId: holdings[0]?.id ?? null,
  title: "",
  reasonToBuy: "",
  addCondition: "",
  sellCondition: "",
  riskFactors: "",
  reviewMemo: "",
});

export function NoteForm({ holdings, initialValue, onSubmit, onCancel }: NoteFormProps) {
  const [form, setForm] = useState<Omit<InvestmentNote, "id" | "updatedAt">>(
    initialValue ?? createEmpty(holdings),
  );

  useEffect(() => {
    setForm(initialValue ?? createEmpty(holdings));
  }, [holdings, initialValue]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
    setForm(createEmpty(holdings));
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        연결 종목
        <select
          value={form.holdingId ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, holdingId: e.target.value }))}
        >
          {holdings.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="full-span">
        노트 제목
        <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
      </label>
      <label className="full-span">
        왜 샀는지
        <textarea value={form.reasonToBuy} onChange={(e) => setForm((prev) => ({ ...prev, reasonToBuy: e.target.value }))} rows={3} required />
      </label>
      <label className="full-span">
        추가매수 조건
        <textarea value={form.addCondition} onChange={(e) => setForm((prev) => ({ ...prev, addCondition: e.target.value }))} rows={2} />
      </label>
      <label className="full-span">
        매도 조건
        <textarea value={form.sellCondition} onChange={(e) => setForm((prev) => ({ ...prev, sellCondition: e.target.value }))} rows={2} />
      </label>
      <label className="full-span">
        리스크 요인
        <textarea value={form.riskFactors} onChange={(e) => setForm((prev) => ({ ...prev, riskFactors: e.target.value }))} rows={2} />
      </label>
      <label className="full-span">
        복기 메모
        <textarea value={form.reviewMemo} onChange={(e) => setForm((prev) => ({ ...prev, reviewMemo: e.target.value }))} rows={3} />
      </label>
      <div className="form-actions full-span">
        {onCancel && (
          <button type="button" className="button ghost" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="button primary">
          {initialValue ? "노트 수정" : "노트 저장"}
        </button>
      </div>
    </form>
  );
}
