import { api } from "./client.js";

export const authApi = {
  signup: (name, email, password) => api.post("/auth/signup", { name, email, password }, { auth: false }),
  login: (email, password) => api.post("/auth/login", { email, password }, { auth: false }),
};

export const entriesApi = {
  range: (start, end) => api.get(`/entries?start=${start}&end=${end}`),
  get: (date) => api.get(`/entries/${date}`),
  history: (date) => api.get(`/entries/${date}/history`),
  save: (date, category, data) => api.put(`/entries/${date}`, { category, data }),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  save: (patch) => api.put("/settings", patch),
};

export const analyticsApi = {
  cyclePrediction: () => api.get("/analytics/cycle-prediction"),
  cycleHistory: () => api.get("/analytics/cycle-history"),
  correlation: (a, b) => api.get(`/analytics/correlation?a=${a}&b=${b}`),
  weeklySummary: () => api.get("/analytics/weekly-summary"),
};
