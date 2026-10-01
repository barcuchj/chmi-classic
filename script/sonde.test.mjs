import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/sonde.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/sonde.css"), "utf8");

function readyHelper() {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports;
}

const slider = () => ({ type: "range", min: "1", max: "12" });
const image = () => ({ complete: true, naturalWidth: 600, naturalHeight: 500,
  currentSrc: "data:image/png;base64,FAKE" });

test("readiness requires both decoded native replays and valid ranges", () => {
  const { replayReady, sondeReady } = readyHelper();
  assert.equal(replayReady(slider(), image()), true);
  assert.equal(sondeReady([{ slider: slider(), image: image() }, { slider: slider(), image: image() }]), true);
  assert.equal(sondeReady([{ slider: slider(), image: image() }]), false);
  for (const broken of [
    { ...image(), complete: false },
    { ...image(), naturalWidth: 0 },
    { ...image(), naturalHeight: 0 },
    { ...image(), currentSrc: "" },
    { ...image(), currentSrc: "https://example.invalid/fake.png" }
  ]) assert.equal(replayReady(slider(), broken), false);
  for (const broken of [
    { ...slider(), type: "text" }, { ...slider(), min: "12", max: "12" },
    { ...slider(), max: "unknown" }
  ]) assert.equal(replayReady(broken, image()), false);
});

function node(tag = "div") {
  const classes = new Set();
  return {
    tagName: tag.toUpperCase(), children: [], attributes: {}, classList: {
      add: name => classes.add(name), contains: name => classes.has(name)
    },
    addEventListener(name, callback) { this.listeners ??= {}; this.listeners[name] = callback; },
    append(...children) {
      for (const child of children) {
        if (child.parentElement) child.parentElement.children = child.parentElement.children.filter(other => other !== child);
        child.parentElement = this;
        this.children.push(child);
      }
    },
    setAttribute(name, value) { this.attributes[name] = value; }
  };
}

function page({ enabled = true, route = "/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa",
  loaded = true, menuComplete = true, playersCount = 2, storageMode = "callback" } = {}) {
  const classes = new Set();
  const products = ["Emagram do 100 hPa", "Emagram do 500 hPa", "Skew-T diagram", "Profil větru", "Hodograf", "ASCII Tabulka"];
  if (!menuComplete) products.pop();
  const items = products.map((name, index) => ({
    classList: { contains: value => value === "__selected" && index === 0 },
    querySelector: () => ({ getAttribute: () => name })
  }));
  const menu = { querySelectorAll: () => items };
  const map = node();
  map.querySelector = () => menu;
  const players = Array.from({ length: playersCount }, () => {
    const range = slider();
    const graph = image();
    graph.complete = loaded;
    const replay = node();
    replay.querySelector = selector => selector.includes("imageSlider") ? range :
      selector.includes("chmi-playableimage-img") ? graph : {};
    const boundary = node();
    boundary.classList.contains = value => value === "portlet-boundary_ChmiImagesReplay_";
    const portlet = { parentElement: boundary, querySelector: () => replay };
    return { range, graph, replay, boundary, portlet };
  });
  let mutation;
  let disconnected = false;
  let savedPreference;
  let reloadCount = 0;
  const body = node("body");
  const document = {
    body,
    documentElement: { classList: { add: value => classes.add(value) } },
    querySelector: selector => selector === "main #chmu-map-container" ? map :
      selector === "main h1" ? { textContent: "Praha - Libuš: Emagram do 100 hPa" } : null,
    querySelectorAll: selector => selector.includes("section.portlet") ? players.map(p => p.portlet) :
      selector === "main h2" ? [
        { textContent: "Emagram do 100 hPa - vzestup" },
        { textContent: "Emagram do 100 hPa - sestup" }
      ] : [],
    createElement: node,
    addEventListener() {}, removeEventListener() {}
  };
  const window = { addEventListener() {}, dispatchEvent() {} };
  const syncStorage = {
      get: (_, callback) => callback({ chmiRadarClassicEnabled: enabled }),
      set: (value, callback) => {
        savedPreference = value.chmiRadarClassicEnabled;
        if (storageMode === "callback" || storageMode === "both") callback();
        if (storageMode === "promise" || storageMode === "both") return Promise.resolve();
      }
  };
  const bridge = {
    get: syncStorage.get,
    set: value => { savedPreference = value.chmiRadarClassicEnabled; }
  };
  vm.runInNewContext(source, {
    window, document, location: { hostname: "www.chmi.cz", pathname: route, reload() { reloadCount++; } },
    chrome: storageMode === "bridge" ? undefined : { storage: { sync: syncStorage } },
    __chmiClassicStorage: storageMode === "bridge" ? bridge : undefined,
    MutationObserver: class {
      constructor(callback) { mutation = callback; }
      observe() {} disconnect() { disconnected = true; }
    },
    requestAnimationFrame: callback => callback(), Event: class {},
    setTimeout: () => 1, clearTimeout() {}
  });
  return { classes, body, map, players, mutation, disconnected: () => disconnected,
    savedPreference: () => savedPreference, reloadCount: () => reloadCount };
}

test("adapter waits for both images before moving native portlets and product menu", () => {
  const result = page({ loaded: false });
  assert.equal(result.classes.size, 0);
  assert.equal(result.body.children.length, 0);
  result.players[0].graph.complete = true;
  result.mutation();
  assert.equal(result.classes.size, 0);
  result.players[1].graph.complete = true;
  result.mutation();
  assert.equal(result.disconnected(), true);
  assert.equal(result.classes.has("chmi-sonde-classic"), true);
  const workspace = result.body.children[0];
  assert.equal(workspace.id, "chmi-sonde-workspace");
  assert.equal(workspace.children[0].id, "chmi-sonde-classic-brand");
  const restore = workspace.children[0].children[2];
  assert.equal(restore.textContent, "Nový vzhled");
  restore.listeners.click();
  assert.equal(result.savedPreference(), false);
  assert.equal(result.reloadCount(), 1);
  assert.equal(workspace.children[1].children[0], result.map);
  const cards = workspace.children[2].children;
  assert.equal(cards.length, 2);
  assert.equal(cards[0].children[1], result.players[0].boundary);
  assert.equal(cards[1].children[1], result.players[1].boundary);
});

test("restore reloads once for the synchronous userscript bridge and promise storage", async () => {
  for (const storageMode of ["bridge", "promise", "both"]) {
    const result = page({ storageMode });
    const restore = result.body.children[0].children[0].children[2];
    restore.listeners.click();
    await Promise.resolve();
    assert.equal(result.savedPreference(), false, `${storageMode} persists the preference`);
    assert.equal(result.reloadCount(), 1, `${storageMode} reloads exactly once`);
  }
});

test("disabled, pseudo forecast, incomplete menu or missing replay leaves native page alone", () => {
  for (const options of [
    { enabled: false },
    { route: "/letectvi/sportovni/11520-praha-libus-pseudosondaz-emagram-100hpa" },
    { menuComplete: false }, { playersCount: 1 }
  ]) {
    const result = page(options);
    assert.equal(result.classes.size, 0);
    assert.equal(result.body.children.length, 0);
  }
});

test("stylesheet scopes shell hiding to the verified adapter and keeps controls in the workspace", () => {
  assert.match(css, /html\.chmi-sonde-classic body > :not\(#chmi-sonde-workspace\)/);
  assert.match(css, /#chmi-sonde-classic-brand/);
  assert.match(css, /\.menu--ul\s*\{[^}]*display: flex !important/s);
  assert.match(css, /#chmi-playableimage-container\s*\{[^}]*overflow: hidden/s);
  assert.match(css, /img\.chmi-playableimage-img\s*\{[^}]*object-fit: contain/s);
  assert.match(css, /@media \(max-width: 800px\)/);
});
