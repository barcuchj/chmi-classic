import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../chrome-edge/portal.js", import.meta.url), "utf8");
const start = source.indexOf('(() => {\n  "use strict";\n  if (window.__chmiHydroAirClassicLoaded');
assert.ok(start > 0, "hydro/air adapter is present");

test("hydro/air header explicitly resists the native column layout", () => {
  const css = readFileSync(new URL("../chrome-edge/portal.css", import.meta.url), "utf8");
  const header = css.match(/html\.chmi-hydro-air-classic #chmi-hydro-air-classic-brand \{([^}]+)\}/)?.[1];
  assert.match(header, /flex-direction: row !important/);
  assert.match(header, /flex-wrap: wrap/);
});

function classes() {
  const values = new Set();
  return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
}

function run(path, withMap = true, native = {}) {
  const rootClasses = classes();
  const mapClasses = classes();
  const contentClasses = classes();
  const styles = new Map();
  const content = { classList: contentClasses };
  const component = { parentElement: content };
  const attributes = new Map([["aria-hidden", "true"], ["aria-disabled", "true"]]);
  const config = path.startsWith("/voda/") ? "hydrologie.povrchove-vody" : "ovzdusi.kvalita";
  const map = withMap ? {
    dataset: {},
    classList: mapClasses,
    getAttribute: key => attributes.get(key) ?? null,
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: key => attributes.delete(key),
    querySelector(selector) {
      if (selector.includes("data-config-url")) return native.wrongConfig ? null : { config };
      if (selector === ".ol-viewport canvas") return { width: native.emptyCanvas ? 0 : 600, height: 400 };
      if (selector.includes("Časová osa")) return { disabled: Boolean(native.loading), max: "167" };
      return null;
    },
    closest: selector => selector === ".lfr-layout-structure-item-chmimapcomponent" ? component : null,
    getBoundingClientRect: () => ({ top: 40 })
  } : null;
  let brand = null;
  const main = { insertBefore(node) { brand = node; } };
  const document = {
    documentElement: { classList: rootClasses, style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) } },
    getElementById(id) { return id === "chmu-map-container" ? map : brand?.id === id ? brand : null; },
    querySelector(selector) { return selector === "main" ? main : null; },
    querySelectorAll(selector) { return selector === ".chmi-hydro-air-map-host" ? [map].filter(Boolean) : selector === ".chmi-hydro-air-content" ? [content] : []; },
    createElement() {
      const anchor = {};
      const tabs = Array.from({ length: 3 }, () => ({ attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } }));
      const button = { addEventListener(_name, callback) { this.click = callback; } };
      return { dataset: {}, querySelector: selector => selector === ".chmi-hydro-air-table" ? anchor :
          selector.startsWith("nav a:nth-child(") ? tabs[Number(selector.match(/\d+/)[0]) - 1] : button,
        anchor, tabs, button, remove() { brand = null; } };
    }
  };
  const window = { innerHeight: 720, addEventListener() {}, dispatchEvent() {} };
  const context = vm.createContext({
    document, window, location: { pathname: path, hostname: "www.chmi.cz" },
    MutationObserver: class { observe() {} },
    requestAnimationFrame: callback => callback(),
    Event: class { constructor(type) { this.type = type; } }
  });
  vm.runInContext(source.slice(start), context);
  return { rootClasses, mapClasses, contentClasses, styles, get brand() { return brand; }, map };
}

for (const [path, table] of [
  ["/voda/aktualni-stav-rek-povodnova-mapa", "/voda/tabulka-hydrologie"],
  ["/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr", "/namerena-data/data-z-mericich-stanic/tabulka-kvality-ovzdusi"]
]) {
  test(`${path} keeps its native map and offers official tabular data`, () => {
    const page = run(path);
    assert.equal(page.rootClasses.contains("chmi-hydro-air-classic"), true);
    assert.equal(page.mapClasses.contains("chmi-hydro-air-map-host"), true);
    assert.equal(page.contentClasses.contains("chmi-hydro-air-content"), true);
    assert.equal(page.styles.get("--chmi-hydro-air-fit-height"), "674px");
    assert.equal(page.map.dataset.chmiHydroAirNative, "verified");
    assert.equal(page.map.getAttribute("aria-hidden"), "false");
    assert.equal(new URL(page.brand.anchor.href).pathname, table);
    assert.equal(page.brand.dataset.kind, path.startsWith("/voda/") ? "water" : "air");
    assert.equal(page.brand.tabs[page.brand.dataset.kind === "water" ? 1 : 2].attributes["aria-current"], "page");
    page.brand.button.click();
    assert.equal(page.rootClasses.contains("chmi-hydro-air-classic"), false);
    assert.equal(page.contentClasses.contains("chmi-hydro-air-content"), false);
    assert.equal(page.mapClasses.contains("chmi-hydro-air-map-host"), false);
    assert.ok(page.map, "new-look toggle does not remove native data");
    assert.equal(page.map.getAttribute("aria-hidden"), "true");
  });
  test(`${path} stays native when the live map is absent`, () => {
    const page = run(path, false);
    assert.equal(page.rootClasses.contains("chmi-hydro-air-classic"), false);
    assert.equal(page.brand, null);
  });
  for (const state of ["loading", "emptyCanvas", "wrongConfig"]) {
    test(`${path} does not claim a ${state} map is ready`, () => {
      const page = run(path, true, { [state]: true });
      assert.equal(page.rootClasses.contains("chmi-hydro-air-classic"), false);
      assert.equal(page.map.dataset.chmiHydroAirNative, undefined);
      assert.equal(page.map.getAttribute("aria-hidden"), "true");
    });
  }
}
