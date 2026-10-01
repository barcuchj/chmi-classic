import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/stations.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/stations.css"), "utf8");

function readiness() {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports.stationMapReady;
}

function mapFixture({ canvas = true, menu = true, selected = true, official = true } = {}) {
  const required = [101, 103, 104, 105, 106, 107];
  const items = required.map(id => ({ dataset: { menuId: String(id) },
    classList: { contains: name => name === "__selected" && selected && id === 101 } }));
  const menuNode = menu ? { querySelectorAll: () => items } : null;
  return {
    querySelector(selector) {
      if (selector.includes("data-config-url")) return official ? {} : null;
      if (selector === ".ol-menu .menu--ul") return menuNode;
      if (selector === ".ol-viewport canvas") return canvas ? { width: 1265, height: 648 } : null;
      return null;
    }
  };
}

test("station adapter waits for official map, canvas and working filters", () => {
  const ready = readiness();
  assert.equal(ready(mapFixture()), true);
  for (const option of [{ canvas: false }, { menu: false }, { selected: false }, { official: false }]) {
    assert.equal(ready(mapFixture(option)), false);
  }
  assert.equal(ready(null), false);
});

test("station CSS keeps the native map live and limits scroll to compact controls", () => {
  assert.match(css, /html\.chmi-stations-classic body > :not\(#chmi-stations-workspace\)/);
  assert.match(css, /#chmu-map-container/);
  assert.match(css, /\.ol-menu\s*\{[^}]*overflow-y: auto/s);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.doesNotMatch(css, /\.ol-viewport\s*\{[^}]*display: none/s);
});
