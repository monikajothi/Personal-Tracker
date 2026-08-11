import React, { useRef, useState } from "react";
import { MOODS } from "../constants.js";
import { useAuth } from "../hooks/useAuth.jsx";

function computeMonthStats(entries, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const days = Object.entries(entries).filter(([d]) => d.startsWith(prefix));

  const trackedDays = days.length;
  const sleepVals = days.map(([, v]) => v.sleep?.duration).filter((v) => typeof v === "number");
  const avgSleep = sleepVals.length ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1) : null;

  const moodCounts = {};
  for (const [, v] of days) if (v.mood?.mood) moodCounts[v.mood.mood] = (moodCounts[v.mood.mood] || 0) + 1;
  const topMoodKey = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topMood = MOODS.find((m) => m.v === topMoodKey);

  const waterVals = days.map(([, v]) => v.water?.glasses).filter((v) => typeof v === "number" && v > 0);
  const avgWater = waterVals.length ? Math.round(waterVals.reduce((a, b) => a + b, 0) / waterVals.length) : null;

  const movementDays = days.filter(([, v]) => v.movement && !v.movement.rest && (v.movement.minutes || v.movement.type)).length;
  const journalDays = days.filter(([, v]) => v.journal?.text || v.journal?.photo).length;

  return { trackedDays, avgSleep, topMood, avgWater, movementDays, journalDays };
}

export default function MonthWrapModal({ theme, entries, onClose }) {
  const { user } = useAuth();
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const stats = computeMonthStats(entries, target.getFullYear(), target.getMonth());
  const monthLabel = target.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Moni";

  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `moni-wrap-${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to export month wrap:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,20,15,0.45)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="mwt-fadeup" style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button onClick={() => setMonthOffset((m) => m - 1)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>‹</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{monthLabel}</span>
          <button onClick={() => setMonthOffset((m) => Math.min(0, m + 1))} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>›</button>
        </div>

        <div ref={cardRef} style={{
          borderRadius: 28, padding: "32px 26px", textAlign: "center", color: "#fff",
          background: `linear-gradient(160deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, opacity: 0.85, textTransform: "uppercase" }}>{firstName}'s Wellness Wrap</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 22px" }}>{monthLabel}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <WrapStat label="Days tracked" value={stats.trackedDays} />
            <WrapStat label="Avg sleep" value={stats.avgSleep ? `${stats.avgSleep}h` : "—"} />
            <WrapStat label="Movement days" value={stats.movementDays} />
            <WrapStat label="Journal entries" value={stats.journalDays} />
          </div>

          {stats.topMood && (
            <div style={{ fontSize: 13, opacity: 0.95, marginBottom: 4 }}>
              Most common mood: <b>{stats.topMood.e} {stats.topMood.label}</b>
            </div>
          )}
          {stats.avgWater && <div style={{ fontSize: 13, opacity: 0.95 }}>Avg water: <b>{stats.avgWater} glasses/day</b></div>}

          <div style={{ fontSize: 22, marginTop: 20, opacity: 0.9 }}>🌷 🌿 ✨</div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={download} disabled={downloading} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: "#fff", color: theme.ink, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            {downloading ? "Preparing…" : "📥 Save as image"}
          </button>
          <button onClick={onClose} style={{ padding: "12px 18px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

const WrapStat = ({ label, value }) => (
  <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 16, padding: "12px 8px" }}>
    <div className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>{label}</div>
  </div>
);