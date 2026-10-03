import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/ticks.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/ticks.css"), "utf8");

function readiness(name = "tickMapReady") {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports[name];
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

function pollenFixture({ official = true, canvas = true, timeline = true, disabled = false, selected = true, max = "2" } = {}) {
  return {
    querySelector(selector) {
      if (selector.includes('data-config-url="https://data-provider.chmi.cz/api/map/init/rizika.pyl"')) return official ? {} : null;
      if (selector === ".ol-viewport canvas") return canvas ? { width: 1265, height: 596 } : null;
      if (selector.includes("tlBioBase")) return timeline ? { max, disabled } : null;
      if (selector.includes('data-menu-id="502"')) return selected ? {} : null;
      return null;
    }
  };
}

test("pollen waits for its own official live map, selected layer and enabled three-day controls", () => {
  const ready = readiness("pollenMapReady");
  assert.equal(ready(pollenFixture()), true);
  for (const options of [{ official: false }, { canvas: false }, { timeline: false }, { disabled: true }, { selected: false }, { max: "0" }]) {
    assert.equal(ready(pollenFixture(options)), false);
  }
  assert.equal(ready(mapFixture()), false, "the tick map is not a pollen map");
  assert.equal(ready(null), false);
});

test("risk map readiness also accepts the native mobile configuration URL", () => {
  for (const [name, config, fixture] of [
    ["pollenMapReady", "rizika.pyl", pollenFixture()],
    ["tickMapReady", "rizika.klistata", mapFixture()]
  ]) {
    const query = fixture.querySelector.bind(fixture);
    fixture.querySelector = selector => selector.includes("data-config-url")
      ? (selector.includes(`data-config-url="https://data-provider.chmi.cz/api/map/init/${config}?client=mobile"`) ? {} : null)
      : query(selector);
    assert.equal(readiness(name)(fixture), true, `${name} must work on direct mobile entry`);
  }
});

test("pollen route reuses the native-map shell and observes asynchronous timeline readiness", () => {
  assert.match(source, /pylovy-semafor/);
  assert.match(source, /Pylový semafor/);
  assert.match(source, /attributeFilter:.*"disabled"/);
  assert.doesNotMatch(source, /fetch\(|innerHTML\s*=|cloneNode\(/);
});

test("compact risk timeline also shrinks its native inner wrapper so day labels are not clipped", () => {
  assert.match(css, /\.timeline--wrapper\s*\{[^}]*height: 48px !important/s);
  assert.match(css, /\.top--line\s*\{[^}]*height: 18px !important/s);
  assert.match(css, /\.top--label\s*\{[^}]*height: 18px !important/s);
});

function runAdapter({ enabled = true, host = "www.chmi.cz", path = "/predpoved-pocasi/rizika/pylovy-semafor", ready = true } = {}) {
  const created = [];
  function element(tag) {
    const node = { tag, children: [], attributes: {}, append(...children) { this.children.push(...children); },
      setAttribute(name, value) { this.attributes[name] = value; }, addEventListener() {} };
    created.push(node);
    return node;
  }
  const boundary = element("native-portlet");
  const map = pollenFixture({ timeline: ready });
  map.attributes = { "aria-hidden": "true", "aria-disabled": "true" };
  map.setAttribute = (name, value) => { map.attributes[name] = value; };
  map.closest = () => boundary;
  const body = element("body");
  const classes = [];
  const storage = { get(defaults, callback) { callback({ chmiRadarClassicEnabled: enabled }); } };
  const context = {
    location: { hostname: host, pathname: path },
    chrome: { storage: { sync: storage } },
    window: { addEventListener() {}, dispatchEvent() {} },
    document: { body, createElement: element, documentElement: { classList: { add(name) { classes.push(name); } } },
      querySelector(selector) { return selector === "main #chmu-map-container" ? map : null; } },
    MutationObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame(callback) { callback(); }, Event: class {},
    setTimeout() { return 1; }, clearTimeout() {}
  };
  vm.runInNewContext(source, context);
  return { body, boundary, map, classes, created };
}

test("pollen adapter moves the original portlet, not a duplicate, and labels the right application", () => {
  const { body, boundary, map, classes, created } = runAdapter();
  const workspace = body.children[0];
  assert.equal(workspace.id, "chmi-ticks-workspace");
  assert.equal(workspace.children[1], boundary);
  assert.equal(created.find(n => n.tag === "h1").textContent, "Pylový semafor");
  assert.deepEqual(classes, ["chmi-ticks-classic"]);
  assert.equal(map.attributes["aria-disabled"], "false");
  assert.equal(map.attributes["aria-hidden"], "false");
});

test("disabled mode, unrelated pages and incomplete live data keep the native page untouched", () => {
  for (const options of [{ enabled: false }, { host: "evil.test" }, { path: "/predpoved-pocasi/rizika/pylovy-semafor/vice-o-pylovem-semaforu" }, { ready: false }]) {
    const { body, map, classes } = runAdapter(options);
    assert.equal(body.children.length, 0);
    assert.equal(classes.length, 0);
    assert.equal(map.attributes["aria-disabled"], "true");
    assert.equal(map.attributes["aria-hidden"], "true");
  }
});
