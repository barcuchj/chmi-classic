import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../chrome-edge/embedded.js", import.meta.url), "utf8");

function runEmbedded({ referrer, stored = new Map(), visibleFilters = new Set(["fkraj", "foblast", "frbot"]) }) {
  const posted = [];
  const box = (visible = true) => ({
    getBoundingClientRect() { return { width: visible ? 320 : 0, height: visible ? 40 : 0 }; }
  });
  const table = box(true);
  const status = { dataset: { state: "empty" }, ...box(true) };
  const workspace = {
    dataset: { kind: "list" },
    ...box(true),
    querySelector(selector) {
      if (selector === "#chmi-snow-status") return status;
      if (selector === "table.chmi-snow-data-table") return table;
      const name = /^#(fkraj|foblast|frbot),/.exec(selector)?.[1];
      return name ? box(visibleFilters.has(name)) : null;
    },
    querySelectorAll(selector) {
      return selector === "table.chmi-snow-data-table tr" ? [{}, {}] : [];
    }
  };
  const registry = {
    embeddedContext() { return { id: "snow", session: "test-session" }; },
    matches(id, url) { return id === "snow" && url.hostname === "hydro.chmi.cz" && /hpps_snh_(?:list|detail)\.php$/.test(url.pathname); },
    isHomepage(url) { return url.protocol === "https:" && url.hostname === "www.chmi.cz" && ["/", "/uvod"].includes(url.pathname); },
    shouldOpenInPanel() { return false; },
    isHomeLink() { return false; },
    get() { return { family: "snow" }; }
  };
  const document = {
    referrer,
    documentElement: { classList: { add() {} } },
    addEventListener() {},
    querySelector(selector) {
      if (selector.includes("html.chmi-snow-classic #chmi-snow-workspace")) return workspace;
      return null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; }
  };
  const window = {
    top: {},
    name: "chmi-classic:snow:test-session",
    parent: { postMessage(message, targetOrigin) { posted.push({ message, targetOrigin }); } },
    addEventListener() {}
  };
  const sessionStorage = {
    setItem(key, value) { stored.set(key, String(value)); },
    getItem(key) { return stored.has(key) ? stored.get(key) : null; }
  };
  const sandbox = {
    URL,
    location: { href: "https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php?sort=3" },
    document,
    window,
    sessionStorage,
    getComputedStyle() { return { visibility: "visible" }; },
    setInterval() { return 1; },
    clearInterval() {},
    chrome: { storage: { sync: { get(_defaults, callback) { callback({ chmiRadarClassicEnabled: true }); } } } },
    __chmiClassicApps: registry
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox);
  return { posted, stored };
}

test("snow embedded parent origin survives native HPPS self-navigation", () => {
  const stored = new Map();
  const first = runEmbedded({ referrer: "https://www.chmi.cz/", stored });
  assert.equal(first.posted.at(-1)?.targetOrigin, "https://www.chmi.cz");
  assert.equal(stored.get("chmi-classic-parent-origin:snow:test-session"), "https://www.chmi.cz");

  const afterSubmit = runEmbedded({
    referrer: "https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php?fkraj=108",
    stored
  });
  assert.equal(afterSubmit.posted.at(-1)?.targetOrigin, "https://www.chmi.cz");
  assert.equal(afterSubmit.posted.at(-1)?.message.state, "ready");
});

test("snow list readiness requires visible Kraj, Oblast and Kategorie controls", () => {
  const missingCategory = runEmbedded({
    referrer: "https://www.chmi.cz/",
    visibleFilters: new Set(["fkraj", "foblast"])
  });
  assert.equal(missingCategory.posted.at(-1)?.message.state, "loading");
});

test("embedded snow patch never introduces wildcard postMessage target", () => {
  assert.doesNotMatch(source, /postMessage\([\s\S]*?,\s*["']\*["']\s*\)/);
  assert.match(source, /savedParent\.protocol === "https:" && registry\.isHomepage\(savedParent\)/);
});
