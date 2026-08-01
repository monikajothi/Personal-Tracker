import React, { useState, useEffect, useRef } from "react";
import {
  Panel,
  SectionTitle,
  inputStyle,
} from "../components/ui.jsx";
import {
  JOURNAL_PROMPTS,
  todayStr,
  fmtNiceDate,
} from "../constants.js";
import { resizeImageFile } from "../utils/image.js";

export default function JournalView({
  theme,
  entries,
  onSave,
}) {
  const t = todayStr();

  const prompt =
    JOURNAL_PROMPTS[
      new Date().getDate() % JOURNAL_PROMPTS.length
    ];

  /* --------------------------------
     State
  -------------------------------- */

  const [text, setText] = useState(
    entries[t]?.journal?.text || ""
  );

  const [photo, setPhoto] = useState(
    entries[t]?.journal?.photo || null
  );

  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");

  const fileRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Prevent server/state updates from overwriting text
  // while the user is actively editing.
  const editingRef = useRef(false);

  // Lets us populate the journal when entries initially
  // arrive asynchronously.
  const initializedDateRef = useRef(null);

  /* --------------------------------
     Sync data from entries
  -------------------------------- */

  useEffect(() => {
    const journal = entries[t]?.journal;

    // Date changed → load that day's journal.
    if (initializedDateRef.current !== t) {
      initializedDateRef.current = t;

      setText(journal?.text || "");
      setPhoto(journal?.photo || null);
      setSaveStatus("saved");
      editingRef.current = false;

      return;
    }

    // Entries may arrive from the backend AFTER this
    // component has mounted.
    //
    // Only hydrate local state if the user hasn't started
    // editing, otherwise an API refresh could overwrite
    // what they're typing.
    if (!editingRef.current && journal) {
      setText(journal.text || "");
      setPhoto(journal.photo || null);
    }
  }, [t, entries]);

  /* --------------------------------
     Cleanup autosave timer
  -------------------------------- */

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  /* --------------------------------
     Save immediately
  -------------------------------- */

  const saveNow = async (patch = {}) => {
    try {
      setSaveStatus("saving");

      await onSave(t, "journal", {
        text,
        photo,
        prompt,
        ...patch,
      });

      editingRef.current = false;
      setSaveStatus("saved");

      return true;
    } catch (err) {
      console.error("Journal save failed:", err);

      setSaveStatus("error");

      return false;
    }
  };

  /* --------------------------------
     Text autosave
  -------------------------------- */

  const handleTextChange = (e) => {
    const nextText = e.target.value;

    editingRef.current = true;

    setText(nextText);
    setSaveStatus("saving");

    // Restart timer every time the user types.
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await onSave(t, "journal", {
          text: nextText,
          photo,
          prompt,
        });

        editingRef.current = false;
        setSaveStatus("saved");
      } catch (err) {
        console.error("Journal autosave failed:", err);

        setSaveStatus("error");
      }
    }, 700);
  };

  /* --------------------------------
     Save immediately on blur too
  -------------------------------- */

  const handleBlur = async () => {
    // Cancel pending autosave because we're
    // saving immediately now.
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    await saveNow({
      text,
    });
  };

  /* --------------------------------
     Photo upload
  -------------------------------- */

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    editingRef.current = true;

    try {
      const dataUrl = await resizeImageFile(file, {
        maxWidth: 700,
        quality: 0.65,
      });

      console.log(
        "Journal image size:",
        Math.round(dataUrl.length / 1024),
        "KB"
      );
      
      setPhoto(dataUrl);

      await saveNow({
        photo: dataUrl,
      });
    } catch (err) {
      console.error("Photo upload failed:", err);

      setSaveStatus("error");
    } finally {
      setUploading(false);

      if (e.target) {
        e.target.value = "";
      }
    }
  };

  /* --------------------------------
     Remove photo
  -------------------------------- */

  const removePhoto = async () => {
    editingRef.current = true;

    setPhoto(null);

    await saveNow({
      photo: null,
    });
  };

  /* --------------------------------
     Recent journal entries
  -------------------------------- */

  const recent = Object.entries(entries)
    .filter(
      ([, value]) =>
        value?.journal?.text ||
        value?.journal?.photo
    )
    .sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    )
    .slice(0, 8);

  /* --------------------------------
     UI
  -------------------------------- */

  return (
    <div>
      <SectionTitle
        theme={theme}
        sub="Completely optional — skip any day."
      >
        📝 Journal
      </SectionTitle>

      {/* Today's journal */}
      <Panel
        theme={theme}
        style={{
          marginBottom: 16,
        }}
      >
        {/* Prompt */}

        <div
          className="font-hand"
          style={{
            fontSize: 22,
            color: theme.accent,
            marginBottom: 10,
          }}
        >
          {prompt}
        </div>

        {/* Photo */}

        {photo ? (
          <div
            style={{
              position: "relative",
              marginBottom: 12,
            }}
          >
            <img
              src={photo}
              alt="Journal"
              style={{
                width: "100%",
                borderRadius: 14,
                display: "block",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />

            <button
              type="button"
              onClick={removePhoto}
              aria-label="Remove journal photo"
              style={{
                position: "absolute",
                top: 8,
                right: 8,

                width: 28,
                height: 28,

                display: "grid",
                placeItems: "center",

                borderRadius: "50%",
                border: "none",

                background: "rgba(0,0,0,0.5)",
                color: "#fff",

                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              fileRef.current?.click()
            }
            disabled={uploading}
            style={{
              width: "100%",

              padding: "16px",

              borderRadius: 14,

              border: `1.5px dashed ${theme.border}`,

              background: theme.bg,
              color: theme.ink,

              opacity: uploading ? 0.5 : 0.7,

              fontWeight: 700,
              fontSize: 13,

              cursor: uploading
                ? "default"
                : "pointer",

              marginBottom: 12,
            }}
          >
            {uploading
              ? "Preparing photo… 🌷"
              : "📷 Add a photo to today's entry"}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          style={{
            display: "none",
          }}
        />

        {/* Text */}

        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="Write a little, or nothing at all…"
          style={{
            ...inputStyle(theme),

            minHeight: 110,

            fontSize: 15,
            lineHeight: 1.55,

            resize: "vertical",
          }}
        />

        {/* Save status */}

        <div
          style={{
            minHeight: 18,

            marginTop: 6,

            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",

            fontSize: 10.5,
            fontWeight: 650,

            color:
              saveStatus === "error"
                ? "#c45b5b"
                : theme.ink,

            opacity:
              saveStatus === "error"
                ? 0.9
                : 0.5,
          }}
        >
          {saveStatus === "saving" && (
            <span>
              Saving… 🌱
            </span>
          )}

          {saveStatus === "saved" && (
            <span>
              Saved ✓
            </span>
          )}

          {saveStatus === "error" && (
            <span>
              Couldn't save ⚠️
            </span>
          )}
        </div>
      </Panel>

      {/* Recent entries */}

      {recent.length > 0 && (
        <>
          <div
            style={{
              fontWeight: 800,
              fontSize: 13.5,

              color: theme.ink,

              opacity: 0.7,

              margin: "4px 0 10px",
            }}
          >
            Recent entries
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {recent.map(([date, value]) => {
              const journal =
                value.journal;

              return (
                <div
                  key={date}
                  className="mwt-card"
                  style={{
                    background:
                      theme.paper,

                    border: `1px solid ${theme.border}`,

                    borderRadius: 16,

                    padding:
                      journal.photo
                        ? "10px 10px 14px"
                        : 16,

                    boxShadow:
                      "0 2px 14px rgba(60,40,30,0.05)",
                  }}
                >
                  {/* Recent photo */}

                  {journal.photo && (
                    <img
                      src={
                        journal.photo
                      }
                      alt=""
                      style={{
                        width: "100%",

                        borderRadius: 10,

                        maxHeight: 220,

                        objectFit:
                          "cover",

                        marginBottom: 10,

                        display:
                          "block",
                      }}
                    />
                  )}

                  {/* Date */}

                  <div
                    style={{
                      fontSize: 11.5,

                      fontWeight: 800,

                      opacity: 0.55,

                      marginBottom: 4,

                      padding:
                        journal.photo
                          ? "0 4px"
                          : 0,
                    }}
                  >
                    {fmtNiceDate(
                      date
                    )}
                  </div>

                  {/* Journal text */}

                  {journal.text && (
                    <div
                      className="font-hand"
                      style={{
                        fontSize: 17,

                        lineHeight: 1.5,

                        color:
                          theme.ink,

                        padding:
                          journal.photo
                            ? "0 4px"
                            : 0,

                        whiteSpace:
                          "pre-wrap",

                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {
                        journal.text
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}