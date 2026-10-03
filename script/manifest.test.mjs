import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, "chrome-edge/manifest.json"), "utf8"));

test("extension and toolbar icons are packaged PNGs at the declared sizes", () => {
  for (const size of [16, 32, 48, 128]) {
    const path = manifest.icons?.[size];
    assert.equal(typeof path, "string", `extension icon ${size} is missing`);
    assert.equal(manifest.action.default_icon?.[size], path, `toolbar icon ${size} differs`);
    assert.match(path, /^icons\/icon-\d+\.png$/);
    const png = readFileSync(join(root, "chrome-edge", path));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.toString("ascii", 12, 16), "IHDR");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

function covers(pattern, url) {
  const regex = new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
  return regex.test(url);
}

test("specific adapters cover live ČHMÚ URLs with query parameters", () => {
  const urls = [
    "https://www.chmi.cz/?t=202610011550&c=50.0000,15.8258,7.7307",
    "https://www.chmi.cz/uvod?t=202610011550",
    "https://www.chmi.cz/namerena-data/webkamery?c=50.0000,15.8258,7.7307&l=webkamery,ZTM",
    "https://www.chmi.cz/predpoved-pocasi/dnes?obdobi=dnes-odpoledne",
    "https://www.chmi.cz/predpoved-pocasi/tyden?obdobi=tyden",
    "https://www.chmi.cz/predpoved-pocasi/mesic",
    "https://www.chmi.cz/predpoved-pocasi/karlovarsky-kraj/dnes?obdobi=dnes-odpoledne",
    "https://www.chmi.cz/predpoved-pocasi/praha/zitra?obdobi=zitra-rano",
    "https://www.chmi.cz/predpoved-pocasi/kraj-vysocina/pozitri",
    "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke?c=50,15,8",
    "https://hydro.chmi.cz/hppsoldv/main_rain.php?id=1&t=r"
  ];
  for (const url of urls) {
    const specific = manifest.content_scripts.filter(rule => rule.js?.includes("portal-registry.js") &&
      rule.matches.some(pattern => covers(pattern, url)) &&
      !(rule.exclude_matches ?? []).some(pattern => covers(pattern, url)));
    assert.equal(specific.length, 1, `${url} must use one specific adapter`);
    assert.ok(specific[0].js.some(file => ["portal.js", "webcams.js", "forecast.js", "week.js", "monthly.js", "regions.js", "stations.js", "rainfall.js"].includes(file)));
  }
});

test("Chrome and userscript share a numeric version newer than published betas", () => {
  assert.ok(manifest.description.length <= 132, `description has ${manifest.description.length} characters`);
  assert.match(manifest.version, /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){2}$/);
  assert.ok(manifest.version.split(".").every(part => Number(part) <= 65535));
  assert.equal(manifest.version_name, undefined, "display the actual numeric version");
  const previous = [0, 7, 0, 25];
  const current = manifest.version.split(".").map(Number);
  const differing = previous.findIndex((value, i) => value !== (current[i] ?? 0));
  assert.ok(differing >= 0 && (current[differing] ?? 0) > previous[differing]);
  const builder = readFileSync(join(root, "script/build_userscript.mjs"), "utf8");
  assert.ok(builder.includes('// @version      ${manifest.version}'));
  const packageScript = readFileSync(join(root, "script/package_release.sh"), "utf8");
  assert.ok(packageScript.includes("manifest.json').version\""));
  assert.ok(!packageScript.includes("manifest.json').version_name"));
});

test("only explicit live application routes run in child frames", () => {
  const framed = manifest.content_scripts.filter(rule => rule.all_frames);
  assert.equal(framed.length, 13);
  assert.deepEqual(framed[0].matches, [
    "https://produkty.chmi.cz/radar/*",
    "https://produkty.chmi.cz/druzice/*",
    "https://produkty.chmi.cz/aladin/*",
    "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub*",
    "https://www.chmi.cz/namerena-data/polarni-druzice/*",
    "https://www.chmi.cz/namerena-data/geostacionarni-druzice/*",
    "https://www.chmi.cz/namerena-data/webkamery*",
    "https://www.chmi.cz/namerena-data/webkamera/*"
  ]);
  assert.deepEqual(framed[1].matches, ["https://www.chmi.cz/meteogram/*"]);
  assert.deepEqual(framed[2].matches, [
    "https://www.chmi.cz/predpoved-pocasi/dnes*",
    "https://www.chmi.cz/predpoved-pocasi/zitra*",
    "https://www.chmi.cz/predpoved-pocasi/pozitri*",
    "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa*",
    "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr*"
  ]);
  assert.deepEqual(framed[3].matches, ["https://hydro.chmi.cz/hppsoldv/main_rain.php*"]);
  assert.deepEqual(framed[4].matches, [
    "https://www.chmi.cz/predpoved-pocasi/synopticka-situace*"
  ]);
  assert.deepEqual(framed[5].matches, [
    "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa*"
  ]);
  assert.deepEqual(framed[6].matches, [
    "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum*"
  ]);
  assert.deepEqual(framed[7].matches, [
    "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke*"
  ]);
  assert.deepEqual(framed[8].matches, [
    "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat*",
    "https://www.chmi.cz/predpoved-pocasi/rizika/pylovy-semafor*"
  ]);
  assert.deepEqual(framed[9].matches, [
    "https://www.chmi.cz/predpoved-pocasi/bio-predpoved*"
  ]);
  assert.deepEqual(framed[10].matches, [
    "https://www.chmi.cz/predpoved-pocasi/tyden*"
  ]);
  assert.deepEqual(framed[11].matches, [
    "https://www.chmi.cz/predpoved-pocasi/mesic*"
  ]);
  assert.deepEqual(framed[12].matches, [
    "https://www.chmi.cz/predpoved-pocasi/*-kraj/*",
    "https://www.chmi.cz/predpoved-pocasi/praha/*",
    "https://www.chmi.cz/predpoved-pocasi/kraj-vysocina/*"
  ]);
  for (const rule of framed) {
    assert.ok(rule.js.indexOf("portal-registry.js") < rule.js.indexOf("embedded.js"));
    assert.ok(rule.css.includes("embedded.css"));
  }
  for (const rule of manifest.content_scripts) {
    for (const file of [...(rule.js ?? []), ...(rule.css ?? [])]) {
      assert.ok(existsSync(join(root, "chrome-edge", file)), file);
    }
  }
});

test("meteogram and forecast adapters work standalone and in the classic panel", () => {
  const rule = manifest.content_scripts.find(item =>
    item.matches.length === 1 && item.matches[0] === "https://www.chmi.cz/meteogram/*");
  assert.ok(rule);
  assert.equal(rule.all_frames, true);
  assert.ok(rule.js.includes("meteogram.js"));
  assert.ok(rule.css.includes("meteogram.css"));
  const generic = manifest.content_scripts.find(item => item.matches.includes("https://www.chmi.cz/*"));
  assert.ok(generic.exclude_matches.includes("https://www.chmi.cz/meteogram/*"));
  for (const route of manifest.content_scripts[3].matches) assert.ok(generic.exclude_matches.includes(route));
  assert.ok(generic.exclude_matches.includes("https://hydro.chmi.cz/hppsoldv/main_rain.php*"));
  for (const route of manifest.content_scripts[5].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[6].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[7].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[8].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[9].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[10].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[11].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[12].matches) assert.ok(generic.exclude_matches.includes(route));
  for (const route of manifest.content_scripts[13].matches) assert.ok(generic.exclude_matches.includes(route));
});

test("every active portal app has the same adapter assets in Chrome and userscript", () => {
  const context = vm.createContext({ URL });
  vm.runInContext(readFileSync(join(root, "chrome-edge/portal-registry.js"), "utf8"), context);
  const builder = readFileSync(join(root, "script/build_userscript.mjs"), "utf8");
  const assets = {
    forecast: ["forecast.js", "forecast.css"],
    radar: ["content.js", "classic.css"],
    lightning: ["content.js", "classic.css"],
    rainfall: ["rainfall.js", "rainfall.css"],
    synoptic: ["synoptic.js", "synoptic.css"],
    sonde: ["sonde.js", "sonde.css"],
    klementinum: ["klementinum.js", "klementinum.css"],
    stations: ["stations.js", "stations.css"],
    ticks: ["ticks.js", "ticks.css"],
    pollen: ["ticks.js", "ticks.css"],
    bio: ["bio.js", "bio.css"],
    week: ["week.js", "week.css"],
    monthly: ["monthly.js", "monthly.css"],
    regions: ["regions.js", "regions.css"],
    meteosat: ["satellite.js", "satellite.css"],
    aladin: ["aladin.js", "aladin.css"],
    "aladin-animation": ["aladin.js", "aladin.css"],
    meteogram: ["meteogram.js", "meteogram.css"],
    webcams: ["webcams.js", "webcams.css"],
    polar: ["satellite.js", "satellite.css"],
    geo: ["satellite.js", "satellite.css"],
    mushrooms: ["content.js", "classic.css"],
    water: ["portal.js", "portal.css"],
    air: ["portal.js", "portal.css"]
  };
  assert.deepEqual(Object.keys(context.__chmiClassicApps.apps).sort(), Object.keys(assets).sort());
  for (const [id, app] of Object.entries(context.__chmiClassicApps.apps)) {
    const url = new URL(app.url);
    const matching = manifest.content_scripts.filter(rule => rule.matches.some(pattern => {
      const match = /^(https?:\/\/[^/]+)(\/.*)$/.exec(pattern);
      if (!match || match[1] !== url.origin) return false;
      const regex = new RegExp(`^${match[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
      return regex.test(url.pathname);
    }));
    assert.ok(matching.length, `${id} has no Chrome route`);
    assert.ok(matching.some(rule => rule.all_frames), `${id} cannot run in its portal frame`);
    for (const asset of assets[id]) {
      assert.ok(builder.includes(`"${asset}"`), `${id} ${asset} missing from userscript build`);
      assert.ok(matching.some(rule => [...(rule.js ?? []), ...(rule.css ?? [])].includes(asset)), `${id} ${asset} missing from Chrome route`);
    }
  }
});
