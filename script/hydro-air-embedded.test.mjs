import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const air = "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/";
const pm10 = `${air}pm10-hodinovy-prumer`;
const overview = `${air}aktualni-mapy-kvality-ovzdusi-cr`;
const water = "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa";

function run({ url = pm10, referrer = overview, id = "air", ready = true, media = true } = {}) {
  const classes = new Set();
  const messages = [];
  const map = {
    getBoundingClientRect: () => ({ width: 760, height: 400 }),
    querySelector: () => media ? {} : null
  };
  const context = vm.createContext({
    URL, location: { href: url },
    document: {
      referrer, documentElement: { classList: { add: name => classes.add(name) } },
      addEventListener() {}, querySelectorAll: () => [],
      getElementById: name => name === "chmu-map-container" ? map : null,
      querySelector: selector => ready && selector ===
        "html.chmi-hydro-air-classic #chmu-map-container[data-chmi-hydro-air-native='verified']" ? map : null
    },
    window: { top: {}, name: `chmi-classic:${id}:test-session`, addEventListener() {},
      parent: { postMessage: (message, targetOrigin) => messages.push({ message, targetOrigin }) } },
    getComputedStyle: () => ({ visibility: "visible" }),
    setInterval() {}, clearInterval() {}
  });
  for (const file of ["portal-registry.js", "embedded.js"]) {
    vm.runInContext(readFileSync(new URL(`../chrome-edge/${file}`, import.meta.url), "utf8"), context);
  }
  return { classes, messages };
}

test("air native navigation and reload retain compact frame mode and send fresh readiness", () => {
  for (const referrer of ["https://www.chmi.cz/", overview, pm10]) {
    const result = run({ referrer });
    assert.ok(result.classes.has("chmi-classic-embedded"));
    assert.equal(result.messages.at(-1)?.message.state, "ready");
    assert.equal(result.messages.at(-1)?.targetOrigin, "https://www.chmi.cz");
  }
  assert.equal(run({ url: overview, referrer: pm10 }).messages.at(-1)?.message.state, "ready");
  assert.equal(run({ url: water, referrer: water, id: "water" }).messages.at(-1)?.message.state, "ready");
});

test("PM10 frame never reports ready for a missing adapter or missing map media", () => {
  for (const state of [{ ready: false }, { media: false }]) {
    assert.equal(run(state).messages.at(-1)?.message.state, "loading");
  }
});

test("native navigation exceptions still reject unrelated referrers and routes", () => {
  for (const referrer of ["https://evil.test/", `${air}unverified-map`, "http://www.chmi.cz/", water]) {
    assert.equal(run({ referrer }).messages.length, 0);
  }
  assert.equal(run({ url: `${pm10}-unknown` }).messages.length, 0);
});
