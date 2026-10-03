import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

// Execute the actual shell: a route must select the matching accessible tab,
// not merely display the right iframe beneath the POČASÍ tab.
function shell(hash) {
  const events = {};
  const nodes = [];
  class Node {
    constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.listeners = {}; this.dataset = {}; this.isConnected = true; }
    append(...children) { this.children.push(...children); }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    remove() { this.isConnected = false; }
    click() { this.listeners.click?.({ button: 0, preventDefault() {} }); }
    querySelectorAll(selector) {
      const descendants = this.children.flatMap(child => [child, ...child.querySelectorAll("*")]);
      return descendants.filter(child => selector === "*" || selector === "button" && child.tag === "button" || selector === "[data-app]" && child.dataset.app);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    classList = { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } };
  }
  const document = {
    createElement(tag) { const node = new Node(tag); nodes.push(node); return node; },
    getElementById(id) { return nodes.find(node => node.id === id && node.isConnected) ?? null; },
    documentElement: new Node("html"), body: new Node("body")
  };
  const window = { addEventListener: (name, callback) => events[name] = callback, removeEventListener() {}, dispatchEvent() {} };
  window.top = window;
  const location = { href: `https://www.chmi.cz/${hash}`, hash };
  const context = vm.createContext({ document, window, location, URL, crypto: { randomUUID: () => "test-session" }, setTimeout() {}, clearTimeout() {} });
  vm.runInContext(readFileSync(new URL("../chrome-edge/portal-registry.js", import.meta.url), "utf8"), context);
  vm.runInContext(readFileSync(new URL("../chrome-edge/portal.js", import.meta.url), "utf8"), context);
  const route = value => { location.hash = value; events.hashchange(); };
  return { document, nodes, location, route };
}

for (const [id, section] of [["water", "water"], ["air", "air"], ["pollen", "weather"], ["radar", "weather"]]) {
  test(`direct #classic=${id} selects ${section}, including back/forward navigation`, () => {
    const page = shell(`#classic=${id}`);
    const tab = page.document.getElementById(`chmi-portal-tab-${section}`);
    assert.equal(tab.attributes["aria-selected"], "true");
    assert.equal(page.document.getElementById("chmi-portal-workspace").attributes["aria-labelledby"], tab.id);
    assert.equal(page.nodes.find(node => node.className === "chmi-portal-directory").hidden, section !== "weather");
    page.route("#classic=air");
    assert.equal(page.document.getElementById("chmi-portal-tab-air").attributes["aria-selected"], "true");
    page.route(`#classic=${id}`);
    assert.equal(tab.attributes["aria-selected"], "true");
  });
}

test("section clicks update the bookmark and keep the previously selected weather app", () => {
  const page = shell("#classic=pollen");
  page.document.getElementById("chmi-portal-tab-water").click();
  assert.equal(page.location.hash, "#classic=water");
  page.route(page.location.hash);
  page.document.getElementById("chmi-portal-tab-weather").click();
  assert.equal(page.location.hash, "#classic=pollen");
});
