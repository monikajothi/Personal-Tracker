import { Router } from "express";
import Entry from "../models/Entry.js";
import { requireAuth } from "../middleware/auth.js";
import { predictNextCycle, correlate, buildWeeklySummary, buildCycleHistory } from "../services/analyticsService.js";

const router = Router();
router.use(requireAuth);

async function loadEntriesByDate(userId, sinceDaysAgo) {
  const since = new Date();
  since.setDate(since.getDate() - sinceDaysAgo);
  const sinceStr = since.toISOString().slice(0, 10);

  const entries = await Entry.find({ userId, date: { $gte: sinceStr } }).sort({ date: 1 });
  const byDate = {};
  for (const e of entries) byDate[e.date] = e.categories;
  return byDate;
}

router.get("/cycle-prediction", async (req, res) => {
  try {
    const byDate = await loadEntriesByDate(req.userId, 270); // ~9 months of history
    res.json(predictNextCycle(byDate));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute cycle prediction" });
  }
});

// GET /api/analytics/correlation?a=sleep.duration&b=mood.energy
router.get("/correlation", async (req, res) => {
  try {
    const { a, b } = req.query;
    if (!a || !b) return res.status(400).json({ error: "Query params 'a' and 'b' are required, e.g. a=sleep.duration&b=mood.energy" });

    const byDate = await loadEntriesByDate(req.userId, 60);
    const getPath = (path) => (cats) => path.split(".").reduce((v, k) => (v == null ? v : v[k]), cats);
    res.json(correlate(byDate, getPath(a), getPath(b)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute correlation" });
  }
});

router.get("/cycle-history", async (req, res) => {
  try {
    const byDate = await loadEntriesByDate(req.userId, 365);
    res.json(buildCycleHistory(byDate));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build cycle history" });
  }
});

router.get("/weekly-summary", async (req, res) => {
  try {
    const byDate = await loadEntriesByDate(req.userId, 7);
    res.json({ lines: buildWeeklySummary(byDate) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build weekly summary" });
  }
});

export default router;
