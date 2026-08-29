import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { inputStyle } from "../components/ui.jsx";
import { THEMES } from "../theme/tokens.js";
import { authApi } from "../api/index.js";

const theme = THEMES.sakura;

// Guaranteed full-viewport centering regardless of parent layout — this
// page renders standalone before the app shell exists, so it can't rely
// on an ancestor having an explicit height. `position: fixed, inset: 0`
// sidesteps that entirely instead of chasing height: 100% up the tree.
const pageWrap = {
  position: "fixed",
  inset: 0,
  background: theme.bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  overflowY: "auto",
};

const card = {
  width: "100%",
  maxWidth: 380,
  background: theme.paper,
  border: `1px solid ${theme.border}`,
  borderRadius: 24,
  padding: 28,
  margin: "auto", // keeps the card centered even if content forces scroll
};

const primaryBtn = {
  padding: "12px",
  borderRadius: 14,
  border: "none",
  background: theme.accent,
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
};

const linkBtn = {
  background: "none",
  border: "none",
  color: theme.accent,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  padding: 0,
};

export default function LoginPage() {
  // Detect a password-reset link ("/reset-password?token=...") before
  // anything else — this is a self-contained view with its own submit flow.
  const [resetToken] = useState(() => {
    if (typeof window === "undefined") return null;
    if (!window.location.pathname.startsWith("/reset-password")) return null;
    return new URLSearchParams(window.location.search).get("token");
  });

  if (resetToken) {
    return (
      <div className="mwt" style={pageWrap}>
        <ResetPasswordCard token={resetToken} />
      </div>
    );
  }

  return (
    <div className="mwt" style={pageWrap}>
      <AuthCard />
    </div>
  );
}

function AuthCard() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("female");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "signup") {
        await signup(name, email, password, gender);
      } else if (mode === "forgot") {
        await authApi.forgotPassword(email);
        setForgotSent(true); // shown regardless of whether the email exists — see note below
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setForgotSent(false);
  };

  return (
    <div style={card}>
      <div style={{ fontSize: 40, textAlign: "center", marginBottom: 4 }}>🌷</div>
      <h1 className="font-display" style={{ textAlign: "center", fontSize: 22, margin: "0 0 4px", color: theme.ink }}>
        Wellness Tracker
      </h1>
      <p style={{ textAlign: "center", fontSize: 13, opacity: 0.6, margin: "0 0 22px" }}>
        {mode === "login" && "Welcome back 🌸"}
        {mode === "signup" && "Let's plant your first seed 🌱"}
        {mode === "forgot" && "We'll help you get back in"}
      </p>

      {mode === "forgot" && forgotSent ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: theme.ink, lineHeight: 1.6, margin: "0 0 20px" }}>
            If an account exists for <b>{email}</b>, a password reset link is on its way. Check your inbox (and spam folder) — the link expires in 1 hour.
          </p>
          <button onClick={() => switchMode("login")} style={primaryBtn}>Back to log in</button>
        </div>
      ) : (
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

          {mode !== "forgot" && (
            <input required type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle(theme)} />
          )}

          {mode === "login" && (
            <button type="button" onClick={() => switchMode("forgot")} style={{ ...linkBtn, textAlign: "right", fontSize: 12.5 }}>
              Forgot password?
            </button>
          )}

          {error && <div style={{ fontSize: 12.5, color: "#B14C4C" }}>{error}</div>}

          <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
            {busy ? "…" : mode === "login" ? "Log in" : mode === "signup" ? "Sign up" : "Send reset link"}
          </button>
        </form>
      )}

      {!forgotSent && (
        <div style={{ marginTop: 16, display: "grid", gap: 8, textAlign: "center" }}>
          {/* {mode !== "login" && (
            <button onClick={() => switchMode("login")} style={linkBtn}>Back to log in</button>
          )} */}
          {mode === "login" && (
            <button onClick={() => switchMode("signup")} style={linkBtn}>New here? Create an account</button>
          )}
          {mode === "signup" && (
            <button onClick={() => switchMode("login")} style={linkBtn}>Already have an account? Log in</button>
          )}
        </div>
      )}
    </div>
  );
}

function ResetPasswordCard({ token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");

    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "This reset link may have expired — request a new one.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={card}>
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 4 }}>✅</div>
        <h1 className="font-display" style={{ textAlign: "center", fontSize: 20, margin: "0 0 10px", color: theme.ink }}>
          Password updated
        </h1>
        <p style={{ textAlign: "center", fontSize: 13.5, color: theme.ink, opacity: 0.75, marginBottom: 20 }}>
          You can log in with your new password now.
        </p>
        <button onClick={() => { window.location.href = "/"; }} style={{ ...primaryBtn, width: "100%" }}>
          Go to log in
        </button>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 40, textAlign: "center", marginBottom: 4 }}>🔒</div>
      <h1 className="font-display" style={{ textAlign: "center", fontSize: 20, margin: "0 0 20px", color: theme.ink }}>
        Set a new password
      </h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input required type="password" placeholder="New password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle(theme)} />
        <input required type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle(theme)} />
        {error && <div style={{ fontSize: 12.5, color: "#B14C4C" }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
          {busy ? "…" : "Update password"}
        </button>
      </form>
    </div>
  );
}