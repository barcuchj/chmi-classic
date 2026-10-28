import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
const require = createRequire(import.meta.url);
const context = vm.createContext({ URL });
vm.runInContext(readFileSync(new URL("../chrome-edge/portal-registry.js", import.meta.url), "utf8"), context);
const registry = context.__chmiClassicApps;
test("three additional directory entries have bounded panel destinations", () => {
  for (const [label, id] of [["Počasí a kůrovec", "bark-beetle"], ["Vertikální profily větru", "wind-profiles"], ["Nalezli jste radiosondu?", "found-sonde"]]) {
    assert.equal(registry.columns.flat().find(item => item.label === label)?.app, id);
    const app = registry.get(id);
    assert.ok(app);
    assert.equal(registry.nativeAppFor(new URL(app.url)), id);
    assert.equal(registry.matches(id, new URL(app.url + "/unknown")), false);
    assert.equal(registry.matches(id, new URL(app.url.replace("www.chmi.cz", "evil.test"))), false);
    const frame = new URL(registry.frameURL(id, "next-test-session"));
    assert.equal(registry.embeddedContext(frame, registry.frameName(id, "next-test-session"))?.id, id);
  }
  assert.equal(registry.matches("wind-profiles", new URL("https://www.chmi.cz/letectvi/sportovni/11406-cheb-pseudosondaz-emagram-100hpa")), false);
});
test("bark beetle waits for its own live layer without inventing a three-day forecast", () => {
  const { barkBeetleMapReady } = require("../chrome-edge/ticks.js");
  const fixture = (config = true, canvas = true, selected = true) => ({ querySelector(selector) {
    if (selector.includes("data-config-url")) return config ? {} : null;
    if (selector === ".ol-viewport canvas") return canvas ? {width:1200,height:600} : null;
    if (selector.includes('data-menu-id="504"')) return selected ? {} : null;
    return null;
  }});
  assert.equal(barkBeetleMapReady(fixture()), true);
  for (const args of [[false,true,true],[true,false,true],[true,true,false]]) assert.equal(barkBeetleMapReady(fixture(...args)), false);
});
test("wind replay rejects missing or undecoded measured images and disabled sliders", () => {
  const { replayReady, stationForPath } = require("../chrome-edge/wind-profiles.js");
  const slider = {type:"range",min:"1",max:"12",disabled:false};
  const image = {complete:true,naturalWidth:1000,naturalHeight:400};
  assert.equal(replayReady(slider, image), true);
  assert.equal(replayReady({...slider,disabled:true}, image), false);
  assert.equal(replayReady(slider, {...image,naturalWidth:0}), false);
  assert.equal(replayReady(slider, {...image,complete:false}), false);
  assert.equal(replayReady({...slider,max:"1"}, image), false);
  assert.equal(stationForPath("/letectvi/aerologicka-data/11406-cheb-vyvoj-profilu-vetru").id, "11406");
  assert.equal(stationForPath("/letectvi/sportovni/11406-cheb-pseudosondaz-emagram-100hpa"), null);
  assert.equal(stationForPath("/letectvi/aerologicka-data/99999-fake-vyvoj-profilu-vetru"), null);
});
test("new standalone adapters respect disabled mode and leave unrelated routes untouched", () => {
  for (const [file, path] of [["wind-profiles.js", "/letectvi/aerologicka-data/11406-cheb-vyvoj-profilu-vetru"], ["found-sonde.js", "/letectvi/aerologicka-mereni/nalezli-jste-radiosondu"]]) {
    const source = readFileSync(new URL(`../chrome-edge/${file}`, import.meta.url), "utf8");
    for (const [hostname, pathname, enabled] of [["www.chmi.cz", path, false], ["evil.test", path, true], ["www.chmi.cz", path + "/unknown", true]]) {
      let domReads = 0;
      const context = { location: {hostname, pathname}, window: {}, document: {querySelector() {domReads++;}},
        chrome: {storage:{sync:{get(defaults, callback) {callback({chmiRadarClassicEnabled:enabled});}}}} };
      vm.runInNewContext(source, context);
      assert.equal(domReads, 0, `${file}: disabled/unrelated page must not be adapted`);
    }
  }
});
