import React from "react";

export const Chip = ({ active, onClick, children, theme, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accent : theme.paper, color: active ? "#fff" : theme.ink,
      fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap", ...style,
    }}
  >{children}</button>
);

export const SectionTitle = ({ children, theme, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, color: theme.ink, margin: 0 }}>{children}</h2>
    {sub && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: theme.ink, opacity: 0.6 }}>{sub}</p>}
  </div>
);

export const Panel = ({ theme, children, style }) => (
  <div style={{ background: theme.paper, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 18, boxShadow: "0 2px 14px rgba(60,40,30,0.05)", ...style }}>
    {children}
  </div>
);

export const btnCircle = (theme) => ({
  width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${theme.border}`,
  background: theme.soft, color: theme.ink, fontSize: 18, fontWeight: 800, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
});

export const Stepper = ({ value, onChange, min = 0, max = 99, unit, theme }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={btnCircle(theme)}>−</button>
    <div style={{ minWidth: 54, textAlign: "center", fontWeight: 800, fontSize: 18, color: theme.ink }}>
      {value}{unit ? <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.6 }}> {unit}</span> : null}
    </div>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={btnCircle(theme)}>+</button>
  </div>
);

export const StarRating = ({ value, onChange, theme, max = 5 }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} onClick={() => onChange(i + 1)} style={{ cursor: "pointer", fontSize: 22 }}>{i < value ? "⭐" : "☆"}</span>
    ))}
  </div>
);

export const Toggle = ({ on, onClick, theme, label }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
    <div style={{ width: 40, height: 22, borderRadius: 999, background: on ? theme.accent : theme.border, position: "relative", transition: "background 0.2s" }}>
      <div style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
    {label && <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>{label}</span>}
  </button>
);

export const Row = ({ label, children, theme }) => (
  <div>
    <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink, opacity: 0.75, marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

export const inputStyle = (theme) => ({
  width: "100%", padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${theme.border}`,
  background: theme.bg, color: theme.ink, fontFamily: "inherit", fontSize: 14, outline: "none",
});

export const formatTime12 = (value) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export const TimeInput = ({ value, onChange, theme, placeholder = "Choose time", style }) => {
  const containerRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [hour, setHour] = React.useState(12);
  const [minute, setMinute] = React.useState(0);
  const [am, setAm] = React.useState(true);
  const formatted = formatTime12(value);

  React.useEffect(() => {
    if (!value) {
      setHour(12);
      setMinute(0);
      setAm(true);
      return;
    }
    const [rawHour, rawMinute] = value.split(":").map(Number);
    if (!Number.isNaN(rawHour) && !Number.isNaN(rawMinute)) {
      setAm(rawHour < 12);
      setHour(rawHour % 12 || 12);
      setMinute(rawMinute);
    }
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const onClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const updateTime = (nextHour, nextMinute, nextAm) => {
    const normalizedHour = nextHour % 12 || 12;
    const hour24 = normalizedHour === 12 ? (nextAm ? 0 : 12) : normalizedHour + (nextAm ? 0 : 12);
    const time = `${String(hour24).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
    onChange(time);
  };

  const handleHour = (value) => {
    setHour(value);
    updateTime(value, minute, am);
  };
  const handleMinute = (value) => {
    setMinute(value);
    updateTime(hour, value, am);
  };
  const handleAmPm = (value) => {
    setAm(value);
    updateTime(hour, minute, value);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          minWidth: 180,
          borderRadius: 18,
          border: `1.5px solid ${theme.border}`,
          background: theme.bg,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: theme.soft,
          display: "grid",
          placeItems: "center",
          fontSize: 18,
        }}>
          🕒
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {formatted || placeholder}
          </div>
          <div style={{ fontSize: 12, color: theme.ink, opacity: 0.65, marginTop: 2 }}>
            {formatted ? "12-hour clock" : "Tap to choose a time"}
          </div>
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute",
          zIndex: 10,
          top: "calc(100% + 10px)",
          left: 0,
          width: 280,
          borderRadius: 18,
          background: theme.paper,
          border: `1.5px solid ${theme.border}`,
          boxShadow: "0 14px 32px rgba(0,0,0,0.12)",
          padding: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 12.5, color: theme.ink, opacity: 0.75 }}>Hour</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <button key={h} onClick={() => handleHour(h)} style={{
                    borderRadius: 10,
                    border: `1px solid ${hour === h ? theme.accent : theme.border}`,
                    background: hour === h ? theme.accent : theme.soft,
                    color: hour === h ? "#fff" : theme.ink,
                    padding: "8px 0",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>{h}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 12.5, color: theme.ink, opacity: 0.75 }}>Minute</div>
              <select value={minute} onChange={(e) => handleMinute(Number(e.target.value))} style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                border: `1.5px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                appearance: "none",
              }}>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "AM", value: true },
              { label: "PM", value: false },
            ].map((option) => (
              <button key={option.label} onClick={() => handleAmPm(option.value)} style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 14,
                border: `1.5px solid ${am === option.value ? theme.accent : theme.border}`,
                background: am === option.value ? theme.accent : theme.soft,
                color: am === option.value ? "#fff" : theme.ink,
                fontWeight: 700,
                cursor: "pointer",
              }}>{option.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const emojiPick = (theme, active) => ({
  fontSize: 20, padding: "6px 10px", borderRadius: 10, border: `1.5px solid ${active ? theme.accent : theme.border}`,
  background: active ? theme.soft : theme.paper, cursor: "pointer",
});

export const SliderRow = ({ value, onChange, theme }) => (
  <input type="range" min={0} max={4} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ accentColor: theme.accent, width: "100%" }} />
);
