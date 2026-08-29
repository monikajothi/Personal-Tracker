import { Router } from "express";
import Transaction from "../models/Transaction.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/transactions?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { userId: req.userId };
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }
    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 }).limit(500);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

// GET /api/transactions/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
// Total spend + a per-category breakdown for the range — kept as simple
// numbers (not a chart) since the category field only needs to justify
// itself with a running total for now.
router.get("/summary", async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = { userId: req.userId };
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }
    const transactions = await Transaction.find(query);

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const byCategory = {};
    for (const t of transactions) {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }

    res.json({ total, count: transactions.length, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build summary" });
  }
});

// POST /api/transactions  body: { date, amount, category, note }
router.post("/", async (req, res) => {
  try {
    const { date, amount, category, note } = req.body;
    if (!date || amount == null) {
      return res.status(400).json({ error: "date and amount are required" });
    }
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ error: "amount must be a non-negative number" });
    }
    const transaction = await Transaction.create({
      userId: req.userId, date, amount, category: category || "Other", note: note || "",
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const { date, amount, category, note } = req.body;
    if (amount != null && (typeof amount !== "number" || amount < 0)) {
      return res.status(400).json({ error: "amount must be a non-negative number" });
    }
    const updates = {};
    if (date != null) updates.date = date;
    if (amount != null) updates.amount = amount;
    if (category != null) updates.category = category;
    if (note != null) updates.note = note;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) return res.status(404).json({ error: "Transaction not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;