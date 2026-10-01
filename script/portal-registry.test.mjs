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
  assert.match(source, /\$\{synopticJs/);
  assert.match(source, /\$\{synopticCss/);
  assert.match(source, /\$\{sondeJs/);
  assert.match(source, /\$\{sondeCss/);
  assert.match(source, /\$\{klementinumJs/);
  assert.match(source, /\$\{klementinumCss/);
  assert.match(source, /\$\{stationsJs/);
  assert.match(source, /\$\{stationsCss/);
  assert.match(source, /\$\{ticksJs/);
  assert.match(source, /\$\{ticksCss/);
  assert.match(source, /\$\{bioJs/);
  assert.match(source, /\$\{bioCss/);
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
test("sonde directory opens only measured Praha-Libuš data, not the forecast pseudosonde", () => {
  assert.equal(registry.columns[2][7].app, "sonde");
  const app = registry.get("sonde");
  assert.equal(app.url, "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa");
  const framed = new URL(registry.frameURL("sonde", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("sonde", "test-session"))?.id, "sonde");
  for (const url of [
    "https://www.chmi.cz/letectvi/sportovni/11520-praha-libus-pseudosondaz-emagram-100hpa",
    "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-500hpa",
    "https://evil.test/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa"
  ]) assert.equal(registry.embeddedContext(new URL(url), registry.frameName("sonde", "test-session")), null);
});
test("Klementinum directory opens only the verified live station detail", () => {
  assert.equal(registry.columns[3][2].app, "klementinum");
  const app = registry.get("klementinum");
  assert.equal(app.url, "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum");
  const framed = new URL(registry.frameURL("klementinum", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("klementinum", "test-session"))?.id, "klementinum");
  for (const url of [
    "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
    "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/l3aber01-abertamy",
    "https://evil.test/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum"
  ]) assert.equal(registry.embeddedContext(new URL(url), registry.frameName("klementinum", "test-session")), null);
});
test("meteorological station directory uses the verified native station map", () => {
  assert.equal(registry.columns[3].at(-1).app, "stations");
  const app = registry.get("stations");
  assert.equal(app.url, "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke");
  const framed = new URL(registry.frameURL("stations", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("stations", "test-session"))?.id, "stations");
  for (const url of [
    "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/ovzdusi",
    "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/l3aber01-abertamy",
    "https://evil.test/namerena-data/umisteni-mericich-stanic/meteorologicke"
  ]) assert.equal(registry.embeddedContext(new URL(url), registry.frameName("stations", "test-session")), null);
});
test("tick activity directory uses only the official live three-day map", () => {
  assert.equal(registry.columns[1].at(-1).app, "ticks");
  const app = registry.get("ticks");
  assert.equal(app.url, "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat");
  const framed = new URL(registry.frameURL("ticks", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("ticks", "test-session"))?.id, "ticks");
  for (const url of [
    "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-komaru",
    "https://info.chmi.cz/bio/mapy.php?type=kliste",
    "https://evil.test/predpoved-pocasi/rizika/aktivita-klistat"
  ]) assert.equal(registry.embeddedContext(new URL(url), registry.frameName("ticks", "test-session")), null);
});
test("bio forecast directory opens the official live two-day map", () => {
  assert.equal(registry.columns[0][5].app, "bio");
  const app = registry.get("bio");
  assert.equal(app.url, "https://www.chmi.cz/predpoved-pocasi/bio-predpoved");
  const framed = new URL(registry.frameURL("bio", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("bio", "test-session"))?.id, "bio");
  for (const url of [
    "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat",
    "https://info.chmi.cz/biometeo/index.php",
    "https://evil.test/predpoved-pocasi/bio-predpoved"
  ]) assert.equal(registry.embeddedContext(new URL(url), registry.frameName("bio", "test-session")), null);
});
test("lightning opens the official radar in a distinct old-look mode", () => {
  assert.equal(registry.columns[2][3].app, "lightning");
  const standalone = new URL(registry.get("lightning").url);
  assert.equal(standalone.origin, "https://produkty.chmi.cz");
  assert.equal(standalone.pathname, "/radar/");
  assert.equal(standalone.searchParams.get("chmi_classic_lightning"), "1");
  const framed = new URL(registry.frameURL("lightning", "test-session"));
  assert.equal(framed.searchParams.get("chmi_classic_lightning"), "1");
  assert.equal(registry.embeddedContext(framed, registry.frameName("lightning", "test-session"))?.id, "lightning");
  assert.equal(registry.matches("radar", framed), false);
  assert.equal(registry.matches("lightning", new URL("https://produkty.chmi.cz/radar/")), false);
  assert.equal(registry.matches("lightning", new URL("https://evil.test/radar/?chmi_classic_lightning=1")), false);
});
test("ALADIN animation and four-map viewer have distinct routes on the same official app", () => {
  assert.equal(registry.columns[1][0].app, "aladin-animation");
  assert.equal(registry.columns[1][1].app, "aladin");
  const standalone = new URL(registry.get("aladin-animation").url);
  assert.equal(standalone.origin, "https://produkty.chmi.cz");
  assert.equal(standalone.pathname, "/aladin/");
  assert.equal(standalone.searchParams.get("chmi_classic_animation"), "1");
  const framed = new URL(registry.frameURL("aladin-animation", "test-session"));
  assert.equal(registry.embeddedContext(framed, registry.frameName("aladin-animation", "test-session"))?.id, "aladin-animation");
  assert.equal(registry.matches("aladin", framed), false);
  assert.equal(registry.matches("aladin-animation", new URL("https://produkty.chmi.cz/aladin/")), false);
  assert.equal(registry.matches("aladin-animation", new URL("https://evil.test/aladin/?chmi_classic_animation=1")), false);
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
test("embedded Úvod returns to the classic portal only for a genuine home link", () => {
  assert.equal(registry.isHomeLink(new URL("https://www.chmi.cz/uvod")), true);
  assert.equal(registry.isHomeLink(new URL("https://www.chmi.cz/?t=123")), true);
  for (const href of ["https://www.chmi.cz/namerena-data", "https://evil.test/uvod", "http://www.chmi.cz/"]) {
    assert.equal(registry.isHomeLink(new URL(href)), false);
  }
  const source = {};
  const frame = { contentWindow: source };
  const event = { source, origin: "https://produkty.chmi.cz", data: {
    type: "chmi-classic-navigate", app: "aladin-animation", session: "test-session", target: "home"
  } };
  assert.equal(registry.acceptsNavigation(event, frame, "aladin-animation", "test-session"), true);
  assert.equal(registry.acceptsNavigation({ ...event, origin: "https://evil.test" }, frame, "aladin-animation", "test-session"), false);
  assert.equal(registry.acceptsNavigation({ ...event, source: {} }, frame, "aladin-animation", "test-session"), false);
  assert.equal(registry.acceptsNavigation({ ...event, data: { ...event.data, target: "https://evil.test/" } }, frame, "aladin-animation", "test-session"), false);
  assert.equal(registry.acceptsNavigation(event, frame, "aladin-animation", "other-session"), false);
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
