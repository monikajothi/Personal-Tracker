import React from "react";

import {
  Row,
  Stepper,
  StarRating,
  Toggle,
  Chip,
  inputStyle,
  TimeInput,
  emojiPick,
  SliderRow,
} from "./ui.jsx";

import { MOODS } from "../constants.js";

import {
  BedIcon,
  ClockIcon,
  MoonIcon,
  StarIcon,
  LightningIcon,
  DropIcon,
  FootprintsIcon,
  ActivityIcon,
  SmileyIcon,
  SmileyMehIcon,
  SmileySadIcon,
  HeartIcon,
  PlantIcon,
  OrangeIcon,
  EggIcon,
  GrainsIcon,
  FirstAidKitIcon,
  HairDryerIcon,
  ToothIcon,
  FlowerLotusIcon,
  SparkleIcon,
  ForkKnifeIcon,
} from "@phosphor-icons/react";


// ============================================================
// ICON STYLE
// ============================================================

const iconStyle = {
  size: 20,
  weight: "duotone",
};


// ============================================================
// SLEEP
// ============================================================

export function SleepForm({ data, onChange, theme }) {
  const d = data || {};

  const calcDuration = (bed, wake) => {
    if (!bed || !wake) return null;

    let [bh, bm] = bed.split(":").map(Number);
    let [wh, wm] = wake.split(":").map(Number);

    let start = bh * 60 + bm;
    let end = wh * 60 + wm;

    if (end <= start) {
      end += 24 * 60;
    }

    return Math.round(((end - start) / 60) * 10) / 10;
  };

  const set = (patch) => {
    const next = { ...d, ...patch };

    next.duration = calcDuration(
      next.bed,
      next.wake
    );

    onChange(next);
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Bedtime */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <BedIcon
              {...iconStyle}
              color={theme.accent}
            />
            Bedtime
          </span>
        }
        theme={theme}
      >
        <TimeInput
          value={d.bed || ""}
          onChange={(t) =>
            set({ bed: t })
          }
          theme={theme}
        />
      </Row>


      {/* Wake up */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <ClockIcon
              {...iconStyle}
              color={theme.accent}
            />
            Wake-up
          </span>
        }
        theme={theme}
      >
        <TimeInput
          value={d.wake || ""}
          onChange={(t) =>
            set({ wake: t })
          }
          theme={theme}
        />
      </Row>


      {/* Duration */}
      {d.duration != null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            color: theme.ink,
            opacity: 0.7,
          }}
        >
          <MoonIcon
            size={18}
            weight="duotone"
            color={theme.accent}
          />

          <span>
            Total sleep:{" "}
            <b>{d.duration}h</b>
          </span>
        </div>
      )}


      {/* Sleep quality */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <StarIcon
              {...iconStyle}
              color={theme.accent}
            />
            Sleep quality
          </span>
        }
        theme={theme}
      >
        <StarRating
          value={d.quality || 0}
          onChange={(v) =>
            set({ quality: v })
          }
          theme={theme}
        />
      </Row>


      {/* Awakenings */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <MoonIcon
              {...iconStyle}
              color={theme.accent}
            />
            Night awakenings
          </span>
        }
        theme={theme}
      >
        <Stepper
          value={d.awakenings || 0}
          onChange={(v) =>
            set({ awakenings: v })
          }
          theme={theme}
          max={20}
        />
      </Row>


      {/* Energy */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <LightningIcon
              {...iconStyle}
              color={theme.accent}
            />
            Energy after waking
          </span>
        }
        theme={theme}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          {[
            {
              icon: SmileySadIcon,
              value: 0,
            },
            {
              icon: SmileyMehIcon,
              value: 1,
            },
            {
              icon: LightningIcon,
              value: 2,
            },
          ].map(({ icon: Icon, value }) => (
            <button
              key={value}
              onClick={() =>
                set({ energy: value })
              }
              style={emojiPick(
                theme,
                d.energy === value
              )}
            >
              <Icon
                size={22}
                weight={
                  d.energy === value
                    ? "fill"
                    : "regular"
                }
              />
            </button>
          ))}
        </div>
      </Row>

    </div>
  );
}


// ============================================================
// WATER / HYDRATION
// ============================================================

export function WaterForm({
  data,
  onChange,
  theme,
  target,
  onTargetChange,
  hydrationTargetMl,
}) {
  const glasses = data?.glasses || 0;

  const pct = Math.min(
    1,
    glasses / (target || 8)
  );

  const stage =
    pct >= 1
      ? "complete"
      : pct >= 0.5
      ? "half"
      : "start";

  const glassMl = Math.round(
    (Number(hydrationTargetMl) || 2000) / 8
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.soft,
            color: theme.accent2,
          }}
        >
          <DropIcon
            size={26}
            weight={
              stage === "complete"
                ? "fill"
                : "duotone"
            }
          />
        </div>


        <div
          style={{
            flex: 1,
          }}
        >

          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: theme.soft,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct * 100}%`,
                height: "100%",
                background: theme.accent2,
                transition:
                  "width 0.3s",
              }}
            />
          </div>

          <div
            style={{
              fontSize: 12.5,
              marginTop: 4,
              opacity: 0.7,
            }}
          >
            {glasses} / {target} glasses today
          </div>

          <div
            style={{
              fontSize: 11.5,
              marginTop: 2,
              opacity: 0.58,
            }}
          >
            1 glass = {glassMl} ml
          </div>

        </div>
      </div>


      {/* Glass count */}
      <Stepper
        value={glasses}
        onChange={(v) =>
          onChange({
            glasses: v,
          })
        }
        theme={theme}
        unit="glasses"
        max={40}
      />


      {/* Daily target */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <DropIcon
              {...iconStyle}
              color={theme.accent2}
            />
            Daily target
          </span>
        }
        theme={theme}
      >
        <Stepper
          value={target}
          onChange={onTargetChange}
          theme={theme}
          unit="glasses"
          min={1}
          max={30}
        />
      </Row>

    </div>
  );
}


// ============================================================
// MOVEMENT
// ============================================================

export function MovementForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Rest day */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <MoonIcon
              {...iconStyle}
              color={theme.accent}
            />
            Rest day
          </span>
        }
        theme={theme}
      >
        <Toggle
          on={!!d.rest}
          onClick={() =>
            onChange({
              ...d,
              rest: !d.rest,
            })
          }
          theme={theme}
        />
      </Row>


      {!d.rest && (
        <>

          {/* Type */}
          <Row
            label={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <ActivityIcon
                  {...iconStyle}
                  color={theme.accent}
                />
                Type
              </span>
            }
            theme={theme}
          >
            <input
              placeholder="walk, gym, yoga, dance…"
              value={d.type || ""}
              onChange={(e) =>
                onChange({
                  ...d,
                  type: e.target.value,
                })
              }
              style={inputStyle(theme)}
            />
          </Row>


          {/* Duration */}
          <Row
            label={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <ClockIcon
                  {...iconStyle}
                  color={theme.accent}
                />
                Duration (min)
              </span>
            }
            theme={theme}
          >
            <Stepper
              value={d.minutes || 0}
              onChange={(v) =>
                onChange({
                  ...d,
                  minutes: v,
                })
              }
              theme={theme}
              unit="min"
              max={600}
            />
          </Row>


          {/* Steps */}
          <Row
            label={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <FootprintsIcon
                  {...iconStyle}
                  color={theme.accent}
                />
                Steps
              </span>
            }
            theme={theme}
          >
            <input
              type="number"
              placeholder="optional"
              value={d.steps ?? ""}
              onChange={(e) =>
                onChange({
                  ...d,
                  steps: e.target.value
                    ? Number(e.target.value)
                    : "",
                })
              }
              style={inputStyle(theme)}
            />
          </Row>

        </>
      )}

    </div>
  );
}


// ============================================================
// MOOD
// ============================================================

export function MoodForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Mood selection */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {MOODS.map((m) => {

          const MoodIcon =
            m.v <= 1
              ? SmileySadIcon
              : m.v === 2
              ? SmileyMehIcon
              : SmileyIcon;

          return (
            <button
              key={m.v}
              onClick={() =>
                onChange({
                  ...d,
                  mood: m.v,
                })
              }
              style={{
                display: "flex",
                flexDirection:
                  "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 4px",
                borderRadius: 14,
                border: `1.5px solid ${
                  d.mood === m.v
                    ? theme.accent
                    : theme.border
                }`,
                background:
                  d.mood === m.v
                    ? theme.soft
                    : theme.paper,
                cursor: "pointer",
                color: theme.ink,
              }}
            >
              <MoodIcon
                size={23}
                weight={
                  d.mood === m.v
                    ? "fill"
                    : "duotone"
                }
                color={
                  d.mood === m.v
                    ? theme.accent
                    : theme.ink
                }
              />

              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: theme.ink,
                }}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>


      {/* Energy */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <LightningIcon
              {...iconStyle}
              color={theme.accent}
            />
            Energy
          </span>
        }
        theme={theme}
      >
        <SliderRow
          value={d.energy ?? 2}
          onChange={(v) =>
            onChange({
              ...d,
              energy: v,
            })
          }
          theme={theme}
        />
      </Row>


      {/* Stress */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <ActivityIcon
              {...iconStyle}
              color={theme.accent}
            />
            Stress
          </span>
        }
        theme={theme}
      >
        <SliderRow
          value={d.stress ?? 2}
          onChange={(v) =>
            onChange({
              ...d,
              stress: v,
            })
          }
          theme={theme}
        />
      </Row>


      {/* Note */}
      <textarea
        placeholder="Optional note…"
        value={d.note || ""}
        onChange={(e) =>
          onChange({
            ...d,
            note: e.target.value,
          })
        }
        style={{
          ...inputStyle(theme),
          minHeight: 60,
          resize: "vertical",
        }}
      />

    </div>
  );
}


// ============================================================
// CYCLE
// ============================================================

export function CycleForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Period */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <DropIcon
              {...iconStyle}
              color={theme.accent}
            />
            Period today?
          </span>
        }
        theme={theme}
      >
        <Toggle
          on={!!d.isPeriod}
          onClick={() =>
            onChange({
              ...d,
              isPeriod: !d.isPeriod,
            })
          }
          theme={theme}
        />
      </Row>


      {d.isPeriod && (
        <>

          {/* Flow */}
          <Row
            label={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <DropIcon
                  {...iconStyle}
                  color={theme.accent}
                />
                Flow
              </span>
            }
            theme={theme}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
              }}
            >
              {[
                "Light",
                "Medium",
                "Heavy",
              ].map((f) => (
                <Chip
                  key={f}
                  theme={theme}
                  active={d.flow === f}
                  onClick={() =>
                    onChange({
                      ...d,
                      flow: f,
                    })
                  }
                >
                  {f}
                </Chip>
              ))}
            </div>
          </Row>


          {/* Cramps */}
          <Row
            label={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <ActivityIcon
                  {...iconStyle}
                  color={theme.accent}
                />
                Cramps
              </span>
            }
            theme={theme}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {[
                "None",
                "Mild",
                "Moderate",
                "Severe",
              ].map((c) => (
                <Chip
                  key={c}
                  theme={theme}
                  active={
                    d.cramps === c
                  }
                  onClick={() =>
                    onChange({
                      ...d,
                      cramps: c,
                    })
                  }
                >
                  {c}
                </Chip>
              ))}
            </div>
          </Row>

        </>
      )}


      {/* Note */}
      <textarea
        placeholder="Optional note…"
        value={d.note || ""}
        onChange={(e) =>
          onChange({
            ...d,
            note: e.target.value,
          })
        }
        style={{
          ...inputStyle(theme),
          minHeight: 50,
        }}
      />


      <p
        style={{
          fontSize: 11.5,
          opacity: 0.55,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <HeartIcon
          size={15}
          weight="duotone"
        />

        This section is private and can
        be hidden from Settings.
      </p>

    </div>
  );
}


// ============================================================
// FOOD
// ============================================================

export function FoodForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  const boxes = [
    {
      key: "veg",
      label: "Vegetables",
      Icon: PlantIcon,
    },
    {
      key: "fruit",
      label: "Fruit",
      Icon: OrangeIcon,
    },
    {
      key: "protein",
      label: "Protein",
      Icon: EggIcon,
    },
    {
      key: "fiber",
      label: "Fiber-rich",
      Icon: GrainsIcon,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >

      {/* Food categories */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {boxes.map(
          ({
            key,
            label,
            Icon,
          }) => (
            <Chip
              key={key}
              theme={theme}
              active={!!d[key]}
              onClick={() =>
                onChange({
                  ...d,
                  [key]: !d[key],
                })
              }
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon
                  size={17}
                  weight={
                    d[key]
                      ? "fill"
                      : "duotone"
                  }
                />
                {label}
              </span>
            </Chip>
          )
        )}
      </div>


      {/* Food note */}
      <textarea
        placeholder="What did I eat today? (brief is fine)"
        value={d.note || ""}
        onChange={(e) =>
          onChange({
            ...d,
            note: e.target.value,
          })
        }
        style={{
          ...inputStyle(theme),
          minHeight: 70,
        }}
      />

    </div>
  );
}


// ============================================================
// SELF CARE
// ============================================================

export function SelfcareForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  const items = [
    {
      key: "am",
      label: "Skincare AM",
      Icon: SparkleIcon,
    },
    {
      key: "pm",
      label: "Skincare PM",
      Icon: MoonIcon,
    },
    {
      key: "hair",
      label: "Hair care",
      Icon: HairDryerIcon,
    },
    {
      key: "dental",
      label: "Dental",
      Icon: ToothIcon,
    },
    {
      key: "relax",
      label: "Relaxation",
      Icon: FlowerLotusIcon,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {items.map(
        ({
          key,
          label,
          Icon,
        }) => (
          <Chip
            key={key}
            theme={theme}
            active={!!d[key]}
            onClick={() =>
              onChange({
                ...d,
                [key]: !d[key],
              })
            }
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon
                size={17}
                weight={
                  d[key]
                    ? "fill"
                    : "duotone"
                }
              />

              {label}
            </span>
          </Chip>
        )
      )}
    </div>
  );
}


// ============================================================
// LEARNING
// ============================================================

export function LearningForm({
  data,
  onChange,
  theme,
}) {
  const d = data || {};

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >

      {/* Completed */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <StarIcon
              {...iconStyle}
              color={theme.accent}
            />
            Completed today?
          </span>
        }
        theme={theme}
      >
        <Toggle
          on={!!d.done}
          onClick={() =>
            onChange({
              ...d,
              done: !d.done,
            })
          }
          theme={theme}
        />
      </Row>


      {/* Time */}
      <Row
        label={
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <ClockIcon
              {...iconStyle}
              color={theme.accent}
            />
            Time spent (min)
          </span>
        }
        theme={theme}
      >
        <Stepper
          value={d.minutes || 0}
          onChange={(v) =>
            onChange({
              ...d,
              minutes: v,
            })
          }
          theme={theme}
          unit="min"
          max={600}
        />
      </Row>


      {/* Topic */}
      <div
        style={{
          position: "relative",
        }}
      >
        <input
          placeholder="e.g. DSA, interview prep, project…"
          value={d.note || ""}
          onChange={(e) =>
            onChange({
              ...d,
              note: e.target.value,
            })
          }
          style={{
            ...inputStyle(theme),
            paddingLeft: 38,
          }}
        />

        <ForkKnifeIcon
          size={18}
          weight="duotone"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform:
              "translateY(-50%)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
      </div>

    </div>
  );
}


// ============================================================
// CATEGORY → FORM MAPPING
// ============================================================

export const CATEGORY_FORMS = {
  sleep: SleepForm,
  movement: MovementForm,
  mood: MoodForm,
  cycle: CycleForm,
  food: FoodForm,
  selfcare: SelfcareForm,
  learning: LearningForm,
};