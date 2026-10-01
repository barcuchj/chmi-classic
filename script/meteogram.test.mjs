import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const rootPath = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(rootPath, "chrome-edge/meteogram.js"), "utf8");
const userscript = readFileSync(join(rootPath, "tampermonkey/chmi-classic.user.js"), "utf8");

function run({ pathname = "/meteogram/387-prostejov", enabled = true,
  canvas = true, search = true, tableCount = 3, heading = "Předpověď počasí: Prostějov",
  stored = "[]", storageAvailable = true } = {}) {
  const classes = new Set();
  const workspaceClasses = new Set();
  const nativeCanvas = canvas === true ? { width: 1300, height: 360 } :
    canvas === "placeholder" ? { width: 300, height: 150 } : null;
  const graph = { dataset: {}, querySelector: () => nativeCanvas };
  const tables = Array.from({ length: tableCount }, () => ({
    classList: { contains: name => name === "lfr-layout-structure-item-chmidynamictable" }
  }));
  const appended = [];
  const headerChildren = [];
  const header = {
    querySelector: selector => selector === "h1" ? { textContent: heading } : null,
    append: node => headerChildren.push(node)
  };
  const workspace = {
    children: tables,
    classList: { add: name => workspaceClasses.add(name) },
    querySelector: selector => selector.includes("chmigraph") ? graph :
      selector.includes("item-header") ? header : search ? {} : null,
    append: node => appended.push(node)
  };
  const document = {
    documentElement: { classList: { add: name => classes.add(name) } },
    querySelector: selector => selector === "main > div" ? workspace : null,
    createElement: () => ({ children: [], attributes: {},
      append(...nodes) { this.children.push(...nodes); },
      setAttribute(name, value) { this.attributes[name] = value; }
    })
  };
  const window = { addEventListener() {}, dispatchEvent() {} };
  const saved = { value: stored };
  const localStorage = {
    getItem: () => { if (!storageAvailable) throw Error("unavailable"); return saved.value; },
    setItem: (_, value) => { if (!storageAvailable) throw Error("unavailable"); saved.value = value; }
  };
  vm.runInNewContext(source, {
    window, document, localStorage, URL,
    location: { hostname: "www.chmi.cz", pathname, href: `https://www.chmi.cz${pathname}` },
    chrome: { storage: { sync: { get: (_, callback) => callback({ chmiRadarClassicEnabled: enabled }) } } },
    requestAnimationFrame(callback) { callback(); },
    MutationObserver: class { observe() {} disconnect() {} },
    setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {}, Event: class {}
  });
  return { classes, workspaceClasses, graph, tables, appended, headerChildren, saved };
}

test("live meteogram graph, search and hourly tables become one workspace", () => {
  const result = run();
  assert.ok(result.classes.has("chmi-meteogram-classic"));
  assert.ok(result.workspaceClasses.has("chmi-meteogram-workspace"));
  assert.equal(result.graph.dataset.chmiMeteogramNative, "verified");
  assert.equal(result.appended.length, 1);
  assert.deepEqual(result.appended[0].children.slice(1), result.tables);
  assert.equal(result.headerChildren[0].attributes["aria-label"], "Poslední místa meteogramu");
  assert.equal(result.headerChildren[0].children[1].textContent, "Prostějov");
  assert.equal(result.headerChildren[0].children[1].attributes["aria-current"], "page");
});

test("recent places keep four valid official links, current place first", () => {
  const stored = JSON.stringify([
    { url: "https://www.chmi.cz/meteogram/25-brno", label: "Brno" },
    { url: "https://evil.example/meteogram/1-foo", label: "Phishing" },
    { url: "https://www.chmi.cz/meteogram/387-prostejov", label: "Duplicate" },
    { url: "https://www.chmi.cz/meteogram/712-brno-turany-lktb-", label: "Letiště" },
    { url: "https://www.chmi.cz/meteogram/15-olomouc", label: "Olomouc" },
    { url: "https://www.chmi.cz/meteogram/99-praha", label: "Praha" }
  ]);
  const result = run({ stored });
  const links = result.headerChildren[0].children.slice(1);
  assert.deepEqual(links.map(link => link.textContent), ["Prostějov", "Brno", "Letiště", "Olomouc"]);
  assert.equal(links[1].href, "https://www.chmi.cz/meteogram/25-brno");
  assert.equal(JSON.parse(result.saved.value).length, 4);
});

test("corrupt or unavailable local storage does not break the live meteogram", () => {
  for (const options of [{ stored: "broken JSON" }, { storageAvailable: false }]) {
    const result = run(options);
    assert.ok(result.classes.has("chmi-meteogram-classic"));
    assert.equal(result.headerChildren[0].children[1].textContent, "Prostějov");
  }
});

test("missing native data, disabled mode and unrelated routes remain untouched", () => {
  for (const options of [
    { canvas: false }, { canvas: "placeholder" }, { search: false }, { tableCount: 0 },
    { enabled: false }, { pathname: "/namerena-data/webkamery" }
  ]) {
    const result = run(options);
    assert.equal(result.classes.size, 0);
    assert.equal(result.appended.length, 0);
  }
});

test("generated Tampermonkey file includes the same adapter and stylesheet", () => {
  assert.ok(userscript.includes('window.__chmiClassicMeteogramLoaded = true'));
  assert.ok(userscript.includes('chmiClassicMeteogramRecentV1'));
  assert.ok(userscript.includes("Aladin – Meteogramy"));
});
