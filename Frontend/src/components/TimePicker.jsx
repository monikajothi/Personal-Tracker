import React, { useEffect, useRef, useState } from "react";

const ClockIcon = ({ color, size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M12 7v5l3.2 2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ color, open }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    style={{
      transform: open
        ? "rotate(180deg)"
        : "rotate(0deg)",
      transition: "transform .15s ease",
      flexShrink: 0,
    }}
  >
    <path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function parseValue(value) {
  if (!value) {
    return {
      hour24: 9,
      minute: 0,
    };
  }

  const [h, m] = value
    .split(":")
    .map(Number);

  return {
    hour24: Number.isFinite(h) ? h : 9,
    minute: Number.isFinite(m) ? m : 0,
  };
}

function to12Hour(hour24) {
  const isAM = hour24 < 12;

  let hour12 = hour24 % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return {
    hour12,
    isAM,
  };
}

function to24Hour(hour12, isAM) {
  let h = hour12 % 12;

  if (!isAM) {
    h += 12;
  }

  return h;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDisplay(hour24, minute) {
  const {
    hour12,
    isAM,
  } = to12Hour(hour24);

  return `${hour12}:${pad(minute)} ${
    isAM ? "AM" : "PM"
  }`;
}

const stepBtn = (theme) => ({
  width: 23,
  height: 23,

  borderRadius: 7,

  border:
    `1px solid ${theme.border}`,

  background:
    theme.bg,

  color:
    theme.ink,

  fontSize: 13,
  fontWeight: 800,

  cursor: "pointer",

  display: "grid",
  placeItems: "center",

  lineHeight: 1,

  padding: 0,

  flexShrink: 0,
});

export default function TimePicker({
  theme,
  value,
  onChange,
  placeholder = "Select a time",
  style,
}) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef(null);

  /* Close outside */
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, [open]);

  const {
    hour24,
    minute,
  } = parseValue(value);

  const {
    hour12,
    isAM,
  } = to12Hour(hour24);

  const formatted = value
    ? formatDisplay(
        hour24,
        minute
      )
    : "";

  /* =========================
     HANDLERS
  ========================= */

  const setHour12 = (nextHour12) => {
    const h =
      ((nextHour12 - 1 + 12) % 12) + 1;

    const h24 =
      to24Hour(h, isAM);

    onChange(
      `${pad(h24)}:${pad(minute)}`
    );
  };

  const setMinute = (nextMinute) => {
    const m =
      ((nextMinute % 60) + 60) % 60;

    onChange(
      `${pad(hour24)}:${pad(m)}`
    );
  };

  const setAmPm = (nextIsAM) => {
    const h24 =
      to24Hour(
        hour12,
        nextIsAM
      );

    onChange(
      `${pad(h24)}:${pad(minute)}`
    );
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

      {/* =========================================
          COMPACT TIME FIELD
      ========================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen((p) => !p)
        }
        style={{
          width: "100%",
          height: 42,

          display: "flex",
          alignItems: "center",

          gap: 8,

          padding:
            "0 10px",

          borderRadius: 12,

          border:
            `1px solid ${
              open
                ? theme.accent
                : theme.border
            }`,

          background:
            theme.paper,

          boxShadow:
            open
              ? `0 0 0 2px ${theme.accent}12`
              : "none",

          cursor:
            "pointer",

          textAlign:
            "left",

          fontFamily:
            "inherit",

          transition:
            "all .15s ease",
        }}
      >

        {/* Small clock */}

        <div
          style={{
            width: 27,
            height: 27,

            borderRadius: 8,

            display: "grid",
            placeItems: "center",

            background:
              theme.soft,

            flexShrink: 0,
          }}
        >
          <ClockIcon
            color={
              theme.accent
            }
            size={14}
          />
        </div>


        {/* Time */}

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.1,

              fontWeight: 800,

              color:
                theme.ink,

              whiteSpace:
                "nowrap",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              opacity:
                formatted
                  ? 1
                  : 0.45,
            }}
          >
            {formatted ||
              placeholder}
          </div>

          <div
            style={{
              fontSize: 8.5,

              marginTop: 2,

              color:
                theme.ink,

              opacity: 0.42,

              fontWeight: 600,
            }}
          >
            {formatted
              ? "12-hour clock"
              : "Choose time"}
          </div>
        </div>


        <ChevronIcon
          color={theme.ink}
          open={open}
        />

      </button>


      {/* =========================================
          COMPACT POPUP
      ========================================= */}

      {open && (
        <div
          style={{
            position: "absolute",

            zIndex: 100,

            top:
              "calc(100% + 5px)",

            left: "50%",

            transform:
              "translateX(-50%)",

            width: 210,

            padding: 10,

            borderRadius: 13,

            background:
              theme.paper,

            border:
              `1px solid ${theme.border}`,

            boxShadow:
              "0 12px 28px rgba(0,0,0,.12)",

            animation:
              "mwt-time-in .14s ease-out",

            boxSizing:
              "border-box",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",

              marginBottom: 8,

              padding:
                "0 2px",
            }}
          >

            <span
              style={{
                fontSize: 9,

                fontWeight: 800,

                textTransform:
                  "uppercase",

                letterSpacing:
                  ".04em",

                color:
                  theme.ink,

                opacity: 0.45,
              }}
            >
              Select time
            </span>

            <span
              style={{
                fontSize: 10.5,

                fontWeight: 800,

                color:
                  theme.accent,
              }}
            >
              {formatted}
            </span>

          </div>


          {/* TIME CONTROLS */}

          <div
            style={{
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: 7,
            }}
          >

            {/* HOUR */}

            <div
              style={{
                display: "grid",
                gap: 4,

                textAlign:
                  "center",
              }}
            >

              <div
                style={{
                  fontSize: 8,

                  fontWeight: 800,

                  textTransform:
                    "uppercase",

                  opacity: 0.4,
                }}
              >
                Hour
              </div>

              <div
                style={{
                  display: "flex",

                  alignItems:
                    "center",

                  gap: 3,
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setHour12(
                      hour12 - 1
                    )
                  }
                  style={stepBtn(
                    theme
                  )}
                >
                  −
                </button>

                <span
                  style={{
                    width: 22,

                    textAlign:
                      "center",

                    fontSize: 15,

                    fontWeight: 800,

                    color:
                      theme.ink,

                    fontVariantNumeric:
                      "tabular-nums",
                  }}
                >
                  {hour12}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setHour12(
                      hour12 + 1
                    )
                  }
                  style={stepBtn(
                    theme
                  )}
                >
                  +
                </button>

              </div>

            </div>


            {/* COLON */}

            <span
              style={{
                fontSize: 15,

                fontWeight: 800,

                opacity: 0.3,

                marginTop: 11,
              }}
            >
              :
            </span>


            {/* MINUTE */}

            <div
              style={{
                display: "grid",
                gap: 4,

                textAlign:
                  "center",
              }}
            >

              <div
                style={{
                  fontSize: 8,

                  fontWeight: 800,

                  textTransform:
                    "uppercase",

                  opacity: 0.4,
                }}
              >
                Min
              </div>

              <div
                style={{
                  display: "flex",

                  alignItems:
                    "center",

                  gap: 3,
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setMinute(
                      minute - 5
                    )
                  }
                  style={stepBtn(
                    theme
                  )}
                >
                  −
                </button>

                <span
                  style={{
                    width: 22,

                    textAlign:
                      "center",

                    fontSize: 15,

                    fontWeight: 800,

                    color:
                      theme.ink,

                    fontVariantNumeric:
                      "tabular-nums",
                  }}
                >
                  {pad(minute)}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setMinute(
                      minute + 5
                    )
                  }
                  style={stepBtn(
                    theme
                  )}
                >
                  +
                </button>

              </div>

            </div>


            {/* AM / PM */}

            <div
              style={{
                display: "flex",

                flexDirection:
                  "column",

                marginLeft: 2,

                marginTop: 11,

                border:
                  `1px solid ${theme.border}`,

                borderRadius: 6,

                overflow:
                  "hidden",
              }}
            >

              {[
                {
                  label: "AM",
                  v: true,
                },
                {
                  label: "PM",
                  v: false,
                },
              ].map(
                (option) => {

                  const selected =
                    isAM ===
                    option.v;

                  return (
                    <button
                      key={
                        option.label
                      }
                      type="button"
                      onClick={() =>
                        setAmPm(
                          option.v
                        )
                      }
                      style={{
                        width: 34,

                        height: 18,

                        padding: 0,

                        border:
                          "none",

                        fontSize: 8.5,

                        fontWeight: 800,

                        cursor:
                          "pointer",

                        background:
                          selected
                            ? theme.accent
                            : theme.bg,

                        color:
                          selected
                            ? "#fff"
                            : theme.ink,
                      }}
                    >
                      {
                        option.label
                      }
                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>
      )}

      <style>
        {`
          @keyframes mwt-time-in {
            from {
              opacity: 0;
              transform:
                translateX(-50%)
                translateY(-3px)
                scale(.98);
            }

            to {
              opacity: 1;
              transform:
                translateX(-50%)
                translateY(0)
                scale(1);
            }
          }
        `}
      </style>

    </div>
  );
}