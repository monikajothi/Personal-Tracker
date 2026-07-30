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

export const CAT_LINES = [
  "Meow! 🐱 Don't forget today's check-in~",
  "You're done for today! Go rest 🌙💗",
  "*stretches* ...five more minutes of sunbathing 🌤️",
  "Purrr~ your garden looked lovely today 🌿",
  "I believe in you. Also I would like a snack.",
  "Small steps still count. Meow 🐾",
];

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

