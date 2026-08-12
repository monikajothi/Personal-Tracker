export const MOODS = [
  { v: "amazing", e: "🥰", label: "Amazing" },
  { v: "happy", e: "😊", label: "Happy" },
  { v: "good", e: "🙂", label: "Good" },
  { v: "okay", e: "😐", label: "Okay" },
  { v: "low", e: "😔", label: "Low" },
  { v: "stressed", e: "😣", label: "Stressed" },
  { v: "tired", e: "😴", label: "Tired" },
  { v: "irritated", e: "😡", label: "Irritated" },
];

export const JOURNAL_PROMPTS = [
  "What made me happy today? 🌸",
  "What occupied my mind today? 💭",
  "Something I accomplished ✨",
  "Something I'm grateful for 🫶",
  "What would make tomorrow better? 🌱",
];

export const DEFAULT_CATEGORIES = [
  { id: "sleep", label: "Sleep", emoji: "😴" },
  { id: "water", label: "Water", emoji: "💧" },
  { id: "movement", label: "Movement", emoji: "🏃" },
  { id: "mood", label: "Mood", emoji: "😊" },
  { id: "cycle", label: "Cycle", emoji: "🩷" },
  { id: "food", label: "Food", emoji: "🥗" },
  { id: "selfcare", label: "Self-care", emoji: "🧴" },
  { id: "learning", label: "Learning", emoji: "📚" },
];

export const COMPANIONS = { cat: ["🐱", "🐶"], dog: ["🐶", "🐱"] };

export function buildCompanionMessage({
  user,
  entries = {},
  todayComplete = false,
  progressPct = 0,
} = {}) {
  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "friend";

  const entryCount = Object.keys(entries || {}).length || 0;

  const name = firstName === "friend" ? "friend" : firstName;

  const lines = [];

  /*
   * 🌸 TODAY IS COMPLETE
   */
  if (todayComplete) {
    lines.push(
      `You did it, ${name}! 🌸 Today is officially checked off.`
    );

    lines.push(
      `Look at you, ${name} — you showed up for yourself today ✨`
    );

    lines.push(
      `${name}, today's little promises to yourself are done. Rest easy 💗`
    );

    lines.push(
      `A complete day! 🌷 You don't need to do anything more — enjoy your evening, ${name}.`
    );

    lines.push(
      `${name}, that's enough for today. You showed up, and that matters 🌙`
    );
  }

  /*
   * 🌼 ALMOST COMPLETE
   */
  else if (progressPct >= 75) {
    lines.push(
      `You're almost there, ${name}! 🌼 Just a little more for today.`
    );

    lines.push(
      `${name}, look how much you've already done today ✨`
    );

    lines.push(
      `75%+ already! 🌱 Finish only if you have the energy, ${name}.`
    );

    lines.push(
      `You've got the hardest part done, ${name}. One small step left 💛`
    );

    lines.push(
      `${name}, today's little garden is already blooming 🌸`
    );
  }

  /*
   * 🌱 GOOD PROGRESS
   */
  else if (progressPct >= 40) {
    lines.push(
      `You're making a nice start today, ${name} 🌱`
    );

    lines.push(
      `${name}, you've already taken a few good steps for yourself today 💗`
    );

    lines.push(
      `No need to rush, ${name}. Keep going at your own pace 🌿`
    );

    lines.push(
      `${name}, you're building today's rhythm one little check-in at a time ✨`
    );

    lines.push(
      `You're doing better than you think, ${name} 🌷 Keep taking it one thing at a time.`
    );
  }

  /*
   * 🌷 JUST STARTING
   */
  else if (progressPct > 0) {
    lines.push(
      `You've started, ${name} 🌱 That's what matters.`
    );

    lines.push(
      `${name}, one little check-in is still progress 💛`
    );

    lines.push(
      `No pressure, ${name}. Pick just one small thing to take care of 🌷`
    );

    lines.push(
      `Your day isn't behind, ${name}. There's still plenty of time 🌤️`
    );

    lines.push(
      `A tiny step counts too, ${name}. What feels easiest right now? 🌿`
    );
  }

  /*
   * 🌙 NOTHING LOGGED YET
   */
  else {
    lines.push(
      `Good to see you, ${name} 🌸 Ready for a gentle start?`
    );

    lines.push(
      `${name}, today's page is still blank — you can start with just one thing 🌱`
    );

    lines.push(
      `No pressure, ${name}. Even one tiny check-in makes today count 💗`
    );

    lines.push(
      `Fresh page, fresh start 🌷 What would feel good to take care of first?`
    );

    lines.push(
      `Hey ${name} 🌤️ You don't have to do everything. Just start somewhere.`
    );
  }

  /*
   * 🌿 LONG-TERM CONSISTENCY
   */
  if (entryCount >= 30) {
    lines.push(
      `${name}, you've been keeping track for ${entryCount} days. That's a beautiful habit 🌳`
    );

    lines.push(
      `${entryCount} days of showing up, ${name}. That's something to be proud of 💚`
    );
  } else if (entryCount >= 14) {
    lines.push(
      `${name}, ${entryCount} days tracked already 🌿 You're building something that lasts.`
    );
  } else if (entryCount >= 7) {
    lines.push(
      `A whole week of tracking, ${name}! 🌸 Keep making this little space yours.`
    );
  }

  /*
   * 🌼 RETURN RANDOM MESSAGE
   */
  return lines[Math.floor(Math.random() * lines.length)];
}

export const todayStr = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayStr(d);
};
export const fmtNiceDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
};

export const uid = () => Math.random().toString(36).slice(2, 9);

// Milestone stickers unlocked by total days tracked (cumulative, never resets)
export const GARDEN_STICKERS = [
  { days: 3, emoji: "🌱", name: "Sprout" },
  { days: 7, emoji: "🌷", name: "First Bloom" },
  { days: 14, emoji: "🦋", name: "Butterfly Visit" },
  { days: 21, emoji: "🌈", name: "Rainbow Day" },
  { days: 30, emoji: "🌳", name: "Little Tree" },
  { days: 45, emoji: "🐝", name: "Busy Bee" },
  { days: 60, emoji: "🍯", name: "Honey Jar" },
  { days: 90, emoji: "🌻", name: "Sunflower" },
  { days: 120, emoji: "🦢", name: "Swan Pond" },
  { days: 180, emoji: "🎋", name: "Bamboo Grove" },
  { days: 270, emoji: "🍂", name: "Autumn Keeper" },
  { days: 365, emoji: "🌸", name: "Full Bloom Year" },
];

// Used by dashboard/calendar/streak to decide if a category counts as "done"
export function isCategoryDone(catId, entry) {
  if (!entry) return false;
  switch (catId) {
    case "sleep": return !!(entry.bed && entry.wake);
    case "water": return (entry.glasses || 0) > 0;
    case "movement": return !!(entry.rest || entry.minutes || entry.type);
    case "mood": return !!entry.mood;
    case "cycle": return entry.isPeriod !== undefined;
    case "food": return !!(entry.veg || entry.fruit || entry.protein || entry.fiber || entry.note);
    case "selfcare": return Object.values(entry).some(Boolean);
    case "learning": return !!(entry.done || entry.minutes);
    default: return Object.keys(entry || {}).length > 0;
  }
}

