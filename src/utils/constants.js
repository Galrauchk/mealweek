export const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
export const SLOTS = ["midi","soir"];
export const BATCH_DAYS = { Dimanche: true, Mercredi: true };
export const BUDGET_TARGET = 80; // €/semaine

export const FREEZER_CATEGORIES = [
  { id: "poulet", label: "Poulet", emoji: "🍗", unit: "portions" },
  { id: "hache", label: "Viande hachée", emoji: "🥩", unit: "portions" },
  { id: "poisson", label: "Poisson", emoji: "🐟", unit: "portions" },
  { id: "fruits_mer", label: "Fruits de mer", emoji: "🦐", unit: "portions" },
  { id: "legumes", label: "Légumes surgelés", emoji: "🥦", unit: "sachets" },
];

export const SOURCE_STYLE = {
  surgele: { label: "❄️ Congélo", bg: "#0c2340", color: "#60a5fa" },
  conserve: { label: "🥫 Conserve", bg: "#0d2b1a", color: "#4ade80" },
  frais:    { label: "🛒 Frais",    bg: "#2d1f00", color: "#fbbf24" },
  batch:    { label: "🥘 Batch",    bg: "#2d1a00", color: "#fb923c" },
};
