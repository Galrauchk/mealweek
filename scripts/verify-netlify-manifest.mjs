import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(".netlify/functions/manifest.json", "utf8"));
const aiFunction = manifest.functions?.find((entry) => entry.name === "ai");

assert.ok(aiFunction, "Function ai absente du manifeste Netlify");
assert.equal(aiFunction.routes?.[0]?.literal, "/api/ai");

const rateLimit = aiFunction.trafficRules?.action?.config?.rateLimitConfig;
assert.deepEqual(rateLimit, {
  windowLimit: 5,
  windowSize: 180,
  algorithm: "sliding_window",
});
assert.deepEqual(
  aiFunction.trafficRules?.action?.config?.aggregate?.keys,
  [{ type: "ip" }, { type: "domain" }],
);

console.log("Manifeste Netlify valide : limite 5 requêtes par 180 secondes et par IP/domaine.");
