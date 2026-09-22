import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/webcams.js"), "utf8");

function run(pathname, enabled = true) {
  const rootClasses = new Set();
  const workspaceClasses = new Set();
  const mapClasses = new Set();
  const listClasses = new Set();
  const workspace = { classList: { add: value => workspaceClasses.add(value) } };
  const mapBlock = { parentElement: workspace, classList: { add: value => mapClasses.add(value) } };
  const listBlock = { parentElement: workspace, classList: { add: value => listClasses.add(value) } };
  const playerBlock = { parentElement: workspace, classList: { add() {} } };
  const map = { dataset: {}, closest: () => mapBlock };
  const signpost = { closest: () => listBlock };
  const image = {};
  const player = { dataset: {}, closest: () => playerBlock,
    querySelector: selector => selector === ".chmi-playableimage-img" ? image : null };
  const window = { addEventListener() {}, dispatchEvent() {} };
  const document = {
    documentElement: { classList: { add: (...values) => values.forEach(value => rootClasses.add(value)) } },
    getElementById: id => id === "chmu-map-container" ? map : id === "chmi-playabledata" ? player : null,
    querySelector: selector => selector.startsWith("[id^=") ? signpost : null
  };
  vm.runInNewContext(source, {
    window, document, location: { hostname: "www.chmi.cz", pathname },
    chrome: { storage: { sync: { get: (_, callback) => callback({ chmiRadarClassicEnabled: enabled }) } } },
    requestAnimationFrame: () => {},
    MutationObserver: class { observe() {} disconnect() {} },
    setTimeout() {}, Event: class {}
  });
  return { rootClasses, workspaceClasses, mapClasses, listClasses, map, player };
}

test("native camera map and list are marked and share one compact workspace", () => {
  const result = run("/namerena-data/webkamery");
  assert.equal(result.map.dataset.chmiWebcamsNative, "verified");
  assert.ok(result.rootClasses.has("chmi-webcams-overview"));
  assert.ok(result.workspaceClasses.has("chmi-webcams-workspace"));
  assert.ok(result.mapClasses.has("chmi-webcams-map-block"));
  assert.ok(result.listClasses.has("chmi-webcams-list-block"));
});

test("native camera detail keeps the live image player", () => {
  const result = run("/namerena-data/webkamera/brno-brno");
  assert.equal(result.player.dataset.chmiWebcamsNative, "verified");
  assert.ok(result.rootClasses.has("chmi-webcams-detail"));
  assert.ok(result.workspaceClasses.has("chmi-webcams-detail-workspace"));
});

test("disabled classic mode and other routes are untouched", () => {
  assert.equal(run("/namerena-data/webkamery", false).rootClasses.size, 0);
  assert.equal(run("/namerena-data/webkamera/brno-brno/extra").rootClasses.size, 0);
});
