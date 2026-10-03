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
  assert.match(source, /show && !pdfFrame\.src/);
  assert.match(source, /pdfFitLabel\.hidden = !show/);
  assert.match(source, /paragraph\.textContent = text/);
  assert.match(css, /body > :not\(#chmi-monthly-workspace\)/);
  assert.match(css, /#chmi-monthly-summary\s*\{[^}]*overflow-y: auto/s);
  assert.match(css, /#chmi-monthly-pdf-frame\s*\{[^}]*height: 100%/s);
});

test("monthly PDF defaults to readable width and offers whole-page overview", () => {
  const context = { module: { exports: {} }, URL };
  vm.runInNewContext(source, context);
  const href = context.module.exports.monthlyPdfHref;
  const pdf = "https://www.chmi.cz/documents/d/chmi.cz/mesicni-2?download=false#old";
  const width = new URL(href(pdf));
  assert.equal(width.pathname, "/documents/d/chmi.cz/mesicni-2");
  assert.equal(width.search, "?download=false");
  assert.equal(width.hash, "#toolbar=0&navpanes=0&view=FitH&zoom=page-width");
  assert.equal(new URL(href(pdf, "page")).hash, "#toolbar=0&navpanes=0&view=Fit&zoom=page-fit");
  assert.equal(href(pdf, "unknown"), href(pdf));
});

test("PDF fit change creates a new native viewer instead of a fragment-only navigation", () => {
  const context = { module: { exports: {} }, URL };
  vm.runInNewContext(source, context);
  const replacement = { id: "chmi-monthly-pdf-frame", title: "Grafy", src: "" };
  let replacedWith;
  const original = {
    cloneNode(deep) { assert.equal(deep, false); return replacement; },
    replaceWith(node) { replacedWith = node; }
  };
  const result = context.module.exports.replaceMonthlyPdfFrame(
    original, "https://www.chmi.cz/documents/d/chmi.cz/mesicni-2", "width"
  );
  assert.equal(result, replacement);
  assert.equal(replacedWith, replacement);
  assert.equal(result.id, "chmi-monthly-pdf-frame");
  assert.match(result.src, /view=FitH/);
});
