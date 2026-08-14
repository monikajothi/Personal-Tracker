import React, { useEffect, useMemo, useState } from "react";
import { analyticsApi } from "../api/index.js";
import { Panel, SectionTitle, btnCircle } from "../components/ui.jsx";
import { isCategoryDone, todayStr } from "../constants.js";

const FLOW_COLORS = {
  Light: { bg: "#FBE1E5", dot: "#E2909E" },
  Medium: { bg: "#F4B9C4", dot: "#D9667A" },
  Heavy: { bg: "#E8899B", dot: "#B84A5E" },
  default: { bg: "#F4B9C4", dot: "#D9667A" },
};
const FERTILE_COLOR = "#8FBFB5";
const OVULATION_COLOR = "#3F8F80";

export default function CalendarView({ theme, entries, essentials, onSelectDay, cycleEnabled }) {
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return { y: today.getFullYear(), m: today.getMonth() };
  });
  const [cycleData, setCycleData] = useState(null);

  useEffect(() => {
    let ignore = false;

    if (!cycleEnabled) {
      setCycleData(null);
      return () => {
        ignore = true;
      };
    }

    analyticsApi.cycleHistory()
      .then((result) => {
        if (!ignore) setCycleData(result || null);
      })
      .catch((err) => {
        if (!ignore) {
          console.error("[CalendarPage] cycle history failed", err);
          setCycleData(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [cycleEnabled]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const { fertileDays, ovulationDays } = useMemo(() => {
    const fertile = new Set();
    const ovulation = new Set();
    if (!cycleEnabled || !cycleData?.hasData || !Array.isArray(cycleData.cycles)) {
      return { fertileDays: fertile, ovulationDays: ovulation };
    }

    for (const cycle of cycleData.cycles) {
      if (isISODate(cycle.ovulationDay)) ovulation.add(cycle.ovulationDay);
      if (!isISODate(cycle.fertileWindowStart) || !isISODate(cycle.fertileWindowEnd)) continue;

      let date = cycle.fertileWindowStart;
      for (let i = 0; i < 12 && date <= cycle.fertileWindowEnd; i++) {
        fertile.add(date);
        date = shiftDate(date, 1);
        if (!date) break;
      }
    }

    return { fertileDays: fertile, ovulationDays: ovulation };
  }, [cycleData, cycleEnabled]);

  const statusFor = (dateStr) => {
    const entry = entries[dateStr];
    if (!entry) return "none";
    if (entry.movement?.rest) return "rest";

    const doneCount = essentials.filter((id) => isCategoryDone(id, entry[id])).length;
    if (doneCount === 0) return "none";
    if (doneCount >= essentials.length) return "full";
    return "partial";
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
      <SectionTitle theme={theme} sub="Tap a day to open or edit that entry.">Calendar</SectionTitle>
      <Panel theme={theme}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setCursor((current) => {
              const m = current.m - 1;
              return m < 0 ? { y: current.y - 1, m: 11 } : { y: current.y, m };
            })}
            style={btnCircle(theme)}
          >
            {"<"}
          </button>
          <div className="font-display" style={{ fontWeight: 600, fontSize: 17, color: theme.ink }}>
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={() => setCursor((current) => {
              const m = current.m + 1;
              return m > 11 ? { y: current.y + 1, m: 0 } : { y: current.y, m };
            })}
            style={btnCircle(theme)}
          >
            {">"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={`${day}-${i}`} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, opacity: 0.5 }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;

            const dateStr = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr();
            const status = statusFor(dateStr);
            const isPeriod = cycleEnabled && entries[dateStr]?.cycle?.isPeriod;
            const flow = entries[dateStr]?.cycle?.flow;
            const flowColor = isPeriod ? (FLOW_COLORS[flow] || FLOW_COLORS.default) : null;
            const isFertile = !isPeriod && fertileDays.has(dateStr);
            const isOvulation = !isPeriod && ovulationDays.has(dateStr);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDay(dateStr)}
                title={isPeriod ? `Period${flow ? ` (${flow})` : ""}` : isOvulation ? "Estimated ovulation" : isFertile ? "Estimated fertile window" : undefined}
                style={{
                  aspectRatio: "1",
                  borderRadius: 12,
                  border: isToday ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  background: isPeriod ? flowColor.bg : isFertile ? "rgba(143,191,181,0.18)" : theme.paper,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: 2,
                  padding: 2,
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isPeriod ? "#5A2A35" : theme.ink }}>
                  {day}
                </span>
                <DayMarker
                  status={status}
                  isPeriod={isPeriod}
                  flowColor={flowColor}
                  isFertile={isFertile}
                  isOvulation={isOvulation}
                />
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 14, fontSize: 11, opacity: 0.7, flexWrap: "wrap", alignItems: "center" }}>
          <LegendDot color="#62A66E" label="Completed" />
          <LegendDot color="#D7B64C" label="Partial" />
          <LegendDot color={theme.border} label="Not tracked" />
          <LegendDot color={theme.ink} label="Rest" />
          {cycleEnabled && (
            <>
              <LegendDot color={FLOW_COLORS.default.dot} label="Period" />
              <LegendDot color={FERTILE_COLOR} label="Fertile window" />
              <LegendDot color={OVULATION_COLOR} label="Ovulation" />
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}

function DayMarker({ status, isPeriod, flowColor, isFertile, isOvulation }) {
  if (isPeriod) return <Dot color={flowColor.dot} />;
  if (isOvulation) return <Dot color={OVULATION_COLOR} />;
  if (isFertile) return <Dot color={FERTILE_COLOR} />;
  if (status === "full") return <Dot color="#62A66E" />;
  if (status === "partial") return <Dot color="#D7B64C" />;
  if (status === "rest") return <span style={{ fontSize: 9 }}>R</span>;
  return <Dot color="#D8D0CA" />;
}

const Dot = ({ color }) => (
  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
);

const LegendDot = ({ color, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
    {label}
  </span>
);

function shiftDate(dateStr, n) {
  if (!isISODate(dateStr)) return null;
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

function isISODate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
