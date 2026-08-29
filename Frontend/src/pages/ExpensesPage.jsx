import React, { useState } from "react";
import { Panel, SectionTitle, Chip, inputStyle, btnCircle } from "../components/ui.jsx";
import { EXPENSE_CATEGORIES, todayStr } from "../constants.js";
import { useTransactions } from "../hooks/useTransactions.js";

export default function ExpensesView({ theme }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const { transactions, summary, loaded, monthLabel, addTransaction, removeTransaction } = useTransactions(true, monthOffset);

  return (
    <div>
      <SectionTitle theme={theme} sub="Minimal on purpose — amount, category, optional note.">💰 Expenses</SectionTitle>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => setMonthOffset((m) => m - 1)} style={btnCircle(theme)}>‹</button>
        <div className="font-display" style={{ fontWeight: 600, fontSize: 16, color: theme.ink }}>{monthLabel}</div>
        <button onClick={() => setMonthOffset((m) => Math.min(0, m + 1))} style={btnCircle(theme)}>›</button>
      </div>

      <Panel theme={theme} style={{ textAlign: "center", marginBottom: 16, background: theme.soft, border: "none" }}>
        <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 700 }}>Spent this month</div>
        <div className="font-display" style={{ fontSize: 32, fontWeight: 700, color: theme.ink, margin: "4px 0" }}>₹{summary.total.toLocaleString()}</div>
        <div style={{ fontSize: 11.5, opacity: 0.6 }}>{summary.count} transaction{summary.count === 1 ? "" : "s"}</div>
      </Panel>

      <AddTransactionForm theme={theme} onAdd={addTransaction} />

      {Object.keys(summary.byCategory).length > 0 && (
        <Panel theme={theme} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginBottom: 10 }}>By category</div>
          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
              const emoji = EXPENSE_CATEGORIES.find((c) => c.v === cat)?.emoji || "✨";
              const pct = summary.total ? Math.round((amt / summary.total) * 100) : 0;
              return (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, width: 22 }}>{emoji}</span>
                  <span style={{ fontSize: 13, color: theme.ink, flex: 1 }}>{cat}</span>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>{pct}%</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: theme.ink, minWidth: 60, textAlign: "right" }}>₹{amt.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, opacity: 0.7, margin: "4px 0 10px" }}>Transactions</div>
      {!loaded ? (
        <div style={{ fontSize: 13, opacity: 0.6, textAlign: "center", padding: 20 }}>Loading…</div>
      ) : transactions.length === 0 ? (
        <Panel theme={theme} style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 26 }}>🧾</div>
          <p style={{ color: theme.ink, opacity: 0.6, fontSize: 13, margin: "6px 0 0" }}>Nothing logged this month yet.</p>
        </Panel>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {transactions.map((t) => {
            const emoji = EXPENSE_CATEGORIES.find((c) => c.v === t.category)?.emoji || "✨";
            return (
              <div key={t._id} style={{
                display: "flex", alignItems: "center", gap: 10, background: theme.paper,
                border: `1px solid ${theme.border}`, borderRadius: 14, padding: "10px 12px",
              }}>
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>{t.category}</div>
                  <div style={{ fontSize: 11, opacity: 0.55 }}>{t.date}{t.note ? ` · ${t.note}` : ""}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: theme.ink }}>₹{t.amount.toLocaleString()}</div>
                <button onClick={() => removeTransaction(t._id)} style={{ border: "none", background: "none", color: theme.ink, opacity: 0.4, cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddTransactionForm({ theme, onAdd }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;
    setSaving(true);
    try {
      await onAdd({ amount: num, category, note, date: todayStr() });
      setAmount("");
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel theme={theme} style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginBottom: 10 }}>Add a transaction</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="number" inputMode="decimal" placeholder="Amount"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ ...inputStyle(theme), maxWidth: 120 }}
        />
        <input
          placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)}
          style={inputStyle(theme)}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {EXPENSE_CATEGORIES.map((c) => (
          <Chip key={c.v} theme={theme} active={category === c.v} onClick={() => setCategory(c.v)}>{c.emoji} {c.v}</Chip>
        ))}
      </div>
      <button onClick={submit} disabled={saving || !amount} style={{
        width: "100%", padding: "11px", borderRadius: 14, border: "none",
        background: theme.accent, color: "#fff", fontWeight: 800, fontSize: 14,
        cursor: "pointer", opacity: saving || !amount ? 0.6 : 1,
      }}>
        {saving ? "Adding…" : "+ Add"}
      </button>
    </Panel>
  );
}