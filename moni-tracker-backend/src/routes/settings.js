import { Router } from "express";
import Settings from "../models/Settings.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });
    if (!settings) settings = await Settings.create({ userId: req.userId });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.userId; // never let the client reassign ownership
    const settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
