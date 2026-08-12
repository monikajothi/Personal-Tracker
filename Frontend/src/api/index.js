import { api, BASE_URL, getToken } from "./client.js";

export const authApi = {
  signup: (name, email, password, gender) => api.post("/auth/signup", { name, email, password, gender }, { auth: false }),
  login: (email, password) => api.post("/auth/login", { email, password }, { auth: false }),
};

export const entriesApi = {
  range: (start, end) => api.get(`/entries?start=${start}&end=${end}`),
  get: (date) => api.get(`/entries/${date}`),
  history: (date) => api.get(`/entries/${date}/history`),
  journalRecent: () => api.get("/entries/journal/recent"),
  journalHistory: () => api.get(`/entries/journal-history`),
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

export const starsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.color) {
      params.set("color", filters.color);
    }

    if (filters.from) {
      params.set("from", filters.from);
    }

    if (filters.to) {
      params.set("to", filters.to);
    }

    const query = params.toString();

    return api.get(`/stars${query ? `?${query}` : ""}`);
  },

  get: (id) =>
    api.get(`/stars/${id}`),

  create: (data) =>
    api.post("/stars", data),

  update: (id, data) =>
    api.put(`/stars/${id}`, data),

  remove: async (id) => {
    const res = await fetch(
      `${BASE_URL}/stars/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to delete star");
    }

    return data;
  },

  shareLink: () =>
    api.get("/stars/share-link/current"),
};