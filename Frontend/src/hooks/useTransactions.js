import { useState, useEffect, useCallback } from "react";
import { transactionsApi } from "../api/index.js";
import { todayStr } from "../constants.js";

function monthRange(offset = 0) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const end = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, label: target.toLocaleDateString(undefined, { month: "long", year: "numeric" }) };
}

export function useTransactions(enabled, monthOffset = 0) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0, byCategory: {} });
  const [loaded, setLoaded] = useState(false);
  const { start, end, label } = monthRange(monthOffset);

  const refetch = useCallback(async () => {
    const [list, sum] = await Promise.all([
      transactionsApi.range(start, end),
      transactionsApi.summary(start, end),
    ]);
    setTransactions(list);
    setSummary(sum);
    setLoaded(true);
  }, [start, end]);

  useEffect(() => {
    if (!enabled) return;
    setLoaded(false);
    refetch().catch((err) => {
      console.error("Failed to load transactions:", err);
      setLoaded(true);
    });
  }, [enabled, refetch]);

  const addTransaction = useCallback(async ({ amount, category, note, date }) => {
    const optimistic = { _id: `temp-${Date.now()}`, amount, category, note, date: date || todayStr() };
    setTransactions((prev) => [optimistic, ...prev]);
    try {
      await transactionsApi.create({ amount, category, note, date: date || todayStr() });
      await refetch();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      refetch().catch(() => {});
    }
  }, [refetch]);

  const removeTransaction = useCallback(async (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    try {
      await transactionsApi.remove(id);
      await refetch();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      refetch().catch(() => {});
    }
  }, [refetch]);

  return { transactions, summary, loaded, monthLabel: label, addTransaction, removeTransaction, refetch };
}