import React, { useState, useEffect, useMemo } from "react";

import {
  DropIcon,
  FlowerIcon,
  HeartIcon,
  LightningIcon,
  LinkIcon,
  MoonIcon,
  PlantIcon,
  SparkleIcon,
  SunIcon,
} from "@phosphor-icons/react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import { Panel, SectionTitle, Chip } from "../components/ui.jsx";

import CycleInsights from "../components/CycleInsights.jsx";

import { useLastNDays } from "./Dashboard.jsx";

import { analyticsApi } from "../api/index.js";

import { useAuth } from "../hooks/useAuth.jsx";

import { getAnalyticsCache, setAnalyticsCache } from "../utils/localStore.js";

const ChartCard = ({ theme, title, children }) => (
  <Panel theme={theme} style={{ marginBottom: 14 }}>
    <div style={{ fontWeight: 800, fontSize: 14, color: theme.ink, marginBottom: 6 }}>{title}</div>
    {children}
  </Panel>
);

function buildInsightStories(entries, theme) {
  const days = Object.entries(entries || {})
    .filter(([date, value]) => value && typeof value === "object")
    .map(([date, value]) => ({ date, value }));

  if (days.length < 7) return [];

  const stories = [];

  const movementDays = days.filter(({ value }) => Number(value.movement?.minutes || 0) >= 20);
  const sleepWithMovement = movementDays
    .map(({ value }) => Number(value.sleep?.duration || 0))
    .filter((v) => Number.isFinite(v) && v > 0);
  const sleepWithoutMovement = days
    .filter(({ value }) => Number(value.movement?.minutes || 0) < 20)
    .map(({ value }) => Number(value.sleep?.duration || 0))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (sleepWithMovement.length && sleepWithoutMovement.length) {
    const avgWith = sleepWithMovement.reduce((sum, v) => sum + v, 0) / sleepWithMovement.length;
    const avgWithout = sleepWithoutMovement.reduce((sum, v) => sum + v, 0) / sleepWithoutMovement.length;
    if (avgWith > avgWithout + 0.4) {
      stories.push({
        title: "Sleep unlock",
        body: `You sleep ${Math.max(0.1, (avgWith - avgWithout)).toFixed(1)}h longer on days you walk 20+ min.`,
        accent: theme.accent,
      });
    }
  }

  const hydratedDays = days.filter(({ value }) => Number(value.water?.glasses || 0) >= 6);
  const moodOnHydrated = hydratedDays
    .map(({ value }) => Number(value.mood?.energy || 0))
    .filter((v) => Number.isFinite(v) && v > 0);
  const moodNotHydrated = days
    .filter(({ value }) => Number(value.water?.glasses || 0) < 6)
    .map(({ value }) => Number(value.mood?.energy || 0))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (moodOnHydrated.length && moodNotHydrated.length) {
    const avgHydrated = moodOnHydrated.reduce((sum, v) => sum + v, 0) / moodOnHydrated.length;
    const avgNotHydrated = moodNotHydrated.reduce((sum, v) => sum + v, 0) / moodNotHydrated.length;
    if (avgHydrated > avgNotHydrated + 0.2) {
      stories.push({
        title: "Energy signal",
        body: `Your mood is ${Math.max(0.1, (avgHydrated - avgNotHydrated)).toFixed(1)} points higher on hydrated days.`,
        accent: theme.accent2,
      });
    }
  }

  const highSleep = days
    .map(({ value }) => Number(value.sleep?.duration || 0))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (highSleep.length) {
    const avgSleep = highSleep.reduce((sum, v) => sum + v, 0) / highSleep.length;
    if (avgSleep >= 7.5) {
      stories.push({
        title: "Recovery pattern",
        body: `Your average sleep is ${avgSleep.toFixed(1)}h — that is showing up in your energy overall.`,
        accent: theme.accent,
      });
    }
  }

  return stories.slice(0, 3);
}

function SundayRecapStory({ theme, entries }) {
  const stories = useMemo(() => buildInsightStories(entries, theme), [entries, theme]);
  const [index, setIndex] = useState(0);

  if (new Date().getDay() !== 0 || stories.length === 0) {
    return null;
  }

  const current = stories[index % stories.length];

  return (
    <Panel theme={theme} style={{ marginBottom: 14, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent2}14)`, border: `1px solid ${theme.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: theme.ink, fontWeight: 800 }}>
          <SparkleIcon size={18} weight="duotone" />
          Sunday recap
        </div>
        <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: ".12em", textTransform: "uppercase", color: theme.ink }}>
          20 sec story
        </div>
      </div>

      <div style={{ minHeight: 132, borderRadius: 18, padding: 16, background: `linear-gradient(180deg, ${current.accent}20, rgba(255,255,255,0.18))`, border: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: theme.ink, opacity: 0.7 }}>{current.title}</div>
        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800, lineHeight: 1.35, color: theme.ink }}>{current.body}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7, color: theme.ink }}>
          {index + 1}/{stories.length}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setIndex((i) => (i === 0 ? stories.length - 1 : i - 1))} style={{ border: `1px solid ${theme.border}`, background: theme.paper, borderRadius: 999, padding: "7px 10px", color: theme.ink, fontWeight: 700, cursor: "pointer" }}>
            Prev
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % stories.length)} style={{ border: "none", background: theme.accent, color: "white", borderRadius: 999, padding: "7px 10px", fontWeight: 700, cursor: "pointer" }}>
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function AnalyticsView({ theme, entries, cycleEnabled, userId, settings }) {
  const [range, setRange] = useState(7);

  const days = useLastNDays(entries, range);
  const enoughData = Object.keys(entries).length >= 2;

  const { user } = useAuth();

  const sleepData = days.map((d) => ({ name: d.label, hours: d.entry.sleep?.duration ?? null }));

  const waterData = days.map((d) => {
    const glasses = Number(d.entry.water?.glasses ?? 0);
    const cupMl = Number(settings?.hydration?.cupMl ?? 250);

    return {
      name: d.label,
      liters: Number(((glasses * cupMl) / 1000).toFixed(2)),
    };
  });

  const moodData = days.map((d) => ({ name: d.label, energy: d.entry.mood?.energy ?? null }));

  if (!enoughData) {
    return (
      <div>
        <SectionTitle theme={theme}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <SparkleIcon size={19} weight="duotone" />
            Insights
          </span>
        </SectionTitle>

        <Panel theme={theme} style={{ textAlign: "center", padding: 30 }}>
          <div style={{ color: theme.accent }}>
            <PlantIcon size={34} weight="duotone" />
          </div>

          <p style={{ color: theme.ink, opacity: 0.7 }}>
            Keep tracking — your trends are growing! Insights appear once you've logged a couple of days.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle theme={theme} sub="Simple patterns from what you've actually logged.">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <SparkleIcon size={19} weight="duotone" />
          Insights
        </span>
      </SectionTitle>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[7, 30].map((r) => (
          <Chip key={r} theme={theme} active={range === r} onClick={() => setRange(r)}>
            {r}-day
          </Chip>
        ))}
      </div>

      <SundayRecapStory theme={theme} entries={entries} />

      <ChartCard
        theme={theme}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <MoonIcon size={18} weight="duotone" />
            Sleep duration
          </span>
        }
      >
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

      <ChartCard
        theme={theme}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <DropIcon size={18} weight="duotone" />
            Water intake
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={waterData}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.accent2} stopOpacity={0.38} />
                <stop offset="100%" stopColor={theme.accent2} stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 11,
                fill: theme.ink,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: theme.ink,
              }}
              axisLine={false}
              tickLine={false}
              width={32}
              tickFormatter={(value) => `${value}L`}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                fontSize: 12,
              }}
              formatter={(value) => [`${Number(value).toFixed(2)} L`, "Water"]}
            />

            <Area
              type="monotone"
              dataKey="liters"
              stroke={theme.accent2}
              fill="url(#waterGrad)"
              strokeWidth={2.5}
              connectNulls
              dot={{
                r: 3,
                fill: theme.accent2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        theme={theme}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <LightningIcon size={18} weight="duotone" />
            Energy trend
          </span>
        }
      >
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

      <WeeklySummaryCard theme={theme} userId={userId} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {cycleEnabled && (
          <CycleInsights
            theme={theme}
            userId={user?.id || user?._id || user?.email}
          />
        )}

        <CorrelationCard theme={theme} userId={userId} />
      </div>
    </div>
  );
}

function WeeklySummaryCard({ theme, userId }) {
  const [lines, setLines] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const cached = userId ? getAnalyticsCache(userId, "weekly-summary") : null;

    if (Array.isArray(cached?.value)) {
      setLines(cached.value);
      setError(cached.value.length ? null : "No weekly summary available yet.");
    }

    analyticsApi
      .weeklySummary()
      .then((r) => {
        if (ignore) return;
        const next = Array.isArray(r?.lines) ? r.lines : [];
        setLines(next);
        setError(next.length ? null : "No weekly summary available yet.");
        if (userId) setAnalyticsCache(userId, "weekly-summary", next);
      })
      .catch((err) => {
        if (!ignore && !cached) {
          console.error("[AnalyticsPage] weekly summary failed", err);
          setError("Weekly summary unavailable right now.");
          setLines([]);
        }
      });

    return () => { ignore = true; };
  }, [userId]);

  const icons = [FlowerIcon, DropIcon, MoonIcon, PlantIcon, SparkleIcon, HeartIcon, SunIcon];

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
        <FlowerIcon size={30} weight="duotone" />
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
        <PlantIcon size={28} weight="duotone" />
      </span>

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
            <FlowerIcon size={20} weight="duotone" />
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
              little patterns from your past 7 days <SparkleIcon size={13} weight="duotone" />
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
          <span className="mwt-float" style={{ fontSize: 18 }}>
            <PlantIcon size={20} weight="duotone" />
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
            <PlantIcon size={20} weight="duotone" />
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
            <span>
              Keep checking in — your weekly story will grow here <FlowerIcon size={13} weight="duotone" />
            </span>
          </div>
        </div>
      )}

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
                {(() => {
                  const Icon = icons[index % icons.length];
                  return <Icon size={16} weight="duotone" />;
                })()}
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <PlantIcon size={13} weight="duotone" />
            Every little check-in counts ♡
          </span>
        </div>
      )}
    </Panel>
  );
}

function CorrelationCard({ theme, userId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const cached = userId ? getAnalyticsCache(userId, "correlation") : null;

    if (cached?.value) {
      setData(cached.value);
      setError(null);
    }

    analyticsApi
      .correlation("sleep.duration", "mood.energy")
      .then((result) => {
        if (ignore) return;
        const next = result || { hasEnoughData: false, message: "Not enough overlapping data yet." };
        setData(next);
        setError(null);
        if (userId) setAnalyticsCache(userId, "correlation", next);
      })
      .catch((err) => {
        if (!ignore && !cached) {
          console.error("[AnalyticsPage] correlation failed", err);
          setData({ hasEnoughData: false, message: "Correlation unavailable right now." });
          setError("Correlation unavailable right now.");
        }
      });

    return () => { ignore = true; };
  }, [userId]);

  if (!data && !error) return null;

  return (
    <Panel theme={theme}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 14,
          color: theme.ink,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <LinkIcon size={18} weight="duotone" />
        Sleep vs. energy
      </div>

      {error && <div style={{ fontSize: 13, opacity: 0.7 }}>{error}</div>}

      {data?.hasEnoughData ? (
        <div style={{ fontSize: 13.5, color: theme.ink }}>
          Across {data.sampleSize} days, sleep and energy show <b>{data.strength}</b> (r = {data.coefficient}).
        </div>
      ) : (
        <div style={{ fontSize: 13, opacity: 0.65 }}>{data?.message || "Not enough overlapping data yet."}</div>
      )}

      <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8, marginBottom: 0 }}>
        Correlation isn't causation — just a pattern worth noticing.
      </p>
    </Panel>
  );
}
