// import React, {
//   useEffect,
//   useState,
// } from "react";
// import TimePicker from "../components/TimePicker.jsx";
// import {
//   Panel,
//   SectionTitle,
//   Chip,
//   Toggle,
// } from "../components/ui.jsx";

// import { THEMES } from "../theme/tokens.js";
// import {
//   DEFAULT_CATEGORIES,
//   uid,
// } from "../constants.js";

// import { useAuth } from "../hooks/useAuth.jsx";


// export default function SettingsView({
//   theme,
//   settings,
//   onChange,
// }) {
//   const { user, logout } = useAuth();

//   const [newHabit, setNewHabit] =
//     useState("");


//   /* -------------------------------------------------------
//      Cycle visibility
//   ------------------------------------------------------- */

//   const cycleVisible =
//     user?.gender === "female";


//   /* -------------------------------------------------------
//      Hydration draft
     
//      IMPORTANT:
//      We don't save every keypress.
//      User can type "2500" without the UI
//      fighting with the server.
//   ------------------------------------------------------- */

//   const hydration =
//     settings.hydration || {};

//   const [hydrationDraft, setHydrationDraft] =
//     useState({
//       targetMl:
//         hydration.targetMl ?? 2500,

//       cupMl:
//         hydration.cupMl ?? 250,

//       minIntervalMin:
//         hydration.minIntervalMin ?? 30,

//       maxIntervalMin:
//         hydration.maxIntervalMin ?? 60,

//       repeatEveryMin:
//         hydration.repeatEveryMin ?? "",
//     });


//   /* -------------------------------------------------------
//      Keep draft synchronized after settings load
//   ------------------------------------------------------- */

//   useEffect(() => {
//     const h =
//       settings.hydration || {};

//     setHydrationDraft({
//       targetMl:
//         h.targetMl ?? 2500,

//       cupMl:
//         h.cupMl ?? 250,

//       minIntervalMin:
//         h.minIntervalMin ?? 30,

//       maxIntervalMin:
//         h.maxIntervalMin ?? 60,

//       repeatEveryMin:
//         h.repeatEveryMin ?? "",
//     });
//   }, [settings.hydration]);


//   /* -------------------------------------------------------
//      Helpers
//   ------------------------------------------------------- */

//   const saveHydration = (
//     changes
//   ) => {
//     onChange({
//       ...settings,

//       hydration: {
//         ...settings.hydration,
//         ...changes,
//       },
//     });
//   };


//   const targetMl = Math.max(
//     500,
//     Number(
//       hydrationDraft.targetMl
//     ) || 2500
//   );


//   const cupMl = Math.max(
//     50,
//     Number(
//       hydrationDraft.cupMl
//     ) || 250
//   );


//   const totalSips =
//     Math.ceil(
//       targetMl / cupMl
//     );


//   const liters =
//     targetMl / 1000;


//   /* -------------------------------------------------------
//      Habits
//   ------------------------------------------------------- */

//   const addHabit = () => {
//     if (!newHabit.trim()) return;

//     onChange({
//       ...settings,

//       customHabits: [
//         ...settings.customHabits,

//         {
//           id: uid(),
//           name: newHabit.trim(),
//           emoji: "🌿",
//         },
//       ],
//     });

//     setNewHabit("");
//   };


//   const removeHabit = (id) => {
//     onChange({
//       ...settings,

//       customHabits:
//         settings.customHabits.filter(
//           (h) => h.id !== id
//         ),
//     });
//   };


//   /* =======================================================
//      UI
//   ======================================================= */

//   return (
//     <div className="settings-page">


//       {/* =================================================
//           ACCOUNT
//       ================================================= */}

//       <SectionTitle theme={theme}>
//         ⚙️ Customize
//       </SectionTitle>


//       <Panel
//         theme={theme}
//         style={{
//           marginBottom: 14,
//         }}
//       >
//         <div
//           style={{
//             fontWeight: 800,
//             marginBottom: 4,
//           }}
//         >
//           👋 {user?.name}
//         </div>

//         <div
//           style={{
//             fontSize: 12.5,
//             opacity: 0.6,
//             marginBottom: 10,
//           }}
//         >
//           {user?.email}
//         </div>

//         <button
//           onClick={logout}
//           className="settings-logout"
//           style={{
//             borderColor: theme.border,
//             background: theme.bg,
//             color: theme.ink,
//           }}
//         >
//           Log out
//         </button>
//       </Panel>



//       {/* =================================================
//           THEME
//       ================================================= */}

//       <Panel
//         theme={theme}
//         style={{
//           marginBottom: 14,
//         }}
//       >
//         <div className="settings-section-title">
//           🎨 Theme
//         </div>

//         <div className="settings-chip-row">
//           {Object.entries(THEMES).map(
//             ([key, t]) => (
//               <Chip
//                 key={key}
//                 theme={theme}
//                 active={
//                   settings.theme === key
//                 }
//                 onClick={() =>
//                   onChange({
//                     ...settings,
//                     theme: key,
//                   })
//                 }
//               >
//                 {t.name}
//               </Chip>
//             )
//           )}
//         </div>

//         <div
//           style={{
//             marginTop: 12,
//           }}
//         >
//           <Toggle
//             on={settings.isDark}
//             onClick={() =>
//               onChange({
//                 ...settings,
//                 isDark:
//                   !settings.isDark,
//               })
//             }
//             theme={theme}
//             label="Dark mode"
//           />
//         </div>
//       </Panel>



//       {/* =================================================
//           COMPANION
//       ================================================= */}

//       <Panel
//         theme={theme}
//         style={{
//           marginBottom: 14,
//         }}
//       >
//         <div className="settings-section-title">
//           🐾 Companion
//         </div>

//         <div className="settings-chip-row">
//           <Chip
//             theme={theme}
//             active={
//               settings.companion ===
//               "cat"
//             }
//             onClick={() =>
//               onChange({
//                 ...settings,
//                 companion: "cat",
//               })
//             }
//           >
//             🐱 Cat
//           </Chip>

//           <Chip
//             theme={theme}
//             active={
//               settings.companion ===
//               "dog"
//             }
//             onClick={() =>
//               onChange({
//                 ...settings,
//                 companion: "dog",
//               })
//             }
//           >
//             🐶 Puppy
//           </Chip>
//         </div>

//         <div
//           style={{
//             marginTop: 12,
//           }}
//         >
//           <Toggle
//             on={settings.animationsOn}
//             onClick={() =>
//               onChange({
//                 ...settings,
//                 animationsOn:
//                   !settings.animationsOn,
//               })
//             }
//             theme={theme}
//             label="Animations"
//           />
//         </div>
//       </Panel>



//       {/* =================================================
//           DAILY REMINDERS
//       ================================================= */}

//       <Panel
//         theme={theme}
//         style={{
//           marginBottom: 14,
//         }}
//       >
//         <div className="settings-section-title">
//           🔔 Reminders
//         </div>

//         <Toggle
//           on={
//             settings.reminders
//               ?.enabled
//           }
//           onClick={() =>
//             onChange({
//               ...settings,

//               reminders: {
//                 ...settings.reminders,

//                 enabled:
//                   !settings.reminders
//                     ?.enabled,
//               },
//             })
//           }
//           theme={theme}
//           label="Daily check-in reminder"
//         />

//         {settings.reminders
//           ?.enabled && (
//           <div
//             style={{
//               marginTop: 12,
//             }}
//           >
//             <TimePicker
//   theme={theme}
//   value={settings.reminders?.time || "20:00"}
//   onChange={(time) =>
//     onChange({
//       ...settings,
//       reminders: {
//         ...settings.reminders,
//         time,
//       },
//     })
//   }
//   placeholder="Set reminder time"
// />
// {/* 
//             <p className="settings-help">
//               Uses your browser's
//               notification permission.
//             </p> */}
//           </div>
//         )}
//       </Panel>



//       {/* =================================================
//     HYDRATION
// ================================================= */}

// <Panel
//   theme={theme}
//   style={{
//     marginBottom: 12,
//     padding: 14,
//   }}
// >
//   {/* HEADER */}
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     }}
//   >
//     <div
//       style={{
//         fontSize: 17,
//         fontWeight: 800,
//         color: theme.ink,
//       }}
//     >
//       💧 Hydration
//     </div>

//     <span style={{ fontSize: 20 }}>
//       🌿
//     </span>
//   </div>


//   {/* ENABLE */}
//   <Toggle
//     on={settings.hydration?.enabled}
//     onClick={() =>
//       onChange({
//         ...settings,
//         hydration: {
//           ...settings.hydration,
//           enabled: !settings.hydration?.enabled,
//         },
//       })
//     }
//     theme={theme}
//     label="Adaptive water reminders"
//   />


//   {settings.hydration?.enabled && (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 10,
//         marginTop: 10,
//       }}
//     >

//       {/* =================================================
//           TARGET / GLASS / SUMMARY
//       ================================================= */}

//       <div className="hydration-compact-grid">

//         {/* TARGET */}
//         <div className="hydration-compact-field">
//           <label>Daily target</label>

//           <div className="hydration-compact-input">
//             <input
//               type="number"
//               min="500"
//               step="50"
//               value={hydrationDraft.targetMl}
//               onChange={(e) =>
//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   targetMl: e.target.value,
//                 }))
//               }
//               onBlur={() => {
//                 const value = Math.max(
//                   500,
//                   Number(
//                     hydrationDraft.targetMl
//                   ) || 2500
//                 );

//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   targetMl: value,
//                 }));

//                 saveHydration({
//                   targetMl: value,
//                 });
//               }}
//             />

//             <span>ml</span>
//           </div>

//           <small>
//             {(
//               Number(
//                 hydrationDraft.targetMl || 0
//               ) / 1000
//             ).toFixed(1)} L
//           </small>
//         </div>


//         {/* GLASS */}
//         <div className="hydration-compact-field">
//           <label>Glass size</label>

//           <div className="hydration-compact-input">
//             <input
//               type="number"
//               min="50"
//               step="10"
//               value={hydrationDraft.cupMl}
//               onChange={(e) =>
//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   cupMl: e.target.value,
//                 }))
//               }
//               onBlur={() => {
//                 const value = Math.max(
//                   50,
//                   Number(
//                     hydrationDraft.cupMl
//                   ) || 250
//                 );

//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   cupMl: value,
//                 }));

//                 saveHydration({
//                   cupMl: value,
//                 });
//               }}
//             />

//             <span>ml</span>
//           </div>

//           <small>
//             1 glass
//           </small>
//         </div>


//         {/* CALCULATED */}
//         <div className="hydration-result-box">
//           <div className="hydration-result-icon">
//             💧
//           </div>

//           <div>
//             <strong>
//               {totalSips} glasses
//             </strong>

//             <small>
//               {cupMl} ml × {totalSips}
//             </small>

//             <small>
//               = {liters.toFixed(1)} L
//             </small>
//           </div>
//         </div>

//       </div>


//       {/* =================================================
//           REMINDER WINDOW
//       ================================================= */}

//       <div className="hydration-compact-grid four">

//         {/* START */}
//         <div className="hydration-compact-field">
//           <label>Start</label>

//           <TimePicker
//           theme={theme}
//           value={
//             settings.hydration?.startTime ||
//             "08:00"
//           }
//           onChange={(time) =>
//             saveHydration({
//               startTime: time,
//             })
//           }
//           placeholder="Start time"
//         />
//         </div>


//         {/* END */}
//         <div className="hydration-compact-field">
//           <label>End</label>

//           <TimePicker
//           theme={theme}
//           value={
//             settings.hydration?.endTime ||
//             "20:00"
//           }
//           onChange={(time) =>
//             saveHydration({
//               endTime: time,
//             })
//           }
//           placeholder="End time"
//         />
//         </div>


//         {/* MIN */}
//         <div className="hydration-compact-field">
//           <label>Min gap</label>

//           <div className="hydration-compact-input">
//             <input
//               type="number"
//               min="5"
//               step="5"
//               value={
//                 hydrationDraft.minIntervalMin
//               }
//               onChange={(e) =>
//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   minIntervalMin:
//                     e.target.value,
//                 }))
//               }
//               onBlur={() => {
//                 const value = Math.max(
//                   5,
//                   Number(
//                     hydrationDraft
//                       .minIntervalMin
//                   ) || 30
//                 );

//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   minIntervalMin: value,
//                 }));

//                 saveHydration({
//                   minIntervalMin: value,
//                 });
//               }}
//             />

//             <span>min</span>
//           </div>
//         </div>


//         {/* MAX */}
//         <div className="hydration-compact-field">
//           <label>Max gap</label>

//           <div className="hydration-compact-input">
//             <input
//               type="number"
//               min="5"
//               step="5"
//               value={
//                 hydrationDraft.maxIntervalMin
//               }
//               onChange={(e) =>
//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   maxIntervalMin:
//                     e.target.value,
//                 }))
//               }
//               onBlur={() => {
//                 const minimum = Math.max(
//                   5,
//                   Number(
//                     hydrationDraft
//                       .minIntervalMin
//                   ) || 30
//                 );

//                 const value = Math.max(
//                   minimum,
//                   Number(
//                     hydrationDraft
//                       .maxIntervalMin
//                   ) || 60
//                 );

//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   maxIntervalMin: value,
//                 }));

//                 saveHydration({
//                   minIntervalMin:
//                     minimum,
//                   maxIntervalMin:
//                     value,
//                 });
//               }}
//             />

//             <span>min</span>
//           </div>
//         </div>

//       </div>


//       {/* =================================================
//           ADVANCED SETTINGS — ONE COMPACT ROW
//       ================================================= */}

//       <div className="hydration-advanced-row">

//         {/* ADAPTIVE */}
//         <div className="hydration-adaptive">
//           <Toggle
//             on={
//               settings.hydration?.adaptive
//             }
//             onClick={() =>
//               saveHydration({
//                 adaptive:
//                   !settings.hydration
//                     ?.adaptive,
//               })
//             }
//             theme={theme}
//             label="Adaptive frequency"
//           />
//         </div>


//         {/* REPEAT */}
//         <div className="hydration-compact-field repeat">
//           <label>
//             Repeat
//             <span className="optional-label">
//               optional
//             </span>
//           </label>

//           <div className="hydration-compact-input">
//             <input
//               type="number"
//               min="5"
//               step="5"
//               placeholder="Auto"
//               value={
//                 hydrationDraft.repeatEveryMin ??
//                 ""
//               }
//               onChange={(e) =>
//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   repeatEveryMin:
//                     e.target.value,
//                 }))
//               }
//               onBlur={() => {
//                 const raw =
//                   hydrationDraft
//                     .repeatEveryMin;

//                 const value =
//                   raw === "" ||
//                   raw == null
//                     ? ""
//                     : Math.max(
//                         5,
//                         Number(raw)
//                       );

//                 setHydrationDraft((prev) => ({
//                   ...prev,
//                   repeatEveryMin: value,
//                 }));

//                 saveHydration({
//                   repeatEveryMin: value,
//                 });
//               }}
//             />

//             <span>min</span>
//           </div>
//         </div>


//         {/* QUIET HOURS */}
//         <div className="hydration-quiet-compact">

//           <span className="quiet-label">
//             🌙 Quiet
//           </span>

//           <TimePicker
//           theme={theme}
//           value={
//             settings.hydration?.quietHours?.start ||
//             "22:00"
//           }
//           onChange={(time) =>
//             saveHydration({
//               quietHours: {
//                 ...settings.hydration?.quietHours,
//                 start: time,
//               },
//             })
//           }
//           placeholder="Quiet start"
//         />

//           <span className="quiet-dash">
//             –
//           </span>

//           <TimePicker
//           theme={theme}
//           value={
//             settings.hydration?.quietHours?.end ||
//             "07:00"
//           }
//           onChange={(time) =>
//             saveHydration({
//               quietHours: {
//                 ...settings.hydration?.quietHours,
//                 end: time,
//               },
//             })
//           }
//           placeholder="Quiet end"
//         />

//         </div>

//       </div>

//     </div>
//   )}
// </Panel>



//       {/* =================================================
//           DAILY ESSENTIALS
//       ================================================= */}

//       <Panel
//         theme={theme}
//         style={{
//           marginBottom: 14,
//         }}
//       >

//         <div className="settings-section-title">
//           ⭐ Daily essentials
//         </div>

//         <div
//           style={{
//             fontSize: 12,
//             opacity: 0.55,
//             marginBottom: 12,
//           }}
//         >
//           These count toward your
//           daily streak.
//         </div>


//         <div className="settings-chip-row">

//           {DEFAULT_CATEGORIES
//             .filter(
//               (c) =>
//                 c.id !== "cycle" ||
//                 cycleVisible
//             )
//             .map((c) => {

//               const active =
//                 settings.essentials.includes(
//                   c.id
//                 );

//               return (
//                 <Chip
//                   key={c.id}
//                   theme={theme}
//                   active={active}
//                   onClick={() => {

//                     const has =
//                       settings.essentials.includes(
//                         c.id
//                       );

//                     onChange({
//                       ...settings,

//                       essentials:
//                         has
//                           ? settings.essentials.filter(
//                               (x) =>
//                                 x !==
//                                 c.id
//                             )
//                           : [
//                               ...settings.essentials,
//                               c.id,
//                             ],
//                     });
//                   }}
//                 >
//                   {c.emoji}{" "}
//                   {c.label}
//                 </Chip>
//               );
//             })}

//         </div>


//         {cycleVisible && (
//           <div
//             style={{
//               marginTop: 14,
//             }}
//           >
//             <Toggle
//               on={
//                 settings.cycleEnabled
//               }
//               onClick={() =>
//                 onChange({
//                   ...settings,

//                   cycleEnabled:
//                     !settings.cycleEnabled,
//                 })
//               }
//               theme={theme}
//               label="Show cycle tracker"
//             />
//           </div>
//         )}

//       </Panel>



//       {/* =================================================
//           LOGOUT / END
//       ================================================= */}

//     </div>
//   );
// }

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

      <SectionTitle theme={theme}>
        ⚙️ Customize
      </SectionTitle>


      <Panel
        theme={theme}
        style={{
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          👋 {user?.name}
        </div>

        <div
          style={{
            fontSize: 12.5,
            opacity: 0.6,
            marginBottom: 10,
          }}
        >
          {user?.email}
        </div>

        <button
          onClick={logout}
          className="settings-logout"
          style={{
            borderColor: theme.border,
            background: theme.bg,
            color: theme.ink,
          }}
        >
          Log out
        </button>
      </Panel>



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
          >
            🐱 Cat
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
  {/* HEADER */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    }}
  >
    <div
      style={{
        fontSize: 17,
        fontWeight: 800,
        color: theme.ink,
      }}
    >
      💧 Hydration
    </div>

    <span style={{ fontSize: 20 }}>
      🌿
    </span>
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
    label="Adaptive water reminders"
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