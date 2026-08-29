import React, { useEffect, useState } from "react";

const STORAGE_KEY = "mwt-notes-v1";

export default function NotesPanel({ theme }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setText(localStorage.getItem(STORAGE_KEY) || "");
  }, []);

  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
      setSaved(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div style={{
      position: "relative", borderRadius: 20, padding: 16, marginBottom: 16,
      overflow: "hidden", border: `1px solid ${theme.border}`,
      background: `linear-gradient(180deg, ${theme.soft}, ${theme.paper})`,
    }}>
      <style>{`
        @keyframes mwt-drift-a { 0% { transform: translateX(-10%); } 50% { transform: translateX(8%); } 100% { transform: translateX(-10%); } }
        @keyframes mwt-drift-b { 0% { transform: translateX(6%); } 50% { transform: translateX(-12%); } 100% { transform: translateX(6%); } }
        @keyframes mwt-drift-c { 0% { transform: translate(-6%, 2%); } 50% { transform: translate(10%, -4%); } 100% { transform: translate(-6%, 2%); } }
      `}</style>

      {/* Cloudy animated base */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-30%", left: "-10%", width: "70%", height: "140%",
          borderRadius: "50%", background: theme.accent2, opacity: 0.14, filter: "blur(30px)",
          animation: "mwt-drift-a 14s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-40%", right: "-10%", width: "65%", height: "130%",
          borderRadius: "50%", background: theme.accent, opacity: 0.12, filter: "blur(34px)",
          animation: "mwt-drift-b 18s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "20%", width: "40%", height: "80%",
          borderRadius: "50%", background: theme.ink, opacity: 0.05, filter: "blur(26px)",
          animation: "mwt-drift-c 22s ease-in-out infinite",
        }} />
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, flex: 1 }}>☁️ Notes & ideas</div>
          <div style={{ fontSize: 10.5, opacity: 0.5, fontWeight: 700 }}>{saved ? "Saved" : "Saving…"}</div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write down a thought, a plan, anything on your mind…"
          rows={4}
          style={{
            width: "100%", resize: "vertical", border: "none", outline: "none",
            background: "transparent", color: theme.ink, fontSize: 13.5, lineHeight: 1.5,
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}