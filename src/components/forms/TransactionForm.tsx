import { useEffect, useState } from "react";
import { Holding, Transaction, TransactionType } from "../../types";

const transactionTypes: TransactionType[] = ["Buy", "Sell", "Deposit", "Withdraw", "Dividend"];

interface TransactionFormProps {
  holdings: Holding[];
  onSubmit: (value: Omit<Transaction, "id">) => void;
}

export function TransactionForm({ holdings, onSubmit }: TransactionFormProps) {
  const [form, setForm] = useState<Omit<Transaction, "id">>({
    type: "Buy",
    date: new Date().toISOString().slice(0, 10),
    holdingId: holdings[0]?.id ?? null,
    name: holdings[0]?.name ?? "",
    quantity: 0,
    price: 0,
    fee: 0,
    memo: "",
  });

  useEffect(() => {
    if (holdings.length === 0) {
      setForm((prev) => ({ ...prev, holdingId: null, name: "" }));
      return;
    }

    const selected = holdings.find((item) => item.id === form.holdingId);
    if (!selected) {
      setForm((prev) => ({
        ...prev,
        holdingId: holdings[0].id,
        name: holdings[0].name,
      }));
    }
  }, [form.holdingId, holdings]);

  const handleHoldingChange = (holdingId: string) => {
    const holding = holdings.find((item) => item.id === holdingId);
    setForm((prev) => ({
      ...prev,
      holdingId,
      name: holding?.name ?? "",
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
    setForm((prev) => ({
      ...prev,
      quantity: 0,
      price: 0,
      fee: 0,
      memo: "",
    }));
  };

  return (
    <form className="form-grid compact" onSubmit={submit}>
      <label>
        거래구분
        <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))}>
          {transactionTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        날짜
        <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
      </label>
      <label>
        종목
        <select value={form.holdingId ?? ""} onChange={(e) => handleHoldingChange(e.target.value)} required>
          {holdings.length === 0 && <option value="">등록된 종목 없음</option>}
          {holdings.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.ticker})
            </option>
          ))}
        </select>
      </label>
      <label>
        수량
        <input type="number" step="0.0001" min="0" value={form.quantity} onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))} required />
      </label>
      <label>
        단가 / 금액
        <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} required />
      </label>
      <label>
        수수료
        <input type="number" step="0.01" min="0" value={form.fee} onChange={(e) => setForm((prev) => ({ ...prev, fee: Number(e.target.value) }))} />
      </label>
      <label className="full-span">
        메모
        <input value={form.memo} onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))} placeholder="간단한 메모" />
      </label>
      <div className="form-actions full-span">
        <button type="submit" className="button primary" disabled={holdings.length === 0}>
          거래 추가
        </button>
      </div>
    </form>
  );
}
