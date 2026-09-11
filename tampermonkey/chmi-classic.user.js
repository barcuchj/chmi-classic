// ==UserScript==
// @name         ČHMÚ Classic – meteorologické výstupy
// @namespace    https://github.com/
// @version      0.5.0
// @description  Vrací klasický vzhled a jednotný katalog živých i archivních meteorologických výstupů ČHMÚ.
// @author       ČHMÚ Classic contributors
// @homepageURL  https://github.com/barcuchj/chmi-classic
// @supportURL   https://github.com/barcuchj/chmi-classic/issues
// @downloadURL  https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @updateURL    https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @match        https://produkty.chmi.cz/radar/*
// @match        https://produkty.chmi.cz/druzice/*
// @match        https://produkty.chmi.cz/aladin/*
// @match        https://www.chmi.cz/*
// @match        https://hydro.chmi.cz/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==


(() => {
  "use strict";

  const key = "chmiRadarClassicEnabled";
  const restoreId = "chmi-classic-userscript-restore";

  function isEnabled() {
    return Boolean(GM_getValue(key, true));
  }

  function isRelevantPage() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (location.hostname === "produkty.chmi.cz") {
      return path.startsWith("/radar") || path.startsWith("/druzice") || path.startsWith("/aladin");
    }
    if (location.hostname === "hydro.chmi.cz") {
      return path.startsWith("/hpps/srz");
    }
    if (location.hostname !== "www.chmi.cz") {
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
    return path === "/" || prefixes.some((prefix) => path.startsWith(prefix));
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

  GM_registerMenuCommand("Přepnout klasický/nový vzhled", () => {
    GM_setValue(key, !isEnabled());
    location.reload();
  });

  GM_addStyle("html.chmi-radar-classic,\nhtml.chmi-radar-classic body#mbody {\n  width: 100%;\n  height: 100%;\n  min-height: 100vh;\n  background: #8bc6da !important;\n  color: #555 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-radar-classic #content,\nhtml.chmi-radar-classic #wrapper > nav,\nhtml.chmi-radar-classic #footer,\nhtml.chmi-radar-classic #footerBottom,\nhtml.chmi-radar-classic .material-scrolltop,\nhtml.chmi-radar-classic .chmi-radar-classic-hidden {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #wrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: calc(100vw - 20px) !important;\n  max-width: none !important;\n  height: calc(100vh - 20px) !important;\n  min-height: 560px !important;\n  margin: 10px auto !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  flex: 0 0 auto;\n  align-items: baseline;\n  gap: 9px;\n  min-height: 46px;\n  padding: 11px 14px 9px;\n  color: #175f82;\n  background: #fff;\n  border-radius: 12px 12px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-radar-classic .mainWrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border-radius: 0 0 12px 12px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-section {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-row {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: row !important;\n  align-items: stretch !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_data {\n  position: relative !important;\n  flex: 1 1 auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: auto !important;\n  max-width: none !important;\n  height: 100% !important;\n  background: #d2d2d2 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-container {\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n  min-height: 100% !important;\n}\n\nhtml.chmi-radar-classic.chmi-radar-classic-web-maps #div_container_data #div_bg {\n  width: 100% !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu {\n  box-sizing: border-box;\n  flex: 0 0 320px !important;\n  align-self: stretch !important;\n  width: 320px !important;\n  max-width: 320px !important;\n  padding: 10px !important;\n  color: #555 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-left: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  min-height: 0 !important;\n  overflow: auto !important;\n  font: 13px/1.35 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-button {\n  min-height: 34px;\n  padding: 7px 8px !important;\n  color: #176b95 !important;\n  background: #f7fbfd !important;\n  border-bottom: 1px solid #b9cbd3 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-body {\n  padding: 8px 0 10px !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu select,\nhtml.chmi-radar-classic #div_container_menu input,\nhtml.chmi-radar-classic #div_container_menu button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar {\n  position: absolute;\n  z-index: 10000;\n  top: 8px;\n  left: 8px;\n  display: block;\n  padding: 3px;\n  background: rgb(255 255 255 / 94%);\n  border: 1px solid #b8cbd4;\n  border-radius: 3px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 22%);\n}\n\nhtml.chmi-radar-classic #div_container_menu #div_radio_display {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar .chmi-radar-classic-options {\n  display: inline-flex !important;\n  flex-wrap: nowrap !important;\n  width: auto !important;\n  white-space: nowrap;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button {\n  box-sizing: border-box;\n  display: inline-block !important;\n  min-width: auto !important;\n  margin: 0 -1px 0 0 !important;\n  padding: 5px 11px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  text-align: center;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:first-child {\n  border-radius: 2px 0 0 2px !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:last-child {\n  margin-right: 0 !important;\n  border-radius: 0 2px 2px 0 !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button[aria-checked=\"true\"] {\n  position: relative;\n  z-index: 1;\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:focus-visible,\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 991px) {\n  html.chmi-radar-classic #wrapper {\n    width: calc(100% - 12px) !important;\n    height: auto !important;\n    min-height: calc(100vh - 12px) !important;\n    margin: 6px auto !important;\n  }\n\n  html.chmi-radar-classic .chmi-radar-classic-app-row {\n    flex-direction: column !important;\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-radar-classic #div_container_data {\n    min-height: 60vh !important;\n    height: 60vh !important;\n  }\n\n  html.chmi-radar-classic #div_container_menu {\n    width: 100% !important;\n    max-width: none !important;\n    border-top: 1px solid #bbb !important;\n    border-left: 0 !important;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar {\n    top: 6px;\n    left: 6px;\n    max-width: calc(100% - 12px);\n    overflow-x: auto;\n  }\n}\n\n@media (max-width: 560px) {\n  html.chmi-radar-classic #chmi-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar button {\n    padding: 5px 8px !important;\n    font-size: 11px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-radar-classic *,\n  html.chmi-radar-classic *::before,\n  html.chmi-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Radar vložený na úvodní stránce ČHMÚ – stylujeme jen jeho sekci. */\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic {\n  box-sizing: border-box;\n  position: relative;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 12px 0 !important;\n  padding: 0 10px 12px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7 !important;\n  border-radius: 10px !important;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 18%);\n  overflow: hidden;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border-bottom: 1px solid #b8cbd4;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-title,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-subtitle {\n  display: none !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n  background: #d2d2d2;\n  border: 1px solid #888 !important;\n  border-radius: 0 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n  min-height: 360px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host img,\nhtml.chmi-home-radar-classic-active img.chmi-home-radar-classic-map-host {\n  display: block;\n  max-width: 100% !important;\n  height: auto !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:not(#chmi-home-radar-classic-brand > button) {\n  border-radius: 2px !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic a:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-anchor {\n  display: block;\n  position: relative;\n  top: -8px;\n  visibility: hidden;\n}\n\n@media (max-width: 640px) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic {\n    margin: 6px 0 !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n    min-height: 300px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::before,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Pravděpodobnost růstu hub – portálová stránka ČHMÚ. */\nhtml.chmi-hub-classic,\nhtml.chmi-hub-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic header#chmu-header,\nhtml.chmi-hub-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-hub-classic .menu-bookmarks,\nhtml.chmi-hub-classic .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-hub-classic footer,\nhtml.chmi-hub-classic #footer,\nhtml.chmi-hub-classic .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-hub-classic main h1 {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main h2,\nhtml.chmi-hub-classic main h3,\nhtml.chmi-hub-classic main h4 {\n  margin-top: 10px !important;\n  margin-bottom: 7px !important;\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-hub-classic main h3 {\n  font-size: 16px !important;\n}\n\nhtml.chmi-hub-classic main h4 {\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-section {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  background: #d2d2d2;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic iframe.chmi-hub-classic-map-host,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n  height: min(78vh, 800px) !important;\n  min-height: 520px !important;\n  border: 1px solid #888;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-host iframe,\nhtml.chmi-hub-classic #chmu-map-container iframe {\n  width: 100% !important;\n  max-width: none !important;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:focus-visible,\nhtml.chmi-hub-classic main button:focus-visible,\nhtml.chmi-hub-classic main a:focus-visible,\nhtml.chmi-hub-classic main select:focus-visible,\nhtml.chmi-hub-classic main input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 640px) {\n  html.chmi-hub-classic main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-hub-classic #chmu-map-container,\n  html.chmi-hub-classic iframe.chmi-hub-classic-map-host,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n    height: 70vh !important;\n    min-height: 420px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-hub-classic *,\n  html.chmi-hub-classic *::before,\n  html.chmi-hub-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* 0.4.1 – dynamické přizpůsobení pracovního prostoru dostupnému oknu. */\nhtml.chmi-radar-classic,\nhtml.chmi-radar-classic body#mbody {\n  overflow: hidden !important;\n}\n\nhtml.chmi-radar-classic #wrapper {\n  width: calc(100vw - 12px) !important;\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  margin: 6px auto !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand {\n  min-height: 40px;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-radar-classic .mainWrapper {\n  padding: 6px 8px 8px !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu {\n  flex: 0 0 clamp(260px, 20vw, 340px) !important;\n  width: clamp(260px, 20vw, 340px) !important;\n  max-width: clamp(260px, 20vw, 340px) !important;\n  overscroll-behavior: contain;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar {\n  top: 8px;\n  left: var(--chmi-radar-toolbar-left, 56px);\n  max-width: calc(100% - var(--chmi-radar-toolbar-left, 56px) - 8px);\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-left {\n  left: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-right {\n  right: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-top {\n  top: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-bottom {\n  bottom: 6px !important;\n}\n\n/* Homepage radar: stejný kompaktní pracovní rám a geometrie jako u produktového radaru. */\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic {\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  margin: 6px 0 8px calc(50% - 50vw + 6px) !important;\n  padding: 0 8px 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 6px;\n  padding: 8px 10px 7px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-section {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  align-items: stretch !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data {\n  position: relative !important;\n  flex: 1 1 auto !important;\n  width: auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_menu {\n  box-sizing: border-box;\n  flex: 0 0 clamp(260px, 20vw, 340px) !important;\n  width: clamp(260px, 20vw, 340px) !important;\n  max-width: clamp(260px, 20vw, 340px) !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  padding: 10px !important;\n  border-left: 1px solid #bbb !important;\n  overflow: auto !important;\n  overscroll-behavior: contain;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n  min-width: 0 !important;\n  max-width: none !important;\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n  min-height: min(360px, 60dvh) !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.leaflet-container,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.maplibregl-map,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.ol-viewport {\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar {\n  position: absolute;\n  z-index: 10000;\n  top: 8px;\n  left: var(--chmi-home-radar-toolbar-left, 56px);\n  display: block;\n  max-width: calc(100% - var(--chmi-home-radar-toolbar-left, 56px) - 8px);\n  padding: 3px;\n  overflow-x: auto;\n  white-space: nowrap;\n  background: rgb(255 255 255 / 94%);\n  border: 1px solid #b8cbd4;\n  border-radius: 3px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 22%);\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar .chmi-radar-classic-options {\n  display: inline-flex !important;\n  flex-wrap: nowrap !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button {\n  box-sizing: border-box;\n  margin: 0 -1px 0 0 !important;\n  padding: 5px 10px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  cursor: pointer;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button:first-child {\n  border-radius: 2px 0 0 2px !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button:last-child {\n  margin-right: 0 !important;\n  border-radius: 0 2px 2px 0 !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button[aria-checked=\"true\"] {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .leaflet-left,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data .leaflet-left {\n  left: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .leaflet-right,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data .leaflet-right {\n  right: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .maplibregl-ctrl-top-left {\n  top: 6px !important;\n  left: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .maplibregl-ctrl-top-right {\n  top: 6px !important;\n  right: 6px !important;\n}\n\n/* Houby: plná šířka okna, mapa vyplní zbylou výšku viewportu. */\nhtml.chmi-hub-classic,\nhtml.chmi-hub-classic body {\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-hub-classic main {\n  width: calc(100vw - 12px) !important;\n  margin: 6px auto 8px !important;\n  padding: 0 8px 8px !important;\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 6px;\n  padding: 8px 10px 7px;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic iframe.chmi-hub-classic-map-host,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n  width: 100% !important;\n  max-width: none !important;\n  height: var(--chmi-hub-fit-height, calc(100dvh - 150px)) !important;\n  min-height: min(420px, calc(100dvh - 120px)) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container > *,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host > * {\n  max-width: 100%;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .leaflet-left,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .leaflet-left {\n  left: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .leaflet-right,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .leaflet-right {\n  right: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .maplibregl-ctrl-top-left,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .maplibregl-ctrl-top-left {\n  top: 8px !important;\n  left: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .maplibregl-ctrl-top-right,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .maplibregl-ctrl-top-right {\n  top: 8px !important;\n  right: 8px !important;\n}\n\n@media (max-width: 760px) {\n  html.chmi-radar-classic,\n  html.chmi-radar-classic body#mbody {\n    overflow: auto !important;\n  }\n\n  html.chmi-radar-classic #wrapper {\n    width: calc(100% - 8px) !important;\n    height: auto !important;\n    min-height: calc(100dvh - 8px) !important;\n    margin: 4px auto !important;\n  }\n\n  html.chmi-radar-classic .chmi-radar-classic-app-row,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row {\n    flex-direction: column !important;\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-radar-classic #div_container_data,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n    height: 62dvh !important;\n    min-height: 320px !important;\n  }\n\n  html.chmi-radar-classic #div_container_menu,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_menu {\n    flex-basis: auto !important;\n    width: 100% !important;\n    max-width: none !important;\n    height: auto !important;\n    border-top: 1px solid #bbb !important;\n    border-left: 0 !important;\n  }\n\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic {\n    width: calc(100vw - 8px) !important;\n    margin-left: calc(50% - 50vw + 4px) !important;\n  }\n\n  html.chmi-hub-classic main {\n    width: calc(100vw - 8px) !important;\n    margin-top: 4px !important;\n  }\n}\n\n/* Prevent browser default body margins from reintroducing viewport scrollbars in full-window classic apps. */\nhtml.chmi-radar-classic body#mbody,\nhtml.chmi-hub-classic body {\n    margin: 0 !important;\n    padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic,\nhtml.chmi-satellite-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: 100%;\n  min-height: 42px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-satellite-classic-live #content,\nhtml.chmi-satellite-classic-live #wrapper > nav,\nhtml.chmi-satellite-classic-live #footer,\nhtml.chmi-satellite-classic-live #footerBottom,\nhtml.chmi-satellite-classic-live .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #wrapper {\n  width: min(1460px, calc(100% - 20px)) !important;\n  min-height: auto !important;\n  margin: 10px auto 40px !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper {\n  box-sizing: border-box;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-top: 0;\n  border-radius: 0 0 10px 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid {\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid > h1,\nhtml.chmi-satellite-classic-live #btn-desktop-sidebar-toggle,\nhtml.chmi-satellite-classic-live #animation-controls,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-native-choice {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1160px) 250px;\n  justify-content: center;\n  gap: 10px !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .map-col,\nhtml.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n  box-sizing: border-box;\n  width: auto !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title {\n  min-height: 24px;\n  margin: 0 0 4px !important;\n  text-align: left !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title h2 {\n  margin: 0 !important;\n  color: #176b95 !important;\n  font: bold 16px/1.4 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container {\n  max-height: none !important;\n  background: #d2d2d2 !important;\n  border: 1px solid #888;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu {\n  position: static !important;\n  visibility: visible !important;\n  width: 100% !important;\n  min-height: 0 !important;\n  height: calc(100vh - 84px) !important;\n  max-height: 900px;\n  padding: 0 !important;\n  color: #111 !important;\n  background: #fff !important;\n  border: 1px solid #aaa !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  transform: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n  padding: 9px !important;\n  overflow-y: auto !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section {\n  margin: 0 !important;\n  padding: 8px 0 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-bottom: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .section-header,\nhtml.chmi-satellite-classic-live #settingsMenu .form-label {\n  margin-bottom: 4px !important;\n  color: #111 !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .btn-info-icon {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu select,\nhtml.chmi-satellite-classic-live #settingsMenu input,\nhtml.chmi-satellite-classic-live #settingsMenu button {\n  border-radius: 2px !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group {\n  gap: 4px !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group label {\n  min-width: 39px;\n  margin: 0 !important;\n  padding: 4px 7px !important;\n  color: #14387f !important;\n  background: #f8fbff !important;\n  border: 1px solid #14387f !important;\n  border-radius: 2px !important;\n  font: 13px/1.25 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group input:checked + label {\n  color: #fff !important;\n  background: #14387f !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector {\n  margin-bottom: 8px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  margin-bottom: 9px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row label,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector > strong {\n  font-weight: bold;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row select {\n  flex: 1;\n  min-width: 0;\n  padding: 3px 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-matrix {\n  display: grid;\n  gap: 3px;\n  margin-top: 7px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  display: grid;\n  grid-template-columns: minmax(85px, 1fr) repeat(3, 37px);\n  align-items: center;\n  gap: 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span {\n  color: #0645ad;\n  font-weight: bold;\n  text-decoration: underline;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button {\n  min-width: 35px;\n  padding: 2px 4px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button:hover,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button.is-active {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-selection {\n  margin-top: 8px;\n  color: #555;\n  font-size: 11px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding: 8px 0 6px;\n  color: #111;\n  background: #fff;\n  font: 13px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player button,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player select {\n  min-height: 25px;\n  padding: 2px 7px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-player-buttons {\n  display: inline-flex;\n  gap: 3px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"loaded\"],\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"time\"] {\n  white-space: nowrap;\n}\n\nhtml.chmi-satellite-classic-live .product-legend-box {\n  margin-top: 4px !important;\n  padding: 8px !important;\n  background: #fff !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #satInfo {\n  color: #d40000 !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-satellite-classic-portal header#chmu-header,\nhtml.chmi-satellite-classic-portal nav[aria-label*=\"Nach\"],\nhtml.chmi-satellite-classic-portal .menu-bookmarks,\nhtml.chmi-satellite-classic-portal .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-satellite-classic-portal footer,\nhtml.chmi-satellite-classic-portal #footer,\nhtml.chmi-satellite-classic-portal .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-portal main > #chmi-satellite-classic-brand {\n  width: calc(100% + 20px);\n  margin: -1px -10px 0;\n}\n\nhtml.chmi-satellite-classic-portal main h1 {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 7px;\n  margin: 9px 0;\n  padding: 7px 8px;\n  background: #fff;\n  border: 1px solid #aaa;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products > div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a {\n  padding: 3px 8px;\n  color: #0645ad;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.35 Arial, Helvetica, sans-serif;\n  text-decoration: none;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a:hover,\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a[aria-current=\"page\"] {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n  margin-left: auto;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: min(78vh, 800px) !important;\n  min-height: 520px;\n  background: #d2d2d2;\n  border: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic button:focus-visible,\nhtml.chmi-satellite-classic a:focus-visible,\nhtml.chmi-satellite-classic select:focus-visible,\nhtml.chmi-satellite-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 1100px) {\n  html.chmi-satellite-classic-live #main-row {\n    grid-template-columns: minmax(0, 1fr);\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu {\n    height: auto !important;\n    max-height: none !important;\n  }\n}\n\n@media (max-width: 640px) {\n  html.chmi-satellite-classic #chmi-satellite-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-satellite-classic-live #wrapper,\n  html.chmi-satellite-classic-portal main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n  }\n\n  html.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n    grid-template-columns: minmax(82px, 1fr) repeat(3, 34px);\n    gap: 3px;\n  }\n\n  html.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n\n  html.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n    margin-left: 0;\n  }\n\n  html.chmi-satellite-classic-portal #chmu-map-container {\n    min-height: 420px;\n    height: 70vh !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-satellite-classic *,\n  html.chmi-satellite-classic *::before,\n  html.chmi-satellite-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* 0.4.1 – dynamické využití viewportu pro Meteosat a portálové družicové mapy. */\nhtml.chmi-satellite-classic-live,\nhtml.chmi-satellite-classic-live body {\n  width: 100%;\n  height: 100%;\n  min-height: 100dvh;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #wrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  margin: 6px auto !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-brand {\n  flex: 0 0 auto;\n  min-height: 40px;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper {\n  display: flex !important;\n  flex: 1 1 auto !important;\n  min-height: 0 !important;\n  padding: 6px 8px 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid {\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row {\n  display: grid !important;\n  flex: 1 1 auto !important;\n  grid-template-columns: minmax(0, 1fr) clamp(230px, 18vw, 300px) !important;\n  grid-template-rows: minmax(0, 1fr) !important;\n  align-items: stretch !important;\n  justify-content: stretch !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  gap: 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .map-col {\n  display: flex !important;\n  flex-direction: column !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n  display: flex !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title {\n  flex: 0 0 auto;\n  min-height: 20px;\n  margin-bottom: 3px !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  max-width: none !important;\n  min-width: 0 !important;\n  min-height: 180px !important;\n  height: auto !important;\n  max-height: none !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container img,\nhtml.chmi-satellite-classic-live #map-container canvas,\nhtml.chmi-satellite-classic-live #map-container video {\n  max-width: 100% !important;\n  max-height: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  max-width: 100% !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  max-height: none !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n  box-sizing: border-box;\n  width: 100% !important;\n  min-width: 0 !important;\n  height: 100% !important;\n  min-height: 0 !important;\n  padding: 8px !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector,\nhtml.chmi-satellite-classic-live #time-range-group {\n  box-sizing: border-box;\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group {\n  display: flex !important;\n  flex-wrap: wrap !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu input[type=\"range\"],\nhtml.chmi-satellite-classic-live #settingsMenu select {\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .form-check,\nhtml.chmi-satellite-classic-live #settingsMenu label {\n  min-width: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player {\n  flex: 0 0 auto !important;\n  min-width: 0 !important;\n  padding: 5px 0 1px;\n}\n\n/* Portálové polární/geostacionární mapy vyplní šířku i zbývající výšku okna. */\nhtml.chmi-satellite-classic-portal,\nhtml.chmi-satellite-classic-portal body {\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal main {\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  margin: 6px auto 8px !important;\n  padding: 0 8px 8px !important;\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal main > #chmi-satellite-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 0;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n  margin: 6px 0;\n  padding: 5px 7px;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container {\n  width: 100% !important;\n  max-width: none !important;\n  height: var(--chmi-satellite-portal-fit-height, calc(100dvh - 140px)) !important;\n  min-height: min(420px, calc(100dvh - 120px)) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container > * {\n  max-width: 100%;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-left {\n  left: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-right {\n  right: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-top {\n  top: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-bottom {\n  bottom: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .maplibregl-ctrl-top-left {\n  top: 8px !important;\n  left: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .maplibregl-ctrl-top-right {\n  top: 8px !important;\n  right: 8px !important;\n}\n\n@media (max-width: 760px) {\n  html.chmi-satellite-classic-live,\n  html.chmi-satellite-classic-live body {\n    height: auto;\n    overflow: auto !important;\n  }\n\n  html.chmi-satellite-classic-live #wrapper {\n    width: calc(100% - 8px) !important;\n    height: auto !important;\n    min-height: calc(100dvh - 8px) !important;\n    margin: 4px auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live .mainWrapper,\n  html.chmi-satellite-classic-live .mainWrapper > .container-fluid,\n  html.chmi-satellite-classic-live #main-row {\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live #main-row {\n    grid-template-columns: minmax(0, 1fr) !important;\n    grid-template-rows: auto auto !important;\n    height: auto !important;\n  }\n\n  html.chmi-satellite-classic-live #main-row > .map-col,\n  html.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live #map-container {\n    height: 58dvh !important;\n    min-height: 320px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu {\n    height: auto !important;\n    max-height: 55dvh !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n    height: auto !important;\n    max-height: 55dvh !important;\n  }\n\n  html.chmi-satellite-classic-portal main {\n    width: calc(100vw - 8px) !important;\n    margin-top: 4px !important;\n  }\n\n  html.chmi-satellite-classic-portal #chmu-map-container {\n    height: 68dvh !important;\n    min-height: 320px !important;\n  }\n}\n\n@media (max-height: 650px) and (min-width: 761px) {\n  html.chmi-satellite-classic-live #chmi-satellite-classic-brand {\n    min-height: 34px;\n    padding-top: 5px;\n    padding-bottom: 4px;\n  }\n\n  html.chmi-satellite-classic-live .mainWrapper {\n    padding-top: 4px !important;\n    padding-bottom: 4px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n    padding: 6px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .settings-section {\n    padding-top: 5px !important;\n    padding-bottom: 5px !important;\n  }\n}\n\n/* Full-window satellite views own the viewport; remove UA body margins that would create 8px overflow. */\nhtml.chmi-satellite-classic-live body,\nhtml.chmi-satellite-classic-portal body {\n    margin: 0 !important;\n    padding: 0 !important;\n}\n\n/* Narrow desktop sidebars: keep every mirrored control inside the settings column. */\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-matrix,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  grid-template-columns: minmax(0, 1fr) repeat(3, minmax(35px, 37px)) !important;\n  gap: 3px !important;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span {\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu input[type=\"range\"],\nhtml.chmi-satellite-classic-live #settingsMenu select {\n  box-sizing: border-box !important;\n  width: 100% !important;\n  min-width: 0 !important;\n}\n\n/* Společná kompaktní navigace mezi podporovanými částmi ČHMÚ Classic. */\n#chmi-radar-classic-brand,\n#chmi-home-radar-classic-brand,\n#chmi-satellite-classic-brand,\n#chmi-hub-classic-brand {\n  flex-wrap: wrap !important;\n  row-gap: 5px !important;\n}\n\n.chmi-classic-navigation {\n  box-sizing: border-box;\n  display: inline-flex !important;\n  flex: 0 1 auto;\n  align-items: center;\n  gap: 2px;\n  min-width: 0;\n  margin: 0 4px 0 8px;\n  padding: 0;\n  white-space: nowrap;\n}\n\n.chmi-classic-navigation a {\n  box-sizing: border-box;\n  display: inline-block !important;\n  padding: 3px 6px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #b2cfdb !important;\n  border-radius: 2px !important;\n  font: 11px/1.25 Arial, Helvetica, sans-serif !important;\n  text-decoration: none !important;\n}\n\n.chmi-classic-navigation a:hover,\n.chmi-classic-navigation a.is-active,\n.chmi-classic-navigation a[aria-current=\"page\"] {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\n.chmi-classic-navigation a:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 900px) {\n  .chmi-classic-navigation {\n    order: 3;\n    flex: 1 0 100%;\n    width: 100%;\n    max-width: 100%;\n    margin: 0;\n    flex-wrap: wrap !important;\n    overflow-x: visible;\n    white-space: normal;\n  }\n}\n\n@media (max-width: 520px) {\n  .chmi-classic-navigation a {\n    padding: 3px 5px !important;\n    font-size: 10.5px !important;\n  }\n}\n\n/* Jednotný katalog a kompaktní old-look rám dalších meteorologických výstupů ČHMÚ. */\n\n.chmi-classic-catalog-button,\n#chmi-aladin-four-map-preset,\n#chmi-catalog-classic-brand > button {\n  box-sizing: border-box;\n  flex: 0 0 auto;\n  padding: 3px 8px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 2px !important;\n  font: 12px/1.35 Arial, Helvetica, sans-serif !important;\n  cursor: pointer;\n}\n\n.chmi-classic-catalog-button:hover,\n#chmi-aladin-four-map-preset:hover,\n#chmi-catalog-classic-brand > button:hover {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\n.chmi-classic-catalog-button:focus-visible,\n#chmi-aladin-four-map-preset:focus-visible,\n#chmi-catalog-classic-brand button:focus-visible,\n#chmi-classic-catalog-dialog a:focus-visible,\n#chmi-classic-catalog-dialog button:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\nhtml.chmi-catalog-open,\nhtml.chmi-catalog-open body {\n  overflow: hidden !important;\n}\n\n#chmi-classic-catalog-overlay[hidden] {\n  display: none !important;\n}\n\n#chmi-classic-catalog-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483600;\n  display: grid;\n  place-items: center;\n  box-sizing: border-box;\n  padding: 14px;\n  background: rgb(15 50 65 / 56%);\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\n#chmi-classic-catalog-dialog {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  width: min(1180px, 100%);\n  max-height: calc(100vh - 28px);\n  overflow: hidden;\n  color: #222;\n  background: #fff;\n  border: 1px solid #6b8c9b;\n  border-radius: 7px;\n  box-shadow: 0 8px 28px rgb(0 0 0 / 38%);\n}\n\n#chmi-classic-catalog-dialog > header {\n  display: flex;\n  flex: 0 0 auto;\n  align-items: center;\n  gap: 12px;\n  padding: 9px 11px;\n  color: #176b95;\n  background: #e8f6fb;\n  border-bottom: 1px solid #9cc5d5;\n}\n\n#chmi-classic-catalog-dialog h2 {\n  flex: 1 1 auto;\n  margin: 0 !important;\n  color: #176b95 !important;\n  font: 700 17px/1.25 Arial, Helvetica, sans-serif !important;\n}\n\n#chmi-classic-catalog-dialog .chmi-catalog-close {\n  flex: 0 0 auto;\n  padding: 4px 9px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #8fb9ca;\n  border-radius: 2px;\n  font: 12px/1.35 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\n.chmi-catalog-intro {\n  flex: 0 0 auto;\n  margin: 0 !important;\n  padding: 7px 11px !important;\n  color: #555 !important;\n  background: #fbfbfb;\n  border-bottom: 1px solid #ddd;\n  font: 12px/1.4 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-quick {\n  flex: 0 0 auto;\n  padding: 6px 8px;\n  border-bottom: 1px solid #ddd;\n}\n\n.chmi-catalog-quick .chmi-classic-navigation {\n  display: flex !important;\n  flex-wrap: wrap !important;\n  width: 100%;\n  margin: 0;\n  white-space: normal;\n}\n\n.chmi-catalog-groups {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 9px;\n  min-height: 0;\n  padding: 9px;\n  overflow: auto;\n  overscroll-behavior: contain;\n}\n\n.chmi-catalog-group {\n  min-width: 0;\n  border: 1px solid #b7cbd4;\n  background: #fafcfd;\n}\n\n.chmi-catalog-group > h3 {\n  margin: 0 !important;\n  padding: 6px 8px !important;\n  color: #176b95 !important;\n  background: #eaf5f9;\n  border-bottom: 1px solid #b7cbd4;\n  font: 700 14px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-list {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1px;\n  background: #dfe7ea;\n}\n\n.chmi-catalog-item {\n  min-width: 0;\n  padding: 6px 7px;\n  background: #fff;\n}\n\n.chmi-catalog-item-top {\n  display: flex;\n  align-items: flex-start;\n  gap: 6px;\n}\n\n.chmi-catalog-item a {\n  flex: 1 1 auto;\n  min-width: 0;\n  color: #0645ad !important;\n  font: 700 12.5px/1.3 Arial, Helvetica, sans-serif !important;\n  text-decoration: underline !important;\n  overflow-wrap: anywhere;\n}\n\n.chmi-catalog-item a[aria-current=\"page\"] {\n  color: #8b1b1b !important;\n}\n\n.chmi-catalog-item p {\n  margin: 3px 0 0 !important;\n  color: #555 !important;\n  font: 11px/1.35 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-status {\n  flex: 0 0 auto;\n  padding: 1px 4px;\n  border: 1px solid #8cad99;\n  border-radius: 2px;\n  color: #28623a;\n  background: #edf8f0;\n  font: 700 9.5px/1.35 Arial, Helvetica, sans-serif !important;\n  text-transform: uppercase;\n  letter-spacing: .02em;\n}\n\n.chmi-catalog-status.is-archive {\n  color: #765100;\n  background: #fff8df;\n  border-color: #c8aa5b;\n}\n\n/* Old-look rám pro další živé výstupy. Nezasahuje do datového backendu ani logiky formulářů. */\nhtml.chmi-catalog-shell,\nhtml.chmi-catalog-shell body {\n  box-sizing: border-box;\n  min-width: 0 !important;\n  min-height: 100%;\n  margin: 0 !important;\n  overflow-x: hidden !important;\n  color: #111 !important;\n  background: #8bc6da !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-catalog-shell body *,\nhtml.chmi-catalog-shell body *::before,\nhtml.chmi-catalog-shell body *::after {\n  box-sizing: border-box;\n}\n\nhtml.chmi-catalog-shell header#chmu-header,\nhtml.chmi-catalog-shell nav[aria-label*=\"Nach\"],\nhtml.chmi-catalog-shell .menu-bookmarks,\nhtml.chmi-catalog-shell .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-catalog-shell footer,\nhtml.chmi-catalog-shell #footer,\nhtml.chmi-catalog-shell #footerBottom,\nhtml.chmi-catalog-shell .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-catalog-shell main {\n  box-sizing: border-box;\n  width: calc(100% - 12px) !important;\n  max-width: none !important;\n  min-height: min(var(--chmi-catalog-available-height, 640px), calc(100vh - 12px));\n  margin: 6px auto 12px !important;\n  padding: 0 8px 10px !important;\n  overflow: visible !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 7px;\n  box-shadow: 0 3px 8px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand {\n  position: relative;\n  z-index: 1000;\n  display: flex !important;\n  flex-wrap: wrap !important;\n  align-items: center !important;\n  gap: 5px 7px;\n  width: calc(100% + 16px);\n  min-width: 0;\n  min-height: 38px;\n  margin: -1px -8px 7px;\n  padding: 6px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-top: 0;\n  border-radius: 7px 7px 0 0;\n  box-shadow: 0 2px 6px rgb(40 83 101 / 18%);\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand > strong {\n  flex: 0 1 auto;\n  min-width: 0;\n  font-size: 15px;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand > span {\n  flex: 0 0 auto;\n  color: #777;\n  font-size: 11px;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-classic-navigation {\n  flex: 1 1 430px;\n  flex-wrap: wrap !important;\n  margin: 0 2px;\n  white-space: normal;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-catalog-new-look {\n  margin-left: auto;\n}\n\nhtml.chmi-catalog-shell main > h1:first-of-type {\n  margin-top: 4px !important;\n  margin-bottom: 8px !important;\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 20px !important;\n}\n\nhtml.chmi-catalog-shell main h2,\nhtml.chmi-catalog-shell main h3,\nhtml.chmi-catalog-shell main h4 {\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-catalog-shell main img,\nhtml.chmi-catalog-shell main iframe,\nhtml.chmi-catalog-shell main svg,\nhtml.chmi-catalog-shell main video {\n  max-width: 100% !important;\n}\n\nhtml.chmi-catalog-shell main table {\n  max-width: 100% !important;\n}\n\nhtml.chmi-catalog-shell main input,\nhtml.chmi-catalog-shell main select,\nhtml.chmi-catalog-shell main textarea,\nhtml.chmi-catalog-shell main button {\n  max-width: 100%;\n}\n\nhtml.chmi-catalog-shell [id*=\"map\" i],\nhtml.chmi-catalog-shell [class*=\"map\" i] {\n  min-width: 0;\n}\n\n/* ALADIN: roztažení pracovního prostoru bez nahrazování map nebo časových ovladačů. */\nhtml.chmi-catalog-aladin .mainWrapper,\nhtml.chmi-catalog-aladin .main-wrapper,\nhtml.chmi-catalog-aladin main > .container,\nhtml.chmi-catalog-aladin main > .container-fluid {\n  width: 100% !important;\n  max-width: none !important;\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n  padding-right: 4px !important;\n  padding-left: 4px !important;\n}\n\nhtml.chmi-catalog-aladin main img {\n  height: auto !important;\n  object-fit: contain;\n}\n\nhtml.chmi-catalog-aladin main form,\nhtml.chmi-catalog-aladin main fieldset {\n  min-width: 0 !important;\n}\n\n@media (max-width: 900px) {\n  .chmi-catalog-groups {\n    grid-template-columns: 1fr;\n  }\n\n  .chmi-catalog-list {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  html.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-classic-navigation {\n    flex-basis: 100%;\n    order: 3;\n  }\n}\n\n@media (max-width: 620px) {\n  #chmi-classic-catalog-overlay {\n    padding: 4px;\n  }\n\n  #chmi-classic-catalog-dialog {\n    max-height: calc(100vh - 8px);\n  }\n\n  .chmi-catalog-list {\n    grid-template-columns: 1fr;\n  }\n\n  html.chmi-catalog-shell main {\n    width: 100% !important;\n    margin-top: 0 !important;\n    border-right: 0;\n    border-left: 0;\n    border-radius: 0;\n  }\n\n  html.chmi-catalog-shell #chmi-catalog-classic-brand {\n    border-radius: 0;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  #chmi-classic-catalog-overlay *,\n  html.chmi-catalog-shell * {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n  }\n}\n\n\n#chmi-classic-userscript-restore {\n  position: fixed;\n  right: 12px;\n  bottom: 12px;\n  z-index: 2147483647;\n  padding: 7px 12px;\n  border: 1px solid #1677a8;\n  border-radius: 2px;\n  background: #eaf7fc;\n  color: #07567e;\n  font: 600 13px Arial, sans-serif;\n  cursor: pointer;\n  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);\n}");
  renderRestoreButton();
})();

(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicNavigationLoaded) {
    return;
  }

  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const pageKey = (() => {
    if (location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/radar/")) {
      return "radar";
    }
    if (location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/druzice/")) {
      return "meteosat";
    }
    if (location.hostname !== "www.chmi.cz") {
      return null;
    }
    if (pathname === "/") {
      return "home-radar";
    }
    if (pathname.includes("/polarni-druzice/")) {
      return "polar";
    }
    if (pathname.includes("/geostacionarni-druzice/")) {
      return "geo";
    }
    if (pathname === "/namerena-data/pravdepodobnost-rustu-hub") {
      return "hub";
    }
    return null;
  })();

  if (!pageKey) {
    return;
  }

  window.__chmiClassicNavigationLoaded = true;

  const NAV_CLASS = "chmi-classic-navigation";
  const HEADER_BY_PAGE = {
    radar: "#chmi-radar-classic-brand",
    "home-radar": "#chmi-home-radar-classic-brand",
    meteosat: "#chmi-satellite-classic-brand",
    polar: "#chmi-satellite-classic-brand",
    geo: "#chmi-satellite-classic-brand",
    hub: "#chmi-hub-classic-brand"
  };

  const pages = [
    {
      key: "radar",
      label: "Radar produkt",
      shortLabel: "Radar",
      href: "https://produkty.chmi.cz/radar/"
    },
    {
      key: "home-radar",
      label: "Radar na úvodní stránce ČHMÚ",
      shortLabel: "Radar ČHMÚ",
      href: "https://www.chmi.cz/#chmi-classic-home-radar"
    },
    {
      key: "meteosat",
      label: "Meteosat / animovaný prohlížeč družic",
      shortLabel: "Meteosat",
      href: "https://produkty.chmi.cz/druzice/?time_range=24"
    },
    {
      key: "polar",
      label: "Polární družice",
      shortLabel: "Polární",
      href: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color"
    },
    {
      key: "geo",
      label: "Geostacionární družice",
      shortLabel: "Geo",
      href: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color"
    },
    {
      key: "hub",
      label: "Pravděpodobnost růstu hub",
      shortLabel: "Houby",
      href: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub"
    }
  ];

  function currentHref(item) {
    if (item.key !== pageKey) {
      return item.href;
    }

    if (pageKey === "home-radar") {
      const url = new URL(location.href);
      url.hash = "chmi-classic-home-radar";
      return url.href;
    }

    return location.href;
  }

  function buildNavigation() {
    const nav = document.createElement("nav");
    nav.className = NAV_CLASS;
    nav.setAttribute("aria-label", "ČHMÚ Classic – rychlá navigace");

    for (const item of pages) {
      const link = document.createElement("a");
      link.href = currentHref(item);
      link.textContent = item.shortLabel;
      link.title = item.label;
      link.dataset.chmiClassicPage = item.key;
      if (item.key === pageKey) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }

    return nav;
  }

  function ensureNavigation() {
    const header = document.querySelector(HEADER_BY_PAGE[pageKey]);
    if (!header || header.querySelector(`.${NAV_CLASS}`)) {
      return false;
    }

    const navigation = buildNavigation();
    const newLookButton = [...header.querySelectorAll("button")].find((button) =>
      /nový vzhled|současn.*vzhled/i.test(`${button.textContent} ${button.title}`)
    );
    header.insertBefore(navigation, newLookButton ?? null);
    return true;
  }

  let updateScheduled = false;
  function scheduleRefresh() {
    if (updateScheduled) {
      return;
    }
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      ensureNavigation();
    });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  ensureNavigation();
})();

(() => {
  "use strict";

  if (window.top !== window) {
    return;
  }

  const isRadarPage =
    location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/radar/");
  const isMushroomPage =
    location.hostname === "www.chmi.cz" &&
    location.pathname.replace(/\/+$/, "") === "/namerena-data/pravdepodobnost-rustu-hub";
  const isHomepage =
    location.hostname === "www.chmi.cz" && (location.pathname === "/" || location.pathname === "");

  if (!isRadarPage && !isMushroomPage && !isHomepage) {
    return;
  }

  if (isMushroomPage) {
    initMushroomClassic();
    return;
  }

  if (isHomepage) {
    initHomepageRadarClassic();
    return;
  }

  if (window.__chmiRadarClassicLoaded) {
    return;
  }

  window.__chmiRadarClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-radar-classic";
  const TOOLBAR_ID = "chmi-radar-classic-toolbar";
  const BRAND_ID = "chmi-radar-classic-brand";
  const HIDDEN_CLASS = "chmi-radar-classic-hidden";
  const APP_SECTION_CLASS = "chmi-radar-classic-app-section";
  const APP_ROW_CLASS = "chmi-radar-classic-app-row";
  const WEB_MAPS_CLASS = "chmi-radar-classic-web-maps";

  const classicLabels = {
    radio_display1: "Dle okna",
    radio_display2: "Zoom 4x",
    radio_display3: "Zoom 8x",
    radio_display4: "Web Maps"
  };

  let classicEnabled = true;
  let updateScheduled = false;
  let defaultDisplayApplied = false;
  let defaultPlaybackApplied = false;
  let layoutResizeObserver = null;
  let observedLayoutElement = null;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function savePreference(enabled) {
    if (storage) {
      storage.set({ [STORAGE_KEY]: enabled });
    }
    setClassicMode(enabled);
  }

  function markNonApplicationSections() {
    const mainWrapper = document.querySelector(".mainWrapper");
    if (!mainWrapper) {
      return false;
    }

    let changed = false;

    for (const section of mainWrapper.children) {
      if (
        section.id === "div_modal" ||
        section.querySelector("#div_container_data") ||
        section.querySelector("#div_fake_container_data")
      ) {
        continue;
      }

      const text = section.textContent.replace(/\s+/g, " ").trim();
      const isTitle = section.querySelector("h1")?.textContent.trim() === "Radar";
      const isDescription = text.startsWith("Aplikace určená k detailní analýze počasí");
      const isSpacer = text.length === 0;

      if ((isTitle || isDescription || isSpacer) && !section.classList.contains(HIDDEN_CLASS)) {
        section.classList.add(HIDDEN_CLASS);
        changed = true;
      }
    }

    return changed;
  }

  function findCommonAncestor(first, second, boundary) {
    if (!first || !second) {
      return null;
    }

    let current = first;
    while (current && current !== boundary?.parentElement) {
      if (current.contains(second)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function ensureResponsiveLayout() {
    const mainWrapper = document.querySelector(".mainWrapper");
    const dataContainer = document.getElementById("div_container_data");
    const menuContainer = document.getElementById("div_container_menu");

    if (!mainWrapper || !dataContainer || !menuContainer) {
      return false;
    }

    let changed = false;
    const appRow = findCommonAncestor(dataContainer, menuContainer, mainWrapper);
    if (appRow && appRow !== mainWrapper && !appRow.classList.contains(APP_ROW_CLASS)) {
      appRow.classList.add(APP_ROW_CLASS);
      changed = true;
    }

    const appSection = [...mainWrapper.children].find((child) => child.contains(dataContainer));
    if (appSection && !appSection.classList.contains(APP_SECTION_CLASS)) {
      appSection.classList.add(APP_SECTION_CLASS);
      changed = true;
    }

    const resizeTarget = appRow ?? dataContainer;
    if (globalThis.ResizeObserver && observedLayoutElement !== resizeTarget) {
      layoutResizeObserver?.disconnect();
      layoutResizeObserver = new ResizeObserver(() => notifyLayoutChanged());
      layoutResizeObserver.observe(resizeTarget);
      observedLayoutElement = resizeTarget;
    }

    return changed;
  }

  function updateRadarFitGeometry() {
    const dataContainer = document.getElementById("div_container_data");
    if (!dataContainer) {
      return;
    }

    const nativeControls = dataContainer.querySelector(
      ".leaflet-top.leaflet-left, .maplibregl-ctrl-top-left"
    );
    let toolbarLeft = 56;
    if (nativeControls) {
      const dataRect = dataContainer.getBoundingClientRect();
      const controlsRect = nativeControls.getBoundingClientRect();
      if (controlsRect.width > 0) {
        toolbarLeft = Math.max(56, Math.ceil(controlsRect.right - dataRect.left + 8));
      }
    }
    dataContainer.style.setProperty("--chmi-radar-toolbar-left", `${toolbarLeft}px`);
  }

  function describeControl(element) {
    if (!element) {
      return "";
    }

    const attributes = [
      element.id,
      element.className,
      element.getAttribute?.("name"),
      element.getAttribute?.("title"),
      element.getAttribute?.("aria-label"),
      element.getAttribute?.("alt"),
      element.getAttribute?.("value"),
      element.getAttribute?.("src")
    ];

    return `${attributes.filter(Boolean).join(" ")} ${element.innerHTML ?? ""}`.toLowerCase();
  }

  function findAnimationRange() {
    const ranges = [...document.querySelectorAll('input[type="range"]')];
    if (ranges.length === 0) {
      return null;
    }

    const scored = ranges.map((range) => {
      const max = Number(range.max);
      const min = Number(range.min);
      const step = Number(range.step || 1);
      const context = range.parentElement?.parentElement?.textContent?.toLowerCase() ?? "";
      let score = 0;

      if (Number.isFinite(max) && Number.isFinite(min) && max > min + 2) {
        score += 5;
      }
      if (Number.isFinite(step) && step >= 1) {
        score += 2;
      }
      if (!range.closest(".accordion-body")) {
        score += 5;
      }
      if (/měření|předp|snímk|anim/.test(context)) {
        score += 4;
      }
      if (/odraziv|blesk|opacity|průhled/.test(context)) {
        score -= 8;
      }

      return { range, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0 ? scored[0].range : null;
  }

  function findPlaybackToggle(range) {
    if (!range) {
      return null;
    }

    const knownToggle = document.getElementById("input_play_pause");
    if (knownToggle instanceof HTMLInputElement && knownToggle.type === "checkbox") {
      return knownToggle;
    }

    const scopes = [];
    let current = range.parentElement;
    for (let depth = 0; current && depth < 4; depth += 1, current = current.parentElement) {
      scopes.push(current);
    }

    for (const scope of scopes) {
      const controls = [...scope.querySelectorAll('button, input[type="button"], input[type="image"], input[type="checkbox"], [role="button"]')];
      const candidates = controls
        .map((control) => ({ control, description: describeControl(control) }))
        .filter(({ description }) => /play|pause|stop|anim|přehr|spust|zastav|pozastav|bi-play|bi-pause|fa-play|fa-pause/.test(description));

      if (candidates.length > 0) {
        return candidates[0].control;
      }
    }

    return null;
  }

  function stopOnLatestFrame() {
    const range = findAnimationRange();
    if (!range) {
      return false;
    }

    if (range.max !== "" && range.value !== range.max) {
      range.value = range.max;
      range.dispatchEvent(new Event("input", { bubbles: true }));
      range.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const toggle = findPlaybackToggle(range);
    if (toggle) {
      const description = describeControl(toggle);
      const appearsToBePlaying =
        toggle instanceof HTMLInputElement && toggle.type === "checkbox"
          ? toggle.checked
          : /pause|stop|zastav|pozastav|bi-pause|fa-pause/.test(description) ||
            toggle.getAttribute?.("aria-pressed") === "true";

      if (appearsToBePlaying) {
        toggle.click();
      }
    }

    return true;
  }

  function applyInitialRadarState() {
    if (!defaultDisplayApplied) {
      const webMaps = document.getElementById("radio_display4");
      if (!webMaps) {
        return;
      }

      if (!webMaps.checked) {
        webMaps.click();
        defaultDisplayApplied = true;
        setTimeout(() => {
          if (classicEnabled && !defaultPlaybackApplied) {
            defaultPlaybackApplied = stopOnLatestFrame();
          }
        }, 250);
        return;
      }

      defaultDisplayApplied = true;
    }

    if (!defaultPlaybackApplied) {
      defaultPlaybackApplied = stopOnLatestFrame();
    }
  }

  function ensureBrand() {
    if (document.getElementById(BRAND_ID)) {
      return false;
    }

    const mainWrapper = document.querySelector(".mainWrapper");
    if (!mainWrapper?.parentElement) {
      return false;
    }

    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <strong>ČHMÚ Radar</strong>
      <span>klasické rozhraní</span>
      <button type="button" title="Dočasně zobrazit původní vzhled stránky">Nový vzhled</button>
    `;

    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    mainWrapper.parentElement.insertBefore(brand, mainWrapper);
    return true;
  }

  function ensureDisplayToolbar() {
    const dataContainer = document.getElementById("div_container_data");
    const displayInputs = Object.keys(classicLabels).map((id) => document.getElementById(id));

    if (!dataContainer || displayInputs.some((input) => !input)) {
      return false;
    }

    let toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = TOOLBAR_ID;
      toolbar.setAttribute("aria-label", "Režim zobrazení mapy");
      toolbar.innerHTML = `
        <div class="chmi-radar-classic-options" role="radiogroup" aria-label="Režim zobrazení mapy">
          ${Object.entries(classicLabels).map(([inputId, label]) => `
            <button type="button" role="radio" data-input-id="${inputId}">${label}</button>
          `).join("")}
        </div>
      `;

      toolbar.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-input-id]");
        if (!button) {
          return;
        }

        document.getElementById(button.dataset.inputId)?.click();
        requestAnimationFrame(() => {
          syncDisplayToolbar();
          notifyLayoutChanged();
        });
      });

      dataContainer.prepend(toolbar);
      syncDisplayToolbar();
      updateRadarFitGeometry();
      return true;
    }

    syncDisplayToolbar();
    updateRadarFitGeometry();
    return false;
  }

  function syncDisplayToolbar() {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) {
      return;
    }

    toolbar.querySelectorAll("button[data-input-id]").forEach((button) => {
      const input = document.getElementById(button.dataset.inputId);
      const selected = Boolean(input?.checked);
      button.setAttribute("aria-checked", String(selected));
      button.classList.toggle("is-active", selected);
    });

    document.documentElement.classList.toggle(
      WEB_MAPS_CLASS,
      Boolean(document.getElementById("radio_display4")?.checked)
    );
  }

  function notifyLayoutChanged() {
    requestAnimationFrame(() => {
      updateRadarFitGeometry();
      window.dispatchEvent(new Event("resize"));
    });
  }

  function applyClassicMode() {
    const hadRootClass = document.documentElement.classList.contains(ROOT_CLASS);
    document.documentElement.classList.add(ROOT_CLASS);
    const sectionsChanged = markNonApplicationSections();
    const layoutChanged = ensureResponsiveLayout();
    const brandChanged = ensureBrand();
    const toolbarChanged = ensureDisplayToolbar();
    applyInitialRadarState();

    if (!hadRootClass || sectionsChanged || layoutChanged || brandChanged || toolbarChanged) {
      notifyLayoutChanged();
    }
  }

  function removeClassicMode() {
    document.getElementById(TOOLBAR_ID)?.remove();
    document.getElementById(BRAND_ID)?.remove();
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(HIDDEN_CLASS);
    });
    document.querySelectorAll(`.${APP_SECTION_CLASS}, .${APP_ROW_CLASS}`).forEach((element) => {
      element.classList.remove(APP_SECTION_CLASS, APP_ROW_CLASS);
    });
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = null;
    observedLayoutElement = null;
    document.getElementById("div_container_data")?.style.removeProperty("--chmi-radar-toolbar-left");
    document.documentElement.classList.remove(ROOT_CLASS);
    document.documentElement.classList.remove(WEB_MAPS_CLASS);
    notifyLayoutChanged();
  }

  function setClassicMode(enabled) {
    classicEnabled = Boolean(enabled);
    if (classicEnabled) {
      applyClassicMode();
    } else {
      removeClassicMode();
    }
  }

  function scheduleRefresh() {
    if (!classicEnabled || updateScheduled) {
      return;
    }

    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      applyClassicMode();
    });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "radio_display") {
      syncDisplayToolbar();
    }
  });

  window.addEventListener("resize", () => {
    if (classicEnabled) {
      requestAnimationFrame(updateRadarFitGeometry);
    }
  });

  if (storage) {
    storage.get({ [STORAGE_KEY]: true }, (result) => {
      setClassicMode(result[STORAGE_KEY]);
    });

    globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === "sync" && changes[STORAGE_KEY]) {
        setClassicMode(changes[STORAGE_KEY].newValue);
      }
    });
  } else {
    setClassicMode(true);
  }

  function initHomepageRadarClassic() {
    if (window.__chmiHomepageRadarClassicLoaded) {
      return;
    }
    window.__chmiHomepageRadarClassicLoaded = true;

    const storageKey = "chmiRadarClassicEnabled";
    const rootClass = "chmi-home-radar-classic-active";
    const sectionClass = "chmi-home-radar-classic";
    const brandId = "chmi-home-radar-classic-brand";
    const anchorId = "chmi-classic-home-radar";
    const mapHostClass = "chmi-home-radar-classic-map-host";
    const nativeTitleClass = "chmi-home-radar-classic-native-title";
    const nativeSubtitleClass = "chmi-home-radar-classic-native-subtitle";
    const appSectionClass = "chmi-home-radar-classic-app-section";
    const appRowClass = "chmi-home-radar-classic-app-row";
    const toolbarId = "chmi-home-radar-classic-toolbar";
    const displayLabels = {
      radio_display1: "Dle okna",
      radio_display2: "Zoom 4x",
      radio_display3: "Zoom 8x",
      radio_display4: "Web Maps"
    };
    const portalStorage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
    let enabled = true;
    let refreshScheduled = false;
    let geometryScheduled = false;
    let anchorScrolled = false;
    let homepageResizeObserver = null;
    let homepageObservedElement = null;

    function normalizeText(value) {
      return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function saveHomepagePreference(value) {
      if (portalStorage) {
        portalStorage.set({ [storageKey]: value });
      }
      setHomepageClassicMode(value);
    }

    function findRadarHeading() {
      return [...document.querySelectorAll("main h1, main h2, main h3, main h4")].find((heading) =>
        /^srážky podle radaru$/i.test(normalizeText(heading.textContent))
      ) ?? null;
    }

    function radarEvidenceScore(element, heading) {
      if (!element || !element.contains(heading)) {
        return Number.NEGATIVE_INFINITY;
      }

      const descriptor = `${element.id ?? ""} ${element.className ?? ""}`.toLowerCase();
      let score = 0;
      if (/radar/.test(descriptor)) {
        score += 8;
      }
      if (/lfr-layout-structure-item/.test(descriptor)) {
        score += 2;
      }
      if (element.querySelector("iframe, canvas, .leaflet-container, .maplibregl-map, .ol-viewport")) {
        score += 5;
      }
      if (element.querySelector('[id*="radar" i], [class*="radar" i], input[type="range"]')) {
        score += 4;
      }
      if ([...element.querySelectorAll("img")].some((image) =>
        /radar/i.test(`${image.alt ?? ""} ${image.src ?? ""}`)
      )) {
        score += 4;
      }

      const otherMajorHeadings = [...element.querySelectorAll("h1, h2")].filter(
        (candidate) => candidate !== heading && normalizeText(candidate.textContent).length > 0
      );
      score -= otherMajorHeadings.length * 6;
      return score;
    }

    function findHomepageRadarSection() {
      const heading = findRadarHeading();
      const main = document.querySelector("main");
      if (!heading || !main) {
        return null;
      }

      let best = null;
      let current = heading.parentElement;
      for (let depth = 0; current && current !== main && depth < 8; depth += 1) {
        const score = radarEvidenceScore(current, heading);
        if (!best || score > best.score) {
          best = { element: current, score };
        }
        current = current.parentElement;
      }

      if (best?.score >= 2) {
        return best.element;
      }

      return heading.closest("section, article, [class*='lfr-layout-structure-item']") ?? heading.parentElement;
    }

    function findHomepageRadarMapHost(section) {
      if (!section) {
        return null;
      }

      const direct = section.querySelector([
        "#chmu-map-container",
        "[id*='radar-map' i]",
        "[class*='radar-map' i]",
        ".leaflet-container",
        ".maplibregl-map",
        ".ol-viewport",
        "iframe[src*='radar' i]",
        "canvas"
      ].join(","));
      if (direct) {
        return direct.closest('[class*="radar" i]') ?? direct;
      }

      const radarImage = [...section.querySelectorAll("img")].find((image) =>
        /radar/i.test(`${image.alt ?? ""} ${image.src ?? ""}`)
      );
      if (radarImage) {
        return radarImage.closest("a, picture, figure, div") ?? radarImage;
      }

      return null;
    }

    function findHomepageAppLayout(section) {
      const dataContainer = section?.querySelector("#div_container_data") ?? null;
      const menuContainer = section?.querySelector("#div_container_menu") ?? null;
      if (!dataContainer || !menuContainer) {
        return { dataContainer, menuContainer, appRow: null, appSection: null };
      }

      let appRow = dataContainer;
      while (appRow && appRow !== section && !appRow.contains(menuContainer)) {
        appRow = appRow.parentElement;
      }
      if (!appRow || appRow === section) {
        appRow = dataContainer.parentElement;
      }

      const appSection = [...section.children].find((child) => child.contains(dataContainer)) ?? appRow;
      return { dataContainer, menuContainer, appRow, appSection };
    }

    function syncHomepageDisplayToolbar() {
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        return;
      }
      toolbar.querySelectorAll("button[data-input-id]").forEach((button) => {
        const input = document.getElementById(button.dataset.inputId);
        const selected = Boolean(input?.checked);
        button.setAttribute("aria-checked", String(selected));
      });
    }

    function ensureHomepageDisplayToolbar(section) {
      const { dataContainer } = findHomepageAppLayout(section);
      const inputs = Object.keys(displayLabels).map((id) => document.getElementById(id));
      if (!dataContainer || inputs.some((input) => !input)) {
        return false;
      }

      let toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = toolbarId;
        toolbar.setAttribute("aria-label", "Režim zobrazení mapy");
        toolbar.innerHTML = `
          <div class="chmi-radar-classic-options" role="radiogroup" aria-label="Režim zobrazení mapy">
            ${Object.entries(displayLabels).map(([inputId, label]) => `
              <button type="button" role="radio" data-input-id="${inputId}">${label}</button>
            `).join("")}
          </div>
        `;
        toolbar.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-input-id]");
          if (!button) {
            return;
          }
          document.getElementById(button.dataset.inputId)?.click();
          requestAnimationFrame(() => {
            syncHomepageDisplayToolbar();
            scheduleHomepageGeometry();
          });
        });
        dataContainer.prepend(toolbar);
        syncHomepageDisplayToolbar();
        return true;
      }

      syncHomepageDisplayToolbar();
      return false;
    }

    function updateHomepageGeometry(section) {
      if (!enabled || !section) {
        return;
      }

      const { dataContainer, appRow } = findHomepageAppLayout(section);
      const mapHost = findHomepageRadarMapHost(section);
      const fitTarget = appRow ?? mapHost;
      if (fitTarget) {
        const rect = fitTarget.getBoundingClientRect();
        const top = Math.max(0, rect.top);
        const available = Math.floor(window.innerHeight - top - 8);
        const fitHeight = Math.max(320, available);
        document.documentElement.style.setProperty("--chmi-home-radar-fit-height", `${fitHeight}px`);
      }

      if (dataContainer) {
        const nativeControls = dataContainer.querySelector(
          ".leaflet-top.leaflet-left, .maplibregl-ctrl-top-left"
        );
        let toolbarLeft = 56;
        if (nativeControls) {
          const dataRect = dataContainer.getBoundingClientRect();
          const controlsRect = nativeControls.getBoundingClientRect();
          if (controlsRect.width > 0) {
            toolbarLeft = Math.max(56, Math.ceil(controlsRect.right - dataRect.left + 8));
          }
        }
        dataContainer.style.setProperty("--chmi-home-radar-toolbar-left", `${toolbarLeft}px`);
      }

      const observeTarget = appRow ?? mapHost ?? section;
      if (globalThis.ResizeObserver && homepageObservedElement !== observeTarget) {
        homepageResizeObserver?.disconnect();
        homepageResizeObserver = new ResizeObserver(() => scheduleHomepageGeometry());
        homepageResizeObserver.observe(observeTarget);
        homepageObservedElement = observeTarget;
      }
    }

    function scheduleHomepageGeometry() {
      if (!enabled || geometryScheduled) {
        return;
      }
      geometryScheduled = true;
      requestAnimationFrame(() => {
        geometryScheduled = false;
        const section = findHomepageRadarSection();
        updateHomepageGeometry(section);
        window.dispatchEvent(new Event("resize"));
      });
    }

    function markHomepageRadarSection() {
      const section = findHomepageRadarSection();
      if (!section) {
        return { section: null, changed: false };
      }

      let changed = false;
      if (!section.classList.contains(sectionClass)) {
        section.classList.add(sectionClass);
        changed = true;
      }

      const heading = findRadarHeading();
      if (heading && section.contains(heading) && !heading.classList.contains(nativeTitleClass)) {
        heading.classList.add(nativeTitleClass);
        changed = true;
      }

      const subtitle = heading?.nextElementSibling;
      if (
        subtitle &&
        section.contains(subtitle) &&
        /^aktuální odhad srážek z meteorologického radaru/i.test(normalizeText(subtitle.textContent)) &&
        !subtitle.classList.contains(nativeSubtitleClass)
      ) {
        subtitle.classList.add(nativeSubtitleClass);
        changed = true;
      }

      const { appRow, appSection } = findHomepageAppLayout(section);
      if (appRow && !appRow.classList.contains(appRowClass)) {
        appRow.classList.add(appRowClass);
        changed = true;
      }
      if (appSection && !appSection.classList.contains(appSectionClass)) {
        appSection.classList.add(appSectionClass);
        changed = true;
      }

      const mapHost = findHomepageRadarMapHost(section);
      if (mapHost && !mapHost.classList.contains(mapHostClass)) {
        mapHost.classList.add(mapHostClass);
        changed = true;
      }

      return { section, changed };
    }

    function ensureHomepageBrand(section) {
      if (!section) {
        return false;
      }
      if (document.getElementById(brandId)) {
        return false;
      }

      const brand = document.createElement("div");
      brand.id = brandId;
      brand.innerHTML = `
        <strong>ČHMÚ Radar</strong>
        <span>úvodní stránka · klasické rozhraní</span>
        <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
      `;
      brand.querySelector("button").addEventListener("click", () => saveHomepagePreference(false));
      section.insertBefore(brand, section.firstChild);

      const anchor = document.createElement("span");
      anchor.id = anchorId;
      anchor.className = "chmi-home-radar-classic-anchor";
      brand.insertAdjacentElement("beforebegin", anchor);
      return true;
    }

    function notifyHomepageLayoutChanged() {
      requestAnimationFrame(() => {
        updateHomepageGeometry(findHomepageRadarSection());
        window.dispatchEvent(new Event("resize"));
      });
    }

    function scrollToHomepageRadarIfRequested(section) {
      if (anchorScrolled || !section || location.hash !== `#${anchorId}`) {
        return;
      }
      anchorScrolled = true;
      requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
    }

    function applyHomepageClassicMode() {
      const { section, changed: sectionChanged } = markHomepageRadarSection();
      if (!section) {
        return;
      }

      const hadRootClass = document.documentElement.classList.contains(rootClass);
      document.documentElement.classList.add(rootClass);
      const brandChanged = ensureHomepageBrand(section);
      const toolbarChanged = ensureHomepageDisplayToolbar(section);
      scrollToHomepageRadarIfRequested(section);
      updateHomepageGeometry(section);

      if (!hadRootClass || sectionChanged || brandChanged || toolbarChanged) {
        notifyHomepageLayoutChanged();
      }
    }

    function removeHomepageClassicMode() {
      document.getElementById(brandId)?.remove();
      document.getElementById(anchorId)?.remove();
      document.getElementById(toolbarId)?.remove();
      document.querySelectorAll(`.${sectionClass}`).forEach((element) => {
        element.classList.remove(sectionClass);
      });
      document.querySelectorAll(`.${mapHostClass}`).forEach((element) => {
        element.classList.remove(mapHostClass);
      });
      document.querySelectorAll(`.${nativeTitleClass}`).forEach((element) => {
        element.classList.remove(nativeTitleClass);
      });
      document.querySelectorAll(`.${nativeSubtitleClass}`).forEach((element) => {
        element.classList.remove(nativeSubtitleClass);
      });
      document.querySelectorAll(`.${appRowClass}, .${appSectionClass}`).forEach((element) => {
        element.classList.remove(appRowClass, appSectionClass);
      });
      homepageResizeObserver?.disconnect();
      homepageResizeObserver = null;
      homepageObservedElement = null;
      document.documentElement.style.removeProperty("--chmi-home-radar-fit-height");
      document.querySelector("#div_container_data")?.style.removeProperty("--chmi-home-radar-toolbar-left");
      document.documentElement.classList.remove(rootClass);
      notifyHomepageLayoutChanged();
    }

    function setHomepageClassicMode(value) {
      enabled = Boolean(value);
      if (enabled) {
        applyHomepageClassicMode();
      } else {
        removeHomepageClassicMode();
      }
    }

    function scheduleHomepageRefresh() {
      if (!enabled || refreshScheduled) {
        return;
      }
      refreshScheduled = true;
      requestAnimationFrame(() => {
        refreshScheduled = false;
        applyHomepageClassicMode();
      });
    }

    document.addEventListener("change", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.name === "radio_display") {
        syncHomepageDisplayToolbar();
        scheduleHomepageGeometry();
      }
    });
    window.addEventListener("resize", () => {
      if (enabled) {
        requestAnimationFrame(() => updateHomepageGeometry(findHomepageRadarSection()));
      }
    });
    window.addEventListener("scroll", scheduleHomepageGeometry, { passive: true });

    const homepageObserver = new MutationObserver(scheduleHomepageRefresh);
    homepageObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (portalStorage) {
      portalStorage.get({ [storageKey]: true }, (result) => {
        setHomepageClassicMode(result[storageKey]);
      });
      globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName === "sync" && changes[storageKey]) {
          setHomepageClassicMode(changes[storageKey].newValue);
        }
      });
    } else {
      setHomepageClassicMode(true);
    }
  }

  function initMushroomClassic() {
    if (window.__chmiMushroomClassicLoaded) {
      return;
    }
    window.__chmiMushroomClassicLoaded = true;

    const storageKey = "chmiRadarClassicEnabled";
    const rootClass = "chmi-hub-classic";
    const brandId = "chmi-hub-classic-brand";
    const mapHostClass = "chmi-hub-classic-map-host";
    const mapSectionClass = "chmi-hub-classic-map-section";
    const portalStorage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
    let enabled = true;
    let refreshScheduled = false;
    let geometryScheduled = false;
    let mushroomResizeObserver = null;
    let mushroomObservedElement = null;

    function saveMushroomPreference(value) {
      if (portalStorage) {
        portalStorage.set({ [storageKey]: value });
      }
      setMushroomClassicMode(value);
    }

    function ensureMushroomBrand() {
      if (document.getElementById(brandId)) {
        return false;
      }

      const main = document.querySelector("main");
      if (!main) {
        return false;
      }

      const brand = document.createElement("div");
      brand.id = brandId;
      brand.innerHTML = `
        <strong>ČHMÚ – pravděpodobnost růstu hub</strong>
        <span>klasické rozhraní</span>
        <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
      `;
      brand.querySelector("button").addEventListener("click", () => saveMushroomPreference(false));
      main.insertBefore(brand, main.firstChild);
      return true;
    }

    function findMushroomMap() {
      const main = document.querySelector("main");
      if (!main) {
        return null;
      }

      return main.querySelector([
        "#chmu-map-container",
        "[id$='map-container']",
        "[class*='map-container']",
        ".leaflet-container",
        ".maplibregl-map",
        ".ol-viewport",
        "iframe[src*='bio']",
        "iframe[src*='map']",
        "chmu-map",
        "chmi-map"
      ].join(","));
    }

    function markMushroomMap() {
      const map = findMushroomMap();
      if (!map) {
        return false;
      }

      let changed = false;
      const preferredHost = map.closest(
        "#chmu-map-container, [id$='map-container'], [class*='map-container']"
      );
      const host = preferredHost ?? map;
      if (!host.classList.contains(mapHostClass)) {
        host.classList.add(mapHostClass);
        changed = true;
      }

      const mapSection = host.closest('[class*="lfr-layout-structure-item-chmimapcomponent"]');
      if (mapSection && !mapSection.classList.contains(mapSectionClass)) {
        mapSection.classList.add(mapSectionClass);
        changed = true;
      }

      return changed;
    }

    function updateMushroomGeometry() {
      if (!enabled) {
        return;
      }
      const map = findMushroomMap();
      if (!map) {
        return;
      }
      const host = map.closest(
        "#chmu-map-container, [id$='map-container'], [class*='map-container']"
      ) ?? map;
      const rect = host.getBoundingClientRect();
      const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 8);
      document.documentElement.style.setProperty(
        "--chmi-hub-fit-height",
        `${Math.max(320, available)}px`
      );

      if (globalThis.ResizeObserver && mushroomObservedElement !== host) {
        mushroomResizeObserver?.disconnect();
        mushroomResizeObserver = new ResizeObserver(() => scheduleMushroomGeometry());
        mushroomResizeObserver.observe(host);
        mushroomObservedElement = host;
      }
    }

    function scheduleMushroomGeometry() {
      if (!enabled || geometryScheduled) {
        return;
      }
      geometryScheduled = true;
      requestAnimationFrame(() => {
        geometryScheduled = false;
        updateMushroomGeometry();
        window.dispatchEvent(new Event("resize"));
      });
    }

    function notifyMushroomLayoutChanged() {
      requestAnimationFrame(() => {
        updateMushroomGeometry();
        window.dispatchEvent(new Event("resize"));
      });
    }

    function applyMushroomClassicMode() {
      const hadRootClass = document.documentElement.classList.contains(rootClass);
      document.documentElement.classList.add(rootClass);
      const brandChanged = ensureMushroomBrand();
      const mapChanged = markMushroomMap();
      updateMushroomGeometry();

      if (!hadRootClass || brandChanged || mapChanged) {
        notifyMushroomLayoutChanged();
      }
    }

    function removeMushroomClassicMode() {
      document.getElementById(brandId)?.remove();
      document.querySelectorAll(`.${mapHostClass}`).forEach((element) => {
        element.classList.remove(mapHostClass);
      });
      document.querySelectorAll(`.${mapSectionClass}`).forEach((element) => {
        element.classList.remove(mapSectionClass);
      });
      mushroomResizeObserver?.disconnect();
      mushroomResizeObserver = null;
      mushroomObservedElement = null;
      document.documentElement.style.removeProperty("--chmi-hub-fit-height");
      document.documentElement.classList.remove(rootClass);
      notifyMushroomLayoutChanged();
    }

    function setMushroomClassicMode(value) {
      enabled = Boolean(value);
      if (enabled) {
        applyMushroomClassicMode();
      } else {
        removeMushroomClassicMode();
      }
    }

    function scheduleMushroomRefresh() {
      if (!enabled || refreshScheduled) {
        return;
      }
      refreshScheduled = true;
      requestAnimationFrame(() => {
        refreshScheduled = false;
        applyMushroomClassicMode();
      });
    }

    window.addEventListener("resize", () => {
      if (enabled) {
        requestAnimationFrame(updateMushroomGeometry);
      }
    });
    window.addEventListener("scroll", scheduleMushroomGeometry, { passive: true });

    const mushroomObserver = new MutationObserver(scheduleMushroomRefresh);
    mushroomObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (portalStorage) {
      portalStorage.get({ [storageKey]: true }, (result) => {
        setMushroomClassicMode(result[storageKey]);
      });
      globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName === "sync" && changes[storageKey]) {
          setMushroomClassicMode(changes[storageKey].newValue);
        }
      });
    } else {
      setMushroomClassicMode(true);
    }
  }
})();

(() => {
  "use strict";

  if (window.top !== window || window.__chmiSatelliteClassicLoaded) {
    return;
  }

  const isLiveViewer =
    location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/druzice/");
  const isPolarPortal =
    location.hostname === "www.chmi.cz" && location.pathname.includes("/polarni-druzice/");
  const isGeoPortal =
    location.hostname === "www.chmi.cz" && location.pathname.includes("/geostacionarni-druzice/");

  if (!isLiveViewer && !isPolarPortal && !isGeoPortal) {
    return;
  }

  window.__chmiSatelliteClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-satellite-classic";
  const BRAND_ID = "chmi-satellite-classic-brand";
  const SELECTOR_ID = "chmi-satellite-classic-selector";
  const PLAYER_ID = "chmi-satellite-classic-player";
  const PORTAL_PRODUCTS_ID = "chmi-satellite-classic-portal-products";

  const products = {
    mtg: [
      ["ir_105", "IR"],
      ["ir_bt_sandwich_night_ir_bt", "IR BT"],
      ["vis_ir", "VIS-IR"],
      ["true_color", "True Color"],
      ["airmass", "Airmass"],
      ["24h_microphysics", "24h-M"],
      ["cloud_type_chmi", "Cloud Type"]
    ],
    msg: [
      ["ir108", "IR"],
      ["ir108BT", "IR BT"],
      ["vis-ir", "VIS-IR"],
      ["airmass", "Airmass"],
      ["24M", "24h-M"]
    ]
  };

  const projections = [
    ["eu", "EU"],
    ["ce", "CE"],
    ["cz", "CZ"]
  ];

  const portalProducts = {
    polar: [
      ["sandwich-ir-bt", "Sandwich IR BT"],
      ["true-color", "True Color"],
      ["vis-ir", "VIS-IR"],
      ["24h-m", "24h-M"],
      ["cloud-type", "Cloud Type"],
      ["night-overview", "Night Overview"]
    ],
    geo: [
      ["sandwich-ir-bt", "Sandwich IR BT"],
      ["ir", "IR"],
      ["true-color", "True Color"],
      ["vis-ir", "VIS-IR"],
      ["airmass", "Airmass"],
      ["24h-m", "24h-M"],
      ["cloud-type", "Cloud Type"]
    ]
  };

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  let classicEnabled = true;
  let updateScheduled = false;
  let resizeDispatchScheduled = false;
  let layoutResizeObserver = null;
  let observedLayoutElement = null;

  function savePreference(enabled) {
    if (storage) {
      storage.set({ [STORAGE_KEY]: enabled });
    }
    setClassicMode(enabled);
  }

  function dispatchLayoutResize() {
    if (resizeDispatchScheduled) {
      return;
    }
    resizeDispatchScheduled = true;
    requestAnimationFrame(() => {
      resizeDispatchScheduled = false;
      window.dispatchEvent(new Event("resize"));
    });
  }

  function observeLayout(element) {
    if (!globalThis.ResizeObserver || !element || observedLayoutElement === element) {
      return;
    }
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = new ResizeObserver(() => dispatchLayoutResize());
    layoutResizeObserver.observe(element);
    observedLayoutElement = element;
  }

  function updateLiveFitGeometry() {
    const mainRow = document.getElementById("main-row");
    if (!mainRow) {
      return;
    }
    observeLayout(mainRow);
  }

  function updatePortalFitGeometry() {
    const map = document.getElementById("chmu-map-container");
    if (!map) {
      return;
    }
    const rect = map.getBoundingClientRect();
    const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 8);
    document.documentElement.style.setProperty(
      "--chmi-satellite-portal-fit-height",
      `${Math.max(320, available)}px`
    );
    observeLayout(map);
  }

  function updateFitGeometry() {
    if (!classicEnabled) {
      return;
    }
    if (isLiveViewer) {
      updateLiveFitGeometry();
    } else {
      updatePortalFitGeometry();
    }
  }

  function createBrand(title) {
    if (document.getElementById(BRAND_ID)) {
      return false;
    }

    const host = isLiveViewer
      ? document.querySelector(".mainWrapper")?.parentElement
      : document.querySelector("main");
    const before = isLiveViewer ? document.querySelector(".mainWrapper") : host?.firstChild;

    if (!host) {
      return false;
    }

    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <strong>${title}</strong>
      <span>klasické rozhraní</span>
      <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
    `;
    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    host.insertBefore(brand, before || null);
    return true;
  }

  function triggerChange(element) {
    element?.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setViewerSelection({ satellite, projection, product }) {
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");
    const autoLoad = document.getElementById("check-auto-load");
    const shouldLoad = autoLoad?.checked !== false;

    if (autoLoad) {
      autoLoad.checked = false;
    }

    if (satellite && satelliteSelect?.value !== satellite) {
      satelliteSelect.value = satellite;
      triggerChange(satelliteSelect);
    }

    if (projection && projectionSelect?.value !== projection) {
      projectionSelect.value = projection;
      triggerChange(projectionSelect);
    }

    setTimeout(() => {
      if (product && productSelect?.querySelector(`option[value="${CSS.escape(product)}"]`)) {
        productSelect.value = product;
        triggerChange(productSelect);
      }

      if (autoLoad) {
        autoLoad.checked = shouldLoad;
      }

      if (shouldLoad) {
        document.getElementById("btn-load-data")?.click();
      }

      renderProductMatrix();
    }, 0);
  }

  function markNativeChoiceSections() {
    ["select-satellite", "select-projection", "select-product"].forEach((id) => {
      document.getElementById(id)?.closest(".settings-section")?.classList.add(
        "chmi-satellite-classic-native-choice"
      );
    });
  }

  function ensureProductSelector() {
    const settingsBody = document.querySelector("#settingsMenu .offcanvas-body");
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");

    if (!settingsBody || !satelliteSelect || !projectionSelect || !productSelect) {
      return false;
    }

    markNativeChoiceSections();

    let selector = document.getElementById(SELECTOR_ID);
    if (!selector) {
      selector = document.createElement("section");
      selector.id = SELECTOR_ID;
      selector.setAttribute("aria-label", "Klasický výběr družicového produktu");
      selector.innerHTML = `
        <div class="chmi-satellite-classic-satellite-row">
          <label for="chmi-satellite-classic-satellite">Družice:</label>
          <select id="chmi-satellite-classic-satellite"></select>
        </div>
        <strong>Vyber produkt:</strong>
        <div class="chmi-satellite-classic-product-matrix"></div>
        <div class="chmi-satellite-classic-selection" aria-live="polite"></div>
      `;

      const mirrorSatellite = selector.querySelector("select");
      mirrorSatellite.addEventListener("change", () => {
        setViewerSelection({
          satellite: mirrorSatellite.value,
          projection: projectionSelect.value
        });
      });

      selector.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-product][data-projection]");
        if (!button) {
          return;
        }
        setViewerSelection({
          satellite: satelliteSelect.value,
          projection: button.dataset.projection,
          product: button.dataset.product
        });
      });

      settingsBody.prepend(selector);
      renderProductMatrix();
      return true;
    }

    renderProductMatrix();
    return false;
  }

  function renderProductMatrix() {
    const selector = document.getElementById(SELECTOR_ID);
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");

    if (!selector || !satelliteSelect || !projectionSelect || !productSelect) {
      return;
    }

    const satellite = satelliteSelect.value in products ? satelliteSelect.value : "mtg";
    const mirrorSatellite = selector.querySelector("select");
    const satelliteSignature = Array.from(satelliteSelect.options)
      .map((option) => `${option.value}:${option.textContent.trim()}`)
      .join("|");

    if (mirrorSatellite.dataset.signature !== satelliteSignature) {
      mirrorSatellite.replaceChildren(
        ...Array.from(satelliteSelect.options).map((option) => {
          const clone = document.createElement("option");
          clone.value = option.value;
          clone.textContent = option.textContent.trim();
          return clone;
        })
      );
      mirrorSatellite.dataset.signature = satelliteSignature;
    }
    mirrorSatellite.value = satellite;

    const matrix = selector.querySelector(".chmi-satellite-classic-product-matrix");
    const signature = `${satellite}:${products[satellite].map(([value]) => value).join(",")}`;
    if (matrix.dataset.signature !== signature) {
      matrix.innerHTML = products[satellite]
        .map(([value, label]) => `
          <div class="chmi-satellite-classic-product-row">
            <span>${label}:</span>
            ${projections.map(([projectionValue, projectionLabel]) => `
              <button type="button" data-product="${value}" data-projection="${projectionValue}">${projectionLabel}</button>
            `).join("")}
          </div>
        `)
        .join("");
      matrix.dataset.signature = signature;
    }

    matrix.querySelectorAll("button[data-product][data-projection]").forEach((button) => {
      const selected =
        button.dataset.product === productSelect.value &&
        button.dataset.projection === projectionSelect.value;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    const selectedProduct = productSelect.selectedOptions[0]?.textContent.trim() || "—";
    const selectedProjection = projectionSelect.selectedOptions[0]?.textContent.trim() || "—";
    selector.querySelector(".chmi-satellite-classic-selection").textContent =
      `Aktuální nastavení: ${satelliteSelect.value.toUpperCase()} / ${selectedProduct} / ${selectedProjection}`;
  }

  function setSliderPosition(position) {
    const slider = document.getElementById("timeline-slider");
    if (!slider || slider.disabled) {
      return;
    }
    slider.value = position === "first" ? slider.min : slider.max;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function ensurePlayer() {
    const map = document.getElementById("map-container");
    const nativeSpeed = document.getElementById("select-speed");
    if (!map || !nativeSpeed) {
      return false;
    }

    let player = document.getElementById(PLAYER_ID);
    if (!player) {
      player = document.createElement("div");
      player.id = PLAYER_ID;
      player.setAttribute("aria-label", "Klasické ovládání animace");
      player.innerHTML = `
        <div class="chmi-satellite-classic-player-buttons" role="group" aria-label="Posun snímků">
          <button type="button" data-action="first" title="První snímek">|&lt;</button>
          <button type="button" data-action="prev" title="Předchozí snímek">&lt;</button>
          <button type="button" data-action="pause" title="Pozastavit animaci">| |</button>
          <button type="button" data-action="play" title="Spustit animaci">&gt;&gt;</button>
          <button type="button" data-action="next" title="Následující snímek">&gt;</button>
          <button type="button" data-action="last" title="Poslední snímek">&gt;|</button>
        </div>
        <label>Animace: <select data-role="speed"></select></label>
        <label>Aktualizuj každých:
          <select data-role="refresh">
            <option value="off">Neaktualizuj</option>
            <option value="1">1 min</option>
            <option value="10">10 min</option>
            <option value="20">20 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </label>
        <button type="button" data-action="refresh">Aktualizuj nyní</button>
        <span data-role="loaded">Nahráno: 0/0</span>
        <span data-role="time">--.--.---- --:--</span>
      `;

      player.addEventListener("click", (event) => {
        const action = event.target.closest("button[data-action]")?.dataset.action;
        const actionMap = {
          prev: "btn-prev",
          pause: "btn-pause",
          play: "btn-play",
          next: "btn-next",
          refresh: "btn-load-data"
        };

        if (action === "first" || action === "last") {
          setSliderPosition(action);
        } else if (actionMap[action]) {
          document.getElementById(actionMap[action])?.click();
        }
        syncPlayer();
      });

      player.querySelector('[data-role="speed"]').addEventListener("change", (event) => {
        nativeSpeed.value = event.target.value;
        triggerChange(nativeSpeed);
        syncPlayer();
      });

      player.querySelector('[data-role="refresh"]').addEventListener("change", (event) => {
        const autoRefresh = document.getElementById("check-auto-refresh");
        const refreshInterval = document.getElementById("select-refresh-interval");
        if (!autoRefresh || !refreshInterval) {
          return;
        }

        if (event.target.value === "off") {
          autoRefresh.checked = false;
          triggerChange(autoRefresh);
        } else {
          refreshInterval.value = event.target.value;
          triggerChange(refreshInterval);
          autoRefresh.checked = true;
          triggerChange(autoRefresh);
        }
        syncPlayer();
      });

      map.insertAdjacentElement("afterend", player);
      syncPlayer();
      return true;
    }

    syncPlayer();
    return false;
  }

  function syncPlayer() {
    const player = document.getElementById(PLAYER_ID);
    const slider = document.getElementById("timeline-slider");
    const nativeSpeed = document.getElementById("select-speed");
    if (!player || !slider || !nativeSpeed) {
      return;
    }

    const speed = player.querySelector('[data-role="speed"]');
    const speedSignature = Array.from(nativeSpeed.options)
      .map((option) => `${option.value}:${option.textContent.trim()}`)
      .join("|");
    if (speed.dataset.signature !== speedSignature) {
      speed.replaceChildren(...Array.from(nativeSpeed.options).map((option) => option.cloneNode(true)));
      speed.dataset.signature = speedSignature;
    }
    speed.value = nativeSpeed.value;
    speed.disabled = nativeSpeed.disabled;

    const max = Number.parseInt(slider.max, 10);
    const value = Number.parseInt(slider.value, 10);
    const count = slider.disabled || !Number.isFinite(max) ? 0 : max + 1;
    const current = count === 0 || !Number.isFinite(value) ? 0 : value + 1;
    player.querySelector('[data-role="loaded"]').textContent = `Nahráno: ${current}/${count}`;
    player.querySelector('[data-role="time"]').textContent =
      document.getElementById("current-time-display")?.textContent.trim() || "--.--.---- --:--";

    const autoRefresh = document.getElementById("check-auto-refresh");
    const refreshInterval = document.getElementById("select-refresh-interval");
    player.querySelector('[data-role="refresh"]').value =
      autoRefresh?.checked ? refreshInterval?.value || "10" : "off";

    const disabledMap = {
      first: slider.disabled,
      last: slider.disabled,
      prev: document.getElementById("btn-prev")?.disabled,
      pause: document.getElementById("btn-pause")?.disabled,
      play: document.getElementById("btn-play")?.disabled,
      next: document.getElementById("btn-next")?.disabled,
      refresh: document.getElementById("btn-load-data")?.disabled
    };
    player.querySelectorAll("button[data-action]").forEach((button) => {
      button.disabled = Boolean(disabledMap[button.dataset.action]);
    });
  }

  function ensurePortalProducts() {
    if (document.getElementById(PORTAL_PRODUCTS_ID)) {
      return false;
    }

    const map = document.getElementById("chmu-map-container");
    const mapSection = map?.closest('[class*="lfr-layout-structure-item-chmimapcomponent"]');
    if (!map || !mapSection?.parentElement) {
      return false;
    }

    const kind = isPolarPortal ? "polar" : "geo";
    const base = `/namerena-data/${kind === "polar" ? "polarni" : "geostacionarni"}-druzice/`;
    const activeSlug = location.pathname.split("/").filter(Boolean).at(-1);
    const nav = document.createElement("nav");
    nav.id = PORTAL_PRODUCTS_ID;
    nav.setAttribute("aria-label", "Výběr družicového produktu");
    nav.innerHTML = `
      <strong>Vyber produkt:</strong>
      <div>
        ${portalProducts[kind].map(([slug, label]) => `
          <a href="${base}${slug}"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>
        `).join("")}
      </div>
      ${kind === "geo" ? '<a class="chmi-satellite-classic-live-link" href="https://produkty.chmi.cz/druzice/?time_range=24">Otevřít animovaný prohlížeč</a>' : ""}
    `;
    mapSection.parentElement.insertBefore(nav, mapSection);
    return true;
  }

  function applyLiveViewer() {
    document.documentElement.classList.add(ROOT_CLASS, "chmi-satellite-classic-live");
    const brandChanged = createBrand("Aktuální data z družic MSG/MTG ČHMÚ");
    const selectorChanged = ensureProductSelector();
    const playerChanged = ensurePlayer();

    renderProductMatrix();
    syncPlayer();
    updateLiveFitGeometry();

    if (brandChanged || selectorChanged || playerChanged) {
      dispatchLayoutResize();
    }
  }

  function applyPortalViewer() {
    document.documentElement.classList.add(
      ROOT_CLASS,
      "chmi-satellite-classic-portal",
      isPolarPortal ? "chmi-satellite-classic-polar" : "chmi-satellite-classic-geo"
    );
    const title = isPolarPortal
      ? "Aktuální data z polárních družic ČHMÚ"
      : "Aktuální data z geostacionárních družic ČHMÚ";
    const changed = createBrand(title) || ensurePortalProducts();
    ensurePortalProducts();
    updatePortalFitGeometry();
    if (changed) {
      dispatchLayoutResize();
    }
  }

  function removeClassicMode() {
    [BRAND_ID, SELECTOR_ID, PLAYER_ID, PORTAL_PRODUCTS_ID].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    document.querySelectorAll(".chmi-satellite-classic-native-choice").forEach((element) => {
      element.classList.remove("chmi-satellite-classic-native-choice");
    });
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = null;
    observedLayoutElement = null;
    document.documentElement.style.removeProperty("--chmi-satellite-portal-fit-height");
    document.documentElement.classList.remove(
      ROOT_CLASS,
      "chmi-satellite-classic-live",
      "chmi-satellite-classic-portal",
      "chmi-satellite-classic-polar",
      "chmi-satellite-classic-geo"
    );
    dispatchLayoutResize();
  }

  function setClassicMode(enabled) {
    classicEnabled = Boolean(enabled);
    if (!classicEnabled) {
      removeClassicMode();
      return;
    }
    if (isLiveViewer) {
      applyLiveViewer();
    } else {
      applyPortalViewer();
    }
  }

  function scheduleRefresh() {
    if (!classicEnabled || updateScheduled) {
      return;
    }
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      if (isLiveViewer) {
        applyLiveViewer();
      } else {
        applyPortalViewer();
      }
    });
  }

  window.addEventListener("resize", () => {
    if (classicEnabled) {
      requestAnimationFrame(updateFitGeometry);
    }
  });
  if (!isLiveViewer) {
    window.addEventListener("scroll", () => {
      if (classicEnabled) {
        requestAnimationFrame(updatePortalFitGeometry);
      }
    }, { passive: true });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["checked", "disabled", "value"]
  });

  document.addEventListener("change", scheduleRefresh);
  document.addEventListener("input", (event) => {
    if (event.target?.id === "timeline-slider") {
      syncPlayer();
    }
  });

  if (storage) {
    storage.get({ [STORAGE_KEY]: true }, (result) => {
      setClassicMode(result[STORAGE_KEY]);
    });
    globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === "sync" && changes[STORAGE_KEY]) {
        setClassicMode(changes[STORAGE_KEY].newValue);
      }
    });
  } else {
    setClassicMode(true);
  }
})();

(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicCatalogLoaded) {
    return;
  }
  window.__chmiClassicCatalogLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-catalog-shell";
  const BRAND_ID = "chmi-catalog-classic-brand";
  const DIALOG_ID = "chmi-classic-catalog-dialog";
  const OVERLAY_ID = "chmi-classic-catalog-overlay";
  const BUTTON_CLASS = "chmi-classic-catalog-button";
  const ALADIN_PRESET_ID = "chmi-aladin-four-map-preset";
  const CATALOG_HASH = "#chmi-classic-products";
  let hashBeforeCatalog = "";

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  const corePaths = [
    ["https://produkty.chmi.cz/radar/", "Radar"],
    ["https://www.chmi.cz/#chmi-classic-home-radar", "Radar ČHMÚ"],
    ["https://produkty.chmi.cz/druzice/?time_range=24", "Meteosat"],
    ["https://www.chmi.cz/namerena-data/polarni-druzice/true-color", "Polární"],
    ["https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", "Geo"],
    ["https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", "Houby"]
  ];

  const groups = [
    {
      title: "ALADIN a meteogramy",
      items: [
        {
          label: "ALADIN – předpovědní mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Živý model ČHMÚ. Klasický rám přidává rychlou volbu 4 map: teplota, oblačnost, srážky za 3 h a vítr."
        },
        {
          label: "Meteogramy – obce",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "live",
          note: "Meteogramy ALADIN pro obce a konkrétní místa."
        },
        {
          label: "Meteogramy – letiště",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "Oficiální meteogramy ČHMÚ pro letiště."
        },
        {
          label: "Meteogramy – hory a lyžařská střediska",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/hory-a-lyzarska-strediska",
          status: "live",
          note: "Oficiální výběr horských lokalit."
        },
        {
          label: "Meteogramy – vodní plochy",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/vodni-plochy",
          status: "live",
          note: "Oficiální výběr vodních ploch."
        },
        {
          label: "Meteogram pro bod na mapě",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/meteogram-pro-bod-na-mape",
          status: "live",
          note: "Výběr bodu přímo z mapy."
        }
      ]
    },
    {
      title: "Webkamery a aktuální měření",
      items: [
        {
          label: "Webkamery ČR",
          href: "https://www.chmi.cz/namerena-data/webkamery",
          status: "live",
          note: "Rychlý přehled oficiálních kamer. Detail a doprovodná data zůstávají podle možností zdrojové stránky."
        },
        {
          label: "Aktuální teplota",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          status: "live",
          note: "Mapa a tabulka aktuálních měření stanic."
        },
        {
          label: "Denní teplotní mapy",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/maximalni-teplota",
          status: "live",
          note: "Oficiální staniční a interpolované mapy denních teplotních charakteristik; nativní stránka nabízí maximální, minimální a průměrné denní hodnoty."
        },
        {
          label: "Denní a aktuální srážky",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek",
          status: "live",
          note: "Srážkové mapy a tabulky ČHMÚ."
        },
        {
          label: "Aktuální srážkoměry HPPS",
          href: "https://hydro.chmi.cz/hpps/srz?lng=CZE",
          status: "live",
          note: "Hydrologická mapa a tabulka srážkoměrů."
        },
        {
          label: "Meteorologické stanice",
          href: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke",
          status: "live",
          note: "Přehled a rozmístění měřicích stanic."
        },
        {
          label: "Tlak vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tlak-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Vlhkost vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/vlhkost-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Tabulka větru",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru",
          status: "live",
          note: "Aktuální staniční údaje o větru."
        },
        {
          label: "Radar – srážky a blesky",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Aktuální radarová a blesková data; pokročilý prohlížeč zůstává na oficiálním backendu."
        },
        {
          label: "Otevřená data a exporty",
          href: "https://www.chmi.cz/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni",
          status: "live",
          note: "Oficiální rozcestník pro data, stažení a další zpracování."
        }
      ]
    },
    {
      title: "Synoptika",
      items: [
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy a textový popis situace."
        },
        {
          label: "Synoptické situace v minulosti",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticke-situace-v-minulosti",
          status: "live",
          note: "Historický přehled a klasifikace synoptických situací."
        },
        {
          label: "Počasí v Evropě – synoptické stanice",
          href: "https://www.chmi.cz/predpoved-pocasi/pocasi-evropa",
          status: "live",
          note: "Mapa staničních/synoptických hlášení pro Evropu."
        },
        {
          label: "Synoptické stanice / aktuální hlášení ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinově aktualizovaný přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "Výšková mapa větru FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Ověřená současná výšková mapa ČHMÚ; samostatná klasická výšková synoptická mapa nebyla při implementaci spolehlivě doložena."
        }
      ]
    },
    {
      title: "Letecká meteorologie",
      items: [
        {
          label: "Letecké počasí – rozcestník",
          href: "https://www.chmi.cz/letectvi",
          status: "live",
          note: "Oficiální vstup k METAR/SPECI, TAF, SIGMET, SWL a dalším produktům."
        },
        {
          label: "Základny / nízká oblačnost",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          status: "live",
          note: "Oficiální předpověď nízké oblačnosti."
        },
        {
          label: "Meteogramy letišť",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "ALADIN meteogramy pro letiště."
        },
        {
          label: "Aktuální počasí pro létání v ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinový přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "METAR / SPECI",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/zpravy-metar-speci",
          status: "live",
          note: "Aktuální letecká staniční hlášení v mapě a textu podle dostupnosti zdroje."
        },
        {
          label: "SIGMET a výstrahy pro letiště",
          href: "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste",
          status: "live",
          note: "Aktuální výstražné informace pro FIR Praha a letiště z oficiálního zdroje ČHMÚ."
        },
        {
          label: "TAF",
          href: "https://www.chmi.cz/letectvi/textove-predpovedi-pro-letani/predpovedi-taf",
          status: "live",
          note: "Aktuální letištní předpovědi ČHMÚ."
        },
        {
          label: "SWL mapa",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/swl-mapa",
          status: "live",
          note: "Mapa význačného počasí od země do FL100 včetně front, tlakových útvarů a nulové izotermy."
        },
        {
          label: "Výškový vítr 2000 ft",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-vysku-2000ft",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru."
        },
        {
          label: "Výškový vítr FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru. Další hladiny zůstávají dostupné v nativní navigaci ČHMÚ."
        },
        {
          label: "Radiosondážní měření",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni",
          status: "live",
          note: "Vertikální měření atmosféry; další aerologické produkty jsou dostupné v nativní navigaci."
        },
        {
          label: "Aerologie a pseudosondáže",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni",
          status: "live",
          note: "Rozcestník radiosond, windprofilerů, radarových profilů větru a pseudosondáží modelu ALADIN."
        },
        {
          label: "Družice VIS-IR",
          href: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/vis-ir",
          status: "live",
          note: "Aktuální geostacionární produkt VIS-IR."
        },
        {
          label: "Blesky a radar",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Radarový a bleskový přehled z oficiálního zdroje."
        },
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy jako doplněk pro letecké použití."
        },
        {
          label: "ALADIN mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Současná živá náhrada starého ALADIN mapového prohlížeče."
        }
      ]
    },
    {
      title: "Historická data, rekordy a zprávy",
      items: [
        {
          label: "Přechody front přes Prahu",
          href: "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu",
          status: "live",
          note: "Historická řada a související data ČHMÚ."
        },
        {
          label: "Klementinum – rekordy a data",
          href: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          status: "live",
          note: "Klementinská měření, rekordy a odkazy na otevřená data."
        },
        {
          label: "Historické mapy teploty vzduchu",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-teploty-vzduchu",
          status: "live",
          note: "Historické klimatologické mapy teplotních charakteristik; aktuální denní mapy jsou samostatně v části Naměřená data."
        },
        {
          label: "Historické mapy srážkových úhrnů",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-srazkovych-uhrnu",
          status: "live",
          note: "Historické klimatologické mapy srážkových úhrnů; aktuální denní mapa je samostatně v části Naměřená data."
        },
        {
          label: "Územní teplota a srážky",
          href: "https://www.chmi.cz/namerena-data/historicka-data/uzemni-teplota-a-srazky",
          status: "live",
          note: "Územní časové řady a souhrny."
        },
        {
          label: "Zprávy a datové přehledy – počasí, voda a ovzduší",
          href: "https://www.chmi.cz/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy/pocasi-voda-a-ovzdusi-v-cr",
          status: "live",
          note: "Oficiální zprávy a PDF, pokud je ČHMÚ u konkrétního výstupu publikuje."
        },
        {
          label: "Otevřená data ČHMÚ",
          href: "https://opendata.chmi.cz/",
          status: "live",
          note: "Oficiální datový server pro stažení a další zpracování."
        }
      ]
    },
    {
      title: "Archiv starých prohlížečů",
      items: [
        {
          label: "Starý radar INCA",
          href: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
          status: "archive",
          note: "Webový archiv vypnuté aplikace intranet.chmi.cz; nejde o živá data."
        },
        {
          label: "Starý Meteosat MSG",
          href: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
          status: "archive",
          note: "Webový archiv původního MSG prohlížeče; živou náhradou je Meteosat na produkty.chmi.cz."
        },
        {
          label: "Starý polární AVHRR",
          href: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
          status: "archive",
          note: "Webový archiv původního AVHRR prohlížeče; nejde o živá data."
        },
        {
          label: "Starý ALADIN – archivní index",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/aladin/*",
          status: "archive",
          note: "Vyhledání archivovaných URL původního ALADINu. Dostupnost konkrétních zachycených stránek se může lišit; živá náhrada je ALADIN na produkty.chmi.cz."
        }
      ]
    }
  ];

  const shellRoutes = [
    ["produkty.chmi.cz", "/aladin", "ALADIN – předpovědní mapy"],
    ["www.chmi.cz", "/predpoved-pocasi/meteogramy-aladin", "Meteogramy ALADIN"],
    ["www.chmi.cz", "/meteogram/", "Meteogram ALADIN"],
    ["www.chmi.cz", "/namerena-data/webkamery", "Webkamery ČHMÚ"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticka-situace", "Synoptická situace"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticke-situace-v-minulosti", "Synoptické situace v minulosti"],
    ["www.chmi.cz", "/predpoved-pocasi/pocasi-evropa", "Počasí v Evropě"],
    ["www.chmi.cz", "/predpoved-pocasi/prechody-front-pres-prahu", "Přechody front přes Prahu"],
    ["www.chmi.cz", "/namerena-data/data-z-mericich-stanic", "Naměřená data stanic"],
    ["www.chmi.cz", "/namerena-data/umisteni-mericich-stanic/meteorologicke", "Meteorologické stanice"],
    ["www.chmi.cz", "/namerena-data/radar-nowcast/srazky-a-blesky", "Srážky a blesky"],
    ["www.chmi.cz", "/namerena-data/historicka-data", "Historická data"],
    ["www.chmi.cz", "/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni", "Data a vyhodnocení"],
    ["www.chmi.cz", "/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy", "Zprávy a datové přehledy"],
    ["www.chmi.cz", "/letectvi", "Letecká meteorologie"],
    ["hydro.chmi.cz", "/hpps/srz", "Aktuální srážkoměry"]
  ];

  function normalizePath(pathname = location.pathname) {
    return pathname.replace(/\/+$/, "") || "/";
  }

  function isCorePage() {
    const path = normalizePath();
    if (location.hostname === "produkty.chmi.cz") {
      return path.startsWith("/radar") || path.startsWith("/druzice");
    }
    if (location.hostname !== "www.chmi.cz") {
      return false;
    }
    return (
      path === "/" ||
      path === "/namerena-data/pravdepodobnost-rustu-hub" ||
      path.includes("/polarni-druzice/") ||
      path.includes("/geostacionarni-druzice/")
    );
  }

  function shellRoute() {
    const path = normalizePath();
    return shellRoutes.find(([host, prefix]) => location.hostname === host && path.startsWith(prefix)) ?? null;
  }

  function pageIsSupported() {
    return isCorePage() || Boolean(shellRoute());
  }

  function getPreference(callback) {
    if (!storage) {
      callback(true);
      return;
    }
    storage.get({ [STORAGE_KEY]: true }, (result) => callback(result?.[STORAGE_KEY] !== false));
  }

  function setPreference(enabled) {
    storage?.set({ [STORAGE_KEY]: enabled });
  }

  function currentPageMatches(href) {
    try {
      const target = new URL(href);
      return target.hostname === location.hostname && normalizePath(target.pathname) === normalizePath();
    } catch {
      return false;
    }
  }

  function createCoreNavigation() {
    const nav = document.createElement("nav");
    nav.className = "chmi-classic-navigation chmi-catalog-core-navigation";
    nav.setAttribute("aria-label", "ČHMÚ Classic – hlavní aplikace");
    for (const [href, label] of corePaths) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (currentPageMatches(href)) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }
    return nav;
  }

  function addCatalogButton(host) {
    if (!host || host.querySelector(`.${BUTTON_CLASS}`)) {
      return false;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.textContent = "Produkty";
    button.title = "Všechny živé a archivní meteorologické výstupy ČHMÚ Classic";
    button.addEventListener("click", () => openCatalog());
    const newLookButton = [...host.querySelectorAll(":scope > button")].find((candidate) =>
      /nový vzhled|současn.*vzhled/i.test(`${candidate.textContent} ${candidate.title}`)
    );
    host.insertBefore(button, newLookButton ?? null);
    return true;
  }

  function ensureCatalogOnCoreHeader() {
    const header = document.querySelector(
      "#chmi-radar-classic-brand, #chmi-home-radar-classic-brand, #chmi-satellite-classic-brand, #chmi-hub-classic-brand"
    );
    return addCatalogButton(header);
  }

  function createShellBrand(title) {
    if (document.getElementById(BRAND_ID)) {
      return document.getElementById(BRAND_ID);
    }
    const host = document.querySelector("main") ?? document.body;
    if (!host) {
      return null;
    }
    const brand = document.createElement("div");
    brand.id = BRAND_ID;

    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    brand.append(titleNode);

    const subtitle = document.createElement("span");
    subtitle.textContent = "klasické rozhraní";
    brand.append(subtitle);

    brand.append(createCoreNavigation());

    const catalogButton = document.createElement("button");
    catalogButton.type = "button";
    catalogButton.className = BUTTON_CLASS;
    catalogButton.textContent = "Produkty";
    catalogButton.addEventListener("click", () => openCatalog());
    brand.append(catalogButton);

    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      const presetButton = document.createElement("button");
      presetButton.type = "button";
      presetButton.id = ALADIN_PRESET_ID;
      presetButton.textContent = "4 mapy";
      presetButton.title = "Vybrat teplotu, oblačnost, srážky za 3 h a vítr";
      presetButton.addEventListener("click", applyAladinFourMapPreset);
      brand.append(presetButton);
    }

    const newLookButton = document.createElement("button");
    newLookButton.type = "button";
    newLookButton.className = "chmi-catalog-new-look";
    newLookButton.textContent = "Nový vzhled";
    newLookButton.title = "Vypnout klasické rozhraní na podporovaných stránkách";
    newLookButton.addEventListener("click", () => {
      setPreference(false);
      location.reload();
    });
    brand.append(newLookButton);

    host.insertBefore(brand, host.firstChild);
    return brand;
  }

  function statusText(status) {
    if (status === "archive") {
      return "Archiv";
    }
    if (status === "external") {
      return "Externí";
    }
    return "Živě";
  }

  function buildCatalog() {
    if (document.getElementById(DIALOG_ID)) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeCatalog();
      }
    });

    const dialog = document.createElement("section");
    dialog.id = DIALOG_ID;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "chmi-classic-catalog-title");

    const header = document.createElement("header");
    const heading = document.createElement("h2");
    heading.id = "chmi-classic-catalog-title";
    heading.textContent = "ČHMÚ Classic – meteorologické výstupy";
    header.append(heading);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "chmi-catalog-close";
    closeButton.setAttribute("aria-label", "Zavřít katalog");
    closeButton.textContent = "Zavřít";
    closeButton.addEventListener("click", closeCatalog);
    header.append(closeButton);
    dialog.append(header);

    const intro = document.createElement("p");
    intro.className = "chmi-catalog-intro";
    intro.innerHTML = "<strong>Živě</strong> = současný oficiální zdroj ČHMÚ. <strong>Archiv</strong> = historická kopie bez živých dat. Přímé PNG/JPG/PDF odkazy se nevytvářejí, pokud je ČHMÚ na zdrojové stránce neposkytuje stabilně.";
    dialog.append(intro);

    const quick = document.createElement("div");
    quick.className = "chmi-catalog-quick";
    quick.append(createCoreNavigation());
    dialog.append(quick);

    const body = document.createElement("div");
    body.className = "chmi-catalog-groups";

    for (const group of groups) {
      const section = document.createElement("section");
      section.className = "chmi-catalog-group";
      const h3 = document.createElement("h3");
      h3.textContent = group.title;
      section.append(h3);

      const list = document.createElement("div");
      list.className = "chmi-catalog-list";
      for (const item of group.items) {
        const article = document.createElement("article");
        article.className = `chmi-catalog-item is-${item.status}`;

        const top = document.createElement("div");
        top.className = "chmi-catalog-item-top";
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        if (item.status === "archive") {
          link.target = "_blank";
          link.rel = "noreferrer";
        }
        if (currentPageMatches(item.href)) {
          link.setAttribute("aria-current", "page");
        }
        top.append(link);

        const badge = document.createElement("span");
        badge.className = `chmi-catalog-status is-${item.status}`;
        badge.textContent = statusText(item.status);
        top.append(badge);
        article.append(top);

        const note = document.createElement("p");
        note.textContent = item.note;
        article.append(note);
        list.append(article);
      }
      section.append(list);
      body.append(section);
    }
    dialog.append(body);
    overlay.append(dialog);
    document.body.append(overlay);
  }

  function openCatalog() {
    buildCatalog();
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = false;
    document.documentElement.classList.add("chmi-catalog-open");
    const closeButton = overlay.querySelector(".chmi-catalog-close");
    closeButton?.focus();
    if (location.hash !== CATALOG_HASH) {
      hashBeforeCatalog = location.hash;
      history.replaceState(null, "", `${location.pathname}${location.search}${CATALOG_HASH}`);
    }
  }

  function closeCatalog() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("chmi-catalog-open");
    if (location.hash === CATALOG_HASH) {
      history.replaceState(null, "", `${location.pathname}${location.search}${hashBeforeCatalog}`);
      hashBeforeCatalog = "";
    }
  }

  function associatedText(input) {
    const id = input.id;
    const forLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const closestLabel = input.closest("label");
    const text = forLabel?.textContent || closestLabel?.textContent || input.parentElement?.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function dispatchControlChange(input, checked) {
    if (input.checked === checked) {
      return false;
    }
    input.checked = checked;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function applyAladinFourMapPreset() {
    const controls = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
    const known = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i,
      /(?:nízká.*oblačnost|oblačnost.*nízká)/i,
      /(?:střední.*oblačnost|oblačnost.*střední)/i,
      /(?:vysoká.*oblačnost|oblačnost.*vysoká)/i,
      /relativní\s+vlhkost/i,
      /ventilační\s+index/i,
      /minimální\s+teplota/i,
      /maximální\s+teplota/i,
      /srážky\s+za\s+24\s*h/i
    ];
    const wanted = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i
    ];

    let matched = 0;
    for (const control of controls) {
      const text = associatedText(control);
      if (!known.some((pattern) => pattern.test(text))) {
        continue;
      }
      const shouldBeChecked = wanted.some((pattern) => pattern.test(text));
      dispatchControlChange(control, shouldBeChecked);
      if (shouldBeChecked) {
        matched += 1;
      }
    }

    const selectCandidates = [...document.querySelectorAll("select")];
    for (const select of selectCandidates) {
      const context = `${select.previousElementSibling?.textContent || ""} ${select.parentElement?.textContent || ""}`;
      if (!/rozložení|sloup/i.test(context)) {
        continue;
      }
      const option = [...select.options].find((candidate) =>
        /(^|\D)4(\D|$)|4\s*sloup|čtyř/i.test(`${candidate.textContent} ${candidate.value}`)
      );
      if (option && select.value !== option.value) {
        select.value = option.value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      break;
    }

    const button = document.getElementById(ALADIN_PRESET_ID);
    if (button) {
      button.dataset.chmiPresetMatched = String(matched);
      button.title = matched >= 4
        ? "Vybrány 4 klasické mapy z původních ovládacích prvků ČHMÚ."
        : `Nalezeno ${matched}/4 požadovaných ovládacích prvků; stránka ČHMÚ mohla změnit strukturu.`;
    }
  }

  let resizeScheduled = false;
  function updateShellGeometry() {
    if (!document.documentElement.classList.contains(ROOT_CLASS)) {
      return;
    }
    const main = document.querySelector("main");
    if (!main) {
      return;
    }
    const top = Math.max(0, main.getBoundingClientRect().top);
    document.documentElement.style.setProperty(
      "--chmi-catalog-available-height",
      `${Math.max(360, Math.floor(window.innerHeight - top - 10))}px`
    );
  }

  function scheduleGeometry() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      updateShellGeometry();
      window.dispatchEvent(new Event("chmi-classic-layout"));
    });
  }

  function enableShell(route) {
    document.documentElement.classList.add(ROOT_CLASS);
    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      document.documentElement.classList.add("chmi-catalog-aladin");
    }
    createShellBrand(route[2]);
    updateShellGeometry();
    window.addEventListener("resize", scheduleGeometry, { passive: true });
    if (globalThis.ResizeObserver) {
      const main = document.querySelector("main");
      if (main) {
        const observer = new ResizeObserver(scheduleGeometry);
        observer.observe(main);
      }
    }
  }

  function initialize(enabled) {
    if (!enabled || !pageIsSupported()) {
      return;
    }

    const route = shellRoute();
    if (route && !isCorePage()) {
      enableShell(route);
    }

    let scheduled = false;
    const refresh = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        ensureCatalogOnCoreHeader();
        if (route && !isCorePage()) {
          createShellBrand(route[2]);
        }
      });
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    refresh();

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !document.getElementById(OVERLAY_ID)?.hidden) {
        closeCatalog();
      }
    });

    if (location.hash === CATALOG_HASH) {
      openCatalog();
    }
  }

  getPreference(initialize);
})();
