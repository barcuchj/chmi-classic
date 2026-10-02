import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/regions.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/regions.css"), "utf8");
const context = { module: { exports: {} }, URL };
vm.runInNewContext(source, context);
const { parseRegionRoute, regionDataReady, regionHref, regionSlugs } = context.module.exports;

test("only 14 official region paths and four forecast periods are adapted", () => {
  assert.equal(regionSlugs.length, 14);
  for (const slug of regionSlugs) {
    for (const period of ["dnes", "zitra", "pozitri", "dalsi-dny"]) {
      assert.deepEqual(JSON.parse(JSON.stringify(parseRegionRoute(`/predpoved-pocasi/${slug}/${period}`))), { slug, period });
    }
  }
  for (const path of [
    "/predpoved-pocasi/dnes", "/predpoved-pocasi/tyden",
    "/predpoved-pocasi/praha", "/predpoved-pocasi/praha/mesic",
    "/predpoved-pocasi/praha/dnes/other", "/predpoved-pocasi/evil-kraj/dnes"
  ]) assert.equal(parseRegionRoute(path), null);
});

test("regional shell waits for live text and complete region navigation", () => {
  const forecast = { querySelector: () => ({ textContent: "Bude oblačno a mírné teploty." }), querySelectorAll: () => [{}, {}] };
  assert.equal(regionDataReady(forecast, 14), true);
  assert.equal(regionDataReady(forecast, 13), false);
  assert.equal(regionDataReady(null, 14), false);
  assert.equal(regionDataReady({ querySelector: () => null, querySelectorAll: () => [{}] }, 14), false);
});

test("regional navigation preserves selected period when native region list points to another day", () => {
  const native = { slug: "zlinsky-kraj", period: "pozitri", url: new URL("https://www.chmi.cz/predpoved-pocasi/zlinsky-kraj/pozitri") };
  assert.equal(regionHref(native, "dalsi-dny"), "https://www.chmi.cz/predpoved-pocasi/zlinsky-kraj/dalsi-dny");
  assert.equal(regionHref(native, "pozitri"), native.url.href);
  assert.equal(regionHref({ ...native, slug: "evil-kraj" }, "dalsi-dny"), null);
  assert.match(source, /if \(!regionLinks\.has\(link\.slug\) \|\| link\.period === route\.period\)/);
});

test("regional layout preserves live forecast and confines scrolling", () => {
  assert.match(source, /forecastPanel\.append\(forecastBoundary\)/);
  assert.match(source, /workspace\.append\(header, regionsNav, periodNav, forecastPanel\)/);
  assert.match(css, /body > :not\(#chmi-regions-workspace\)/);
  assert.match(css, /#chmi-regions-forecast\s*\{[^}]*overflow-y: auto/s);
});
