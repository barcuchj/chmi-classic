import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, "chrome-edge/monthly.js"), "utf8");
const css = readFileSync(join(root, "chrome-edge/monthly.css"), "utf8");

function readiness() {
  const context = { module: { exports: {} }, URL };
  vm.runInNewContext(source, context);
  return context.module.exports.monthlyDataReady;
}

test("monthly view requires current official text, period and PDF", () => {
  const ready = readiness();
  const period = "Na období od 28. 9. 2026 do 25. 10. 2026";
  const paragraphs = ["Teplotní výhled ".repeat(20), "Srážkový výhled ".repeat(20)];
  const pdf = "https://www.chmi.cz/documents/d/chmi.cz/mesicni-2";
  assert.equal(ready(period, paragraphs, pdf), true);
  assert.equal(ready("", paragraphs, pdf), false);
  assert.equal(ready(period, [paragraphs[0]], pdf), false);
  assert.equal(ready(period, ["krátký", paragraphs[1]], pdf), false);
  assert.equal(ready(period, paragraphs, "https://evil.test/documents/d/chmi.cz/mesicni-2"), false);
  assert.equal(ready(period, paragraphs, "https://www.chmi.cz/"), false);
});

test("monthly layout defaults to live summary and loads PDF only when requested", () => {
  assert.match(source, /summaryPanel\.hidden = false/);
  assert.match(source, /pdfPanel\.hidden = true/);
  assert.match(source, /pdfFrame\.src = pdfUrl/);
  assert.match(source, /paragraph\.textContent = text/);
  assert.match(css, /body > :not\(#chmi-monthly-workspace\)/);
  assert.match(css, /#chmi-monthly-summary\s*\{[^}]*overflow-y: auto/s);
  assert.match(css, /#chmi-monthly-pdf-frame\s*\{[^}]*height: 100%/s);
});
