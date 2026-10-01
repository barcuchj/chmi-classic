import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/ticks.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/ticks.css"), "utf8");

function readiness() {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports.tickMapReady;
}

function mapFixture({ official = true, canvas = true, timeline = true, selected = true } = {}) {
  return {
    querySelector(selector) {
      if (selector.includes("data-config-url")) return official ? {} : null;
      if (selector === ".ol-viewport canvas") return canvas ? { width: 1265, height: 524 } : null;
      if (selector.includes("tlKliste")) return timeline ? { max: "2" } : null;
      if (selector.includes('data-menu-id="501"')) return selected ? {} : null;
      return null;
    }
  };
}

test("tick adapter requires the official live map and its three-day timeline", () => {
  const ready = readiness();
  assert.equal(ready(mapFixture()), true);
  for (const option of [{ official: false }, { canvas: false }, { timeline: false }, { selected: false }]) {
    assert.equal(ready(mapFixture(option)), false);
  }
  assert.equal(ready(null), false);
});

test("tick shell preserves native map and its own timeline without page scrolling", () => {
  assert.match(css, /body > :not\(#chmi-ticks-workspace\)/);
  assert.match(css, /\.chmu--map--timeline\s*\{[^}]*height: 66px/s);
  assert.match(css, /\.chmu--map--container/);
  assert.match(css, /\.ol-menu\s*\{[^}]*overflow-y: auto/s);
  assert.doesNotMatch(css, /\.ol-viewport\s*\{[^}]*display: none/s);
});
