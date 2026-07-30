import React, { useState, useEffect, useRef } from "react";
import { Panel, SectionTitle, inputStyle } from "../components/ui.jsx";
import { JOURNAL_PROMPTS, todayStr, fmtNiceDate } from "../constants.js";
import { resizeImageFile } from "../utils/image.js";

export default function JournalView({ theme, entries, onSave }) {
  const t = todayStr();
  const prompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];
  const [text, setText] = useState(entries[t]?.journal?.text || "");
  const [photo, setPhoto] = useState(entries[t]?.journal?.photo || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setText(entries[t]?.journal?.text || "");
    setPhoto(entries[t]?.journal?.photo || null);
  }, [t]);

  const saveNow = (patch) => onSave(t, "journal", { text, photo, prompt, ...patch });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file, { maxWidth: 900, quality: 0.75 });
      setPhoto(dataUrl);
      saveNow({ photo: dataUrl });
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = () => { setPhoto(null); saveNow({ photo: null }); };

  const recent = Object.entries(entries)
    .filter(([, v]) => v?.journal?.text || v?.journal?.photo)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 8);

  return (
    <div>
      <SectionTitle theme={theme} sub="Completely optional — skip any day.">📝 Journal</SectionTitle>

      <Panel theme={theme} style={{ marginBottom: 16 }}>
        <div className="font-hand" style={{ fontSize: 22, color: theme.accent, marginBottom: 10 }}>{prompt}</div>

        {photo ? (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img src={photo} alt="" style={{ width: "100%", borderRadius: 14, display: "block", maxHeight: 260, objectFit: "cover" }} />
            <button onClick={removePhoto} style={{
              position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
              border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 14, cursor: "pointer",
            }}>✕</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: `1.5px dashed ${theme.border}`,
            background: theme.bg, color: theme.ink, opacity: 0.7, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 12,
          }}>
            {uploading ? "Uploading…" : "📷 Add a photo to today's entry"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => saveNow({ text })}
          placeholder="Write a little, or nothing at all…"
          style={{ ...inputStyle(theme), minHeight: 110, fontSize: 15 }}
        />
      </Panel>

      {recent.length > 0 && (
        <>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, opacity: 0.7, margin: "4px 0 10px" }}>Recent entries</div>
          <div style={{ display: "grid", gap: 12 }}>
            {recent.map(([d, v]) => (
              <div key={d} className="mwt-card" style={{
                background: theme.paper, border: `1px solid ${theme.border}`, borderRadius: 16,
                padding: v.journal.photo ? "10px 10px 14px" : 16, boxShadow: "0 2px 14px rgba(60,40,30,0.05)",
              }}>
                {v.journal.photo && (
                  <img src={v.journal.photo} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 220, objectFit: "cover", marginBottom: 10, display: "block" }} />
                )}
                <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.55, marginBottom: 4, padding: v.journal.photo ? "0 4px" : 0 }}>{fmtNiceDate(d)}</div>
                {v.journal.text && <div className="font-hand" style={{ fontSize: 17, color: theme.ink, padding: v.journal.photo ? "0 4px" : 0 }}>{v.journal.text}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}