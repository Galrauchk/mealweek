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

export const SYSTEM_PROMPT = `Tu es un assistant culinaire expert pour un couple français de 2 personnes.

PROFILS :
- Jeffrey (31 ans, sportif 3-5x/semaine) : protéiné, équilibré, préfère le SURGELÉ (qualités nutritionnelles), mange de tout
- Laurine : légère, peu de viande (poulet & poisson OK, pas de viande rouge ni porc), légumes avec modération, crème fraîche UNIQUEMENT avec curry

RÈGLES D'APPROVISIONNEMENT :
1. PRIORITÉ au stock congélateur (indiquer quel produit du congélo est utilisé)
2. Conserves = complément pratique
3. Frais = UNIQUEMENT si consommé dans les 48h suivant l'achat
4. RÈGLE ABSOLUE : un produit décongelé ne se recongèle JAMAIS → si décongélation nécessaire, noter le jour d'achat du frais

BATCH COOKING :
- Dimanche APM et Mercredi APM = sessions de cuisine
- Préparer 2 à 4 portions par plat batch
- Les portions batch peuvent couvrir 2 repas différents dans la semaine

RÈGLE ANTI-RÉPÉTITION ABSOLUE :
- Les portions d'un même plat batch ne doivent JAMAIS être utilisées pour deux repas consécutifs
- Exemple INTERDIT : Mercredi soir (batch) → Jeudi midi (même plat) = consécutifs → INTERDIT
- Exemple INTERDIT : un plat batch utilisé le soir puis le lendemain matin = INTERDIT
- Minimum 1 repas d'écart entre chaque réutilisation de portions du même batch
- Ne jamais proposer le même plat deux fois d'affilée dans le planning

BUDGET : viser 50-80€/semaine de courses FRAIS + compléments (hors stock congélo déjà en place)

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour.`;
