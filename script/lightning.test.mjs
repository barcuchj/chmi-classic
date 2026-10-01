import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../chrome-edge/content.js", import.meta.url), "utf8");
const start = source.indexOf("  function latestLightningFrame(");
const end = source.indexOf("  function stopOnLatestFrame(", start);

test("lightning preset is implemented in the shared radar source", () => {
  assert.ok(start >= 0 && end > start);
  assert.match(source, /chmi_classic_lightning/);
  assert.match(source, /input_opa_slider_data1/);
  assert.match(source, /input_opa_slider_data2/);
});

test("latest lightning frame skips forecasts and unavailable lightning images", () => {
  const context = vm.createContext({});
  vm.runInContext(`${source.slice(start, end)}\nthis.latestLightningFrame = latestLightningFrame;`, context);
  const selectedOptions = [
    { value: "./input_data/radar/newest.png;./img/nic.png" },
    { value: "./input_data/radar/previous.png;./input_data/blesk/recent.png" },
    { value: "./input_data/radar/older.png;./input_data/blesk/older.png" }
  ];
  assert.equal(context.latestLightningFrame({ selectedOptions }, { min: "0", max: "5" }), "1");
  assert.equal(context.latestLightningFrame({ selectedOptions: [] }, { min: "0", max: "5" }), null);
  assert.equal(context.latestLightningFrame({ selectedOptions }, { min: "0", max: "0" }), null);
});

test("lightning preset uses native controls once and preserves later user changes", () => {
  const presetStart = source.indexOf("  function applyLightningPreset(");
  const presetEnd = source.indexOf("  function applyInitialRadarState(", presetStart);
  assert.ok(presetStart >= 0 && presetEnd > presetStart);
  const events = [];
  const classes = new Set();
  const control = (id, value) => ({ id, value, dispatchEvent(event) { events.push(`${id}:${event.type}`); } });
  const controls = {
    select_prod: control("select_prod", "maxz_mask-li"),
    input_opa_slider_data1: control("input_opa_slider_data1", "0.7"),
    input_opa_slider_data2: control("input_opa_slider_data2", "0.8")
  };
  const context = vm.createContext({
    lightningMode: true, lightningPresetApplied: false, defaultDisplayApplied: true,
    defaultPlaybackApplied: true, LIGHTNING_CLASS: "lightning-only",
    document: { getElementById: id => controls[id], documentElement: { classList: { add: name => classes.add(name) } } },
    Event: class { constructor(type) { this.type = type; } },
    setTimeout() { throw new Error("no retry needed"); },
    scheduleRefresh() {}
  });
  vm.runInContext(`${source.slice(presetStart, presetEnd)}\nthis.applyLightningPreset = applyLightningPreset;`, context);
  assert.equal(context.applyLightningPreset(), true);
  assert.equal(controls.input_opa_slider_data1.value, "0");
  assert.equal(controls.input_opa_slider_data2.value, "1");
  assert.equal(classes.has("lightning-only"), true);
  assert.deepEqual(events, [
    "input_opa_slider_data1:input", "input_opa_slider_data1:change",
    "input_opa_slider_data2:input", "input_opa_slider_data2:change"
  ]);
  controls.input_opa_slider_data1.value = "0.5";
  assert.equal(context.applyLightningPreset(), false);
  assert.equal(controls.input_opa_slider_data1.value, "0.5");
});
