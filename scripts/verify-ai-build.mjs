import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "esbuild";

async function readTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      contents.push(await readTextFiles(target));
    } else if (/\.(?:css|html|js|json|map|svg|txt)$/.test(entry.name)) {
      contents.push(await readFile(target, "utf8"));
    }
  }
  return contents.join("\n");
}

const outputDirectory = await mkdtemp(path.join(tmpdir(), "mealweek-ai-"));
try {
  const clientBundle = await readTextFiles("dist");
  for (const forbidden of [
    "Tu es un assistant culinaire",
    "GEMINI_API_KEY",
    "generativelanguage.googleapis.com",
    "x-goog-api-key",
  ]) {
    assert.equal(clientBundle.includes(forbidden), false, `${forbidden} trouvé dans le bundle client`);
  }

  const serverBundlePath = path.join(outputDirectory, "ai.mjs");
  await build({
    entryPoints: ["netlify/functions/ai.mjs"],
    outfile: serverBundlePath,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    logLevel: "silent",
  });
  const serverBundle = await readFile(serverBundlePath, "utf8");
  assert.match(serverBundle, /assistant culinaire/);
  assert.match(serverBundle, /x-goog-api-key/);
  console.log("Bundle client sans secret ni prompt, Function serveur empaquetable.");
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
