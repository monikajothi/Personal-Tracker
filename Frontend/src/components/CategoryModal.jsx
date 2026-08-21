import React, { useEffect, useState } from "react";

import { CATEGORY_FORMS } from "./forms.jsx";
import HydrationWaterCard from "./HydrationWaterCard.jsx";


export default function CategoryModal({
  theme,
  category,
  dayEntry,
  onClose,
  onSave,
  settings,
  animationsOn,
}) {
  /*
   * =========================================================
   * CATEGORY ID
   * =========================================================
   *
   * category can temporarily be null during React/HMR
   * transitions, so we safely derive the ID.
   */

  const categoryId =
    category?.id || null;


  /*
   * =========================================================
   * LOCAL FORM STATE
   * =========================================================
   */

  const [local, setLocal] =
    useState(() => {
      if (!categoryId) {
        return {};
      }

      return (
        dayEntry?.[categoryId] ||
        {}
      );
    });


  /*
   * =========================================================
   * SYNC WHEN CATEGORY / DAY CHANGES
   * =========================================================
   */

  useEffect(() => {
    if (!categoryId) {
      setLocal({});
      return;
    }

    setLocal(
      dayEntry?.[categoryId] ||
        {}
    );

  }, [
    categoryId,
    dayEntry,
  ]);


  /*
   * =========================================================
   * NORMAL CATEGORY FORM
   * =========================================================
   */

  const Form =
    categoryId
      ? CATEGORY_FORMS[categoryId]
      : null;


  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  const save = (patch) => {
    if (!categoryId) {
      return;
    }

    /*
     * Update modal immediately.
     */
    setLocal(patch);

    /*
     * Pass the change to the existing App
     * save/local-storage flow.
     */
    onSave(
      categoryId,
      patch
    );
  };


  /*
   * =========================================================
   * NULL SAFETY
   * =========================================================
   *
   * This MUST be after the hooks.
   *
   * Prevents:
   * "Cannot read properties of null (reading 'id')"
   *
   * and:
   * "Expected static flag was missing"
   */

  if (!category) {
    return null;
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      onClick={onClose}

      style={{
        position: "fixed",

        inset: 0,

        background:
          "rgba(30,20,15,0.35)",

        zIndex: 10001,

        display: "flex",

        alignItems:
          "flex-end",

        justifyContent:
          "center",
      }}
    >

      <div
        onClick={(event) =>
          event.stopPropagation()
        }

        className="mwt-fadeup"

        style={{
          background:
            theme.paper,

          borderRadius:
            "24px 24px 0 0",

          padding:
            "22px 20px max(36px, env(safe-area-inset-bottom))",

          width: "100%",

          maxWidth: 460,

          maxHeight:
            "calc(100dvh - 32px)",

          overflowY:
            "auto",

          overflowX:
            "hidden",
        }}
      >

        {/* =================================================
            DRAG HANDLE
            ================================================= */}

        <div
          style={{
            width: 40,

            height: 4,

            borderRadius: 4,

            background:
              theme.border,

            margin:
              "0 auto 16px",
          }}
        />


        {/* =================================================
            HEADER
            ================================================= */}

        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: 10,

            marginBottom: 16,
          }}
        >

          <span
            style={{
              fontSize: 26,

              lineHeight: 1,
            }}
          >
            {category.emoji}
          </span>


          <h3
            className="font-display"

            style={{
              margin: 0,

              fontSize: 20,

              color:
                theme.ink,

              lineHeight: 1.2,
            }}
          >
            {category.label}
          </h3>

        </div>


        {/* =================================================
            WATER COMPONENT
            ================================================= */}

        {categoryId === "water" ? (

          <HydrationWaterCard
            data={local}

            onChange={save}

            theme={theme}

            settings={settings}

            animationsOn={
              animationsOn ??
              settings?.animationsOn ??
              true
            }
          />

        ) : Form ? (

          /*
           * =================================================
           * OTHER CATEGORY FORMS
           * =================================================
           */

          <Form
            data={local}

            onChange={save}

            theme={theme}
          />

        ) : (

          /*
           * =================================================
           * FALLBACK
           * =================================================
           */

          <p
            style={{
              color:
                theme.ink,

              opacity: 0.6,

              fontSize: 13,

              lineHeight: 1.5,
            }}
          >
            Tap the card on the dashboard
            to toggle this habit.
          </p>

        )}

      </div>

    </div>
  );
}