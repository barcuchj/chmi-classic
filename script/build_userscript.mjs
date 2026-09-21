#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptRoot);
const sourceRoot = join(projectRoot, "chrome-edge");
const outputPath = join(projectRoot, "tampermonkey", "chmi-classic.user.js");
const [portalRegistryJs, embeddedJs, portalJs, portalCss, embeddedCss, aladinJs, aladinCss] = await Promise.all(
  ["portal-registry.js", "embedded.js", "portal.js", "portal.css", "embedded.css", "aladin.js", "aladin.css"]
    .map(name => readFile(join(sourceRoot, name), "utf8"))
);

const [radarCss, satelliteCss, navigationCss, catalogCss, legacyCss, navigationJs, radarJs, satelliteJs, catalogJs, legacyJs] = await Promise.all([
  readFile(join(sourceRoot, "classic.css"), "utf8"),
  readFile(join(sourceRoot, "satellite.css"), "utf8"),
  readFile(join(sourceRoot, "navigation.css"), "utf8"),
  readFile(join(sourceRoot, "catalog.css"), "utf8"),
  readFile(join(sourceRoot, "legacy.css"), "utf8"),
  readFile(join(sourceRoot, "navigation.js"), "utf8"),
  readFile(join(sourceRoot, "content.js"), "utf8"),
  readFile(join(sourceRoot, "satellite.js"), "utf8"),
  readFile(join(sourceRoot, "catalog.js"), "utf8"),
  readFile(join(sourceRoot, "legacy.js"), "utf8")
]);

const metadata = `// ==UserScript==
// @name         ČHMÚ Classic – meteorologické výstupy
// @namespace    https://github.com/
// @version      0.7.0-beta.2
// @description  Vrací klasický vzhled, historické adaptace a jednotný katalog živých i archivních meteorologických výstupů ČHMÚ.
// @author       ČHMÚ Classic contributors
// @homepageURL  https://github.com/barcuchj/chmi-classic
// @supportURL   https://github.com/barcuchj/chmi-classic/issues
// @downloadURL  https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @updateURL    https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @match        https://produkty.chmi.cz/radar/*
// @match        https://produkty.chmi.cz/druzice/*
// @match        https://produkty.chmi.cz/aladin/*
// @match        https://www.chmi.cz/*
// @match        https://chmi.cz/*
// @match        https://hydro.chmi.cz/*
// @match        https://intranet.chmi.cz/*
// @match        http://intranet.chmi.cz/*
// @match        https://portal.chmi.cz/*
// @match        http://portal.chmi.cz/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==`;

const bridge = `
(() => {
  "use strict";

  const key = "chmiRadarClassicEnabled";
  const restoreId = "chmi-classic-userscript-restore";

  function isEnabled() {
    return Boolean(GM_getValue(key, true));
  }

  function isRelevantPage() {
    const path = location.pathname.replace(/\\/+$/, "") || "/";
    if (location.hostname === "produkty.chmi.cz") {
      return path.startsWith("/radar") || path.startsWith("/druzice") || path.startsWith("/aladin");
    }
    if (location.hostname === "hydro.chmi.cz") {
      return path.startsWith("/hpps/srz");
    }
    if (location.hostname === "intranet.chmi.cz" || location.hostname === "portal.chmi.cz") {
      return true;
    }
    if (location.hostname !== "www.chmi.cz" && location.hostname !== "chmi.cz") {
      return false;
    }
    const prefixes = [
      "/predpoved-pocasi/meteogramy-aladin",
      "/meteogram/",
      "/namerena-data/webkamery",
      "/predpoved-pocasi/synopticka-situace",
      "/predpoved-pocasi/synopticke-situace-v-minulosti",
      "/predpoved-pocasi/pocasi-evropa",
      "/predpoved-pocasi/prechody-front-pres-prahu",
      "/namerena-data/data-z-mericich-stanic",
      "/namerena-data/umisteni-mericich-stanic/meteorologicke",
      "/namerena-data/radar-nowcast/srazky-a-blesky",
      "/namerena-data/historicka-data",
      "/namerena-data/polarni-druzice",
      "/namerena-data/geostacionarni-druzice",
      "/namerena-data/pravdepodobnost-rustu-hub",
      "/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni",
      "/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy",
      "/letectvi"
    ];
    return path === "/" || path === "/uvod" || prefixes.some((prefix) => path.startsWith(prefix));
  }

  function renderRestoreButton() {
    document.getElementById(restoreId)?.remove();
    if (isEnabled() || !isRelevantPage()) {
      return;
    }

    const button = document.createElement("button");
    button.id = restoreId;
    button.type = "button";
    button.textContent = "Klasický vzhled";
    button.title = "Znovu zapnout klasické rozhraní ČHMÚ";
    button.addEventListener("click", () => {
      GM_setValue(key, true);
      location.reload();
    });
    document.body.append(button);
  }

  globalThis.__chmiClassicStorage = {
    get(defaultValues, callback) {
      callback({ [key]: GM_getValue(key, defaultValues[key]) });
    },
    set(values) {
      if (Object.hasOwn(values, key)) {
        GM_setValue(key, Boolean(values[key]));
        renderRestoreButton();
      }
    }
  };

  if (window.top === window) GM_registerMenuCommand("Přepnout klasický/nový vzhled", () => {
    GM_setValue(key, !isEnabled());
    location.reload();
  });

  GM_addStyle(${JSON.stringify(`${radarCss}\n${satelliteCss}\n${navigationCss}\n${catalogCss}\n${legacyCss}\n${aladinCss}\n${portalCss}\n${embeddedCss}\n
#chmi-classic-userscript-restore {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 2147483647;
  padding: 7px 12px;
  border: 1px solid #1677a8;
  border-radius: 2px;
  background: #eaf7fc;
  color: #07567e;
  font: 600 13px Arial, sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);
}`)});
  renderRestoreButton();
})();`;

const output = `${metadata}\n\n${bridge}\n\n${portalRegistryJs}\n\n${embeddedJs}\n\n${portalJs}\n\n${navigationJs.trimEnd()}\n\n${radarJs.trimEnd()}\n\n${satelliteJs.trimEnd()}\n\n${aladinJs.trimEnd()}\n\n${catalogJs.trimEnd()}\n\n${legacyJs.trimEnd()}\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, "utf8");
console.log(`Created ${outputPath}`);
