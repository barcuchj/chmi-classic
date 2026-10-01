import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../chrome-edge/forecast.js", import.meta.url), "utf8");

function forecastCore() {
  const context = vm.createContext({ module: { exports: {} }, URL });
  vm.runInContext(source, context);
  return context.module.exports;
}

test("three-day panel validates live periods and never supplies a missing morning", () => {
  const core = forecastCore();
  const periods = core.normalizePeriods({ data: [
    { title: "Neděle odpoledne 19/23 °C", mapDataRequestToken: "dnes-odpoledne", weatherIcon: 40, weatherAlt: "Polojasno" },
    { title: "Pondělí ráno 9/5/3 °C", mapDataRequestToken: "zitra-rano", weatherIcon: 10, weatherAlt: "Jasno" },
    { title: "Pondělí ráno 9/5/3 °C", mapDataRequestToken: "https://evil.test/", weatherIcon: 10 },
    { title: "Neděle ráno 7 °C", mapDataRequestToken: "dnes-rano", weatherIcon: "../../evil" }
  ] });
  assert.equal(periods.length, 2);
  assert.equal(periods[0].temperature, "19/23");
  assert.equal(periods[0].weekday, "Neděle");
  assert.equal(periods[1].part, "rano");
  assert.equal(periods.some(period => period.token === "dnes-rano"), false);
  assert.equal(core.normalizePeriods({ data: null }).length, 0);
});

test("rolling period from today is fallback, not an overwrite of tomorrow's data", () => {
  const core = forecastCore();
  const fallback = { day: "zitra", part: "rano", token: "zitra-rano", temperature: "old" };
  const fresh = { ...fallback, temperature: "fresh" };
  const merged = core.mergePeriods([{ day: "dnes", periods: [fallback] }, { day: "zitra", periods: [fresh] }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].temperature, "fresh");
});

test("forecast period links use only exact official day routes", () => {
  const core = forecastCore();
  const url = new URL(core.periodURL("https://www.chmi.cz/", "pozitri-odpoledne"));
  assert.equal(url.pathname, "/predpoved-pocasi/pozitri");
  assert.equal(url.searchParams.get("obdobi"), "pozitri-odpoledne");
  for (const token of ["dnes-../../evil", "constructor", "zitra-noc", "https://evil.test/"]) {
    assert.equal(core.periodURL("https://www.chmi.cz/", token), null);
  }
  assert.equal(core.periodURL("https://evil.test/", "dnes-rano"), null);
});

test("portrait city list uses spare vertical room, not a short embedded panel", () => {
  const core = forecastCore();
  assert.equal(core.usePortraitCityList(390, 844), true);
  assert.equal(core.usePortraitCityList(700, 980), true);
  for (const [width, height] of [[1280, 720], [844, 390], [390, 350], [390, 568], [0, 844], [NaN, 844], [390, Infinity]]) {
    assert.equal(core.usePortraitCityList(width, height), false);
  }
});

test("forecast map aspect ratio comes from validated native SVG geometry", () => {
  const core = forecastCore();
  assert.equal(core.mapAspectRatio("0 0 2560 1471"), 2560 / 1471);
  assert.equal(core.mapAspectRatio("-10,-20,200,100"), 2);
  for (const viewBox of [null, "", "0 0 0 100", "0 0 100 -1", "0 0 NaN 100", "0 0 100 Infinity", "0 0 100 100 1"]) {
    assert.equal(core.mapAspectRatio(viewBox), null);
  }
});

test("forecast cards follow the rendered centre of their own region after resizing", () => {
  const { regionCardCenter } = forecastCore();
  assert.deepEqual({ ...regionCardCenter(
    { left: 620, top: 340, width: 160, height: 100 },
    { left: 200, top: 100, width: 900, height: 600 }
  ) }, { left: 500, top: 290 });
  assert.deepEqual({ ...regionCardCenter(
    { left: 410, top: 250, width: 80, height: 50 },
    { left: 100, top: 50, width: 650, height: 400 }
  ) }, { left: 350, top: 225 });
  assert.equal(regionCardCenter({ left: 0, top: 0, width: 0, height: 10 },
    { left: 0, top: 0, width: 100, height: 100 }), null);
});

test("forecast initialization waits for native checked property after DOM mutations", () => {
  const frames = [];
  const observations = [];
  let checked = false;
  let mutation;
  const candidate = {
    querySelector(selector) {
      if (selector.includes("viewBox")) return {};
      if (selector.includes("input:checked")) {
        observations.push(checked);
        return checked ? {} : null;
      }
      return {};
    },
    querySelectorAll() { return []; }
  };
  const context = vm.createContext({
    window: { addEventListener() {} },
    location: { hostname: "www.chmi.cz", pathname: "/predpoved-pocasi/dnes" },
    document: { querySelector: () => candidate, documentElement: {} },
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout() {},
    MutationObserver: class {
      constructor(callback) { mutation = callback; }
      observe() {}
      disconnect() {}
    }
  });
  vm.runInContext(source, context);
  assert.deepEqual(observations, [false]);
  mutation();
  mutation();
  assert.equal(frames.length, 1, "batch native mutations into one frame");
  checked = true; // Native async continuation changes a property, not an attribute.
  frames.shift()();
  assert.deepEqual(observations, [false, true]);
});

test("forecast adapter does not touch county or unrelated pages", () => {
  for (const pathname of ["/predpoved-pocasi/praha/dnes", "/predpoved-pocasi/tyden", "/namerena-data"]) {
    const context = vm.createContext({
      window: {}, location: { hostname: "www.chmi.cz", pathname },
      document: { querySelector() { throw new Error("must not inspect unrelated page"); } }
    });
    vm.runInContext(source, context);
    assert.equal(context.window.__chmiClassicForecastLoaded, undefined);
  }
});
