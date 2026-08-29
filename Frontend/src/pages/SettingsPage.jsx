import React, {
  useEffect,
  useState,
} from "react";
import TimePicker from "../components/TimePicker.jsx";
import {
  Panel,
  SectionTitle,
  Chip,
  Toggle,
} from "../components/ui.jsx";

import { THEMES } from "../theme/tokens.js";
import {
  DEFAULT_CATEGORIES,
  uid,
} from "../constants.js";

import { useAuth } from "../hooks/useAuth.jsx";


export default function SettingsView({
  theme,
  settings,
  onChange,
}) {
  const { user, logout } = useAuth();

  const [newHabit, setNewHabit] =
    useState("");


  /* -------------------------------------------------------
     Cycle visibility
  ------------------------------------------------------- */

  const cycleVisible =
    user?.gender === "female";


  /* -------------------------------------------------------
     Hydration draft
     
     IMPORTANT:
     We don't save every keypress.
     User can type "2500" without the UI
     fighting with the server.
  ------------------------------------------------------- */

  const hydration =
    settings.hydration || {};

  const [hydrationDraft, setHydrationDraft] =
    useState({
      targetMl:
        hydration.targetMl ?? 2500,

      cupMl:
        hydration.cupMl ?? 250,

      minIntervalMin:
        hydration.minIntervalMin ?? 30,

      maxIntervalMin:
        hydration.maxIntervalMin ?? 60,

      repeatEveryMin:
        hydration.repeatEveryMin ?? "",
    });


  /* -------------------------------------------------------
     Keep draft synchronized after settings load
  ------------------------------------------------------- */

  useEffect(() => {
    const h =
      settings.hydration || {};

    setHydrationDraft({
      targetMl:
        h.targetMl ?? 2500,

      cupMl:
        h.cupMl ?? 250,

      minIntervalMin:
        h.minIntervalMin ?? 30,

      maxIntervalMin:
        h.maxIntervalMin ?? 60,

      repeatEveryMin:
        h.repeatEveryMin ?? "",
    });
  }, [settings.hydration]);


  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */

  const saveHydration = (
    changes
  ) => {
    onChange({
      ...settings,

      hydration: {
        ...settings.hydration,
        ...changes,
      },
    });
  };

const [profileOpen, setProfileOpen] = useState(false);
  const targetMl = Math.max(
    500,
    Number(
      hydrationDraft.targetMl
    ) || 2500
  );


  const cupMl = Math.max(
    50,
    Number(
      hydrationDraft.cupMl
    ) || 250
  );


  const totalSips =
    Math.ceil(
      targetMl / cupMl
    );


  const liters =
    targetMl / 1000;


  /* -------------------------------------------------------
     Habits
  ------------------------------------------------------- */

  const addHabit = () => {
    if (!newHabit.trim()) return;

    onChange({
      ...settings,

      customHabits: [
        ...settings.customHabits,

        {
          id: uid(),
          name: newHabit.trim(),
          emoji: "🌿",
        },
      ],
    });

    setNewHabit("");
  };


  const removeHabit = (id) => {
    onChange({
      ...settings,

      customHabits:
        settings.customHabits.filter(
          (h) => h.id !== id
        ),
    });
  };


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="settings-page">


      {/* =================================================
          ACCOUNT
      ================================================= */}

      {/* <SectionTitle theme={theme}>
        ⚙️ Customize
      </SectionTitle> */}
<div
  className="font-display"
  style={{
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  }}
>
  {/* Customize title */}
  <div
    style={{
      fontSize: 24,
      fontWeight: 800,
      color: theme.ink,
      lineHeight: 1,
    }}
  >
    ⚙️ Customize
  </div>

  {/* Profile avatar */}
  <button
    type="button"
    onClick={() => setProfileOpen((prev) => !prev)}
    style={{
      width: 36,
      height: 36,
      padding: 0,
      borderRadius: "50%",
      border: `1.5px solid ${theme.accent}`,
      background: theme.soft,
      color: theme.accent,
      display: "grid",
      placeItems: "center",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: "inherit",
      flexShrink: 0,
      boxShadow: "none",
    }}
  >
    {(user?.name?.trim()?.charAt(0) || "U").toUpperCase()}
  </button>

  {/* Compact profile popup */}
  {profileOpen && (
    <div
      style={{
        position: "absolute",
        top: 42,
        right: 0,
        zIndex: 1000,
        width: 190,
        padding: 10,
        borderRadius: 13,
        background: theme.paper,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
      }}
    >
      {/* User info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 7,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: theme.accent,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {(user?.name?.trim()?.charAt(0) || "U").toUpperCase()}
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: theme.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name || "User"}
          </div>

          <div
            style={{
              fontSize: 9.5,
              color: theme.ink,
              opacity: 0.55,
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.email || ""}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: theme.border,
          margin: "6px 0",
        }}
      />

      {/* Small logout */}
      <button
        type="button"
        onClick={logout}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 7,
          padding: "5px 6px",
          background: "transparent",
          color: theme.ink,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 10.5,
          fontWeight: 700,
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.soft;
          e.currentTarget.style.color = theme.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = theme.ink;
        }}
      >
        <span style={{ fontSize: 13 }}>↪</span>
        <span>Log out</span>
      </button>
    </div>
  )}
</div>



      {/* =================================================
          THEME
      ================================================= */}

      <Panel
        theme={theme}
        style={{
          marginBottom: 14,
        }}
      >
        <div className="settings-section-title">
          🎨 Theme
        </div>

        <div className="settings-chip-row">
          {Object.entries(THEMES).map(
            ([key, t]) => (
              <Chip
                key={key}
                theme={theme}
                active={
                  settings.theme === key
                }
                onClick={() =>
                  onChange({
                    ...settings,
                    theme: key,
                  })
                }
                style={{
    padding: "5px 10px",
    fontSize: 11,
    minHeight: 28,
    borderRadius: 10,
  }}
              >
                {t.name}
              </Chip>
            )
          )}
        </div>

        <div
          style={{
            marginTop: 12,
          }}
        >
          <Toggle
            on={settings.isDark}
            onClick={() =>
              onChange({
                ...settings,
                isDark:
                  !settings.isDark,
              })
            }
            theme={theme}
            label="Dark mode"

            style={{
    fontSize: 11,
    minHeight: 28
  }}
          />
        </div>
      </Panel>



      {/* =================================================
          COMPANION
      ================================================= */}

      <Panel
        theme={theme}
        style={{
          marginBottom: 14,
        }}
      >
        <div className="settings-section-title">
          🐾 Companion
        </div>

        <div className="settings-chip-row">
          <Chip
            theme={theme}
            active={
              settings.companion ===
              "cat"
            }
            onClick={() =>
              onChange({
                ...settings,
                companion: "cat",
              })
            }
            style={{
    padding: "5px 10px",
    fontSize: 11,
    minHeight: 28,
    borderRadius: 10,
  }}
          >
            🐱 Kitty
          </Chip>

          <Chip
            theme={theme}
            active={
              settings.companion ===
              "dog"
            }
            onClick={() =>
              onChange({
                ...settings,
                companion: "dog",
              })
            }
            style={{
    padding: "5px 10px",
    fontSize: 11,
    minHeight: 28,
    borderRadius: 10,
  }}
          >
            🐶 Puppy
          </Chip>
        </div>

        <div
          style={{
            marginTop: 12,
          }}
        >
          <Toggle
            on={settings.animationsOn}
            onClick={() =>
              onChange({
                ...settings,
                animationsOn:
                  !settings.animationsOn,
              })
            }
            style={{
    fontSize: 11,
    minHeight: 28,
  }}
            theme={theme}
            label="Animations"
          />
        </div>
      </Panel>



      {/* =================================================
          DAILY REMINDERS
      ================================================= */}

      <Panel
        theme={theme}
        style={{
          marginBottom: 14,
        }}
      >
        <div className="settings-section-title">
          🔔 Reminders
        </div>

        <Toggle
          on={
            settings.reminders
              ?.enabled
          }
          onClick={() =>
            onChange({
              ...settings,

              reminders: {
                ...settings.reminders,

                enabled:
                  !settings.reminders
                    ?.enabled,
              },
            })
          }
          theme={theme}
          label="Daily check-in reminder"
        />

        {settings.reminders
          ?.enabled && (
          <div
            style={{
              marginTop: 12,
            }}
          >
            <TimePicker
  theme={theme}
  value={settings.reminders?.time || "20:00"}
  onChange={(time) =>
    onChange({
      ...settings,
      reminders: {
        ...settings.reminders,
        time,
      },
    })
  }
  placeholder="Set reminder time"
/>
{/* 
            <p className="settings-help">
              Uses your browser's
              notification permission.
            </p> */}
          </div>
        )}
      </Panel>



      {/* =================================================
    HYDRATION
================================================= */}

<Panel
  theme={theme}
  style={{
    marginBottom: 12,
    padding: 14,
  }}
>
  <div className="settings-section-title">
         💧 Hydration
        </div>


  {/* ENABLE */}
  <Toggle
    on={settings.hydration?.enabled}
    onClick={() =>
      saveHydration({
        enabled:
          !settings.hydration?.enabled,
      })
    }
    theme={theme}
    label="Water reminders"
  />


  {settings.hydration?.enabled && (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 10,

    "--hydration-input-color":
      theme.ink,

    "--hydration-input-placeholder":
      theme.ink,

    "--hydration-input-bg":
      theme.isDark
        ? "rgba(255,255,255,0.08)"
        : "#d1cec5ab",

    "--hydration-border":
      theme.border,
  }}
>

      {/* =================================================
          TARGET / GLASS / SUMMARY
      ================================================= */}

      <div className="hydration-compact-grid">

        {/* TARGET */}
        <div className="hydration-compact-field">
          <label>Daily target</label>

          <div className="hydration-compact-input">
            <input
              type="number"
              min="500"
              step="50"
              value={hydrationDraft.targetMl}
              onChange={(e) =>
                setHydrationDraft((prev) => ({
                  ...prev,
                  targetMl: e.target.value,
                }))
              }
              onBlur={() => {
                const value = Math.max(
                  500,
                  Number(
                    hydrationDraft.targetMl
                  ) || 2500
                );

                setHydrationDraft((prev) => ({
                  ...prev,
                  targetMl: value,
                }));

                saveHydration({
                  targetMl: value,
                });
              }}
            />

            <span>ml</span>
          </div>

          <small>
            {(
              Number(
                hydrationDraft.targetMl || 0
              ) / 1000
            ).toFixed(1)} L
          </small>
        </div>


        {/* GLASS */}
        <div className="hydration-compact-field">
          <label>Glass size</label>

          <div className="hydration-compact-input">
            <input
              type="number"
              min="50"
              step="10"
              value={hydrationDraft.cupMl}
              onChange={(e) =>
                setHydrationDraft((prev) => ({
                  ...prev,
                  cupMl: e.target.value,
                }))
              }
              onBlur={() => {
                const value = Math.max(
                  50,
                  Number(
                    hydrationDraft.cupMl
                  ) || 250
                );

                setHydrationDraft((prev) => ({
                  ...prev,
                  cupMl: value,
                }));

                saveHydration({
                  cupMl: value,
                });
              }}
            />

            <span>ml</span>
          </div>

          <small>
            1 glass
          </small>
        </div>


        {/* CALCULATED */}
        <div className="hydration-result-box">
          <div className="hydration-result-icon">
            💧
          </div>

          <div>
            <strong>
              {totalSips} glasses
            </strong>

            <small>
              {cupMl} ml × {totalSips}
            </small>

            <small>
              = {liters.toFixed(1)} L
            </small>
          </div>
        </div>

      </div>


      {/* =================================================
          REMINDER WINDOW
      ================================================= */}

      <div className="hydration-compact-grid four">

        {/* START */}
        <div className="hydration-compact-field">
          <label>Start</label>

          <TimePicker
          theme={theme}
          value={
            settings.hydration?.startTime ||
            "08:00"
          }
          onChange={(time) =>
            saveHydration({
              startTime: time,
            })
          }
          placeholder="Start time"
        />
        </div>


        {/* END */}
        <div className="hydration-compact-field">
          <label>End</label>

          <TimePicker
          theme={theme}
          value={
            settings.hydration?.endTime ||
            "20:00"
          }
          onChange={(time) =>
            saveHydration({
              endTime: time,
            })
          }
          placeholder="End time"
        />
        </div>


        {/* MIN */}
        <div className="hydration-compact-field">
          <label>Min gap</label>

          <div className="hydration-compact-input">
            <input
              type="number"
              min="5"
              step="5"
              value={
                hydrationDraft.minIntervalMin
              }
              onChange={(e) =>
                setHydrationDraft((prev) => ({
                  ...prev,
                  minIntervalMin:
                    e.target.value,
                }))
              }
              onBlur={() => {
                const value = Math.max(
                  5,
                  Number(
                    hydrationDraft
                      .minIntervalMin
                  ) || 30
                );

                setHydrationDraft((prev) => ({
                  ...prev,
                  minIntervalMin: value,
                }));

                saveHydration({
                  minIntervalMin: value,
                });
              }}
            />

            <span>min</span>
          </div>
        </div>


        {/* MAX */}
        <div className="hydration-compact-field">
          <label>Max gap</label>

          <div className="hydration-compact-input">
            <input
              type="number"
              min="5"
              step="5"
              value={
                hydrationDraft.maxIntervalMin
              }
              onChange={(e) =>
                setHydrationDraft((prev) => ({
                  ...prev,
                  maxIntervalMin:
                    e.target.value,
                }))
              }
              onBlur={() => {
                const minimum = Math.max(
                  5,
                  Number(
                    hydrationDraft
                      .minIntervalMin
                  ) || 30
                );

                const value = Math.max(
                  minimum,
                  Number(
                    hydrationDraft
                      .maxIntervalMin
                  ) || 60
                );

                setHydrationDraft((prev) => ({
                  ...prev,
                  maxIntervalMin: value,
                }));

                saveHydration({
                  minIntervalMin:
                    minimum,
                  maxIntervalMin:
                    value,
                });
              }}
            />

            <span>min</span>
          </div>
        </div>

      </div>


      {/* =================================================
          ADVANCED SETTINGS — ONE COMPACT ROW
      ================================================= */}

      <div className="hydration-advanced-row">

        {/* ADAPTIVE */}
        <div className="hydration-adaptive">
          <Toggle
            on={
              settings.hydration?.adaptive
            }
            onClick={() =>
              saveHydration({
                adaptive:
                  !settings.hydration
                    ?.adaptive,
              })
            }
            theme={theme}
            label="Adaptive frequency"
          />
        </div>


        {/* REPEAT */}
        <div className="hydration-compact-field repeat">
          <label>
            Repeat
            <span className="optional-label">
              optional
            </span>
          </label>

          <div className="hydration-compact-input">
            <input
              type="number"
              min="5"
              step="5"
              placeholder="Auto"
              value={
                hydrationDraft.repeatEveryMin ??
                ""
              }
              onChange={(e) =>
                setHydrationDraft((prev) => ({
                  ...prev,
                  repeatEveryMin:
                    e.target.value,
                }))
              }
              onBlur={() => {
                const raw =
                  hydrationDraft
                    .repeatEveryMin;

                const value =
                  raw === "" ||
                  raw == null
                    ? ""
                    : Math.max(
                        5,
                        Number(raw)
                      );

                setHydrationDraft((prev) => ({
                  ...prev,
                  repeatEveryMin: value,
                }));

                saveHydration({
                  repeatEveryMin: value,
                });
              }}
            />

            <span>min</span>
          </div>
        </div>


        {/* QUIET HOURS */}
        <div className="hydration-quiet-compact">

          <span className="quiet-label">
            🌙 Quiet
          </span>

          <TimePicker
          theme={theme}
          value={
            settings.hydration?.quietHours?.start ||
            "22:00"
          }
          onChange={(time) =>
            saveHydration({
              quietHours: {
                ...settings.hydration?.quietHours,
                start: time,
              },
            })
          }
          placeholder="Quiet start"
        />

          <span className="quiet-dash">
            –
          </span>

          <TimePicker
          theme={theme}
          value={
            settings.hydration?.quietHours?.end ||
            "07:00"
          }
          onChange={(time) =>
            saveHydration({
              quietHours: {
                ...settings.hydration?.quietHours,
                end: time,
              },
            })
          }
          placeholder="Quiet end"
        />

        </div>

      </div>

    </div>
  )}
</Panel>



      {/* =================================================
          DAILY ESSENTIALS
      ================================================= */}

      <Panel
        theme={theme}
        style={{
          marginBottom: 14,
        }}
      >

        <div className="settings-section-title">
          ⭐ Daily essentials
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.55,
            marginBottom: 12,
          }}
        >
          These count toward your
          daily streak.
        </div>


        <div className="settings-chip-row">

          {DEFAULT_CATEGORIES
            .filter(
              (c) =>
                c.id !== "cycle" ||
                cycleVisible
            )
            .map((c) => {

              const active =
                settings.essentials.includes(
                  c.id
                );

              return (
                <Chip
                  key={c.id}
                  theme={theme}
                  active={active}
                  onClick={() => {

                    const has =
                      settings.essentials.includes(
                        c.id
                      );

                    onChange({
                      ...settings,

                      essentials:
                        has
                          ? settings.essentials.filter(
                              (x) =>
                                x !==
                                c.id
                            )
                          : [
                              ...settings.essentials,
                              c.id,
                            ],
                    });
                  }}
                  style={{
    padding: "5px 10px",
    fontSize: 11,
    minHeight: 28,
    borderRadius: 10,
  }}
                >
                  {c.emoji}{" "}
                  {c.label}
                </Chip>
              );
            })}

        </div>


        {cycleVisible && (
          <div
            style={{
              marginTop: 14,
            }}
          >
            <Toggle
              on={
                settings.cycleEnabled
              }
              onClick={() =>
                onChange({
                  ...settings,

                  cycleEnabled:
                    !settings.cycleEnabled,
                })
              }
              theme={theme}
              label="Show cycle tracker"
            />
          </div>
        )}

      </Panel>



      {/* =================================================
          LOGOUT / END
      ================================================= */}

    </div>
  );
}