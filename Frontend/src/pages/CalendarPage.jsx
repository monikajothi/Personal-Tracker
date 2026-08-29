import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { analyticsApi } from "../api/index.js";

import {
  Panel,
  SectionTitle,
  btnCircle,
} from "../components/ui.jsx";

import {
  isCategoryDone,
  todayStr,
  DEFAULT_CATEGORIES,
  fmtNiceDate,
} from "../constants.js";


/* =========================================================
   PERIOD COLORS
========================================================= */

const FLOW_COLORS = {
  Light: {
    bg: "#FBE1E5",
    dot: "#E2909E",
  },

  Medium: {
    bg: "#F4B9C4",
    dot: "#D9667A",
  },

  Heavy: {
    bg: "#E8899B",
    dot: "#B84A5E",
  },

  default: {
    bg: "#F4B9C4",
    dot: "#D9667A",
  },
};

const FERTILE_COLOR = "#8FBFB5";
const OVULATION_COLOR = "#3F8F80";


/* =========================================================
   CALENDAR VIEW
========================================================= */

export default function CalendarView({
  theme,
  entries,
  essentials,
  onSelectDay,
  selectedDay,
  cycleEnabled,
  onEditDay,
}) {
  const [cursor, setCursor] =
    useState(() => {
      const today = new Date();

      return {
        y: today.getFullYear(),
        m: today.getMonth(),
      };
    });

  const [cycleData, setCycleData] =
    useState(null);


  /* =======================================================
     LOAD CYCLE HISTORY
  ======================================================= */

  useEffect(() => {
    let ignore = false;

    if (!cycleEnabled) {
      setCycleData(null);

      return () => {
        ignore = true;
      };
    }

    analyticsApi
      .cycleHistory()
      .then((result) => {
        if (!ignore) {
          setCycleData(
            result || null
          );
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(
            "[CalendarPage] cycle history failed",
            err
          );

          setCycleData(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [cycleEnabled]);


  /* =======================================================
     MONTH DATA
  ======================================================= */

  const first =
    new Date(
      cursor.y,
      cursor.m,
      1
    );

  const startWeekday =
    first.getDay();

  const daysInMonth =
    new Date(
      cursor.y,
      cursor.m + 1,
      0
    ).getDate();

  const monthLabel =
    first.toLocaleDateString(
      undefined,
      {
        month: "long",
        year: "numeric",
      }
    );


  /* =======================================================
     FERTILE / OVULATION DAYS
  ======================================================= */

  const {
    fertileDays,
    ovulationDays,
  } = useMemo(() => {
    const fertile = new Set();
    const ovulation = new Set();

    if (
      !cycleEnabled ||
      !cycleData?.hasData ||
      !Array.isArray(
        cycleData.cycles
      )
    ) {
      return {
        fertileDays: fertile,
        ovulationDays: ovulation,
      };
    }

    for (
      const cycle of
      cycleData.cycles
    ) {
      if (
        isISODate(
          cycle.ovulationDay
        )
      ) {
        ovulation.add(
          cycle.ovulationDay
        );
      }

      if (
        !isISODate(
          cycle.fertileWindowStart
        ) ||
        !isISODate(
          cycle.fertileWindowEnd
        )
      ) {
        continue;
      }

      let date =
        cycle.fertileWindowStart;

      for (
        let i = 0;
        i < 12 &&
        date <=
          cycle.fertileWindowEnd;
        i++
      ) {
        fertile.add(date);

        date = shiftDate(
          date,
          1
        );

        if (!date) {
          break;
        }
      }
    }

    return {
      fertileDays: fertile,
      ovulationDays: ovulation,
    };
  }, [
    cycleData,
    cycleEnabled,
  ]);


  /* =======================================================
     DAY STATUS
  ======================================================= */

  const statusFor = (
    dateStr
  ) => {
    const entry =
      entries?.[dateStr];

    if (!entry) {
      return "none";
    }

    if (
      entry.movement?.rest
    ) {
      return "rest";
    }

    const doneCount =
      essentials.filter(
        (id) =>
          isCategoryDone(
            id,
            entry[id]
          )
      ).length;

    if (doneCount === 0) {
      return "none";
    }

    if (
      doneCount >=
      essentials.length
    ) {
      return "full";
    }

    return "partial";
  };


  /* =======================================================
     CALENDAR CELLS
  ======================================================= */

  const cells = [];

  for (
    let i = 0;
    i < startWeekday;
    i++
  ) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(day);
  }


  /* =======================================================
     DAY CLICK
  ======================================================= */

  const handleDayClick = (
    dateStr
  ) => {
    if (
      selectedDay === dateStr
    ) {
      onSelectDay(null);
      return;
    }

    /*
     * IMPORTANT:
     * Selecting a day only shows the
     * inline summary card.
     *
     * It does NOT open DayDetail.
     */
    onSelectDay(dateStr);
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="mwt-no-stretch"
      style={{
        display: "flex",
        flexDirection:
          "column",
        height: "100%",
      }}
    >

      <SectionTitle
        theme={theme}
        sub="Tap a day to see what you logged."
      >
        Calendar
      </SectionTitle>


      <Panel theme={theme}>

        {/* =================================================
            MONTH HEADER
        ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            marginBottom: 14,
          }}
        >

          <button
            type="button"
            onClick={() =>
              setCursor(
                (current) => {
                  const m =
                    current.m - 1;

                  if (m < 0) {
                    return {
                      y:
                        current.y -
                        1,
                      m: 11,
                    };
                  }

                  return {
                    y: current.y,
                    m,
                  };
                }
              )
            }
            style={btnCircle(theme)}
            aria-label="Previous month"
          >
            {"<"}
          </button>


          <div
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: 17,
              color: theme.ink,
            }}
          >
            {monthLabel}
          </div>


          <button
            type="button"
            onClick={() =>
              setCursor(
                (current) => {
                  const m =
                    current.m + 1;

                  if (m > 11) {
                    return {
                      y:
                        current.y +
                        1,
                      m: 0,
                    };
                  }

                  return {
                    y: current.y,
                    m,
                  };
                }
              )
            }
            style={btnCircle(theme)}
            aria-label="Next month"
          >
            {">"}
          </button>

        </div>


        {/* =================================================
            WEEKDAYS
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap: 6,
            marginBottom: 6,
          }}
        >

          {[
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S",
          ].map(
            (day, i) => (
              <div
                key={`${day}-${i}`}
                style={{
                  textAlign:
                    "center",
                  fontSize: 11,
                  fontWeight: 800,
                  opacity: 0.5,
                }}
              >
                {day}
              </div>
            )
          )}

        </div>


        {/* =================================================
            CALENDAR GRID
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(7, 1fr)",
            gap: 6,
          }}
        >

          {cells.map(
            (day, i) => {

              if (!day) {
                return (
                  <div
                    key={`empty-${i}`}
                  />
                );
              }


              const dateStr =
                `${cursor.y}-${String(
                  cursor.m + 1
                ).padStart(
                  2,
                  "0"
                )}-${String(
                  day
                ).padStart(
                  2,
                  "0"
                )}`;


              const isToday =
                dateStr ===
                todayStr();


              const isSelected =
                dateStr ===
                selectedDay;


              const status =
                statusFor(
                  dateStr
                );


              const isPeriod =
                cycleEnabled &&
                entries?.[
                  dateStr
                ]?.cycle
                  ?.isPeriod;


              const flow =
                entries?.[
                  dateStr
                ]?.cycle
                  ?.flow;


              const flowColor =
                isPeriod
                  ? (
                      FLOW_COLORS[
                        flow
                      ] ||
                      FLOW_COLORS.default
                    )
                  : null;


              const isFertile =
                !isPeriod &&
                fertileDays.has(
                  dateStr
                );


              const isOvulation =
                !isPeriod &&
                ovulationDays.has(
                  dateStr
                );


              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() =>
                    handleDayClick(
                      dateStr
                    )
                  }
                  title={
                    isPeriod
                      ? `Period${
                          flow
                            ? ` (${flow})`
                            : ""
                        }`
                      : isOvulation
                      ? "Estimated ovulation"
                      : isFertile
                      ? "Estimated fertile window"
                      : undefined
                  }
                  style={{
                    aspectRatio: "1",

                    borderRadius: 12,

                    border:
                      isSelected
                        ? `2px solid ${theme.ink}`
                        : isToday
                        ? `2px solid ${theme.accent}`
                        : `1px solid ${theme.border}`,

                    background:
                      isPeriod
                        ? flowColor.bg
                        : isFertile
                        ? "rgba(143,191,181,0.18)"
                        : isSelected
                        ? theme.soft
                        : theme.paper,

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    cursor:
                      "pointer",

                    gap: 2,

                    padding: 2,

                    position:
                      "relative",

                    transition:
                      "transform .15s ease, background .15s ease",
                  }}
                >

                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color:
                        isPeriod
                          ? "#5A2A35"
                          : theme.ink,
                    }}
                  >
                    {day}
                  </span>


                  <DayMarker
                    status={status}
                    isPeriod={
                      isPeriod
                    }
                    flowColor={
                      flowColor
                    }
                    isFertile={
                      isFertile
                    }
                    isOvulation={
                      isOvulation
                    }
                  />

                </button>
              );
            }
          )}

        </div>


        {/* =================================================
            LEGEND
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 14,
            fontSize: 11,
            opacity: 0.7,
            flexWrap:
              "wrap",
            alignItems:
              "center",
          }}
        >

          <LegendDot
            color="#62A66E"
            label="Completed"
          />

          <LegendDot
            color="#D7B64C"
            label="Partial"
          />

          <LegendDot
            color={theme.border}
            label="Not tracked"
          />

          {cycleEnabled && (
            <>
              <LegendDot
                color={
                  FLOW_COLORS
                    .default
                    .dot
                }
                label="Period"
              />
            </>
          )}

        </div>


        {/* =================================================
            SELECTED DAY CARD
        ================================================= */}

        {selectedDay && (
          <SelectedDayCard
            theme={theme}
            date={selectedDay}
            entry={
              entries?.[
                selectedDay
              ] || {}
            }
            essentials={
              essentials
            }
            cycleEnabled={
              cycleEnabled
            }
            onEdit={() =>
              onEditDay(
                selectedDay
              )
            }
            onClose={() =>
              onSelectDay(
                null
              )
            }
          />
        )}

      </Panel>
    </div>
  );
}


/* =========================================================
   FLOWER RING
========================================================= */

function FlowerRing({ theme, categories, entry, selected, onSelect }) {
  const size = 176;
  const radius = 62;
  const center = size / 2;
  const loggedCount = categories.filter((c) => hasCategoryData(c.id, entry)).length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <circle
        cx={center}
        cy={center}
        r={28}
        fill={theme.soft}
        stroke={theme.border}
        strokeWidth={1}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={theme.accent}
      >
        {loggedCount}/{categories.length}
      </text>

      {categories.map((category, i) => {
        const angle = ((360 / categories.length) * i - 90) * (Math.PI / 180);
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isSelected = selected === category.id;
        const isLogged = hasCategoryData(category.id, entry);

        return (
          <g
            key={category.id}
            onClick={() => isLogged && onSelect(isSelected ? null : category.id)}
            style={{ cursor: isLogged ? "pointer" : "default" }}
            opacity={isLogged ? 1 : 0.32}
          >
            <circle
              cx={x}
              cy={y}
              r={20}
              fill={isSelected ? theme.soft : theme.paper}
              stroke={theme.border}
              strokeWidth={isSelected ? 2 : 1}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
            >
              {category.emoji}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


/* =========================================================
   SELECTED DAY CARD
========================================================= */

function SelectedDayCard({
  theme,
  date,
  entry,
  essentials,
  cycleEnabled,
  onEdit,
  onClose,
}) {
  const [selected, setSelected] =
    useState(null);

  const categories =
    getVisibleCategories(
      cycleEnabled
    );


  const logged =
    categories.filter(
      (category) =>
        hasCategoryData(
          category.id,
          entry
        )
    );


  const completed =
    essentials.filter(
      (id) =>
        isCategoryDone(
          id,
          entry?.[id]
        )
    ).length;


  const percentage =
    essentials.length
      ? Math.round(
          (
            completed /
            essentials.length
          ) * 100
        )
      : 0;


  const niceDate =
    fmtNiceDate(date);


  const selectedCategory =
    logged.find(
      (c) => c.id === selected
    );


  return (
    <div
      style={{
        marginTop: 14,

        padding: 15,

        borderRadius: 16,

        border:
          `1px solid ${theme.border}`,

        background:
          theme.paper,

        boxShadow:
          "0 8px 22px rgba(0,0,0,0.06)",

        position: "relative",
        zIndex: 2,

        animation:
          "mwt-fadeup .22s ease",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          gap: 10,
          marginBottom: 13,
        }}
      >

        <div
          style={{
            minWidth: 0,
          }}
        >

          <div
            style={{
              fontSize: 9.5,
              fontWeight: 850,
              color:
                theme.accent,
              textTransform:
                "uppercase",
              letterSpacing:
                ".08em",
              marginBottom: 3,
            }}
          >
            Your day
          </div>

          <div
            className="font-display"
            style={{
              fontSize: 17,
              fontWeight: 700,
              color:
                theme.ink,
            }}
          >
            {niceDate}
          </div>

        </div>


        {/* =================================================
            EDIT BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={onEdit}
          style={{
            border:
              `1px solid ${theme.border}`,

            borderRadius:
              999,

            background:
              theme.soft,

            color:
              theme.accent,

            padding:
              "6px 10px",

            fontSize:
              10.5,

            fontWeight:
              850,

            cursor:
              "pointer",

            whiteSpace:
              "nowrap",

            flexShrink:
              0,
          }}
        >
          Edit ✎
        </button>

      </div>


      {/* =================================================
          NOTHING LOGGED
      ================================================= */}

      {logged.length === 0 ? (

        <div
          style={{
            textAlign:
              "center",

            padding:
              "12px 8px 8px",
          }}
        >

          <div
            style={{
              fontSize: 28,
            }}
          >
            🌱
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12.5,
              fontWeight: 800,
              color:
                theme.ink,
            }}
          >
            Nothing logged yet
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              lineHeight: 1.45,
              opacity: 0.55,
            }}
          >
            Tap Edit to open the
            complete day details.
          </div>

        </div>

      ) : (

        <>
          {/* =================================================
              FLOWER RING
          ================================================= */}

          <FlowerRing
            theme={theme}
            categories={categories}
            entry={entry}
            selected={selected}
            onSelect={setSelected}
          />

          <div
            style={{
              marginTop: 10,
              minHeight: 32,
              textAlign: "center",
              fontSize: 11.5,
              fontWeight: 700,
              color: theme.ink,
            }}
          >
            {selectedCategory ? (
              <>
                <span>
                  {selectedCategory.label}:{" "}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    opacity: 0.75,
                  }}
                >
                  {getSummary(
                    selectedCategory.id,
                    entry
                  )}
                </span>
              </>
            ) : (
              <span
                style={{
                  opacity: 0.45,
                  fontWeight: 600,
                }}
              >
                Tap a petal to see
                details
              </span>
            )}
          </div>


          {/* =================================================
              PROGRESS
          ================================================= */}

          <div
            style={{
              marginTop: 12,
              paddingTop: 10,

              borderTop:
                `1px dashed ${theme.border}`,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap: 8,
            }}
          >

            <span
              style={{
                fontSize: 10.5,
                opacity: 0.62,
              }}
            >
              🌷 {completed} /{" "}
              {essentials.length}{" "}
              essentials
            </span>


            <strong
              style={{
                fontSize: 11,
                color:
                  percentage ===
                  100
                    ? "#62A66E"
                    : theme.accent,
              }}
            >
              {percentage}% complete
            </strong>

          </div>

        </>

      )}


      {/* =================================================
          CLOSE CARD
      ================================================= */}

      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",

          marginTop: 10,

          padding:
            "8px 10px",

          border:
            `1px solid ${theme.border}`,

          borderRadius: 11,

          background:
            "transparent",

          color:
            theme.ink,

          fontSize: 10.5,

          fontWeight: 800,

          cursor:
            "pointer",
        }}
      >
        ✓ Done
      </button>

    </div>
  );
}


/* =========================================================
   VISIBLE CATEGORIES
========================================================= */

function getVisibleCategories(
  cycleEnabled
) {
  return DEFAULT_CATEGORIES.filter(
    (category) =>
      category.id !==
        "cycle" ||
      cycleEnabled
  );
}


/* =========================================================
   CATEGORY DATA CHECK
========================================================= */

function hasCategoryData(
  categoryId,
  entry
) {
  const data =
    entry?.[categoryId];

  if (!data) {
    return false;
  }


  if (
    categoryId ===
      "water" &&
    Number(
      data.glasses
    ) <= 0
  ) {
    return false;
  }


  if (
    categoryId ===
      "movement" &&
    data.rest
  ) {
    return true;
  }


  if (
    categoryId ===
      "cycle" &&
    data.isPeriod
  ) {
    return true;
  }


  return isCategoryDone(
    categoryId,
    data
  );
}


/* =========================================================
   SUMMARY TEXT
========================================================= */

function getSummary(
  categoryId,
  entry
) {
  const data =
    entry?.[categoryId];

  if (!data) {
    return "Not logged";
  }


  switch (
    categoryId
  ) {

    case "sleep": {
      if (
        data.duration !==
          undefined &&
        data.duration !==
          null &&
        data.duration !==
          ""
      ) {
        const duration =
          Number(
            data.duration
          );

        if (
          Number.isFinite(
            duration
          )
        ) {
          return `${duration.toFixed(
            1
          )} hours`;
        }
      }

      if (
        data.bed &&
        data.wake
      ) {
        return `${data.bed} → ${data.wake}`;
      }

      return "Logged";
    }


    case "water": {
      const glasses =
        Number(
          data.glasses
        ) || 0;

      return `${glasses} ${
        glasses === 1
          ? "glass"
          : "glasses"
      }`;
    }


    case "movement": {
      if (data.rest) {
        return "Rest day 🌙";
      }

      const parts = [];

      if (data.type) {
        parts.push(
          data.type
        );
      }

      if (data.minutes) {
        parts.push(
          `${data.minutes} min`
        );
      }

      if (data.steps) {
        parts.push(
          `${data.steps} steps`
        );
      }

      return parts.length
        ? parts.join(" · ")
        : "Logged";
    }


    case "mood": {
      const moods = {
        amazing:
          "🥰 Amazing",
        happy:
          "😊 Happy",
        good:
          "🙂 Good",
        okay:
          "😐 Okay",
        low:
          "😔 Low",
        stressed:
          "😣 Stressed",
        tired:
          "😴 Tired",
        irritated:
          "😡 Irritated",
      };

      return (
        moods[data.mood] ||
        "Logged"
      );
    }


    case "cycle": {
      if (
        data.isPeriod
      ) {
        return data.flow
          ? `Period · ${data.flow}`
          : "Period";
      }

      if (
        data.cramps
      ) {
        return "Cycle logged";
      }

      return "Logged";
    }


    case "food": {
      const items = [];

      if (data.veg) {
        items.push("Veg");
      }

      if (data.fruit) {
        items.push("Fruit");
      }

      if (data.protein) {
        items.push(
          "Protein"
        );
      }

      if (data.fiber) {
        items.push(
          "Fiber"
        );
      }

      if (data.note) {
        items.push("Note");
      }

      return items.length
        ? items.join(" · ")
        : "Logged";
    }


    case "selfcare": {
      const hasData =
        Object.values(
          data
        ).some(Boolean);

      return hasData
        ? "Logged ✨"
        : "Not logged";
    }


    case "learning": {
      if (
        data.minutes
      ) {
        return `${data.minutes} min`;
      }

      if (data.done) {
        return "Completed ✓";
      }

      return "Logged";
    }


    default:
      return "Logged";
  }
}


/* =========================================================
   DAY MARKER
========================================================= */

function DayMarker({
  status,
  isPeriod,
  flowColor,
  isFertile,
  isOvulation,
}) {
  if (isPeriod) {
    return (
      <Dot
        color={
          flowColor.dot
        }
      />
    );
  }


  if (isOvulation) {
    return (
      <Dot
        color={
          OVULATION_COLOR
        }
      />
    );
  }


  if (isFertile) {
    return (
      <Dot
        color={
          FERTILE_COLOR
        }
      />
    );
  }


  if (status === "full") {
    return (
      <Dot
        color="#62A66E"
      />
    );
  }


  if (
    status === "partial"
  ) {
    return (
      <Dot
        color="#D7B64C"
      />
    );
  }


  if (
    status === "rest"
  ) {
    return (
      <span
        style={{
          fontSize: 9,
        }}
      >
        R
      </span>
    );
  }


  return (
    <Dot
      color="#D8D0CA"
    />
  );
}


/* =========================================================
   DOT
========================================================= */

function Dot({
  color,
}) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius:
          "50%",
        background:
          color,
        display:
          "inline-block",
      }}
    />
  );
}


/* =========================================================
   LEGEND DOT
========================================================= */

function LegendDot({
  color,
  label,
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",
        alignItems:
          "center",
        gap: 4,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius:
            "50%",
          background:
            color,
          display:
            "inline-block",
        }}
      />

      {label}
    </span>
  );
}


/* =========================================================
   DATE HELPERS
========================================================= */

function shiftDate(
  dateStr,
  n
) {
  if (
    !isISODate(
      dateStr
    )
  ) {
    return null;
  }

  const date =
    new Date(
      dateStr +
        "T00:00:00"
    );

  date.setDate(
    date.getDate() +
      n
  );

  return date
    .toISOString()
    .slice(0, 10);
}


function isISODate(
  value
) {
  return (
    typeof value ===
      "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  );
}