import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, "chrome-edge/manifest.json"), "utf8"));

test("Chrome Web Store manifest description fits the published limit", () => {
  assert.ok(manifest.description.length <= 132);
  assert.ok(Buffer.byteLength(manifest.description, "utf8") <= 132);
});

test("only allowlisted live applications run in child frames", () => {
  const framed = manifest.content_scripts.filter(rule => rule.all_frames);
  assert.equal(framed.length, 1);
  assert.deepEqual(framed[0].matches, [
    "https://produkty.chmi.cz/radar/*",
    "https://produkty.chmi.cz/druzice/*",
    "https://produkty.chmi.cz/aladin/*",
    "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub*",
    "https://www.chmi.cz/namerena-data/polarni-druzice/*",
    "https://www.chmi.cz/namerena-data/geostacionarni-druzice/*",
    "https://www.chmi.cz/namerena-data/webkamery",
    "https://www.chmi.cz/namerena-data/webkamery/",
    "https://www.chmi.cz/namerena-data/webkamera/*"
  ]);
  assert.ok(framed[0].js.indexOf("portal-registry.js") < framed[0].js.indexOf("embedded.js"));
  for (const rule of manifest.content_scripts) {
    for (const file of [...(rule.js ?? []), ...(rule.css ?? [])]) {
      assert.ok(existsSync(join(root, "chrome-edge", file)), file);
    }
  }
});
