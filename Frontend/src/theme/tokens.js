export const THEMES = {
  sakura:   { name: "Garden", bg: "#FBF3EC", paper: "#FFFCF8", ink: "#4A3B34", accent: "#C97B84", accent2: "#D6A24C", soft: "#F3DCD9", border: "#EADFD3" },
  lavender: { name: "Sleepy", bg: "#F3F0F8", paper: "#FCFAFE", ink: "#3F3752", accent: "#8779B5", accent2: "#C97B84", soft: "#E4DEF2", border: "#E2DCEE" },
  matcha:   { name: "Greeny", bg: "#F1F4EC", paper: "#FBFDF8", ink: "#3B4632", accent: "#7C9470", accent2: "#D6A24C", soft: "#DCE6D3", border: "#DEE7D5" },
  peach:    { name: "Café", bg: "#FDF1E7", paper: "#FFFBF6", ink: "#4A3728", accent: "#E0916B", accent2: "#7B8FC9", soft: "#F6DFC9", border: "#F0DFCB" },
  cloudy:   { name: "Cloudy", bg: "#EFF4F8", paper: "#FAFCFE", ink: "#33404A", accent: "#7B93B5", accent2: "#C97B84", soft: "#DCE7EF", border: "#DDE6EC" },
  // cozycat:  { name: "Cozy Cat Room", bg: "#F2ECE4", paper: "#FBF7F1", ink: "#3E332A", accent: "#B5825E", accent2: "#8FA687", soft: "#E5D9C7", border: "#E7DCCB" },

  // Male-oriented optional palette set, presented to the user through the same theme picker.
  //cafeRacer: { name: "Cafe Racer 🏍️", bg: "#F6F2E9", paper: "#FFFDF6", ink: "#2F3839", accent: "#B25846", accent2: "#A0AFA2", soft: "#EFE3CE", border: "#DED6BD" },
};

export const DARK_OVERLAY = { bg: "#221E26", paper: "#2C2732", ink: "#EFE7F0", soft: "#3A3341", border: "#463E4F" };

export function resolveTheme(settings) {
  const base = THEMES[settings?.theme] || THEMES.sakura;
  return settings?.isDark ? { ...base, ...DARK_OVERLAY } : base;
}
