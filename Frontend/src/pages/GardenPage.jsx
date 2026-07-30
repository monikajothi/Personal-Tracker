import React, { useMemo } from "react";
import { Panel, SectionTitle } from "../components/ui.jsx";
import { GARDEN_STICKERS } from "../constants.js";

function gardenStage(totalDays) {
  if (totalDays >= 30) return { emoji: "🌳", label: "Cute little tree" };
  if (totalDays >= 7) return { emoji: "🌷", label: "Flower" };
  if (totalDays >= 3) return { emoji: "🌱", label: "Tiny sprout" };
  if (totalDays >= 1) return { emoji: "🌰", label: "Seed planted" };
  return { emoji: "🕳️", label: "Empty patch — plant your first seed!" };
}

export default function GardenView({ theme, entries, animationsOn }) {
  const trackedDays = useMemo(() => Object.keys(entries).filter((d) => Object.keys(entries[d] || {}).length > 0).sort(), [entries]);
  const total = trackedDays.length;
  const stage = gardenStage(total);
  const plots = Math.min(total, 30);

  const nextSticker = GARDEN_STICKERS.find((s) => s.days > total);

  return (
    <div>
      <SectionTitle theme={theme} sub="Every day you show up plants something new. Missed days never uproot what's already grown.">🌿 My Garden</SectionTitle>
      <Panel theme={theme} style={{ textAlign: "center", padding: 28 }}>
        <div className={animationsOn ? "mwt-sway" : ""} style={{ fontSize: 64, display: "inline-block" }}>{stage.emoji}</div>
        <div className="font-display" style={{ fontSize: 20, color: theme.ink, marginTop: 6 }}>{stage.label}</div>
        <div style={{ fontSize: 13.5, opacity: 0.65, marginTop: 4 }}>{total} day{total === 1 ? "" : "s"} tracked in total</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, fontSize: 12, opacity: 0.6, flexWrap: "wrap" }}>
          <span>🌰 1 day</span><span>→</span><span>🌱 3 days</span><span>→</span><span>🌷 7 days</span><span>→</span><span>🌳 30 days</span>
        </div>
      </Panel>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8, marginBottom: 20 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: i < plots ? theme.soft : theme.bg, border: `1px dashed ${theme.border}` }}>
            {i < plots ? ["🌱", "🌿", "🌸", "🌷", "🌼"][i % 5] : ""}
          </div>
        ))}
      </div>

      <SectionTitle theme={theme} sub={nextSticker ? `${nextSticker.days - total} more day${nextSticker.days - total === 1 ? "" : "s"} to unlock ${nextSticker.name}` : "You've unlocked every sticker so far 🎉"}>
        📖 Sticker book
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {GARDEN_STICKERS.map((s) => {
          const unlocked = total >= s.days;
          return (
            <div key={s.days} title={unlocked ? s.name : `Unlocks at ${s.days} days`} style={{
              aspectRatio: "1", borderRadius: 16, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 2,
              background: unlocked ? theme.soft : theme.bg,
              border: `1.5px solid ${unlocked ? theme.accent : theme.border}`,
              opacity: unlocked ? 1 : 0.55,
            }}>
              <div style={{ fontSize: 22, filter: unlocked ? "none" : "grayscale(1)" }}>{unlocked ? s.emoji : "🔒"}</div>
              <div style={{ fontSize: 8.5, fontWeight: 800, color: theme.ink, textAlign: "center", padding: "0 2px" }}>{unlocked ? s.name : `${s.days}d`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}