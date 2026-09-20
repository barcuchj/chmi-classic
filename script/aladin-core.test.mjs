import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const sourceUrl = new URL("../chrome-edge/aladin.js", import.meta.url);
const source = await readFile(sourceUrl, "utf8");

test("aladin module has valid standalone syntax", () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: "aladin.js" }));
});

function loadHooks({ framed = false, embedded = false } = {}) {
  const hooks = {};
  const pageWindow = {
    __chmiAladinClassicTestHooks: hooks,
    __chmiClassicEmbedded: embedded,
    location: {
      hostname: "unsupported.invalid",
      pathname: "/"
    }
  };
  pageWindow.top = framed ? {} : pageWindow;

  const context = vm.createContext({
    globalThis: pageWindow,
    window: pageWindow,
    location: pageWindow.location
  });
  new vm.Script(source, { filename: "aladin.js" }).runInContext(context);
  return hooks;
}

test("frame gate accepts only the explicit portal bootstrap flag", () => {
  const { shouldRun } = loadHooks();
  const page = { hostname: "produkty.chmi.cz", pathname: "/aladin/" };

  assert.equal(shouldRun({ ...page, framed: false, embedded: false }), true);
  assert.equal(shouldRun({ ...page, framed: true, embedded: false }), false);
  assert.equal(shouldRun({ ...page, framed: true, embedded: true }), true);
  assert.equal(
    shouldRun({ hostname: "produkty.chmi.cz", pathname: "/radar/", framed: false }),
    false
  );
});

test("classic four-map order is temperature, cloud, precipitation, wind", () => {
  const { PRODUCT_IDS, productOrder } = loadHooks();

  assert.deepEqual([...PRODUCT_IDS], ["T", "C", "R3", "W"]);
  assert.deepEqual([...PRODUCT_IDS].map(productOrder), [1, 2, 3, 4]);
  assert.equal(productOrder("H"), 5);
});

test("3-hour stepping and wheel direction stay bounded", () => {
  const { steppedIndex, wheelDirection } = loadHooks();

  assert.equal(steppedIndex(0, 25, -1), 0);
  assert.equal(steppedIndex(0, 25, 1), 1);
  assert.equal(steppedIndex(24, 25, 1), 24);
  assert.equal(wheelDirection(120, 0), 1);
  assert.equal(wheelDirection(-120, 0), -1);
  assert.equal(wheelDirection(2, 1), 0);
});

test("module targets verified native handlers instead of constructing data URLs", () => {
  assert.match(source, /dateToLoadSelector/);
  assert.match(source, /displaySelector/);
  assert.match(source, /input\.item-check/);
  assert.match(source, /dispatchEvent\(new Event\("change"/);
  assert.doesNotMatch(source, /getMaps\.php/);
  assert.doesNotMatch(source, /adjusted_data\//);
});
