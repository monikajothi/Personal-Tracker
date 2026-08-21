import React, { useEffect, useRef, useState } from "react";

function parseValue(value) {
  if (!value) return { hour24: 9, minute: 0 };
  const [h, m] = value.split(":").map(Number);
  return { hour24: Number.isFinite(h) ? h : 9, minute: Number.isFinite(m) ? m : 0 };
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function to12(hour24) {
  const isAM = hour24 < 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, isAM };
}
function to24(hour12, isAM) {
  let h = hour12 % 12;
  if (!isAM) h += 12;
  return h;
}
function formatDisplay(hour24, minute) {
  const { hour12, isAM } = to12(hour24);
  return `${hour12}:${pad(minute)} ${isAM ? "AM" : "PM"}`;
}

const R = 88; // clock face radius
const CENTER = 100;

function pointForIndex(i, count, radius) {
  const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

export default function TimePicker({ theme, value, onChange, placeholder = "Select a time", style }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour"); // "hour" | "minute"
  const containerRef = useRef(null);
  const faceRef = useRef(null);
  const dragging = useRef(false);

  const { hour24, minute } = parseValue(value);
  const { hour12, isAM } = to12(hour24);
  const formatted = value ? formatDisplay(hour24, minute) : "";

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [open]);

  useEffect(() => {
    if (open) setMode("hour");
  }, [open]);

  const commitHour = (h12) => {
    const h24 = to24(h12, isAM);
    onChange(`${pad(h24)}:${pad(minute)}`);
  };
  const commitMinute = (m) => {
    onChange(`${pad(hour24)}:${pad(((m % 60) + 60) % 60)}`);
  };
  const commitAmPm = (nextIsAM) => {
    onChange(`${pad(to24(hour12, nextIsAM))}:${pad(minute)}`);
  };

  const angleToValue = (clientX, clientY) => {
    const rect = faceRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let angle = Math.atan2(clientY - cy, clientX - cx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    if (mode === "hour") {
      const idx = Math.round((angle / (2 * Math.PI)) * 12);
      const h12 = idx === 0 ? 12 : idx;
      commitHour(h12);
    } else {
      const idx = Math.round((angle / (2 * Math.PI)) * 60);
      commitMinute(idx === 60 ? 0 : idx);
    }
  };

  const handlePointerDown = (e) => {
    dragging.current = true;
    const p = e.touches ? e.touches[0] : e;
    angleToValue(p.clientX, p.clientY);
  };
  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    const p = e.touches ? e.touches[0] : e;
    angleToValue(p.clientX, p.clientY);
  };
  const handlePointerUp = () => {
    if (dragging.current && mode === "hour") {
      dragging.current = false;
      setMode("minute");
      return;
    }
    dragging.current = false;
  };

  // Hand angle for current selection
  const handAngle =
    mode === "hour"
      ? (hour12 % 12) * (2 * Math.PI / 12) - Math.PI / 2
      : minute * (2 * Math.PI / 60) - Math.PI / 2;
  const handLen = R - 22;
  const handX = CENTER + handLen * Math.cos(handAngle);
  const handY = CENTER + handLen * Math.sin(handAngle);
  const knobX = CENTER + R * Math.cos(handAngle);
  const knobY = CENTER + R * Math.sin(handAngle);

  const hourLabels = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const minuteLabels = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", boxSizing: "border-box", ...style }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          borderRadius: 12,
          border: `1px solid ${open ? theme.accent : theme.border}`,
          background: theme.paper,
          color: theme.ink,
          fontFamily: "inherit",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 800, opacity: formatted ? 1 : 0.45 }}>
          {formatted || placeholder}
        </span>
        <span style={{ fontSize: 15, opacity: 0.5 }}>🕑</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 252,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 18,
            background: theme.paper,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 16px 40px rgba(0,0,0,.16)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Header: big readable time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 12px 12px",
              background: theme.soft,
            }}
          >
            <span
              onClick={() => setMode("hour")}
              style={{
                fontSize: 30,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                cursor: "pointer",
                color: mode === "hour" ? theme.accent : theme.ink,
                opacity: mode === "hour" ? 1 : 0.55,
              }}
            >
              {hour12}
            </span>
            <span style={{ fontSize: 30, fontWeight: 800, opacity: 0.35 }}>:</span>
            <span
              onClick={() => setMode("minute")}
              style={{
                fontSize: 30,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                cursor: "pointer",
                color: mode === "minute" ? theme.accent : theme.ink,
                opacity: mode === "minute" ? 1 : 0.55,
              }}
            >
              {pad(minute)}
            </span>

            <div style={{ display: "flex", flexDirection: "column", marginLeft: 8, borderRadius: 7, overflow: "hidden", border: `1px solid ${theme.border}` }}>
              {[{ l: "AM", v: true }, { l: "PM", v: false }].map((o) => (
                <button
                  key={o.l}
                  type="button"
                  onClick={() => commitAmPm(o.v)}
                  style={{
                    width: 32,
                    height: 18,
                    border: "none",
                    fontSize: 9,
                    fontWeight: 800,
                    cursor: "pointer",
                    background: isAM === o.v ? theme.accent : theme.bg,
                    color: isAM === o.v ? "#fff" : theme.ink,
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Clock face */}
          <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
            <svg
              ref={faceRef}
              width={200}
              height={200}
              viewBox="0 0 200 200"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={() => (dragging.current = false)}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              style={{ touchAction: "none", cursor: "pointer", userSelect: "none" }}
            >
              <circle cx={CENTER} cy={CENTER} r={R + 12} fill={theme.bg} />
              <line x1={CENTER} y1={CENTER} x2={handX} y2={handY} stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round" />
              <circle cx={CENTER} cy={CENTER} r={3.5} fill={theme.accent} />
              <circle cx={knobX} cy={knobY} r={15} fill={theme.accent} />

              {mode === "hour"
                ? hourLabels.map((h, i) => {
                    const { x, y } = pointForIndex(i, 12, R);
                    const selected = hour12 === h;
                    return (
                      <text
                        key={h}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight={800}
                        fill={selected ? "#fff" : theme.ink}
                        style={{ pointerEvents: "none" }}
                      >
                        {h}
                      </text>
                    );
                  })
                : minuteLabels.map((m, i) => {
                    const { x, y } = pointForIndex(i, 12, R);
                    const selected = minute === m || (minute > m - 3 && minute < m + 3 && Math.abs(minute - m) <= 2);
                    const isKnobHere = Math.round(minute / 5) % 12 === i;
                    return (
                      <text
                        key={m}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12.5}
                        fontWeight={700}
                        fill={isKnobHere ? "#fff" : theme.ink}
                        opacity={isKnobHere ? 1 : 0.7}
                        style={{ pointerEvents: "none" }}
                      >
                        {pad(m)}
                      </text>
                    );
                  })}
            </svg>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 14px" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: theme.accent,
                color: "#fff",
                fontWeight: 800,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}