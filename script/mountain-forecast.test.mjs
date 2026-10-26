import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { slugs, route, ready } = createRequire(import.meta.url)("../chrome-edge/mountain-forecast.js");
const base = "/predpoved-pocasi/lyzarska-strediska-a-hory/";

test("only the ten official mountain paths are recognized", () => {
  for (const slug of slugs) {
    assert.equal(route(base + slug), slug);
    assert.equal(route(base + slug + "/"), slug);
  }
  for (const path of [base, base + "krkonose/extra", base + "hory-a-lyzarska-strediska", "/predpoved-pocasi/synopticka-situace"]) assert.equal(route(path), null);
});

test("ready requires the native populated table, forecast state, legend and all mountain links", () => {
  const table = { tHead: { rows: [{ cells: [{}, {}] }] }, tBodies: [{ rows: [{}] }] };
  const forecast = { textContent: "Textová předpověď není v tuto chvíli dostupná" };
  const nodes = { h1: {}, '[id^="ChmiDynamicTable_"] table': table, '[id^="ChmiForecastComponent_"] .chmu-forecast-content': forecast, '.explanatory .dropdown [data-toggle="dropdown"]': {} };
  const main = { querySelector: key => nodes[key] };
  const links = new Map(slugs.map(slug => [slug, {}]));
  assert.equal(ready(main, links), true);
  links.delete(slugs[0]);
  assert.equal(ready(main, links), false);
  links.set(slugs[0], {});
  table.tBodies[0].rows = [];
  assert.equal(ready(main, links), false);
  table.tBodies[0].rows = [{}];
  forecast.textContent = "   ";
  assert.equal(ready(main, links), false);
  assert.equal(ready(null, links), false);
});
