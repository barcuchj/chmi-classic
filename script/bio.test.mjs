import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/bio.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/bio.css"), "utf8");

function readiness() {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports.bioDataReady;
}

function fixture({ official = true, canvas = true, timeline = true, today = true, tomorrow = true } = {}) {
  const map = {
    querySelector(selector) {
      if (selector.includes("data-config-url")) return official ? {} : null;
      if (selector === ".ol-viewport canvas") return canvas ? { width: 1265, height: 524 } : null;
      if (selector.includes("tlBioPredpoved")) return timeline ? { max: "1" } : null;
      return null;
    }
  };
  const table = present => ({ querySelector: () => present ? {} : null });
  return { map, day0: table(today), day1: table(tomorrow) };
}

test("bio adapter waits for the official map, two-day timeline and both live tables", () => {
  const ready = readiness();
  const full = fixture();
  assert.equal(ready(full.map, full.day0, full.day1), true);
  for (const missing of [{ official: false }, { canvas: false }, { timeline: false }, { today: false }, { tomorrow: false }]) {
    const item = fixture(missing);
    assert.equal(ready(item.map, item.day0, item.day1), false);
  }
  assert.equal(ready(null, full.day0, full.day1), false);
});

test("bio workspace keeps original map and tables, with optional compact details", () => {
  assert.match(source, /details\.append\(tabs, today, tomorrow\)/);
  assert.match(source, /content\.append\(mapBoundary, details\)/);
  assert.match(source, /details\.hidden = !details\.hidden/);
  assert.match(css, /body > :not\(#chmi-bio-workspace\)/);
  assert.match(css, /\.chmu--map--container\s*\{[^}]*min-height: 0/s);
  assert.match(css, /#chmi-bio-details\[hidden\]/);
  assert.doesNotMatch(css, /\.ol-viewport\s*\{[^}]*display: none/s);
});
