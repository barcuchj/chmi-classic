import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { firstUsableFrame } = require("../chrome-edge/rainfall.js");

test("missing latest official frame falls back only to a loaded native frame", () => {
  const frames = [
    { id: "mapa_0", complete: true, naturalWidth: 0 },
    { id: "mapa_1", complete: false, naturalWidth: 0 },
    { id: "mapa_2", complete: true, naturalWidth: 728 }
  ];
  assert.equal(firstUsableFrame(frames), "mapa_2");
  assert.equal(firstUsableFrame(frames.slice(0, 2)), null);
  assert.equal(firstUsableFrame([{ id: "mapa_1_extra", complete: true, naturalWidth: 728 }]), null);
});

test("old rainfall entry points only to the verified live HPPS viewer", () => {
  const context = vm.createContext({ URL });
  vm.runInContext(readFileSync(new URL("../chrome-edge/portal-registry.js", import.meta.url), "utf8"), context);
  const registry = context.__chmiClassicApps;
  assert.equal(registry.get("rainfall").url, "https://hydro.chmi.cz/hppsoldv/main_rain.php");
  assert.equal(registry.columns[2].find(item => item.label === "Radarové odhady srážek")?.app, "rainfall");
  const name = registry.frameName("rainfall", "test-session");
  assert.equal(registry.embeddedContext(new URL("https://hydro.chmi.cz/hppsoldv/main_rain.php?id=6&t=s"), name)?.id, "rainfall");
  for (const url of ["https://evil.test/hppsoldv/main_rain.php", "https://hydro.chmi.cz/hppsoldv/other.php", "https://hydro.chmi.cz/hpps/main_rain.php"]) {
    assert.equal(registry.embeddedContext(new URL(url), name), null);
  }
});
