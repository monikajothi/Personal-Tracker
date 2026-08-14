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
  `}</style>
);
