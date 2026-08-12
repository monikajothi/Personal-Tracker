import { Router } from "express";
import Entry from "../models/Entry.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const MAX_HISTORY = 20;

// GET /api/entries?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns all entries in range (used by calendar + analytics). No range = last 60 days.
router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { userId: req.userId };
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }
    const entries = await Entry.find(query).sort({ date: 1 }).limit(400);
    const byDate = {};

    for (const e of entries) {
      const categories = {
        ...e.categories,
      };

      // Journal photos are large Base64 strings.
      // Do NOT send them during the normal 120-day
      // dashboard/calendar load.
      if (categories.journal) {
        categories.journal = {
          ...categories.journal,
          photo: null,
        };
      }

      byDate[e.date] = categories;
    }

    res.json(byDate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load entries" });
  }
});

// GET /api/entries/journal/recent
router.get("/journal/recent", async (req, res) => {
  try {
    const entries = await Entry.find({
      userId: req.userId,
      "categories.journal": { $exists: true },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const journals = entries
      .map((entry) => {
        const journal = entry.categories?.journal;

        if (!journal) return null;

        return {
          date: entry.date,
          journal: {
            text: journal.text || "",
            photo: journal.photo || null,
            prompt: journal.prompt || "",
          },
        };
      })
      .filter(Boolean);

    res.json(journals);
  } catch (err) {
    console.error("Failed to load journal:", err);

    res.status(500).json({
      error: "Failed to load journal",
    });
  }
});

// GET /api/entries/journal-history
// Returns the complete user journal history, independent from the 120-day UI cache.
router.get("/journal-history", async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });

    const byDate = {};

    for (const entry of entries) {
      if (entry.categories?.journal) {
        byDate[entry.date] = {
          journal: entry.categories.journal,
        };
      }
    }

    res.json(byDate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load journal history" });
  }
});

// GET /api/entries/:date
router.get("/:date", async (req, res) => {
  try {
    const entry = await Entry.findOne({ userId: req.userId, date: req.params.date });
    res.json(entry?.categories || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to load entry" });
  }
});

// GET /api/entries/:date/history — edit history for one day
router.get("/:date/history", async (req, res) => {
  try {
    const entry = await Entry.findOne({ userId: req.userId, date: req.params.date });
    res.json(entry?.history || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

// PUT /api/entries/:date  body: { category: "sleep", data: {...} }
// Upserts the day's entry, merges the one category, and snapshots the
// previous state into history so nothing is silently lost.

router.put("/:date", async (req, res) => {
  console.log("📷 Save request received");
  try {
    const { category, data } = req.body;

    console.log({
      category,
      hasPhoto: !!data?.photo,
      photoSizeKB: data?.photo
        ? Math.round(data.photo.length / 1024)
        : 0,
    });

    if (!category || typeof data !== "object") {
      return res.status(400).json({ error: "Body must include { category, data }" });
    }

    let entry = await Entry.findOne({ userId: req.userId, date: req.params.date });

    if (!entry) {
      entry = new Entry({ userId: req.userId, date: req.params.date, categories: {}, history: [] });
    } else {
      // snapshot before mutating, so history reflects the pre-edit state
      entry.history.push({ snapshot: entry.categories, savedAt: new Date() });
      if (entry.history.length > MAX_HISTORY) entry.history = entry.history.slice(-MAX_HISTORY);
    }

    entry.categories = { ...entry.categories, [category]: data };
    entry.markModified("categories");
    await entry.save();

    res.json(entry.categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

export default router;
