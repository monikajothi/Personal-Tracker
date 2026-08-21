import React from "react";

export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Nunito:wght@400;600;700;800&family=Caveat:wght@500;600;700&display=swap');

    .mwt * { box-sizing: border-box; }
    .mwt { font-family: 'Nunito', sans-serif; }
    .mwt .font-display { font-family: 'Fraunces', serif; }
    .mwt .font-hand { font-family: 'Caveat', cursive; }

    .mwt-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
    .mwt-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }

    @keyframes mwt-pop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.05); opacity: 1;} 100% { transform: scale(1); } }
    @keyframes mwt-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes mwt-drift { 0% { transform: translateX(-10vw); } 100% { transform: translateX(110vw); } }
    @keyframes mwt-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
    @keyframes mwt-fadeup { 0% { opacity: 0; transform: translateY(8px);} 100% { opacity: 1; transform: translateY(0);} }
    @keyframes mwt-fade-down { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(10px); } }
    @keyframes mwt-time-picker-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
    @keyframes mwt-page-enter {
      0% { opacity: 0; transform: translateY(10px) scale(0.985); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .mwt-anim .mwt-pop { animation: mwt-pop 0.35s ease-out; }
    .mwt-anim .mwt-float { animation: mwt-float 3.5s ease-in-out infinite; }
    .mwt-anim .mwt-sway { animation: mwt-sway 4s ease-in-out infinite; transform-origin: bottom center; }
    .mwt-fadeup { animation: mwt-fadeup 0.4s ease-out; }
    .mwt-fade-down { animation: mwt-fade-down 0.9s ease-out forwards; }
    .mwt-page-shell {
      animation: mwt-page-enter 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: opacity, transform;
    }
    
    @keyframes mwt-burst {
  0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0.5); opacity: 0; }
}
    .mwt-anim .mwt-drift { animation: mwt-drift 22s linear infinite; }

    .mwt-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .mwt-card:hover { transform: translateY(-2px); }
    .mwt-scrollbar-none::-webkit-scrollbar { display: none; }

    .mwt-cycle-history-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 130, 150, 0.35) transparent;
}

.mwt-cycle-history-scroll::-webkit-scrollbar {
  width: 5px;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-thumb {
  background: rgba(180, 130, 150, 0.28);
  border-radius: 999px;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(180, 130, 150, 0.48);
}

/* =========================================================
   GLOBAL RESPONSIVE APP LAYOUT
   ========================================================= */

html,
body,
#root {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  overflow-x: hidden;
}

body {
  overflow-x: hidden;
  min-width: 0;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* =========================================================
   APP ROOT
   ========================================================= */

.mwt {
  width: 100%;
  min-width: 0;
  min-height: 100dvh;

  position: relative;

  display: flex;
  flex-direction: column;

  overflow-x: hidden;
}

/* =========================================================
   MAIN PAGE AREA

   IMPORTANT:
   BottomNav is position: fixed, so it does NOT occupy
   normal document space.

   Therefore we reserve space for it here.
   ========================================================= */

.tracker-page {
  width: 100%;
  min-width: 0;

  flex: 1 1 auto;

  display: flex;
  flex-direction: column;

  /*
    TOP
    LEFT / RIGHT
    BOTTOM = space for fixed navigation
  */
  padding:
    16px
    clamp(14px, 3vw, 32px)
    calc(104px + env(safe-area-inset-bottom))
    clamp(14px, 3vw, 32px);

  margin: 0;

  overflow-x: hidden;
}

/* Every actual page is allowed to shrink */
.tracker-page > * {
  width: 100%;
  min-width: 0;
  max-width: 1200px;

  margin-left: auto;
  margin-right: auto;

  /* Make each page fill available vertical space and distribute
     its internal sections evenly (top → middle → bottom) so pages
     appear centered and balanced on different screen heights. */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

/* =========================================================
   IMAGES / MEDIA
   ========================================================= */

.mwt img,
.tracker-page img {
  max-width: 100%;
}

/* =========================================================
   RESPONSIVE WIDTHS
   ========================================================= */

/* Small phones */
@media (max-width: 380px) {

  .tracker-page {
    padding:
      12px
      10px
      calc(96px + env(safe-area-inset-bottom))
      10px;
  }
}

/* Normal phones */
@media (min-width: 381px) and (max-width: 600px) {

  .tracker-page {
    padding:
      14px
      14px
      calc(100px + env(safe-area-inset-bottom))
      14px;
  }
}

/* Large phones / small tablets */
@media (min-width: 601px) and (max-width: 900px) {

  .tracker-page {
    padding:
      20px
      24px
      calc(110px + env(safe-area-inset-bottom))
      24px;
  }
}

/* Tablet / desktop */
@media (min-width: 901px) {

  .tracker-page {
    padding:
      24px
      32px
      calc(110px + env(safe-area-inset-bottom))
      32px;
  }
}

/* =========================================================
   SHORT SCREEN PROTECTION

   Important for landscape phones and short Android screens.
   ========================================================= */

@media (max-height: 700px) {

  .tracker-page {
    padding-top: 10px;

    padding-bottom:
      calc(92px + env(safe-area-inset-bottom));
  }
}

/* =========================================================
   VERY TALL SCREEN

   Don't stretch individual cards.
   Just give the page breathing room.
   ========================================================= */

@media (min-height: 850px) and (max-width: 600px) {

  .tracker-page {
    padding-top: 18px;
  }
}

/* =========================================================
   MODAL / OVERFLOW SAFETY
   ========================================================= */

.mwt button,
.mwt input,
.mwt textarea,
.mwt select {
  max-width: 100%;
}

.mwt textarea {
  resize: vertical;
}

/* =========================================================
   HORIZONTAL SCROLL CONTAINERS
   ========================================================= */

.mwt-scroll {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

/* =========================================================
   FIXED DECORATIONS MUST NEVER CREATE PAGE SPACE
   ========================================================= */

.mwt [style*="position: fixed"] {
  max-width: 100vw;
}
  /* =========================================================
   SETTINGS PAGE
========================================================= */

.settings-page {
  width: 100%;
  max-width: 100%;
  padding-bottom: 110px;
}

.settings-section-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 10px;
  color: inherit;
}

.settings-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-logout {
  padding: 9px 15px;
  border-radius: 12px;
  border: 1.5px solid;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.settings-help {
  margin: 7px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  opacity: 0.55;
}


/* =========================================================
   COMPACT HYDRATION UI
========================================================= */

.hydration-compact-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(150px, 0.85fr);

  gap: 8px;
  width: 100%;
}


.hydration-compact-grid.four {
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
}


.hydration-compact-field {
  min-width: 0;
}


.hydration-compact-field label {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-bottom: 4px;

  font-size: 10.5px;
  font-weight: 800;

  opacity: 0.62;
}


.hydration-compact-field small {
  display: block;

  margin-top: 3px;

  font-size: 9.5px;

  opacity: 0.48;
}


/* =========================================================
   COMPACT INPUT
========================================================= */

/* =========================================================
   COMPACT INPUT
========================================================= */

.hydration-compact-input {
  height: 38px;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;

  border:
    1px solid
    var(--hydration-border, #d9dfd2);

  border-radius: 10px;

  background:
    var(--hydration-input-bg, #fff);

  overflow: hidden;

  box-sizing: border-box;

  transition:
    border-color .15s ease,
    box-shadow .15s ease;
}


.hydration-compact-input:focus-within {
  border-color: #7fa17a;

  box-shadow:
    0 0 0 2px
    rgba(127,161,122,.10);
}


/* =========================================================
   NUMBER INPUT
========================================================= */

.hydration-compact-input input {
  min-width: 0;

  /*
   * IMPORTANT:
   * Do not use width: 100% here.
   *
   * The input and the ml/min suffix are siblings
   * inside a flex container.
   */
  width: 0;

  flex:
    1 1 auto;

  height: 100%;

  padding:
    7px 9px;

  border: 0;
  outline: 0;

  background: transparent;

  color:
    var(
      --hydration-input-color,
      #403742
    );

  -webkit-text-fill-color:
    var(
      --hydration-input-color,
      #403742
    );

  font-family: inherit;

  font-size: 13px;

  font-weight: 700;

  box-sizing: border-box;
}


/* =========================================================
   UNIT — ml / min
========================================================= */

.hydration-compact-input > span {
  flex:
    0 0 auto;

  width: auto;

  min-width: 24px;

  padding:
    0 9px 0 3px;

  font-size: 9px;

  line-height: 1;

  font-weight: 800;

  white-space: nowrap;

  text-align: right;

  opacity: .45;

  box-sizing: border-box;
}


/* =========================================================
   NUMBER SPINNER RESET
========================================================= */

.hydration-compact-input input::-webkit-inner-spin-button,
.hydration-compact-input input::-webkit-outer-spin-button {
  -webkit-appearance: none;

  margin: 0;
}


.hydration-compact-input input[type="number"] {
  appearance: textfield;

  -moz-appearance:
    textfield;
}
/* =========================================================
   CALCULATED RESULT
========================================================= */

.hydration-result-box {
  min-width: 0;

  min-height: 38px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding:
    6px 9px;

  border-radius: 10px;

  background:
    rgba(127,161,122,.08);

  border:
    1px solid
    rgba(127,161,122,.12);
}


.hydration-result-icon {
  width: 28px;
  height: 28px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    rgba(127,161,122,.12);

  font-size: 14px;
}


.hydration-result-box strong {
  display: block;

  font-size: 11px;
  font-weight: 800;
}


.hydration-result-box small {
  display: block;

  margin-top: 1px;

  font-size: 9px;

  opacity: .55;
}


/* =========================================================
   ADVANCED ROW
========================================================= */

.hydration-advanced-row {
  display: grid;

  grid-template-columns:
    minmax(150px, 1fr)
    minmax(110px, .65fr)
    minmax(210px, 1.2fr);

  align-items: end;

  gap: 10px;

  padding-top: 2px;
}


.hydration-adaptive {
  min-width: 0;
}


.hydration-compact-field.repeat {
  min-width: 0;
}


/* =========================================================
   OPTIONAL LABEL
========================================================= */

.optional-label {
  font-size: 8px;

  font-weight: 600;

  opacity: .45;
}


/* =========================================================
   QUIET HOURS
========================================================= */

.hydration-quiet-compact {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 5px;

  min-height: 38px;

  padding:
    3px 7px;

  border-radius: 10px;

  background:
    rgba(120,100,140,.055);

  border:
    1px solid
    rgba(120,100,140,.08);
}


.quiet-label {
  flex-shrink: 0;

  font-size: 10px;
  font-weight: 800;

  opacity: .6;
}


.quiet-dash {
  font-size: 10px;

  opacity: .4;
}


/* Make TimeInput fit compact rows */

.hydration-quiet-compact > * {
  min-width: 0;
}


.hydration-quiet-compact input {
  min-width: 0;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 700px) {

  .hydration-compact-grid {
    grid-template-columns:
      1fr 1fr;

    gap: 7px;
  }


  .hydration-result-box {
    grid-column: 1 / -1;
  }


  .hydration-compact-grid.four {
    grid-template-columns:
      1fr 1fr;
  }


  .hydration-advanced-row {
    grid-template-columns:
      1fr 1fr;
  }


  .hydration-adaptive {
    grid-column: 1 / -1;
  }


  .hydration-quiet-compact {
    grid-column: 1 / -1;
  }

}


/* =========================================================
   SMALL PHONES
========================================================= */

@media (max-width: 430px) {

  .hydration-compact-grid {
    grid-template-columns:
      1fr 1fr;
  }


  .hydration-compact-grid.four {
    grid-template-columns:
      1fr 1fr;
  }


  .hydration-advanced-row {
    grid-template-columns:
      1fr 1fr;
  }


  .hydration-compact-input {
    height: 36px;
  }


  .hydration-compact-input input {
    font-size: 12px;
    padding: 6px 7px;
  }


  .hydration-compact-input span {
    padding-right: 7px;
  }


  .hydration-result-box {
    padding: 5px 7px;
  }


  .hydration-result-icon {
    width: 25px;
    height: 25px;

    font-size: 12px;
  }

}


/* =========================================================
   VERY SMALL PHONES
========================================================= */

@media (max-width: 350px) {

  .hydration-compact-grid,
  .hydration-compact-grid.four,
  .hydration-advanced-row {
    grid-template-columns:
      1fr;
  }


  .hydration-result-box,
  .hydration-adaptive,
  .hydration-quiet-compact {
    grid-column: auto;
  }

}
  `}</style>
);
