import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Panel, SectionTitle } from "./ui.jsx";
import { analyticsApi } from "../api/index.js";
import { addDays, todayStr } from "../constants.js";

const PERIOD_DOT = "#D9667A";
const FERTILE_DOT = "#8FBFB5";
const OVULATION_DOT = "#3F8F80";
const NORMAL_MIN = 21;
const NORMAL_MAX = 35;

export default function CycleInsights({ theme }) {
  const [data, setData] = useState(null);
  useEffect(() => { analyticsApi.cycleHistory().then(setData).catch(() => setData({ hasData: false })); }, []);

  if (!data) return null;

  if (!data.hasData) {
    return (
      <Panel theme={theme} style={{ marginBottom: 14, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 26 }}>🩷</div>
        <p style={{ color: theme.ink, opacity: 0.7, fontSize: 13, margin: "6px 0 0" }}>{data.message || "Log period days to see cycle insights."}</p>
      </Panel>
    );
  }

  return (
    <>
      <CycleHeroCard theme={theme} data={data} />
      {data.cycles.length >= 2 && <CycleTrendsChart theme={theme} data={data} />}
      <CycleHistoryList theme={theme} data={data} />
    </>
  );
}

function phaseFor(daysSoFar, avgLength) {
  if (!avgLength) return { label: "Tracking", detail: "Keep logging to see your phase estimate." };
  const ovulationDay = avgLength - 14;
  if (daysSoFar <= 5) return { label: "Menstrual phase", detail: "Period days." };
  if (daysSoFar < ovulationDay - 5) return { label: "Follicular phase", detail: "Before the fertile window." };
  if (daysSoFar <= ovulationDay + 1) return { label: "Fertile window", detail: "Estimated fertile days." };
  return { label: "Luteal phase", detail: "After ovulation." };
}

function CycleHeroCard({ theme, data }) {
  const { currentCycle, averageLength } = data;
  const phase = phaseFor(currentCycle.daysSoFar, averageLength);

  return (
    <div style={{
      borderRadius: 24, padding: "26px 22px", marginBottom: 14, textAlign: "center",
      background: `linear-gradient(160deg, ${theme.accent} 0%, #B5657A 100%)`, color: "#fff",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 700, letterSpacing: 0.3 }}>{phase.label}</div>
      <div className="font-display" style={{ fontSize: 44, fontWeight: 600, margin: "6px 0 2px" }}>Day {currentCycle.daysSoFar}</div>
      <div style={{ fontSize: 12.5, opacity: 0.85 }}>of {averageLength ? `~${averageLength}-day cycle` : "current cycle"}</div>
      <div style={{ fontSize: 13, marginTop: 14, opacity: 0.95 }}>{phase.detail}</div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 10 }}>Started {currentCycle.start} · estimate only, not medical advice</div>
    </div>
  );
}

function CycleTrendsChart({ theme, data }) {
  const chartData = data.cycles
    .slice()
    .reverse() // chronological for the chart
    .map((c, i) => ({ name: `#${i + 1}`, length: c.length, abnormal: c.abnormal }));

  return (
    <Panel theme={theme} style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 14, color: theme.ink, marginBottom: 2 }}>📈 Cycle length trend</div>
      <div style={{ fontSize: 11.5, opacity: 0.55, marginBottom: 6 }}>Typical range is {NORMAL_MIN}–{NORMAL_MAX} days — outliers are flagged, not diagnosed.</div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} width={28} domain={["dataMin - 3", "dataMax + 3"]} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 12 }} />
          <ReferenceLine y={NORMAL_MIN} stroke={theme.border} strokeDasharray="4 4" />
          <ReferenceLine y={NORMAL_MAX} stroke={theme.border} strokeDasharray="4 4" />
          <Line
            type="monotone" dataKey="length" stroke={theme.accent} strokeWidth={2.5}
            dot={(props) => {
              const { cx, cy, payload, key } = props;
              return payload.abnormal
                ? <circle key={key} cx={cx} cy={cy} r={5} fill="#E0916B" stroke="#fff" strokeWidth={1.5} />
                : <circle key={key} cx={cx} cy={cy} r={3.5} fill={theme.accent} />;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>🟠 outside the typical range</div>
    </Panel>
  );
}

function CycleHistoryList({ theme, data }) {
  return (
    <Panel theme={theme}>
      {/* Header */}
      <div
        style={{
          fontWeight: 800,
          fontSize: 14,
          color: theme.ink,
          marginBottom: 4,
        }}
      >
        🩷 Cycle history
      </div>

      {/* Legend - stays fixed */}
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 11,
          opacity: 0.65,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <LegendDot color={PERIOD_DOT} label="Period" />
        <LegendDot color={FERTILE_DOT} label="Fertile window" />
        <LegendDot color={OVULATION_DOT} label="Ovulation" />
      </div>

      {/* Scrollable cycle history */}
      <div
        className="mwt-cycle-history-scroll"
        style={{
          // Adjust this slightly depending on CycleRow height.
          // Intended to show ~3 rows before scrolling.
          maxHeight: 270,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 6,
          scrollBehavior: "smooth",
        }}
      >
        {/* Current cycle */}
        <CycleRow
          theme={theme}
          title={`Current cycle: ${data.currentCycle.daysSoFar} days`}
          subtitle={`Started ${data.currentCycle.start}`}
          dots={buildDots({
            start: data.currentCycle.start,
            end: todayStr(),
            periodEnd: data.currentCycle.periodEnd,
            fertileWindowStart: null,
            fertileWindowEnd: null,
            ovulationDay: null,
          })}
        />

        {/* Previous cycles */}
        {data.cycles.map((c, i) => (
          <CycleRow
            key={i}
            theme={theme}
            title={`${c.length} days${
              c.abnormal ? " · outside typical range" : ""
            }`}
            subtitle={`${c.start} – ${c.end}`}
            dots={buildDots(c)}
          />
        ))}
      </div>

      {/* Hint only when there are more than 3 rows */}
      {data.cycles.length + 1 > 2 && (
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: theme.ink,
            opacity: 0.4,
            marginTop: 8,
          }}
        >
          ↕ scroll to see older cycles
        </div>
      )}
    </Panel>
  );
}

function CycleRow({ theme, title, subtitle, dots }) {
  return (
    <div style={{ padding: "10px 0", borderTop: `1px solid ${theme.border}` }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink }}>{title}</div>
      <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 6 }}>{subtitle}</div>
      <div className="mwt-scroll" style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 2 }}>
        {dots.map((type, i) => (
          <span key={i} style={{
            width: 7, height: 7, minWidth: 7, borderRadius: "50%",
            background: type === "period" ? PERIOD_DOT : type === "ovulation" ? OVULATION_DOT : type === "fertile" ? FERTILE_DOT : theme.border,
          }} />
        ))}
      </div>
    </div>
  );
}

const LegendDot = ({ color, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
    {label}
  </span>
);

function buildDots(cycle) {
  const dots = [];
  let d = cycle.start;
  while (d <= cycle.end) {
    if (cycle.periodEnd && d >= cycle.start && d <= cycle.periodEnd) dots.push("period");
    else if (cycle.ovulationDay && d === cycle.ovulationDay) dots.push("ovulation");
    else if (cycle.fertileWindowStart && d >= cycle.fertileWindowStart && d <= cycle.fertileWindowEnd) dots.push("fertile");
    else dots.push("none");
    d = addDays(d, 1);
  }
  return dots;
}