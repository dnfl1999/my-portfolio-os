import { useMemo, useState } from "react";

type Direction = "asc" | "desc";

export function useSortableData<T>(items: T[], initialKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [direction, setDirection] = useState<Direction>("desc");

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];

      if (typeof left === "number" && typeof right === "number") {
        return direction === "asc" ? left - right : right - left;
      }

      return direction === "asc"
        ? String(left).localeCompare(String(right), "ko")
        : String(right).localeCompare(String(left), "ko");
    });
  }, [direction, items, sortKey]);

  const toggleSort = (nextKey: keyof T) => {
    if (sortKey === nextKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setDirection("desc");
  };

  return { sortedItems, sortKey, direction, toggleSort };
}
