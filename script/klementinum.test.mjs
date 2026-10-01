import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = readFileSync(join(root, "chrome-edge/klementinum.js"), "utf8");
const styles = readFileSync(join(root, "chrome-edge/klementinum.css"), "utf8");
const { matchesStation, disableClassic } = createRequire(import.meta.url)(join(root, "chrome-edge/klementinum.js"));

test("Klementinum adaptation is scoped to the verified station route", () => {
  assert.equal(matchesStation("https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum?zalozka=klima"), true);
  assert.equal(matchesStation("https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum/"), true);
  assert.equal(matchesStation("https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/l3aber01-abertamy"), false);
  assert.equal(matchesStation("https://attacker.test/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum"), false);
});

test("Klementinum keeps official tabs and waits for populated native data", () => {
  assert.match(source, /table\?\.tBodies\[0\]\?\.rows\?\.length/);
  assert.match(source, /data-id='klima'/);
  assert.match(source, /tabsBlock\.dataset\.chmiKlementinumNative/);
  assert.doesNotMatch(source, /fetch\(|innerHTML\s*=/);
});

test("Nový vzhled saves preference and reloads once in both extension and userscript", async () => {
  for (const mode of ["callback", "promise", "bridge"]) {
    let saved;
    let reloads = 0;
    const storage = { set(value, callback) {
      saved = value.chmiRadarClassicEnabled;
      if (mode === "callback") callback();
      if (mode === "promise") return Promise.resolve();
    } };
    disableClassic(storage, () => reloads++, mode === "bridge");
    await Promise.resolve();
    assert.equal(saved, false);
    assert.equal(reloads, 1, mode);
  }
});

test("Klementinum styles only the measurement tabs, not the station directory", () => {
  assert.match(styles, /:not\(\[data-chmi-klementinum-native="verified"\]\)/);
  assert.match(styles, /\[data-chmi-klementinum-native="verified"\] \.tabcordion--tabs \{/);
  assert.match(styles, /visibility: visible !important/);
  assert.match(styles, /opacity: 1 !important/);
  assert.match(styles, /min-height: 44px/);
  assert.doesNotMatch(styles, /#main-content \.lfr-layout-structure-item-chmi---tabs \.tabcordion/);
});
