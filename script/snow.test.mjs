import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "../chrome-edge/snow.js");
const cssPath = join(here, "../chrome-edge/snow.css");
const source = readFileSync(sourcePath, "utf8");
const styles = readFileSync(cssPath, "utf8");
const {
  matchesSnowLocation,
  parseSnowValue,
  recordCountFromText,
  summarizeLatest,
  latestDateColumn,
  statusText,
  findNativeFilterForm,
  revealNativeCategoryFilter,
  collectNativeListNodes
} = createRequire(import.meta.url)(sourcePath);

test("snow adapter is scoped to official live HPPS list/detail only", () => {
  for (const url of [
    "https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php",
    "https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php?sort=1&sort_type=desc&startpage=2",
    "https://hydro.chmi.cz/hppsoldv/hpps_snh_detail.php?seq=2804301"
  ]) assert.equal(matchesSnowLocation(url), true, url);
  for (const url of [
    "http://hydro.chmi.cz/hppsoldv/hpps_snh_list.php",
    "https://hydro.chmi.cz/hppsoldv/hpps_snh_other.php",
    "https://evil.test/hppsoldv/hpps_snh_list.php"
  ]) assert.equal(matchesSnowLocation(url), false, url);
});

test("zero centimetres, positive snow and missing values stay distinct", () => {
  assert.deepEqual(parseSnowValue("0"), { kind: "zero", value: 0 });
  assert.deepEqual(parseSnowValue("12"), { kind: "positive", value: 12 });
  assert.deepEqual(parseSnowValue(""), { kind: "missing", value: null });
  assert.deepEqual(parseSnowValue("—"), { kind: "invalid", value: null });

  const empty = summarizeLatest("03.10.", ["0", "0", "", "0"]);
  assert.equal(empty.state, "empty");
  assert.equal(empty.zero, 3);
  assert.equal(empty.missing, 1);
  assert.match(statusText(empty), /všechna dostupná měření 0 cm/);
  assert.match(statusText(empty), /bez údaje: 1/);

  const snow = summarizeLatest("03.10.", ["0", "7", "", "15"]);
  assert.equal(snow.state, "snow");
  assert.equal(snow.positive, 2);
  assert.equal(snow.zero, 1);
  assert.match(statusText(snow), /sníh hlásí 2/);

  const missing = summarizeLatest("03.10.", ["", " ", "—"]);
  assert.equal(missing.state, "missing");
  assert.match(statusText(missing), /nemají pro nejnovější den číselný údaj/);
});

test("latest date is taken from the final native date label even when metadata headers use rowspans", () => {
  const cells = values => values.map(textContent => ({ textContent }));
  const table = { rows: [
    { cells: cells(["DBČ", "Název stanice", "Nadmořská výška", "Oblast", "Výška sněhové pokrývky [cm]"]) },
    { cells: cells(["26.09.", "27.09.", "28.09.", "29.09.", "30.09.", "01.10.", "02.10.", "03.10."]) }
  ] };
  assert.deepEqual(latestDateColumn(table), { date: "03.10.", dateCount: 8 });
});

test("native zero-result count is a legitimate empty filter result", () => {
  assert.equal(recordCountFromText("Počet vyhledaných záznamů : 0"), 0);
  assert.equal(recordCountFromText("Počet vyhledaných záznamů : 194"), 194);
  assert.equal(recordCountFromText("server error"), null);
  assert.match(statusText({ state: "no-results", latestDate: null, missing: 0, invalid: 0 }), /Filtr nevrátil žádné stanice/);
});

test("invalid or not-yet-built table is not misreported as an empty snow state", () => {
  for (const summary of [
    summarizeLatest("", ["0", "0"]),
    summarizeLatest("03.10.", []),
    summarizeLatest("bad-date", ["0"])
  ]) assert.equal(summary.state, "invalid");
});

test("native Kraj / Oblast / Kategorie filter form is moved with the result block", () => {
  const body = { nodeName: "BODY" };
  const filterForm = {
    nodeName: "FORM",
    parentElement: body,
    contains(node) { return [fkraj, foblast, frbot].includes(node); }
  };
  const control = name => ({ name, form: filterForm, closest(selector) { return selector === "form" ? filterForm : null; } });
  const fkraj = control("fkraj");
  const foblast = control("foblast");
  const frbot = control("frbot");
  const table = { nodeName: "TABLE" };
  const results = {
    nodeName: "DIV",
    parentElement: body,
    textContent: "Objekty s aktuálním měřením Počet vyhledaných záznamů : 194",
    contains(node) { return node === table; }
  };
  table.parentElement = results;
  const bySelector = new Map([
    ['#fkraj, [name="fkraj"]', fkraj],
    ['#foblast, [name="foblast"]', foblast],
    ['#frbot, [name="frbot"]', frbot]
  ]);
  const root = { body, querySelector(selector) { return bySelector.get(selector) ?? null; } };

  assert.equal(findNativeFilterForm(root), filterForm);
  const nodes = collectNativeListNodes(table, root);
  assert.deepEqual(nodes, [filterForm, results]);
  assert.equal(nodes[0], filterForm, "the original native form must be reused, not cloned");
  assert.equal(fkraj.form, nodes[0]);
  assert.equal(foblast.form, nodes[0]);
  assert.equal(frbot.form, nodes[0]);
});

test("native frbot remains the original text field but its hidden Kategorie cells are revealed", () => {
  const makeStyle = initial => ({
    display: initial,
    removeProperty(name) { if (name === "display") this.display = ""; }
  });
  const makeClasses = () => ({ values: new Set(), add(value) { this.values.add(value); } });
  const labelCell = { textContent: "Kategorie", style: makeStyle("none"), classList: makeClasses() };
  const valueCell = { textContent: "", style: makeStyle("none"), classList: makeClasses() };
  const control = {
    name: "frbot", type: "text", value: "", style: makeStyle("none"), classList: makeClasses(),
    removed: [],
    closest(selector) { return selector === "td, th" ? valueCell : null; },
    removeAttribute(name) { this.removed.push(name); }
  };
  const form = {
    querySelector(selector) { return selector === '#frbot, [name="frbot"]' ? control : null; },
    querySelectorAll(selector) { return selector === "td, th" ? [labelCell, valueCell] : []; }
  };

  assert.equal(revealNativeCategoryFilter(form), true);
  assert.equal(labelCell.style.display, "");
  assert.equal(valueCell.style.display, "");
  assert.equal(control.style.display, "");
  assert.equal(labelCell.classList.values.has("chmi-snow-category-cell"), true);
  assert.equal(valueCell.classList.values.has("chmi-snow-category-cell"), true);
  assert.equal(control.classList.values.has("chmi-snow-category-control"), true);
  assert.deepEqual(control.removed, ["hidden"]);
  assert.equal(control.type, "text");
  assert.equal(control.value, "", "adapter must not invent a backend category value");
});

test("missing one native snow filter never fabricates a replacement form", () => {
  const body = { nodeName: "BODY" };
  const table = { nodeName: "TABLE" };
  const results = {
    parentElement: body,
    textContent: "Objekty s aktuálním měřením Počet vyhledaných záznamů : 0",
    contains(node) { return node === table; }
  };
  table.parentElement = results;
  const form = { contains() { return true; } };
  const root = {
    body,
    querySelector(selector) {
      if (selector.includes("fkraj") || selector.includes("foblast")) return { form, closest() { return form; } };
      return null;
    }
  };
  assert.equal(findNativeFilterForm(root), null);
  assert.deepEqual(collectNativeListNodes(table, root), [results]);
});

test("adapter reuses native DOM and does not fetch, embed or hard-code readings", () => {
  assert.doesNotMatch(source, /fetch\s*\(/);
  assert.doesNotMatch(source, /web\.archive\.org|intranet\.chmi\.cz\/.*sneh/i);
  assert.match(source, /native\.append\(node\)/);
  assert.match(source, /\["fkraj", "foblast", "frbot"\]/);
  assert.match(source, /if \(!table \|\| !filterForm \|\| !revealNativeCategoryFilter\(filterForm\)\) return false/);
  assert.doesNotMatch(source, /createElement\(["']option["']\)|control\.value\s*=|control\.type\s*=/);
  assert.doesNotMatch(source, /cloneNode\s*\(/);
  assert.match(source, /findSnowTable/);
  assert.match(source, /počet vyhledaných záznamů/);
  assert.match(source, /dataset\.chmiSnowNative = "verified"/);
});

test("layout confines scrolling to the live data workspace", () => {
  assert.match(styles, /html\.chmi-snow-classic body[\s\S]*overflow: hidden !important/);
  assert.match(styles, /\.chmi-snow-native\s*\{[\s\S]*overflow: auto/);
  assert.match(styles, /html\.chmi-classic-embedded\.chmi-snow-classic #chmi-snow-workspace\s*\{[\s\S]*inset: 0/);
  assert.match(styles, /\.chmi-snow-category-cell\s*\{[\s\S]*display: table-cell !important/);
  assert.match(styles, /\.chmi-snow-category-control\s*\{[\s\S]*display: inline-block !important/);
});
