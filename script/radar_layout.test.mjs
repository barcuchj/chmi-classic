import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const css = readFileSync(join(root, "chrome-edge/classic.css"), "utf8");
const content = readFileSync(join(root, "chrome-edge/content.js"), "utf8");
const viewportWidth = 1256;

function parseRules(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const stack = [];
  const rules = [];
  let segmentStart = 0;

  for (let index = 0; index < clean.length; index += 1) {
    if (clean[index] === "{") {
      stack.push({
        selector: clean.slice(segmentStart, index).trim(),
        bodyStart: index + 1,
        media: stack
          .filter((entry) => entry.selector.startsWith("@media"))
          .map((entry) => entry.selector)
      });
      segmentStart = index + 1;
    } else if (clean[index] === "}") {
      const block = stack.pop();
      if (block && !block.selector.startsWith("@")) {
        rules.push({ ...block, body: clean.slice(block.bodyStart, index) });
      }
      segmentStart = index + 1;
    }
  }

  return rules;
}

const rules = parseRules(css);

function mediaMatches(conditions) {
  return conditions.every((condition) => {
    const maxWidth = condition.match(/max-width:\s*(\d+(?:\.\d+)?)px/i);
    const minWidth = condition.match(/min-width:\s*(\d+(?:\.\d+)?)px/i);
    return (!maxWidth || viewportWidth <= Number(maxWidth[1])) &&
      (!minWidth || viewportWidth >= Number(minWidth[1]));
  });
}

function declarationsFor(selector) {
  const declarations = new Map();
  for (const rule of rules) {
    if (!mediaMatches(rule.media)) continue;
    const selectors = rule.selector.split(",").map((item) => item.trim());
    if (!selectors.includes(selector)) continue;

    for (const declaration of rule.body.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      const name = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).replace(/!important\s*$/i, "").trim();
      if (name && value) declarations.set(name, value);
    }
  }
  return declarations;
}

function px(value) {
  const match = value?.match(/^(\d+(?:\.\d+)?)px$/);
  assert.ok(match, `expected a pixel value, got ${value}`);
  return Number(match[1]);
}

function horizontalPadding(value) {
  const parts = value.split(/\s+/).map(px);
  return parts.length === 1 ? parts[0] : parts[1];
}

test("1256px radar keeps the menu fixed while the map flexes into the remaining row", () => {
  const wrapper = declarationsFor("html.chmi-radar-classic #wrapper");
  const main = declarationsFor("html.chmi-radar-classic .mainWrapper");
  const row = declarationsFor("html.chmi-radar-classic .chmi-radar-classic-app-row");
  const menu = declarationsFor("html.chmi-radar-classic #div_container_menu");
  const map = declarationsFor("html.chmi-radar-classic #div_container_data");

  assert.equal(wrapper.get("width"), "calc(100vw - 12px)");
  assert.equal(main.get("box-sizing"), "border-box");
  assert.equal(row.get("flex-direction"), "row");
  assert.equal(map.get("min-width"), "0");
  assert.equal(menu.get("box-sizing"), "border-box");

  const flex = menu.get("flex");
  const clamp = flex.match(/^0\s+0\s+clamp\((\d+)px,\s*([\d.]+)vw,\s*(\d+)px\)$/);
  assert.ok(clamp, `menu must have a non-shrinking clamped flex basis, got ${flex}`);
  const [, minimum, preferredVw, maximum] = clamp;
  const preferred = viewportWidth * Number(preferredVw) / 100;
  const menuWidth = Math.max(Number(minimum), Math.min(preferred, Number(maximum)));
  const wrapperWidth = viewportWidth - 12;
  const rowWidth = wrapperWidth - 2 * horizontalPadding(main.get("padding"));
  const mapWidth = rowWidth - menuWidth;

  assert.equal(menuWidth, 260);
  assert.equal(mapWidth, 968);
  assert.ok(mapWidth > 0, "the map retains the flexible remainder of the row");
});

test("select and opacity sliders fit the menu content box without horizontal scrolling", () => {
  const menu = declarationsFor("html.chmi-radar-classic #div_container_menu");
  const select = declarationsFor("html.chmi-radar-classic #div_container_menu select");
  const input = declarationsFor("html.chmi-radar-classic #div_container_menu input");
  const range = declarationsFor('html.chmi-radar-classic #div_container_menu input[type="range"]');
  const accordion = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion");
  const item = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion-item");
  const button = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion-button");
  const collapse = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion-collapse");
  const body = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion-body");
  const menuWidth = 260;
  const borderWidth = px(menu.get("border-left").split(" ")[0]);
  const contentWidth = menuWidth - 2 * horizontalPadding(menu.get("padding")) - borderWidth;

  assert.equal(menu.get("overflow-x"), "hidden");
  assert.equal(menu.get("overflow-y"), "auto");
  for (const control of [select, input]) {
    assert.equal(control.get("box-sizing"), "border-box");
    assert.equal(control.get("min-width"), "0");
    assert.equal(control.get("max-width"), "100%");
  }
  assert.equal(select.get("width"), "100%");
  assert.equal(range.get("width"), "100%");
  for (const container of [accordion, item, button, collapse, body]) {
    assert.equal(container.get("min-width"), "0");
    assert.equal(container.get("max-width"), "100%");
  }

  assert.equal(contentWidth, 243);
  assert.equal(contentWidth, menuWidth - 2 * horizontalPadding(menu.get("padding")) - borderWidth);
  assert.ok(contentWidth > 200, "the native product selector keeps a usable control width");
  assert.ok(content.includes('"select_prod"'));
  assert.ok(content.includes('"input_opa_slider_data1"'));
  assert.ok(content.includes('"input_opa_slider_data2"'));
});

test("the long CZRÁD explanation collapses accessibly while preserving enough menu height", () => {
  const explanation = "CZRÁD: maximální odrazivost ve vert. sloupci (odrazy srážek, které pravděpodobně nedopadnou na zemský povrch jsou vyznačeny světlejší méně sytou barvou)";
  const disclosureSummary = "Zobrazit celý popis vrstvy";
  const menu = declarationsFor("html.chmi-radar-classic #div_container_menu");
  const body = declarationsFor("html.chmi-radar-classic #div_container_menu .accordion-body");
  const contentWidth = 243;
  const lineHeight = 13 * 1.35;
  const averageGlyphWidth = 13 * 0.48;
  const fullTextLines = Math.ceil(
    explanation.length / Math.floor(contentWidth / averageGlyphWidth)
  );
  const summaryCharactersPerLine = Math.floor((contentWidth - 20) / (12 * 0.48));
  const summaryLines = Math.ceil(disclosureSummary.length / summaryCharactersPerLine);
  const savedDescriptionHeight = (fullTextLines - summaryLines) * lineHeight;
  const savedVerticalPadding = 2 * (10 - 6) + (8 - 6) + (10 - 8);
  const reportedOverflow = 553 - 506;

  assert.ok(explanation.length >= 100);
  assert.equal(body.get("padding"), "6px 0 8px");
  assert.equal(menu.get("padding"), "6px 8px");
  assert.equal(summaryLines, 1, "the short disclosure label fits on one line");
  assert.ok(
    savedDescriptionHeight + savedVerticalPadding > reportedOverflow,
    "collapsing the actual long layer explanation frees more than the measured 47px overflow"
  );

  assert.ok(content.includes('document.createElement("details")'));
  assert.ok(content.includes('summary.textContent = "Zobrazit celý popis vrstvy"'));
  assert.ok(
    content.includes("content.append(element)"),
    "the original description node remains intact inside the disclosure"
  );
  assert.ok(
    content.includes("disclosure.replaceWith(original)"),
    "turning classic mode off restores the original description node"
  );
});
