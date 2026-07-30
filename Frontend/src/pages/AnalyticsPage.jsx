import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Panel, SectionTitle, Chip } from "../components/ui.jsx";
import CycleInsights from "../components/CycleInsights.jsx";
import { useLastNDays } from "./Dashboard.jsx";
import { analyticsApi } from "../api/index.js";

const ChartCard = ({ theme, title, children }) => (
  <Panel theme={theme} style={{ marginBottom: 14 }}>
    <div style={{ fontWeight: 800, fontSize: 14, color: theme.ink, marginBottom: 6 }}>{title}</div>
    {children}
  </Panel>
);

export default function AnalyticsView({ theme, entries, cycleEnabled }) {
  const [range, setRange] = useState(7);
  const days = useLastNDays(entries, range);
  const enoughData = Object.keys(entries).length >= 2;

  const sleepData = days.map((d) => ({ name: d.label, hours: d.entry.sleep?.duration ?? null }));
  const waterData = days.map((d) => ({ name: d.label, glasses: d.entry.water?.glasses ?? 0 }));
  const moodData = days.map((d) => ({ name: d.label, energy: d.entry.mood?.energy ?? null }));

  if (!enoughData) {
    return (
      <div>
        <SectionTitle theme={theme}>📊 Insights</SectionTitle>
        <Panel theme={theme} style={{ textAlign: "center", padding: 30 }}>
          <div style={{ fontSize: 32 }}>🌱</div>
          <p style={{ color: theme.ink, opacity: 0.7 }}>Keep tracking — your trends are growing! Insights appear once you've logged a couple of days.</p>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle theme={theme} sub="Simple patterns from what you've actually logged.">📊 Insights</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[7, 30].map((r) => <Chip key={r} theme={theme} active={range === r} onClick={() => setRange(r)}>{r}-day</Chip>)}
      </div>

      <ChartCard theme={theme} title="😴 Sleep duration">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sleepData}>
            <defs>
              <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={theme.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} width={26} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 12 }} />
            <Area type="monotone" dataKey="hours" stroke={theme.accent} fill="url(#sleepGrad)" strokeWidth={2.5} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard theme={theme} title="💧 Water intake">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={waterData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} width={26} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 12 }} />
            <Bar dataKey="glasses" fill={theme.accent2} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard theme={theme} title="⚡ Energy trend">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: theme.ink }} axisLine={false} tickLine={false} width={26} />
            <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 12 }} />
            <Line type="monotone" dataKey="energy" stroke={theme.accent} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
   <WeeklySummaryCard theme={theme} />
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
  {cycleEnabled && <CycleInsights theme={theme} />}

  <CorrelationCard theme={theme} />
</div>
    </div>
  );
}

function WeeklySummaryCard({ theme }) {
  const [lines, setLines] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const endpoint = "/api/analytics/weekly-summary";

    analyticsApi.weeklySummary()
      .then((r) => {
        if (!ignore) {
          const next = Array.isArray(r?.lines) ? r.lines : [];
          setLines(next);
          setError(
            next.length ? null : "No weekly summary available yet."
          );
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(`[AnalyticsPage] ${endpoint} failed`, err);
          setError("Weekly summary unavailable right now.");
          setLines([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const icons = ["🌸", "💧", "🌙", "🌿", "✨", "🫶", "☀️"];

  return (
    <Panel
      theme={theme}
      style={{
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
        padding: 18,
      }}
    >
      {/* soft decorative background */}
      <span
        style={{
          position: "absolute",
          top: -18,
          right: -12,
          fontSize: 72,
          opacity: 0.07,
          transform: "rotate(15deg)",
          pointerEvents: "none",
        }}
      >
        🌸
      </span>

      <span
        style={{
          position: "absolute",
          bottom: -18,
          left: -12,
          fontSize: 58,
          opacity: 0.06,
          transform: "rotate(-12deg)",
          pointerEvents: "none",
        }}
      >
        🌿
      </span>

      {/* HEADER */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: theme.soft,
              border: `1px solid ${theme.border}`,
              display: "grid",
              placeItems: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🌷
          </div>

          <div>
            <div
              style={{
                fontWeight: 850,
                fontSize: 15,
                color: theme.ink,
                lineHeight: 1.2,
              }}
            >
              Your week, gently
            </div>

            <div
              style={{
                fontSize: 10.5,
                color: theme.ink,
                opacity: 0.5,
                marginTop: 3,
              }}
            >
              little patterns from your past 7 days ✨
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: theme.soft,
            border: `1px solid ${theme.border}`,
            color: theme.ink,
            fontSize: 9,
            fontWeight: 800,
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          7 DAYS
        </div>
      </div>

      {/* LOADING */}
      {!lines && !error && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "12px 13px",
            borderRadius: 14,
            background: theme.soft,
            color: theme.ink,
          }}
        >
          <span
            className="mwt-float"
            style={{ fontSize: 18 }}
          >
            🌱
          </span>

          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              Gathering your week...
            </div>

            <div
              style={{
                fontSize: 10.5,
                opacity: 0.45,
                marginTop: 2,
              }}
            >
              finding your little patterns ♡
            </div>
          </div>
        </div>
      )}

      {/* ERROR / EMPTY */}
      {error && (
        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "16px 10px 12px",
          }}
        >
          <div
            style={{
              fontSize: 30,
              marginBottom: 6,
            }}
          >
            🌱
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: theme.ink,
              fontWeight: 700,
              opacity: 0.7,
            }}
          >
            {error}
          </div>

          <div
            style={{
              fontSize: 10.5,
              color: theme.ink,
              opacity: 0.45,
              marginTop: 4,
            }}
          >
            Keep checking in — your weekly story will grow here 🌷
          </div>
        </div>
      )}

      {/* SUMMARY LINES */}
      {lines?.length > 0 && (
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                padding: "9px 11px",
                borderRadius: 14,
                background: theme.soft,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
              }}
            >
              <div
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: 9,
                  display: "grid",
                  placeItems: "center",
                  background: theme.paper,
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                {icons[index % icons.length]}
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  fontWeight: 600,
                  opacity: 0.8,
                  paddingTop: 4,
                }}
              >
                {line}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      {lines?.length > 0 && (
        <div
          style={{
            position: "relative",
            marginTop: 13,
            paddingTop: 11,
            borderTop: `1px dashed ${theme.border}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            color: theme.ink,
            fontSize: 10,
            fontWeight: 650,
            opacity: 0.48,
          }}
        >
          🌱 Every little check-in counts ♡
        </div>
      )}
    </Panel>
  );
}

function CorrelationCard({ theme }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const endpoint = "/api/analytics/correlation";
    analyticsApi.correlation("sleep.duration", "mood.energy")
      .then((result) => {
        if (!ignore) {
          const next = result || { hasEnoughData: false, message: "Not enough overlapping data yet." };
          setData(next);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(`[AnalyticsPage] ${endpoint} failed`, err);
          setData({ hasEnoughData: false, message: "Correlation unavailable right now." });
          setError("Correlation unavailable right now.");
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (!data && !error) return null;
  return (
    <Panel theme={theme}>
      <div style={{ fontWeight: 800, fontSize: 14, color: theme.ink, marginBottom: 8 }}>🔗 Sleep vs. energy</div>
      {error && <div style={{ fontSize: 13, opacity: 0.7 }}>{error}</div>}
      {data?.hasEnoughData ? (
        <div style={{ fontSize: 13.5, color: theme.ink }}>Across {data.sampleSize} days, sleep and energy show <b>{data.strength}</b> (r = {data.coefficient}).</div>
      ) : (
        <div style={{ fontSize: 13, opacity: 0.65 }}>{data?.message || "Not enough overlapping data yet."}</div>
      )}
      <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8, marginBottom: 0 }}>Correlation isn't causation — just a pattern worth noticing.</p>
    </Panel>
  );
}
