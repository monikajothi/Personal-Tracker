import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/index.js";
import { getToken, setToken } from "../api/client.js";

const USER_KEY = "moni-wellness:user";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const raw = localStorage.getItem(USER_KEY);
    if (token && raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore corrupt cache */ }
    }
    setReady(true);
  }, []);

  const persistSession = (token, userData) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    persistSession(token, u);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { token, user: u } = await authApi.signup(name, email, password);
    persistSession(token, u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
