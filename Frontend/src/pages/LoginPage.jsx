import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { inputStyle } from "../components/ui.jsx";
import { THEMES } from "../theme/tokens.js";

const theme = THEMES.sakura;

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("female");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name, email, password, gender);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mwt" style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: theme.paper, border: `1px solid ${theme.border}`, borderRadius: 24, padding: 28 }}>
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 4 }}>🌷</div>
        <h1 className="font-display" style={{ textAlign: "center", fontSize: 22, margin: "0 0 4px", color: theme.ink }}>Wellness Tracker</h1>
        <p style={{ textAlign: "center", fontSize: 13, opacity: 0.6, margin: "0 0 22px" }}>
          {mode === "login" ? "Welcome back 🌸" : "Let's plant your first seed 🌱"}
        </p>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          {mode === "signup" && (
            <>
              <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(theme)} />
              <select required value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle(theme)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </>
          )}
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(theme)} />
          <input required type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle(theme)} />
          {error && <div style={{ fontSize: 12.5, color: "#B14C4C" }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ padding: "12px", borderRadius: 14, border: "none", background: theme.accent, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: theme.accent, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
