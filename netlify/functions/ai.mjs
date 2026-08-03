const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_BODY_BYTES = 16 * 1024;
const MAX_MESSAGE_LENGTH = 12_000;

const SYSTEM_PROMPT = `Tu es un assistant culinaire expert pour un couple français de 2 personnes.

PROFILS :
- Profil sportif : repas protéinés et équilibrés, préférence pour le surgelé, alimentation variée
- Profil léger : peu de viande, poulet et poisson acceptés, sans viande rouge ni porc, légumes avec modération, crème fraîche uniquement avec curry

RÈGLES D'APPROVISIONNEMENT :
1. Priorité au stock congélateur et indication du produit utilisé
2. Conserves comme complément pratique
3. Frais uniquement si consommé dans les 48 heures suivant l'achat
4. Un produit décongelé ne se recongèle jamais

BATCH COOKING :
- Dimanche après-midi et mercredi après-midi
- Préparer 2 à 4 portions par plat
- Les portions peuvent couvrir 2 repas différents dans la semaine

BUDGET : viser 50 à 80 euros par semaine de courses fraîches et compléments, hors stock déjà présent.

Réponds uniquement en JSON valide, sans markdown ni texte autour.`;

function jsonResponse(status, body) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function parseOrigins(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
}

export function isAllowedOrigin(request, configuredOrigins) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;

  try {
    const normalized = new URL(origin).origin;
    if (normalized === new URL(request.url).origin) return true;
    return parseOrigins(configuredOrigins).has(normalized);
  } catch {
    return false;
  }
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413 };
  }

  if (!request.body) return { ok: false, status: 400 };
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, status: 413 };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const rawBody = new TextDecoder().decode(bytes);

  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false, status: 400 };
  }
}

export function validatePayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (Object.keys(value).some((key) => key !== "message")) return null;
  if (typeof value.message !== "string") return null;
  const message = value.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return null;
  return { message };
}

export async function handleAiRequest(request, dependencies = {}) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    });
  }

  const configuredOrigins =
    dependencies.allowedOrigins ?? process.env.AI_ALLOWED_ORIGINS;
  if (!isAllowedOrigin(request, configuredOrigins)) {
    return jsonResponse(403, { error: "Requête refusée." });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return jsonResponse(415, { error: "Format non pris en charge." });
  }

  let parsed;
  try {
    parsed = await readJsonBody(request);
  } catch {
    return jsonResponse(400, { error: "Requête invalide." });
  }
  if (!parsed.ok) {
    return jsonResponse(parsed.status, {
      error: parsed.status === 413 ? "Requête trop volumineuse." : "Requête invalide.",
    });
  }

  const payload = validatePayload(parsed.value);
  if (!payload) {
    return jsonResponse(400, { error: "Requête invalide." });
  }

  const apiKey = dependencies.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[mealweek-ai] configuration Gemini absente");
    return jsonResponse(503, { error: "Service temporairement indisponible." });
  }

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  let upstream;
  try {
    upstream = await fetchImpl(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: payload.message }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    console.error("[mealweek-ai] appel Gemini impossible", {
      reason: error instanceof Error ? error.name : "UnknownError",
    });
    return jsonResponse(502, { error: "Service temporairement indisponible." });
  }

  if (!upstream.ok) {
    console.error("[mealweek-ai] réponse Gemini refusée", { status: upstream.status });
    return jsonResponse(upstream.status === 429 ? 429 : 502, {
      error: "Service temporairement indisponible.",
    });
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return jsonResponse(502, { error: "Réponse du service invalide." });
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || text.length === 0) {
    return jsonResponse(502, { error: "Réponse du service invalide." });
  }

  return jsonResponse(200, { content: [{ type: "text", text }] });
}

export default handleAiRequest;

export const config = {
  rateLimit: {
    action: "rate_limit",
    aggregateBy: "ip",
    windowLimit: 20,
    windowSize: 3600,
  },
};
