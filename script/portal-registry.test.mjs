import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const context = vm.createContext({ URL });
vm.runInContext(readFileSync(new URL("../chrome-edge/portal-registry.js", import.meta.url), "utf8"), context);
const registry = context.__chmiClassicApps;

test("only the current homepage gets the portal shell", () => {
  for (const path of ["/", "/uvod", "/uvod/"]) assert.equal(registry.isHomepage(new URL(`https://www.chmi.cz${path}`)), true);
  assert.equal(registry.isHomepage(new URL("https://www.chmi.cz/namerena-data")), false);
  assert.equal(registry.isHomepage(new URL("https://chmi.cz.evil.test/")), false);
});
test("hash routes cannot inject arbitrary frame URLs", () => {
  assert.equal(registry.route(""), "forecast");
  assert.equal(registry.route("#classic=meteosat"), "meteosat");
  for (const bad of ["#classic=https://evil.test/", "#classic=__proto__", "#classic=constructor", "#classic=%72adar"]) assert.equal(registry.route(bad), "radar");
  assert.equal(registry.frameURL("constructor", "abcdefgh"), null);
});
test("forecast days remain explicit same-origin panel routes", () => {
  assert.equal(registry.columns[0][0].app, "forecast");
  const name = registry.frameName("forecast", "test-session");
  for (const day of ["dnes", "zitra", "pozitri"]) {
    assert.equal(registry.embeddedContext(new URL(`https://www.chmi.cz/predpoved-pocasi/${day}?obdobi=dnes-rano`), name)?.id, "forecast");
  }
  for (const url of ["https://evil.test/predpoved-pocasi/dnes", "https://www.chmi.cz/predpoved-pocasi/tyden", "https://www.chmi.cz/predpoved-pocasi/praha/dnes"]) {
    assert.equal(registry.embeddedContext(new URL(url), name), null);
  }
});
test("userscript builder includes the forecast adapter and its CSS", () => {
  const source = readFileSync(new URL("./build_userscript.mjs", import.meta.url), "utf8");
  assert.match(source, /forecast\.js/);
  assert.match(source, /forecast\.css/);
  assert.match(source, /\$\{forecastJs/);
  assert.match(source, /\$\{forecastCss/);
  assert.match(source, /\$\{rainfallJs/);
  assert.match(source, /\$\{rainfallCss/);
});
test("embedded URLs preserve application settings and bind a session", () => {
  const url = new URL(registry.frameURL("meteosat", "test-session"));
  assert.equal(url.searchParams.get("time_range"), "24");
  assert.equal(url.searchParams.get("chmi_classic_embed"), "meteosat");
  assert.equal(url.searchParams.get("chmi_classic_session"), "test-session");
  assert.equal(registry.matches("meteosat", url), true);
  assert.equal(registry.matches("radar", url), false);
});
test("only an ordinary primary click is captured by the central panel", () => {
  assert.equal(registry.shouldOpenInPanel({ button: 0 }), true);
  for (const modifier of ["metaKey", "ctrlKey", "shiftKey", "altKey", "defaultPrevented"]) {
    assert.equal(registry.shouldOpenInPanel({ button: 0, [modifier]: true }), false);
  }
  for (const button of [1, 2]) assert.equal(registry.shouldOpenInPanel({ button }), false);
  for (const app of Object.values(registry.apps)) {
    const url = new URL(app.url);
    assert.equal(url.searchParams.has("chmi_classic_embed"), false);
    assert.equal(url.searchParams.has("chmi_classic_session"), false);
  }
});
test("Meteosat native URL normalization cannot lose the embedded context", () => {
  const name = registry.frameName("meteosat", "test-session");
  const normalized = new URL("https://produkty.chmi.cz/druzice/?satellite=mtg&projection=cz&time_range=24");
  assert.equal(registry.embeddedContext(normalized, name)?.id, "meteosat");
  assert.equal(registry.embeddedContext(normalized, name)?.session, "test-session");
  assert.equal(registry.embeddedContext(new URL("https://evil.test/druzice/"), name), null);
  assert.equal(registry.embeddedContext(normalized, registry.frameName("radar", "test-session")), null);
  assert.equal(registry.embeddedContext(normalized, "chmi-classic:constructor:test-session"), null);
  assert.equal(registry.embeddedContext(normalized, "chmi-classic:meteosat:short"), null);
});
test("webcam overview and detail stay in one allowlisted portal app", () => {
  const name = registry.frameName("webcams", "test-session");
  assert.equal(registry.matches("webcams", new URL("https://www.chmi.cz/namerena-data/webkamery")), true);
  assert.equal(registry.embeddedContext(new URL("https://www.chmi.cz/namerena-data/webkamera/brno-brno"), name)?.id, "webcams");
  for (const url of ["https://www.chmi.cz/namerena-data/webkamera/", "https://www.chmi.cz/namerena-data/webkamera/brno-brno/extra", "https://evil.test/namerena-data/webkamera/brno-brno"]) {
    assert.equal(registry.embeddedContext(new URL(url), name), null);
  }
});
test("meteogram panel accepts only official place routes, including native navigation", () => {
  assert.equal(registry.columns[1][2].app, "meteogram");
  assert.equal(registry.get("meteogram").url, "https://www.chmi.cz/meteogram/355-praha");
  const name = registry.frameName("meteogram", "test-session");
  for (const path of ["/meteogram/355-praha", "/meteogram/387-prostejov/"]) {
    assert.equal(registry.embeddedContext(new URL(`https://www.chmi.cz${path}`), name)?.id, "meteogram");
  }
  for (const url of ["https://evil.test/meteogram/355-praha", "https://www.chmi.cz/meteogram/", "https://www.chmi.cz/meteogram/355-praha/extra", "https://www.chmi.cz/meteogram/javascript:bad"]) {
    assert.equal(registry.embeddedContext(new URL(url), name), null);
  }
});
test("rainfall native query links stay on the exact old-viewer page", () => {
  const name = registry.frameName("rainfall", "test-session");
  for (const query of ["?id=1&t=r", "?id=6&t=s", "?chmi_classic_embed=rainfall&chmi_classic_session=test-session"]) {
    assert.equal(registry.embeddedContext(new URL(`https://hydro.chmi.cz/hppsoldv/main_rain.php${query}`), name)?.id, "rainfall");
  }
  assert.equal(registry.embeddedContext(new URL("https://hydro.chmi.cz/hppsoldv/hpps_act_rain.php"), name), null);
});
test("readiness messages require exact origin, frame, app and session", () => {
  const source = {};
  const frame = { contentWindow: source };
  const event = { source, origin: "https://produkty.chmi.cz", data: { type: "chmi-classic-status", app: "radar", session: "test-session", state: "ready" } };
  assert.equal(registry.accepts(event, frame, "radar", "test-session"), true);
  assert.equal(registry.accepts({ ...event, origin: "https://evil.test" }, frame, "radar", "test-session"), false);
  assert.equal(registry.accepts({ ...event, source: {} }, frame, "radar", "test-session"), false);
  assert.equal(registry.accepts(event, frame, "radar", "old-session"), false);
  assert.equal(registry.accepts(event, null, "radar", "test-session"), false);
  assert.equal(registry.accepts(event, frame, "meteosat", "test-session"), false);
});
test("every old-directory entry has a known adapter or a reason and no URL", () => {
  for (const item of [...registry.columns.flat(), ...registry.supplementary]) {
    assert.ok(item.label);
    if (item.app) assert.ok(registry.get(item.app));
    else { assert.ok(item.reason); assert.equal(item.href, undefined); }
  }
});
test("homepage source never embeds archived readings or asserts warning absence", () => {
  const source = readFileSync(new URL("../chrome-edge/portal.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Image24|archivní náhled|Není v platnosti žádná výstraha|const stations/);
  assert.doesNotMatch(source, /body\.replaceChildren/);
});
