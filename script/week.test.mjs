import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/week.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/week.css"), "utf8");

function readiness() {
  const context = { module: { exports: {} } };
  vm.runInNewContext(source, context);
  return context.module.exports.weekDataReady;
}

function fixture({ chart = true, days = 6, paragraphs = 6 } = {}) {
  const graph = { querySelector: () => chart ? { width: 1300, height: 360 } : null };
  const forecast = { querySelectorAll: selector => ({ "h3": Array(days).fill({}), "p": Array(paragraphs).fill({}) })[selector] ?? [] };
  return { graph, forecast };
}

test("week adapter waits for live chart and multi-day text", () => {
  const ready = readiness();
  for (const item of [{}, { chart: false }, { days: 2 }, { paragraphs: 1 }]) {
    const { graph, forecast } = fixture(item);
    assert.equal(ready(graph, forecast), Object.keys(item).length === 0);
  }
  assert.equal(ready(null, fixture().forecast), false);
});

test("week layout keeps original chart and forecast in bounded panels", () => {
  assert.match(source, /forecastPanel\.append\(forecastBoundary\)/);
  assert.match(source, /graphPanel\.append\(graphBoundary\)/);
  assert.match(source, /content\.append\(forecastPanel, graphPanel\)/);
  assert.match(source, /graphPanel\.hidden = true/);
  assert.match(css, /body > :not\(#chmi-week-workspace\)/);
  assert.match(css, /#chmi-week-forecast\s*\{[^}]*overflow-y: auto/s);
  assert.match(css, /#chmi-week-graph\s*\{[^}]*overflow-y: auto/s);
});
