import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, default: "sakura" },
    isDark: { type: Boolean, default: false },
    animationsOn: { type: Boolean, default: true },
    companion: { type: String, default: "cat" },
    waterTarget: { type: Number, default: 8 },
    essentials: { type: [String], default: ["sleep", "water", "mood", "movement"] },
    customHabits: { type: [mongoose.Schema.Types.Mixed], default: [] },
    cycleEnabled: { type: Boolean, default: true },
    reminders: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: "20:00" }, // "HH:MM", local to the user's browser
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
