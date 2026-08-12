import React, { useState } from "react";
import { buildCompanionMessage } from "../constants.js";

export function Companion({ theme, animationsOn, kind, user, entries, todayComplete, progressPct }) {
  const [msg, setMsg] = useState(null);
  const [closing, setClosing] = useState(false);
  const emoji = kind === "dog" ? "🐶" : "🐱";

  const say = () => {
    const next = buildCompanionMessage({ user, entries, todayComplete, progressPct });
    window.clearTimeout(say.hideTimer);
    window.clearTimeout(say.removeTimer);
    setClosing(false);
    setMsg(next);

    say.hideTimer = window.setTimeout(() => {
      setClosing(true);
      say.removeTimer = window.setTimeout(() => {
        setMsg(null);
        setClosing(false);
      }, 900);
    }, 4000);
  };

  return (
    <div style={{
    position: "fixed",
    bottom: 85,
    left: 18,
    zIndex: 10000,
    userSelect: "none",
    pointerEvents: "auto"
  }}>
      {msg && (
        <div className={closing ? "mwt-fade-down font-hand" : "mwt-fadeup font-hand"} style={{ position: "absolute", bottom: 46, left: 0, background: theme.paper, border: `1.5px solid ${theme.border}`, borderRadius: 14, padding: "8px 14px", fontSize: 18, color: theme.ink, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>{msg}</div>
      )}
      <button onClick={say} title="pspsps" style={{ fontSize: 32, background: "none", border: "none", cursor: "pointer", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.15))" }} className={animationsOn ? "mwt-float" : ""}>
        {emoji}
      </button>
    </div>
  );
}

export function FloatingDecor({ animationsOn, themeKey }) {
  if (!animationsOn) return null;

  const DECOR = {
  sakura: [
    { emoji: "🌸", top: "7%",  size: 20, opacity: 0.42, delay: "-4s",  duration: "28s" },
    { emoji: "🌸", top: "19%", size: 14, opacity: 0.40, delay: "-16s", duration: "35s" },
    { emoji: "🍃", top: "31%", size: 16, opacity: 0.48, delay: "-9s",  duration: "31s" },
    { emoji: "🦋", top: "43%", size: 17, opacity: 0.45, delay: "-22s", duration: "38s" },
    { emoji: "🌷", top: "55%", size: 15, opacity: 0.40, delay: "-13s", duration: "34s" },
    { emoji: "✨", top: "67%", size: 12, opacity: 0.35, delay: "-28s", duration: "40s" },

    { emoji: "🌺", top: "77%", size: 16, opacity: 0.40, delay: "-7s",  duration: "33s" },
    { emoji: "🌿", top: "86%", size: 17, opacity: 0.37, delay: "-19s", duration: "37s" },
    { emoji: "💗", top: "14%", size: 12, opacity: 0.32, delay: "-25s", duration: "42s" },
  ],

  lavender: [
    { emoji: "🌙", top: "7%",  size: 20, opacity: 0.45, delay: "-5s",  duration: "36s" },
    { emoji: "☁️", top: "18%", size: 24, opacity: 0.45, delay: "-18s", duration: "40s" },
    { emoji: "⭐", top: "29%", size: 13, opacity: 0.38, delay: "-9s",  duration: "32s" },
    { emoji: "💜", top: "41%", size: 13, opacity: 0.35, delay: "-25s", duration: "38s" },
    { emoji: "💤", top: "53%", size: 15, opacity: 0.35, delay: "-13s", duration: "42s" },
    { emoji: "✨", top: "65%", size: 12, opacity: 0.35, delay: "-29s", duration: "35s" },

    { emoji: "🌌", top: "76%", size: 16, opacity: 0.45, delay: "-7s",  duration: "39s" },
    { emoji: "🪻", top: "85%", size: 17, opacity: 0.30, delay: "-21s", duration: "34s" },
    { emoji: "💫", top: "14%", size: 13, opacity: 0.45, delay: "-31s", duration: "44s" },
  ],

  matcha: [
    { emoji: "🍃", top: "7%",  size: 19, opacity: 0.38, delay: "-3s",  duration: "30s" },
    { emoji: "🌱", top: "18%", size: 17, opacity: 0.42, delay: "-17s", duration: "38s" },
    { emoji: "🌿", top: "30%", size: 18, opacity: 0.40, delay: "-8s",  duration: "34s" },
    { emoji: "🐝", top: "42%", size: 15, opacity: 0.34, delay: "-23s", duration: "29s" },
    { emoji: "🌼", top: "54%", size: 16, opacity: 0.42, delay: "-14s", duration: "40s" },
    { emoji: "🍵", top: "66%", size: 18, opacity: 0.45, delay: "-30s", duration: "42s" },

    { emoji: "🪴", top: "77%", size: 18, opacity: 0.40, delay: "-6s",  duration: "36s" },
    { emoji: "🌻", top: "86%", size: 16, opacity: 0.38, delay: "-20s", duration: "39s" },
    { emoji: "🐛", top: "13%", size: 13, opacity: 0.44, delay: "-27s", duration: "43s" },
  ],

  peach: [
    { emoji: "🍑", top: "7%",  size: 18, opacity: 0.45, delay: "-4s",  duration: "32s" },
    { emoji: "☕", top: "18%", size: 17, opacity: 0.48, delay: "-18s", duration: "39s" },
    { emoji: "🥐", top: "30%", size: 16, opacity: 0.37, delay: "-9s",  duration: "36s" },
    { emoji: "💕", top: "42%", size: 14, opacity: 0.48, delay: "-24s", duration: "31s" },
    { emoji: "🌷", top: "54%", size: 16, opacity: 0.40, delay: "-14s", duration: "41s" },
    { emoji: "✨", top: "66%", size: 12, opacity: 0.35, delay: "-29s", duration: "34s" },

    { emoji: "🧁", top: "77%", size: 17, opacity: 0.48, delay: "-7s",  duration: "38s" },
    { emoji: "🍓", top: "86%", size: 15, opacity: 0.38, delay: "-21s", duration: "35s" },
    { emoji: "🎀", top: "13%", size: 14, opacity: 0.45, delay: "-26s", duration: "43s" },
  ],

  cloudy: [
    { emoji: "☁️", top: "7%",  size: 25, opacity: 0.40, delay: "-5s",  duration: "40s" },
    { emoji: "☁️", top: "18%", size: 18, opacity: 0.30, delay: "-22s", duration: "46s" },
    { emoji: "💧", top: "30%", size: 13, opacity: 0.35, delay: "-11s", duration: "35s" },
    { emoji: "🫧", top: "42%", size: 17, opacity: 0.40, delay: "-27s", duration: "43s" },
    { emoji: "🕊️", top: "54%", size: 18, opacity: 0.48, delay: "-16s", duration: "38s" },
    { emoji: "✨", top: "66%", size: 11, opacity: 0.42, delay: "-31s", duration: "34s" },

    { emoji: "🌧️", top: "77%", size: 18, opacity: 0.42, delay: "-8s",  duration: "44s" },
    { emoji: "🩵", top: "86%", size: 13, opacity: 0.33, delay: "-20s", duration: "37s" },
    { emoji: "🪶", top: "13%", size: 16, opacity: 0.45, delay: "-34s", duration: "48s" },
  ],

  cozy: [
    { emoji: "🐾", top: "7%",  size: 16, opacity: 0.42, delay: "-4s",  duration: "34s" },
    { emoji: "🧶", top: "18%", size: 18, opacity: 0.40, delay: "-19s", duration: "40s" },
    { emoji: "🐾", top: "30%", size: 14, opacity: 0.45, delay: "-10s", duration: "37s" },
    { emoji: "☕", top: "42%", size: 17, opacity: 0.38, delay: "-25s", duration: "42s" },
    { emoji: "💗", top: "54%", size: 14, opacity: 0.35, delay: "-14s", duration: "35s" },
    { emoji: "🪴", top: "66%", size: 18, opacity: 0.40, delay: "-30s", duration: "44s" },

    { emoji: "🐟", top: "77%", size: 15, opacity: 0.35, delay: "-7s",  duration: "38s" },
    { emoji: "🛋️", top: "86%", size: 18, opacity: 0.35, delay: "-22s", duration: "41s" },
    { emoji: "🐈", top: "13%", size: 17, opacity: 0.38, delay: "-33s", duration: "46s" },
  ],
};

  const items = DECOR[themeKey] || DECOR.sakura;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {items.map((item, index) => (
        <div
          key={`${themeKey}-${index}`}
          className="mwt-drift"
          style={{
            position: "absolute",
            top: item.top,
            left: "-50px",
            fontSize: item.size,
            opacity: item.opacity,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

const NAV = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "calendar", label: "Calendar", emoji: "🗓️" },
  { id: "insights", label: "Insights", emoji: "📊" },
  { id: "journal", label: "Journal", emoji: "📝" },
  { id: "garden", label: "Garden", emoji: "🌿" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

export function BottomNav({ theme, tab, setTab }) {
  const handleSelect = (nextTab) => {
    setTab(nextTab);
  };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: theme.paper, borderTop: `1px solid ${theme.border}`, zIndex: 9999, pointerEvents: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", padding: "8px 6px", overflowX: "auto", pointerEvents: "auto" }} className="mwt-scrollbar-none">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => handleSelect(n.id)}
            onMouseDown={(e) => e.preventDefault()}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, background: "none", border: "none", cursor: "pointer", padding: "4px 2px", color: tab === n.id ? theme.accent : theme.ink, opacity: tab === n.id ? 1 : 0.55, pointerEvents: "auto", WebkitTapHighlightColor: "transparent" }}
          >
            <span style={{ fontSize: 19 }}>{n.emoji}</span>
            <span style={{ fontSize: 9.5, fontWeight: 800 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
