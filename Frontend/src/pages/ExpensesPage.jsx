import React, { useMemo, useState } from "react";

import {
  Panel,
  SectionTitle,
  Chip,
  inputStyle,
  btnCircle,
} from "../components/ui.jsx";

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  todayStr,
  colorForCategory,
} from "../constants.js";

import { useTransactions } from "../hooks/useTransactions.js";

import {
  MoneyIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadSimpleIcon,
  ReceiptIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  MinusIcon,
} from "@phosphor-icons/react";


// ============================================================
// EXPENSES PAGE
// ============================================================

export default function ExpensesView({ theme }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [listFilter, setListFilter] = useState("all");
  const [search, setSearch] = useState("");

  const {
    transactions,
    summary,
    loaded,
    monthLabel,
    addTransaction,
    removeTransaction,
  } = useTransactions(true, monthOffset);


  // ==========================================================
  // FILTERED TRANSACTIONS
  // ==========================================================

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (
        listFilter !== "all" &&
        (t.type || "expense") !== listFilter
      ) {
        return false;
      }

      if (
        search &&
        !`${t.category} ${t.note || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, listFilter, search]);


  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Category", "Note", "Amount"],
    ];

    transactions.forEach((t) =>
      rows.push([
        t.date,
        t.type || "expense",
        t.category,
        t.note || "",
        t.amount,
      ])
    );

    const csv = rows
      .map((r) =>
        r
          .map((v) =>
            `"${String(v).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `transactions-${monthLabel.replace(
      " ",
      "-"
    )}.csv`;

    a.click();

    URL.revokeObjectURL(url);
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>

      {/* PAGE TITLE */}
      <SectionTitle
        theme={theme}
        sub="Track what comes in and what goes out."
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <MoneyIcon
            size={20}
            weight="duotone"
          />
          Expenses
        </span>
      </SectionTitle>


      {/* MONTH NAVIGATION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() =>
            setMonthOffset((m) => m - 1)
          }
          style={btnCircle(theme)}
          aria-label="Previous month"
        >
          <CaretLeftIcon
            size={18}
            weight="bold"
          />
        </button>

        <div
          className="font-display"
          style={{
            fontWeight: 600,
            fontSize: 16,
            color: theme.ink,
          }}
        >
          {monthLabel}
        </div>

        <button
          onClick={() =>
            setMonthOffset((m) =>
              Math.min(0, m + 1)
            )
          }
          style={btnCircle(theme)}
          aria-label="Next month"
        >
          <CaretRightIcon
            size={18}
            weight="bold"
          />
        </button>
      </div>


      {/* INCOME / EXPENSE SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >

        {/* INCOME */}
        <Panel
          theme={theme}
          style={{
            textAlign: "center",
            background: theme.soft,
            border: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              opacity: 0.6,
              fontWeight: 700,
            }}
          >
            <ArrowDownIcon
              size={14}
              weight="bold"
            />
            Income
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#3a9d5f",
              margin: "4px 0",
            }}
          >
            ₹{summary.totalIncome.toLocaleString()}
          </div>
        </Panel>


        {/* EXPENSE */}
        <Panel
          theme={theme}
          style={{
            textAlign: "center",
            background: theme.soft,
            border: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              opacity: 0.6,
              fontWeight: 700,
            }}
          >
            <ArrowUpIcon
              size={14}
              weight="bold"
            />
            Expense
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#c9584f",
              margin: "4px 0",
            }}
          >
            ₹{summary.totalExpense.toLocaleString()}
          </div>
        </Panel>

      </div>


      {/* NET BALANCE */}
      <Panel
        theme={theme}
        style={{
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 11.5,
            opacity: 0.6,
            fontWeight: 700,
          }}
        >
          <MoneyIcon
            size={15}
            weight="duotone"
          />
          Net balance
        </div>

        <div
          className="font-display"
          style={{
            fontSize: 30,
            fontWeight: 700,
            margin: "4px 0",
            color:
              summary.net >= 0
                ? "#3a9d5f"
                : "#c9584f",
          }}
        >
          {summary.net >= 0 ? "+" : "−"}₹
          {Math.abs(
            summary.net
          ).toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 11.5,
            opacity: 0.6,
          }}
        >
          {summary.count} transaction
          {summary.count === 1
            ? ""
            : "s"}
        </div>
      </Panel>


      {/* ADD TRANSACTION */}
      <AddTransactionForm
        theme={theme}
        onAdd={addTransaction}
      />


      {/* CATEGORY BREAKDOWN */}
      <CategoryBreakdown
        theme={theme}
        byCategory={summary.byCategory}
      />


      {/* TRANSACTIONS HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "4px 0 10px",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 13.5,
            color: theme.ink,
            opacity: 0.7,
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ReceiptIcon
            size={17}
            weight="duotone"
          />
          Transactions
        </div>

        <button
          onClick={exportCsv}
          style={{
            border: `1px solid ${theme.border}`,
            background: "none",
            borderRadius: 10,
            fontSize: 11,
            padding: "4px 10px",
            color: theme.ink,
            opacity: 0.7,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <DownloadSimpleIcon
            size={15}
            weight="bold"
          />
          Export
        </button>
      </div>


      {/* FILTER + SEARCH */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        {[
          ["all", "All"],
          ["expense", "Expenses"],
          ["income", "Income"],
        ].map(([v, l]) => (
          <Chip
            key={v}
            theme={theme}
            active={listFilter === v}
            onClick={() =>
              setListFilter(v)
            }
          >
            {l}
          </Chip>
        ))}

        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 100,
          }}
        >
          <MagnifyingGlassIcon
            size={15}
            weight="regular"
            style={{
              position: "absolute",
              left: 9,
              top: "50%",
              transform:
                "translateY(-50%)",
              opacity: 0.45,
              pointerEvents: "none",
            }}
          />

          <input
            placeholder="Search…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              ...inputStyle(theme),
              width: "100%",
              boxSizing: "border-box",
              padding:
                "6px 10px 6px 29px",
              fontSize: 12,
            }}
          />
        </div>
      </div>


      {/* TRANSACTION LIST */}
      {!loaded ? (

        <div
          style={{
            fontSize: 13,
            opacity: 0.6,
            textAlign: "center",
            padding: 20,
          }}
        >
          Loading…
        </div>

      ) : filtered.length === 0 ? (

        <Panel
          theme={theme}
          style={{
            textAlign: "center",
            padding: 24,
          }}
        >
          <ReceiptIcon
            size={30}
            weight="duotone"
            color={theme.accent}
          />

          <p
            style={{
              color: theme.ink,
              opacity: 0.6,
              fontSize: 13,
              margin: "6px 0 0",
            }}
          >
            Nothing here yet.
          </p>
        </Panel>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 8,
          }}
        >

          {filtered.map((t) => {

            const cats =
              t.type === "income"
                ? INCOME_CATEGORIES
                : EXPENSE_CATEGORIES;

            const isIncome =
              t.type === "income";

            return (
              <div
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: theme.paper,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >

                {/* CATEGORY ICON */}
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    display: "grid",
                    placeItems: "center",
                    background: theme.soft,
                    color: theme.accent,
                    flexShrink: 0,
                  }}
                >
                  <ReceiptIcon
                    size={18}
                    weight="duotone"
                  />
                </span>


                {/* DETAILS */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: theme.ink,
                    }}
                  >
                    {t.category}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.55,
                    }}
                  >
                    {t.date}
                    {t.note
                      ? ` · ${t.note}`
                      : ""}
                  </div>
                </div>


                {/* AMOUNT */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isIncome
                      ? "#3a9d5f"
                      : theme.ink,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {isIncome ? "+" : "−"}₹
                  {t.amount.toLocaleString()}
                </div>


                {/* DELETE */}
                <button
                  onClick={() =>
                    removeTransaction(t._id)
                  }
                  style={{
                    border: "none",
                    background: "none",
                    color: theme.ink,
                    opacity: 0.4,
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 4,
                    display: "grid",
                    placeItems: "center",
                  }}
                  aria-label="Delete transaction"
                >
                  <TrashIcon
                    size={16}
                    weight="regular"
                  />
                </button>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


// ============================================================
// CATEGORY BREAKDOWN
// ============================================================

function CategoryBreakdown({
  theme,
  byCategory,
}) {
  const [tab, setTab] =
    useState("expense");

  const entries = Object.entries(
    byCategory[tab] || {}
  ).sort((a, b) => b[1] - a[1]);

  const total = entries.reduce(
    (s, [, v]) => s + v,
    0
  );


  if (
    Object.keys(
      byCategory.expense
    ).length === 0 &&
    Object.keys(
      byCategory.income
    ).length === 0
  ) {
    return null;
  }


  let acc = 0;

  const gradientStops = entries.map(
    ([cat, v]) => {
      const start =
        (acc / total) * 360;

      acc += v;

      const end =
        (acc / total) * 360;

      return `${colorForCategory(
        cat
      )} ${start}deg ${end}deg`;
    }
  );


  return (
    <Panel
      theme={theme}
      style={{
        marginBottom: 16,
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >

        <div
          style={{
            fontWeight: 800,
            fontSize: 13.5,
            color: theme.ink,
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ReceiptIcon
            size={17}
            weight="duotone"
          />
          By category
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          <Chip
            theme={theme}
            active={tab === "expense"}
            onClick={() =>
              setTab("expense")
            }
          >
            Expense
          </Chip>

          <Chip
            theme={theme}
            active={tab === "income"}
            onClick={() =>
              setTab("income")
            }
          >
            Income
          </Chip>
        </div>
      </div>


      {/* EMPTY */}
      {entries.length === 0 ? (

        <div
          style={{
            fontSize: 12,
            opacity: 0.5,
            textAlign: "center",
            padding: 10,
          }}
        >
          No data yet.
        </div>

      ) : (

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >

          {/* DONUT */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              flexShrink: 0,
              background: `conic-gradient(${gradientStops.join(
                ", "
              )})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: theme.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: theme.ink,
                  textAlign: "center",
                }}
              >
                ₹{total.toLocaleString()}
              </div>
            </div>
          </div>


          {/* CATEGORY LIST */}
          <div
            style={{
              display: "grid",
              gap: 7,
              flex: 1,
              minWidth: 0,
            }}
          >
            {entries.map(
              ([cat, amt]) => (
                <div
                  key={cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >

                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background:
                        colorForCategory(cat),
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      fontSize: 12.5,
                      color: theme.ink,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {cat}
                  </span>

                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.5,
                    }}
                  >
                    {total
                      ? Math.round(
                          (amt / total) *
                            100
                        )
                      : 0}
                    %
                  </span>

                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: theme.ink,
                      minWidth: 56,
                      textAlign: "right",
                    }}
                  >
                    ₹
                    {amt.toLocaleString()}
                  </span>

                </div>
              )
            )}
          </div>

        </div>
      )}

    </Panel>
  );
}


// ============================================================
// ADD TRANSACTION FORM
// ============================================================

function AddTransactionForm({
  theme,
  onAdd,
}) {
  const [type, setType] =
    useState("expense");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState(
      EXPENSE_CATEGORIES[0].v
    );

  const [note, setNote] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const categories =
    type === "income"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;


  // ==========================================================
  // SWITCH TYPE
  // ==========================================================

  const switchType = (t) => {
    setType(t);

    setCategory(
      (
        t === "income"
          ? INCOME_CATEGORIES
          : EXPENSE_CATEGORIES
      )[0].v
    );
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const submit = async () => {
    const num = Number(amount);

    if (!num || num <= 0) {
      return;
    }

    setSaving(true);

    try {
      await onAdd({
        amount: num,
        category,
        note,
        type,
        date: todayStr(),
      });

      setAmount("");
      setNote("");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Panel
      theme={theme}
      style={{
        marginBottom: 16,
      }}
    >

      {/* TYPE */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 12,
        }}
      >

        <button
          onClick={() =>
            switchType("expense")
          }
          style={toggleBtn(
            theme,
            type === "expense",
            "#c9584f"
          )}
        >
          <MinusIcon
            size={14}
            weight="bold"
          />
          Debit
        </button>

        <button
          onClick={() =>
            switchType("income")
          }
          style={toggleBtn(
            theme,
            type === "income",
            "#3a9d5f"
          )}
        >
          <PlusIcon
            size={14}
            weight="bold"
          />
          Credit
        </button>

      </div>


      {/* AMOUNT + NOTE */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
        }}
      >

        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          style={{
            ...inputStyle(theme),
            maxWidth: 120,
          }}
        />

        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          style={inputStyle(theme)}
        />

      </div>


      {/* CATEGORIES */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {categories.map((c) => (
          <Chip
            key={c.v}
            theme={theme}
            active={category === c.v}
            onClick={() =>
              setCategory(c.v)
            }
          >
            {c.v}
          </Chip>
        ))}
      </div>


      {/* ADD BUTTON */}
      <button
        onClick={submit}
        disabled={
          saving || !amount
        }
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: 14,
          border: "none",
          background:
            type === "income"
              ? "#3a9d5f"
              : theme.accent,
          color: "#fff",
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          opacity:
            saving || !amount
              ? 0.6
              : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {saving ? (
          "Adding…"
        ) : (
          <>
            <PlusIcon
              size={16}
              weight="bold"
            />
            {type === "income"
              ? "Add credit"
              : "Add debit"}
          </>
        )}
      </button>

    </Panel>
  );
}


// ============================================================
// TOGGLE BUTTON
// ============================================================

function toggleBtn(
  theme,
  active,
  color
) {
  return {
    flex: 1,
    padding: "9px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 12.5,
    cursor: "pointer",

    border: `1px solid ${
      active
        ? color
        : theme.border
    }`,

    background: active
      ? color
      : "transparent",

    color: active
      ? "#fff"
      : theme.ink,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  };
}