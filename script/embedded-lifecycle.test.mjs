import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

test("embedded pagehide covers navigation; BFCache restores one readiness timer", () => {
  const events = {}, messages = [], timers = new Set();
  let sequence = 0;
  const context = vm.createContext({
    URL, location: { href: "https://www.chmi.cz/predpoved-pocasi/dnes" },
    document: { referrer: "https://www.chmi.cz/", documentElement: { classList: { add() {} } },
      addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null },
    window: { top: {}, name: "chmi-classic:forecast:test-session", parent: { postMessage: (data, origin) => messages.push({data, origin}) },
      addEventListener: (name, fn) => { events[name] = fn; } },
    setInterval() { timers.add(++sequence); return sequence; }, clearInterval(id) { timers.delete(id); }
  });
  for (const file of ["portal-registry.js", "embedded.js"])
    vm.runInContext(readFileSync(new URL("../chrome-edge/" + file, import.meta.url), "utf8"), context);
  assert.equal(timers.size, 1);
  for (let cycle = 0; cycle < 2; cycle++) {
    events.pagehide({persisted:true});
    assert.equal(timers.size, 0);
    assert.equal(messages.at(-1).data.state, "loading");
    assert.equal(messages.at(-1).origin, "https://www.chmi.cz");
    const count = messages.length;
    events.pageshow({persisted:true});
    assert.equal(messages.length, count + 1);
    assert.equal(timers.size, 1);
  }
});

test("loading CSS suppresses painting without removing native map layout", () => {
  const css = readFileSync(new URL("../chrome-edge/portal.css", import.meta.url), "utf8");
  const rule = css.match(/\.chmi-portal-stage:not\(\[data-state="ready"\]\) \.chmi-portal-app-frame\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /opacity:\s*0/);
  assert.match(rule, /pointer-events:\s*none/);
  assert.doesNotMatch(rule, /display:|visibility:|height:|width:/);
});
