import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const sourceUrl = new URL("../chrome-edge/aladin.js", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const stylesheet = await readFile(new URL("../chrome-edge/aladin.css", import.meta.url), "utf8");

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
test("animation preset and playback use live native rows without generating forecast URLs", () => {
  const { productPreset, nextAnimationIndex, animationDelay } = loadHooks();
  assert.deepEqual([...productPreset(false)], ["T", "C", "R3", "W"]);
  assert.deepEqual([...productPreset(true)], ["T"]);
  assert.equal(nextAnimationIndex(0, 3), 1);
  assert.equal(nextAnimationIndex(2, 3), 0);
  assert.equal(nextAnimationIndex(0, 0), 0);
  assert.equal(animationDelay("slow"), 1800);
  assert.equal(animationDelay("normal"), 900);
  assert.equal(animationDelay("fast"), 450);
  assert.equal(animationDelay("unknown"), 900);
  assert.match(source, /timeRows\(\)/);
  assert.doesNotMatch(source, /getMaps\.php/);
});

test("map layout maximizes complete maps without cropping at wide and tall sizes", () => {
  const { mapLayout } = loadHooks();
  for (const [width, height] of [[2000, 1050], [1400, 450], [700, 650], [360, 400]]) {
    const layout = mapLayout(width, height);
    assert.ok(layout.width > 0);
    assert.ok(layout.columns * layout.width + (layout.columns - 1) * 2 <= width + 0.01);
    assert.ok((4 / layout.columns) * (layout.width * 442 / 700 + 22) +
      (4 / layout.columns - 1) * 2 <= height + 0.01);
  }
  assert.equal(mapLayout(2000, 1050).columns, 2);
  assert.equal(mapLayout(1400, 250).columns, 4);
});

test("map layout fits the actual number of selected native variables", () => {
  const { mapLayout } = loadHooks();
  for (const count of [1, 5, 11]) {
    for (const [width, height] of [[1400, 700], [390, 600]]) {
      const layout = mapLayout(width, height, 442 / 700, count);
      const rows = Math.ceil(count / layout.columns);
      assert.ok(layout.columns >= 1 && layout.columns <= count);
      assert.ok(layout.columns * layout.width + (layout.columns - 1) * 2 <= width + 0.01);
      assert.ok(rows * (layout.width * 442 / 700 + 22) + (rows - 1) * 2 <= height + 0.01);
    }
  }
});

test("extra variables change only a verified native checkbox", () => {
  const { selectedProductIds, updateNativeProduct } = loadHooks();
  const fake = (id, checked, valid = true) => ({
    id,
    checked,
    classList: { contains: name => valid && name === "item-check" }
  });
  const controls = [fake("T", true), fake("V", false), fake("invalid", false, false)];

  assert.deepEqual([...selectedProductIds(controls)], ["T"]);
  assert.equal(updateNativeProduct(controls, "V", true), controls[1]);
  assert.deepEqual([...selectedProductIds(controls)], ["T", "V"]);
  assert.equal(updateNativeProduct(controls, "V", true), null);
  assert.equal(updateNativeProduct(controls, "missing", true), null);
  assert.equal(updateNativeProduct(controls, "invalid", true), null);
  assert.equal(controls[0].checked, true);
  assert.equal(controls[2].checked, false);
});

test("selected chips follow the familiar map order, not native checkbox order", () => {
  const { selectedProductIds } = loadHooks();
  const controls = ["T", "R3", "W", "C", "H"].map(id => ({
    id, checked: true, classList: { contains: name => name === "item-check" }
  }));
  assert.deepEqual([...selectedProductIds(controls)], ["T", "C", "R3", "W", "H"]);
});

test("variable picker stays inside desktop and narrow viewports", () => {
  const { pickerLayout } = loadHooks();
  for (const [width, height] of [[1280, 720], [390, 844]]) {
    for (const left of [0, 335, width - 90]) {
      const layout = pickerLayout(left, 160, width, height);
      assert.ok(layout.left >= 0);
      assert.ok(layout.left + layout.width <= width);
      assert.ok(layout.top >= 0);
      assert.ok(layout.top + layout.maxHeight <= height);
    }
  }
});

test("module targets verified native handlers instead of constructing data URLs", () => {
  assert.match(source, /dateToLoadSelector/);
  assert.match(source, /displaySelector/);
  assert.match(source, /input\.item-check/);
  assert.match(source, /dispatchEvent\(new Event\("change"/);
  assert.doesNotMatch(source, /getMaps\.php/);
  assert.doesNotMatch(source, /adjusted_data\//);
});

test("missing native images keep a short label and map-sized placeholder", () => {
  assert.match(source, /empty\.textContent = "Snímek chybí"/);
  assert.match(source, /empty\.setAttribute\("aria-label", empty\.title\)/);
  assert.match(stylesheet, /height: calc\(var\(--chmi-aladin-map-width, 700px\) \* var\(--chmi-aladin-map-ratio/);
});
