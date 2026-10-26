import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { replayReady, forecastStep } = require("../chrome-edge/synoptic.js");

test("synoptic old look waits for real native map media and slider", () => {
  const slider = { type: "range", min: "1", max: "3" };
  const image = { complete: true, naturalWidth: 1240, naturalHeight: 802, src: "data:image/png;base64,example" };
  assert.equal(replayReady(slider, image), true);
  assert.equal(replayReady({ ...slider, max: "1" }, image), false);
  assert.equal(replayReady({ ...slider, type: "text" }, image), false);
  assert.equal(replayReady(slider, { ...image, complete: false }), false);
  assert.equal(replayReady(slider, { ...image, naturalWidth: 0 }), false);
  assert.equal(replayReady(slider, { ...image, src: "" }), false);
  assert.equal(replayReady(slider, { ...image, src: "https://www.chmi.cz/documents/d/chmi.cz/synop-bez-dat" }), false);
});

test("first forecast step follows the official timeline marker", () => {
  const slider = { min: "1", max: "4" };
  const replay = left => ({ querySelector: () => ({ closest: () => ({ style: { left } }) }) });
  assert.equal(forecastStep(slider, replay("33.3333%")), 2);
  assert.equal(forecastStep(slider, replay("66.6667%")), 3);
  assert.equal(forecastStep(slider, replay("101%")), null);
  assert.equal(forecastStep(slider, { querySelector: () => null }), null);
});

test("synoptic forecast and situation open the same native timeline in distinct modes", () => {
  const context = vm.createContext({ URL });
  vm.runInContext(readFileSync(new URL("../chrome-edge/portal-registry.js", import.meta.url), "utf8"), context);
  const registry = context.__chmiClassicApps;
  const situation = registry.columns[1].find(item => item.label === "Synoptická situace");
  const forecast = registry.columns[0].find(item => item.label === "Synoptická předpověď");
  assert.equal(situation.app, "synoptic");
  assert.equal(registry.get("synoptic").url, "https://www.chmi.cz/predpoved-pocasi/synopticka-situace");
  assert.equal(forecast.app, "synoptic-forecast");
  const target = new URL(registry.get(forecast.app).url);
  assert.equal(target.searchParams.get("chmi_classic_synoptic_forecast"), "1");
  assert.equal(registry.matches("synoptic-forecast", target), true);
  assert.equal(registry.matches("synoptic", target), false);
  const name = registry.frameName("synoptic", "test-session");
  assert.equal(registry.embeddedContext(new URL("https://www.chmi.cz/predpoved-pocasi/synopticka-situace?chmi_classic_embed=synoptic&chmi_classic_session=test-session"), name)?.id, "synoptic");
  assert.equal(registry.embeddedContext(new URL("https://evil.test/predpoved-pocasi/synopticka-situace"), name), null);
});
