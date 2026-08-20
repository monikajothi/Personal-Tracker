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
    <div
  ref={containerRef}
  style={{
    position: "relative",
    width: "100%",
    ...style,
  }}
>
  {/* TIME FIELD */}
  <button
    type="button"
    onClick={() => setOpen((prev) => !prev)}
    style={{
      width: "100%",
      minHeight: 56,
      display: "flex",
      alignItems: "center",
      gap: 12,

      padding: "8px 12px",

      borderRadius: 14,
      border: `1px solid ${
        open ? theme.accent : theme.border
      }`,

      background: theme.paper,

      boxShadow: open
        ? `0 0 0 3px ${theme.accent}18`
        : "0 2px 8px rgba(0,0,0,0.035)",

      cursor: "pointer",
      textAlign: "left",

      transition:
        "border-color .18s ease, box-shadow .18s ease, transform .12s ease",

      fontFamily: "inherit",
    }}
  >
    {/* ICON */}
    <div
      style={{
        width: 38,
        height: 38,
        flexShrink: 0,

        display: "grid",
        placeItems: "center",

        borderRadius: 11,

        background: `${theme.accent}12`,
        color: theme.accent,

        fontSize: 17,
      }}
    >
      🕒
    </div>

    {/* TEXT */}
    <div
      style={{
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1.2,
          color: theme.ink,

          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {formatted || placeholder}
      </div>

      <div
        style={{
          marginTop: 3,

          fontSize: 10.5,
          fontWeight: 600,

          color: theme.ink,
          opacity: 0.48,
        }}
      >
        {formatted
          ? "12-hour format"
          : "Select a time"}
      </div>
    </div>

    {/* CHEVRON */}
    <div
      style={{
        flexShrink: 0,

        width: 26,
        height: 26,

        display: "grid",
        placeItems: "center",

        borderRadius: 8,

        background: theme.soft,

        color: theme.ink,
        opacity: 0.55,

        fontSize: 12,

        transform: open
          ? "rotate(180deg)"
          : "rotate(0deg)",

        transition: "transform .2s ease",
      }}
    >
      ↓
    </div>
  </button>


  {/* =================================================
      DROPDOWN
  ================================================= */}

  {open && (
    <div
      style={{
        position: "absolute",

        zIndex: 100,

        top: "calc(100% + 7px)",
        left: 0,

        width: "100%",
        minWidth: 280,

        padding: 12,

        borderRadius: 16,

        background: theme.paper,

        border: `1px solid ${theme.border}`,

        boxShadow:
          "0 18px 45px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.04)",

        animation:
          "mwt-time-picker-in .16s ease-out",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          marginBottom: 10,
          padding: "2px 2px 4px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: theme.ink,
          }}
        >
          Select time
        </div>

        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: theme.accent,
          }}
        >
          {formatted || "--:--"}
        </div>
      </div>


      {/* HOUR + MINUTE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr .7fr",
          gap: 10,
        }}
      >

        {/* HOUR */}
        <div>
          <div
            style={{
              marginBottom: 6,

              fontSize: 10,
              fontWeight: 800,

              color: theme.ink,
              opacity: 0.5,

              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Hour
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: 5,
            }}
          >
            {Array.from(
              { length: 12 },
              (_, i) => i + 1
            ).map((h) => {
              const selected = hour === h;

              return (
                <button
                  key={h}
                  type="button"
                  onClick={() =>
                    handleHour(h)
                  }
                  style={{
                    height: 32,

                    borderRadius: 8,

                    border: selected
                      ? `1px solid ${theme.accent}`
                      : `1px solid ${theme.border}`,

                    background: selected
                      ? theme.accent
                      : theme.bg,

                    color: selected
                      ? "#fff"
                      : theme.ink,

                    fontSize: 11,
                    fontWeight: 800,

                    cursor: "pointer",

                    transition:
                      "all .12s ease",
                  }}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>


        {/* MINUTE */}
        <div>
          <div
            style={{
              marginBottom: 6,

              fontSize: 10,
              fontWeight: 800,

              color: theme.ink,
              opacity: 0.5,

              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            Minute
          </div>

          <select
            value={minute}
            onChange={(e) =>
              handleMinute(
                Number(e.target.value)
              )
            }
            style={{
              width: "100%",
              height: 32,

              padding: "0 9px",

              borderRadius: 8,

              border:
                `1px solid ${theme.border}`,

              background: theme.bg,
              color: theme.ink,

              fontSize: 11,
              fontWeight: 800,

              outline: "none",
              cursor: "pointer",
            }}
          >
            {Array.from(
              { length: 12 },
              (_, i) => i * 5
            ).map((m) => (
              <option
                key={m}
                value={m}
              >
                {String(m).padStart(
                  2,
                  "0"
                )}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* AM / PM */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",

          gap: 6,

          marginTop: 10,

          padding: 4,

          borderRadius: 10,

          background: theme.bg,
        }}
      >
        {[
          {
            label: "AM",
            value: true,
          },
          {
            label: "PM",
            value: false,
          },
        ].map((option) => {
          const selected =
            am === option.value;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                handleAmPm(
                  option.value
                )
              }
              style={{
                height: 30,

                border: "none",
                borderRadius: 7,

                background: selected
                  ? theme.paper
                  : "transparent",

                color: selected
                  ? theme.accent
                  : theme.ink,

                fontSize: 11,
                fontWeight: 800,

                cursor: "pointer",

                boxShadow: selected
                  ? "0 1px 4px rgba(0,0,0,.08)"
                  : "none",

                transition:
                  "all .15s ease",
              }}
            >
              {option.label}
            </button>
          );
        })}
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
