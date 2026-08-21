import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { glassesToMl } from "../utils/hydration.js";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, toNumber(value)));
}

function formatGlasses(value) {
  const n = Math.max(0, toNumber(value));

  if (Number.isInteger(n)) {
    return String(n);
  }

  return n.toFixed(1).replace(/\.0$/, "");
}

export default function HydrationWaterCard({
  data,
  onChange,
  theme,
  settings,
  animationsOn = true,
}) {
  /*
   * =========================================================
   * SETTINGS ARE THE SOURCE OF TRUTH
   * =========================================================
   *
   * No static 2000 ml.
   * No static 250 ml.
   * No static 25 glasses.
   *
   * Everything comes from Settings.
   */

  const hydration = settings?.hydration || {};

  const targetMl = Math.max(
    1,
    toNumber(hydration.targetMl)
  );

  const glassMl = Math.max(
    1,
    toNumber(hydration.cupMl)
  );

  const glasses = Math.max(
    0,
    toNumber(data?.glasses)
  );

  /*
   * Actual consumed amount.
   */
  const currentMl = Math.max(
    0,
    glassesToMl(glasses, settings)
  );

  /*
   * Dynamic target glasses.
   *
   * Example:
   * 2500 / 100 = 25
   * 2500 / 250 = 10
   * 3000 / 250 = 12
   */
  const targetGlasses = Math.max(
    1,
    Math.ceil(targetMl / glassMl)
  );

  /*
   * Visual fill is based on ACTUAL ML,
   * not the glass count.
   */
  const progress = Math.max(
    0,
    currentMl / targetMl
  );

  const visualProgress = Math.min(
    1,
    progress
  );

  const remainingMl = Math.max(
    0,
    targetMl - currentMl
  );

  const overMl = Math.max(
    0,
    currentMl - targetMl
  );

  const reached = currentMl >= targetMl;

  const [feedback, setFeedback] =
    useState("");

  const [animationKey, setAnimationKey] =
    useState(0);

  const [animationType, setAnimationType] =
    useState("");

  const [goalPulse, setGoalPulse] =
    useState(false);

  const feedbackTimer =
    useRef(null);

  const goalTimer =
    useRef(null);

  const glassesRef =
    useRef(glasses);

  useEffect(() => {
    glassesRef.current = glasses;
  }, [glasses]);

  useEffect(() => {
    return () => {
      window.clearTimeout(
        feedbackTimer.current
      );

      window.clearTimeout(
        goalTimer.current
      );
    };
  }, []);

  /*
   * =========================================================
   * STATUS MESSAGE
   * =========================================================
   */

  const statusMessage = useMemo(() => {
    if (overMl > 0) {
      return `${formatNumber(
        overMl
      )} ml beyond your daily target.`;
    }

    if (reached) {
      return "Daily hydration goal reached ✨";
    }

    if (progress >= 0.75) {
      return "Almost there — keep the flow going. 💧";
    }

    if (progress >= 0.5) {
      return "You're more than halfway there. 💧";
    }

    if (progress > 0) {
      return "Nice start — one glass at a time. 💧";
    }

    return "Ready for your first glass? 💧";
  }, [
    overMl,
    reached,
    progress,
  ]);

  /*
   * =========================================================
   * CHANGE WATER
   * =========================================================
   */

  const changeGlasses = (
    nextValue,
    direction
  ) => {
    const previousGlasses =
      glassesRef.current;

    const nextGlasses = Math.max(
      0,
      nextValue
    );

    /*
     * Update ref immediately.
     * This prevents rapid taps from using stale state.
     */
    glassesRef.current =
      nextGlasses;

    /*
     * Same data structure used by
     * the existing hydration system.
     */
    onChange({
      ...(data || {}),
      glasses: nextGlasses,
    });

    /*
     * Animation trigger.
     */
    setAnimationKey(
      (key) => key + 1
    );

    setAnimationType(
      direction
    );

    /*
     * Feedback.
     */
    setFeedback(
      direction === "add"
        ? `+1 glass · ${formatNumber(
            glassMl
          )} ml 💧`
        : `−1 glass · ${formatNumber(
            glassMl
          )} ml`
    );

    window.clearTimeout(
      feedbackTimer.current
    );

    feedbackTimer.current =
      window.setTimeout(
        () => {
          setFeedback("");
        },
        animationsOn
          ? 1500
          : 700
      );

    /*
     * Goal transition.
     */
    const previousMl =
      glassesToMl(
        previousGlasses,
        settings
      );

    const nextMl =
      glassesToMl(
        nextGlasses,
        settings
      );

    if (
      direction === "add" &&
      previousMl < targetMl &&
      nextMl >= targetMl
    ) {
      setGoalPulse(true);

      window.clearTimeout(
        goalTimer.current
      );

      goalTimer.current =
        window.setTimeout(
          () => {
            setGoalPulse(false);
          },
          animationsOn
            ? 1800
            : 350
        );
    }
  };

  const addGlass = () => {
    changeGlasses(
      glassesRef.current + 1,
      "add"
    );
  };

  const removeGlass = () => {
    if (
      glassesRef.current <= 0
    ) {
      return;
    }

    changeGlasses(
      glassesRef.current - 1,
      "remove"
    );
  };

  return (
    <section
      className={`mwt-hydration-water-card ${
        animationsOn
          ? "mwt-water-animated"
          : "mwt-water-static"
      }`}
      style={{
        "--mwt-theme-accent":
          theme?.accent || "#8d78bd",

        "--mwt-theme-soft":
          theme?.soft || "#f2edf8",

        "--mwt-theme-border":
          theme?.border || "#e7deec",

        "--mwt-theme-paper":
          theme?.paper || "#ffffff",

        "--mwt-theme-ink":
          theme?.ink || "#403742",

        "--mwt-water-fill":
          visualProgress,
      }}
    >
      <style>{`

        /* =====================================================
           MAIN CARD
        ===================================================== */

        .mwt-hydration-water-card {
          --water-light: #8ee3ff;
          --water-mid: #35b7ee;
          --water-main: #1399df;
          --water-deep: #0875bd;

          position: relative;

          width: 100%;
          min-width: 0;

          overflow: hidden;

          isolation: isolate;

          border-radius:
            clamp(22px, 6vw, 32px);

          padding:
            clamp(12px, 3vw, 20px);

          color:
            var(--mwt-theme-ink);

          border:
            1px solid
            color-mix(
              in srgb,
              var(--mwt-theme-border) 78%,
              transparent
            );

          background:

            radial-gradient(
              circle at 12% 8%,
              rgba(255,255,255,.88),
              transparent 25%
            ),

            radial-gradient(
              circle at 88% 18%,
              color-mix(
                in srgb,
                var(--mwt-theme-accent) 20%,
                transparent
              ),
              transparent 32%
            ),

            radial-gradient(
              circle at 15% 92%,
              rgba(50,180,235,.10),
              transparent 30%
            ),

            linear-gradient(
              145deg,
              color-mix(
                in srgb,
                var(--mwt-theme-paper) 92%,
                white
              ),
              color-mix(
                in srgb,
                var(--mwt-theme-soft) 78%,
                white
              )
            );

          box-shadow:
            0 18px 50px
            rgba(55,80,100,.08),

            inset 0 1px 0
            rgba(255,255,255,.85);

          backdrop-filter:
            blur(18px);

          -webkit-backdrop-filter:
            blur(18px);
        }

        .mwt-hydration-water-card,
        .mwt-hydration-water-card * {
          box-sizing: border-box;
        }

        /* =====================================================
           WATER ATMOSPHERE
        ===================================================== */

        .mwt-hydration-water-card::before,
        .mwt-hydration-water-card::after {
          content: "";

          position: absolute;

          z-index: -1;

          pointer-events: none;

          border-radius: 50%;

          filter: blur(10px);

          opacity: .55;
        }

        .mwt-hydration-water-card::before {
          width: 48%;
          aspect-ratio: 1;

          right: -14%;
          top: -18%;

          background:
            color-mix(
              in srgb,
              var(--mwt-theme-accent) 24%,
              transparent
            );
        }

        .mwt-hydration-water-card::after {
          width: 44%;
          aspect-ratio: 1;

          left: -18%;
          bottom: -20%;

          background:
            rgba(50,190,240,.13);
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .mwt-water-head {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 14px;
        }

        .mwt-water-kicker {
          font-size: 10px;

          font-weight: 900;

          letter-spacing: .12em;

          text-transform: uppercase;

          opacity: .48;
        }

        .mwt-water-title {
          margin: 3px 0 0;

          font-size:
            clamp(
              20px,
              5.5vw,
              29px
            );

          line-height: 1.05;

          font-weight: 800;
        }

        .mwt-water-subtitle {
          margin-top: 6px;

          font-size:
            clamp(
              10px,
              2.8vw,
              12px
            );

          opacity: .55;
        }

        .mwt-water-count {
          flex: 0 0 auto;

          text-align: right;

          padding: 8px 10px;

          border-radius: 15px;

          background:
            rgba(255,255,255,.50);

          border:
            1px solid
            rgba(255,255,255,.68);

          box-shadow:
            0 7px 20px
            rgba(70,90,110,.06);

          backdrop-filter:
            blur(10px);
        }

        .mwt-water-count strong {
          display: block;

          font-size:
            clamp(
              20px,
              5.5vw,
              27px
            );

          line-height: 1;
        }

        .mwt-water-count span {
          display: block;

          margin-top: 4px;

          font-size: 9.5px;

          opacity: .5;
        }

        /* =====================================================
           WATER SCENE
        ===================================================== */

        .mwt-water-scene {
  position: relative;

  width: min(100%, 320px);

  margin:
    clamp(10px, 3vw, 16px) auto 4px;

  aspect-ratio: 1 / .78;

          display: grid;

          place-items: center;
        }

        .mwt-water-aura {
          position: absolute;

          width: 80%;

          aspect-ratio: 1;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(70,205,250,.18) 0%,
              rgba(70,205,250,.07) 43%,
              transparent 70%
            );

          filter: blur(4px);
        }

        /* =====================================================
           GLASS / WATER ORB
        ===================================================== */

        .mwt-water-orb {
  position: relative;

  width: clamp(
    190px,
    58vw,
    220px
  );

  aspect-ratio: 1;

          border-radius: 50%;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.78);

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.40),
              rgba(255,255,255,.12)
            );

          box-shadow:

            inset 0 1px 0
            rgba(255,255,255,.95),

            inset 0 -18px 35px
            rgba(70,150,190,.06),

            0 22px 55px
            rgba(45,110,145,.13);

          backdrop-filter:
            blur(10px);

          -webkit-backdrop-filter:
            blur(10px);
        }

        .mwt-water-orb::before {
          content: "";

          position: absolute;

          inset: 7%;

          z-index: 8;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.44);

          pointer-events: none;
        }

        /* =====================================================
           LIQUID
        ===================================================== */

        .mwt-water-liquid {
          position: absolute;

          z-index: 2;

          left: -12%;
          right: -12%;

          bottom: -3%;

          height:
            calc(
              var(--mwt-water-fill) * 100% + 5%
            );

          min-height: 7%;

          overflow: hidden;

          background:
            linear-gradient(
              180deg,
              var(--water-light) 0%,
              var(--water-mid) 48%,
              var(--water-main) 76%,
              var(--water-deep) 100%
            );

          border-radius:
            50% 50% 0 0 /
            15% 15% 0 0;

          box-shadow:

            0 -10px 28px
            rgba(75,194,241,.25),

            inset 0 10px 18px
            rgba(255,255,255,.14);

          transition:
            height .72s
            cubic-bezier(.22,1,.36,1);
        }

        /* =====================================================
           NATURAL WATER WAVES
        ===================================================== */

                 .mwt-water-wave {
          position: absolute;
          left: -14%;
          top: -9%;
          width: 128%;
          height: 26%;
          border-radius: 50%;
          background: rgba(225,250,255,.62);
          box-shadow: 0 2px 14px rgba(255,255,255,.28);
          animation: mwt-water-wave 2.3s ease-in-out infinite;
        }

        .mwt-water-wave.wave-two {
          top: 2%;
          opacity: .32;
          transform: scale(.93);
          animation-duration: 3.1s;
          animation-direction: reverse;
        }

        .mwt-water-wave.wave-three {
          top: 9%;
          opacity: .18;
          transform: scale(.85);
          animation-duration: 4.4s;
          animation-delay: -1.2s;
        }

        /* =====================================================
           GLASS REFLECTION
        ===================================================== */

        .mwt-water-shimmer {
          position: absolute;

          z-index: 6;

          top: 13%;

          left: 20%;

          width: 13%;

          height: 38%;

          border-radius: 999px;

          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,.88),
              rgba(255,255,255,0)
            );

          transform:
            rotate(19deg);

          opacity: .64;

          pointer-events: none;
        }

        /* =====================================================
           BUBBLES
        ===================================================== */

        .mwt-water-bubbles {
          position: absolute;

          z-index: 5;

          inset:
            25% 20% 12%;

          pointer-events: none;
        }

                .mwt-water-bubbles span {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(232,251,255,.65);
          animation: mwt-water-bubble 2.4s ease-in-out infinite;
        }
        .mwt-water-bubbles span:nth-child(1) { left: 14%; bottom: 6%; animation-delay: -.4s; }
        .mwt-water-bubbles span:nth-child(2) { left: 48%; bottom: 2%; width: 4px; height: 4px; animation-delay: -1.1s; }
        .mwt-water-bubbles span:nth-child(3) { left: 68%; bottom: 14%; width: 5px; height: 5px; animation-delay: -1.8s; }
        .mwt-water-bubbles span:nth-child(4) { left: 30%; bottom: 20%; width: 4px; height: 4px; animation-delay: -2.3s; }
        .mwt-water-bubbles span:nth-child(5) { left: 80%; bottom: 4%; width: 5px; height: 5px; animation-delay: -.9s; }

        /* =====================================================
           DROPLET
        ===================================================== */

        .mwt-water-drop {
          position: absolute;

          z-index: 20;

          left: 50%;

          top: 9%;

          width: 18px;

          height: 25px;

          border-radius:
            65% 35% 62% 38% /
            55% 45% 55% 45%;

          background:
            linear-gradient(
              145deg,
              #b9f0ff,
              #2aa8e9 68%,
              #087bc7
            );

          box-shadow:
            0 6px 15px
            rgba(20,140,205,.28);

          transform:
            translate(-50%,-12px)
            rotate(45deg)
            scale(.65);

          opacity: 0;

          pointer-events: none;
        }

        .mwt-water-drop.adding {
          animation:
            mwt-water-drop-add
            .82s
            cubic-bezier(.22,1,.36,1);
        }

        .mwt-water-drop.removing {
          animation:
            mwt-water-drop-remove
            .62s
            ease-out;
        }

        /* =====================================================
           RIPPLE
        ===================================================== */

        .mwt-water-ripple {
          position: absolute;

          z-index: 10;

          left: 50%;

          top:
            calc(
              100% -
              (
                var(--mwt-water-fill)
                * 100%
              )
            );

          width: 38%;

          aspect-ratio: 1;

          border:
            2px solid
            rgba(218,249,255,.76);

          border-radius: 50%;

          transform:
            translate(-50%,-50%)
            scale(.25);

          opacity: 0;

          pointer-events: none;
        }

        .mwt-water-ripple.active {
          animation:
            mwt-water-ripple
            .95s
            ease-out;
        }

        /* =====================================================
           GOAL
        ===================================================== */

        .mwt-water-goal {
          position: absolute;

          z-index: 30;

          inset: 0;

          display: grid;

          place-items: center;

          pointer-events: none;
        }

        .mwt-water-goal span {
          padding:
            8px 12px;

          border-radius: 999px;

          color: #fff;

          background:
            rgba(8,123,199,.84);

          box-shadow:
            0 8px 22px
            rgba(8,123,199,.24);

          font-size: 11px;

          font-weight: 900;

          opacity: 0;

          transform:
            translateY(8px)
            scale(.94);
        }

        .mwt-water-goal.active span {
          animation:
            mwt-water-goal
            .9s
            ease-out;
        }

        /* =====================================================
           PROGRESS
        ===================================================== */

        .mwt-water-meta {
          text-align: center;
        }

        .mwt-water-main-ml {
          font-size:
            clamp(
              12px,
              3vw,
              14px
            );

          font-weight: 900;
        }

        .mwt-water-main-ml span {
          opacity: .5;
          font-weight: 700;
        }

        .mwt-water-status {
          min-height: 18px;

          margin-top: 5px;

          font-size: 11px;

          opacity: .55;
        }

        .mwt-water-progress {
          width:
            min(
              100%,
              330px
            );

          height: 7px;

          margin:
            11px auto 0;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(70,150,180,.10);

          border:
            1px solid
            rgba(70,150,180,.08);
        }

        .mwt-water-progress span {
          display: block;

          width:
            calc(
              var(--mwt-water-fill)
              * 100%
            );

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #72d8ff,
              #1898dd,
              #087bc7
            );

          transition:
            width .65s
            cubic-bezier(.22,1,.36,1);
        }

        /* =====================================================
           CONTROLS
        ===================================================== */

        .mwt-water-controls {
          display: flex;

          align-items: center;

          justify-content: center;

          gap:
            clamp(
              10px,
              4vw,
              16px
            );

          margin-top: 18px;
        }

        .mwt-water-control {
          width:
            clamp(
              42px,
              12vw,
              50px
            );

          height:
            clamp(
              42px,
              12vw,
              50px
            );

          flex: 0 0 auto;

          border:
            1px solid
            rgba(80,150,185,.18);

          border-radius: 50%;

          background:
            rgba(255,255,255,.64);

          color:
            #087bc7;

          display: grid;

          place-items: center;

          font-size:
            clamp(
              20px,
              5vw,
              24px
            );

          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 8px 20px
            rgba(60,110,140,.09);

          transition:
            transform .14s ease,
            background .2s ease;

          touch-action: manipulation;

          -webkit-tap-highlight-color:
            transparent;
        }

        .mwt-water-control:active:not(:disabled) {
          transform: scale(.91);
        }

        .mwt-water-control:hover:not(:disabled) {
          background:
            rgba(232,249,255,.9);
        }

        .mwt-water-control:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .mwt-water-add {
          min-width:
            min(
              48vw,
              190px
            );

          min-height: 52px;

          border:
            1px solid
            rgba(255,255,255,.70);

          border-radius: 18px;

          padding:
            0 20px;

          background:
            linear-gradient(
              135deg,
              #65d2ff,
              #199ce0 58%,
              #087bc7
            );

          color: #fff;

          font:
            900 14px/1
            inherit;

          cursor: pointer;

          box-shadow:
            0 12px 26px
            rgba(18,144,205,.24),

            inset 0 1px 0
            rgba(255,255,255,.42);

          transition:
            transform .14s ease;

          touch-action:
            manipulation;

          -webkit-tap-highlight-color:
            transparent;
        }

        .mwt-water-add:active {
          transform: scale(.96);
        }

        /* =====================================================
           FEEDBACK
        ===================================================== */

        .mwt-water-feedback {
          min-height: 19px;

          margin-top: 8px;

          text-align: center;

          font-size: 11px;

          font-weight: 900;

          color: #087bc7;
        }

        .mwt-water-note {
          margin:
            12px 0 0;

          text-align: center;

          font-size: 9.5px;

          line-height: 1.45;

          opacity: .42;
        }

        /* =====================================================
           ANIMATION SWITCH
        ===================================================== */

        .mwt-water-static
        .mwt-water-wave,

        .mwt-water-static
        .mwt-water-wave.wave-two,
        

        .mwt-water-static
        .mwt-water-bubbles span {
          animation: none !important;
        }

        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes mwt-water-wave {
          0%,100% {
            transform: translateX(-7%) scaleY(.78) rotate(-2deg);
          }
          50% {
            transform: translateX(7%) scaleY(1.22) rotate(2deg);
          }
        }

        @keyframes mwt-water-bubble {
          0%,100% { transform: translateY(10px) scale(.8); opacity: 0; }
          15% { opacity: .75; }
          70% { opacity: .4; }
          100% { transform: translateY(-115px) scale(1.1); opacity: 0; }
        }

        @keyframes mwt-water-shimmer-sway {
          0%,100% { transform: rotate(15deg) translateX(0); opacity: .58; }
          50% { transform: rotate(23deg) translateX(3px); opacity: .78; }
        }
        .mwt-water-shimmer {
          position: absolute;
          z-index: 6;
          top: 13%;
          left: 20%;
          width: 13%;
          height: 38%;
          border-radius: 999px;
          background: linear-gradient(to bottom, rgba(255,255,255,.88), rgba(255,255,255,0));
          pointer-events: none;
          animation: mwt-water-shimmer-sway 4s ease-in-out infinite;
        }

        @keyframes mwt-water-drop-add {
  0% {
    opacity: 0;
    transform:
      translate(-50%, -16px)
      rotate(45deg)
      scale(.6);
  }

  10% {
    opacity: 1;
  }

  68% {
    opacity: 1;
    transform:
      translate(-50%, 178px)
      rotate(45deg)
      scale(1);
  }

  82% {
    transform:
      translate(-50%, 187px)
      rotate(45deg)
      scale(1.25, .7);
  }

  100% {
    opacity: 0;
    transform:
      translate(-50%, 190px)
      rotate(45deg)
      scale(.3, .5);
  }
}

        @keyframes mwt-water-drop-remove {

          0% {
            opacity: 0;

            transform:
              translate(-50%,220px)
              rotate(45deg)
              scale(.7);
          }

          25% {
            opacity: .8;
          }

          100% {
            opacity: 0;

            transform:
              translate(-50%,275px)
              rotate(45deg)
              scale(.45);
          }
        }

        @keyframes mwt-water-ripple {
          0% { opacity: .85; transform: translate(-50%,-50%) scale(.2); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(1.9); }
        }
        @keyframes mwt-water-ripple-two {
          0% { opacity: .6; transform: translate(-50%,-50%) scale(.2); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(2.4); }
        }
        .mwt-water-ripple.active {
          animation: mwt-water-ripple 1.1s ease-out;
        }
        .mwt-water-ripple.active.ripple-two {
          animation: mwt-water-ripple-two 1.1s ease-out .15s;
        }

        @keyframes mwt-water-goal {

          0% {
            opacity: 0;

            transform:
              translateY(8px)
              scale(.94);
          }

          25% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

          75% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

          100% {
            opacity: 0;

            transform:
              translateY(-8px)
              scale(1.02);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 380px) {

          .mwt-hydration-water-card {
            padding: 14px;
          }

          .mwt-water-add {
            min-width: 150px;
          }

        }

        @media (min-width: 700px) {

  .mwt-hydration-water-card {
    padding: 26px 30px;
  }

  .mwt-water-scene {
    max-width: 360px;
  }

  .mwt-water-orb {
    width: 220px;
  }

}

        @media (prefers-reduced-motion: reduce) {

          .mwt-hydration-water-card
          .mwt-water-wave,

          .mwt-hydration-water-card
          .mwt-water-bubbles span {
            animation: none !important;
          }

        }

      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mwt-water-head">

        <div>

          <div className="mwt-water-kicker">
            Hydration
          </div>

          <h3 className="mwt-water-title">
            Today's water
          </h3>

          <div className="mwt-water-subtitle">
            One tap adds one configured glass.
          </div>

        </div>

        <div className="mwt-water-count">

          <strong>
            {formatGlasses(glasses)}
            {" / "}
            {targetGlasses}
          </strong>

          <span>
            glasses
          </span>

        </div>

      </div>

      {/* =====================================================
          WATER VISUAL
      ===================================================== */}

      <div className="mwt-water-scene">

        <div className="mwt-water-aura" />

        <div
          key={`drop-${animationKey}`}
          className={`
            mwt-water-drop
            ${
              animationsOn &&
              animationType === "add"
                ? "adding"
                : ""
            }
            ${
              animationsOn &&
              animationType === "remove"
                ? "removing"
                : ""
            }
          `}
          aria-hidden="true"
        />

        <div className="mwt-water-orb">

          <div className="mwt-water-liquid">

            <div className="mwt-water-wave" />

            <div className="mwt-water-wave wave-two" />

            <div className="mwt-water-wave wave-three" />

          </div>

          <div
            className="mwt-water-bubbles"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div
            className="mwt-water-shimmer"
            aria-hidden="true"
          />

          <div
            key={`ripple-${animationKey}`}
            className={`
              mwt-water-ripple
              ${
                animationsOn &&
                animationType === "add"
                  ? "active"
                  : ""
              }
            `}
            aria-hidden="true"
          />
          <div
            key={`ripple2-${animationKey}`}
            className={`mwt-water-ripple ripple-two ${animationsOn && animationType === "add" ? "active" : ""}`}
            aria-hidden="true"
          />

          <div
            className={`
              mwt-water-goal
              ${
                goalPulse
                  ? "active"
                  : ""
              }
            `}
            aria-hidden="true"
          >
            <span>
              ✨ Goal reached
            </span>
          </div>

        </div>

      </div>

      {/* =====================================================
          NUMBERS
      ===================================================== */}

      <div className="mwt-water-meta">

        <div className="mwt-water-main-ml">

          {formatNumber(currentMl)}

          {" ml"}

          <span>
            {" / "}
            {formatNumber(targetMl)}
            {" ml"}
          </span>

        </div>

        <div className="mwt-water-status">

          {overMl > 0
            ? `${formatNumber(
                overMl
              )} ml beyond your target`

            : remainingMl > 0
              ? `${formatNumber(
                  remainingMl
                )} ml remaining`

              : "Goal reached — beautifully done ✨"}

        </div>

        <div
          className="mwt-water-progress"
          aria-hidden="true"
        >
          <span />
        </div>

      </div>

      {/* =====================================================
          + / -
      ===================================================== */}

      <div className="mwt-water-controls">

        <button
          type="button"
          className="mwt-water-control"
          onClick={removeGlass}
          disabled={
            glasses <= 0
          }
          aria-label={
            `Remove one ${formatNumber(
              glassMl
            )} ml glass`
          }
        >
          −
        </button>

        <button
          type="button"
          className="mwt-water-add"
          onClick={addGlass}
          aria-label={
            `Add one ${formatNumber(
              glassMl
            )} ml glass`
          }
        >
          + 1 glass ·{" "}
          {formatNumber(glassMl)}
          {" ml 💧"}
        </button>

      </div>

      {/* =====================================================
          FEEDBACK
      ===================================================== */}

      <div
        className="mwt-water-feedback"
        aria-live="polite"
      >
        {feedback ||
          statusMessage}
      </div>

      <p className="mwt-water-note">

        Target:{" "}
        {formatNumber(targetMl)}
        {" ml · Glass: "}
        {formatNumber(glassMl)}
        {" ml · Goal: "}
        {targetGlasses}
        {" glasses"}

      </p>

    </section>
  );
}