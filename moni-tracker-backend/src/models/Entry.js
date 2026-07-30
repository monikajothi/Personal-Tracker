import mongoose from "mongoose";

/*
  One document per (user, date). `categories` holds the flexible
  per-category data (sleep, water, mood, cycle, food, selfcare,
  learning, habits, journal) — kept as Mixed since each category
  has a different shape and the frontend already validates it.

  `history` keeps a snapshot of the previous `categories` value
  every time an update overwrites something meaningful — this is
  what gives the app real edit history instead of silent overwrites.
*/
const historyEntrySchema = new mongoose.Schema(
  {
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const entrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    categories: { type: mongoose.Schema.Types.Mixed, default: {} },
    history: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true }
);

entrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Entry", entrySchema);
