// ==UserScript==
// @name         ČHMÚ Classic – meteorologické výstupy
// @namespace    https://github.com/
// @version      0.7.0-beta.22
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
      return path.startsWith("/hpps/srz") || path === "/hppsoldv/main_rain.php";
    }
    if (location.hostname === "intranet.chmi.cz" || location.hostname === "portal.chmi.cz") {
      return true;
    }
    if (location.hostname !== "www.chmi.cz" && location.hostname !== "chmi.cz") {
      return false;
    }
    const prefixes = [
      "/predpoved-pocasi/dnes",
      "/predpoved-pocasi/zitra",
      "/predpoved-pocasi/pozitri",
      "/voda/aktualni-stav-rek-povodnova-mapa",
      "/predpoved-pocasi/meteogramy-aladin",
      "/meteogram/",
      "/namerena-data/webkamery",
      "/namerena-data/webkamera/",
      "/predpoved-pocasi/synopticka-situace",
      "/predpoved-pocasi/rizika/aktivita-klistat",
      "/predpoved-pocasi/bio-predpoved",
      "/predpoved-pocasi/tyden",
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
    return path === "/" || path === "/uvod" || prefixes.some((prefix) => path.startsWith(prefix)) ||
      /^\/predpoved-pocasi\/(?:[a-z-]+-kraj|praha|kraj-vysocina)\/(?:dnes|zitra|pozitri|dalsi-dny)$/.test(path);
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

  GM_addStyle("/* Keep the complete native scale inside the map, independently of map zoom.\n   Native inline pixel sizes otherwise push the lowest values below the viewport. */\nhtml.chmi-radar-classic #div_scl {\n  top: auto !important;\n  bottom: 22px !important;\n  left: 6px !important;\n  width: auto !important;\n  height: min(55%, 440px) !important;\n  max-height: calc(100% - 160px) !important;\n  z-index: 450;\n  pointer-events: none;\n}\nhtml.chmi-radar-classic #div_scl #img_scl {\n  display: block !important;\n  width: auto !important;\n  height: 100% !important;\n  max-height: 100% !important;\n  max-width: 100% !important;\n  object-fit: contain;\n}\n\nhtml.chmi-radar-classic,\nhtml.chmi-radar-classic body#mbody {\n  width: 100%;\n  height: 100%;\n  min-height: 100vh;\n  background: #8bc6da !important;\n  color: #555 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-radar-classic #content,\nhtml.chmi-radar-classic #wrapper > nav,\nhtml.chmi-radar-classic #footer,\nhtml.chmi-radar-classic #footerBottom,\nhtml.chmi-radar-classic .material-scrolltop,\nhtml.chmi-radar-classic .chmi-radar-classic-hidden {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #wrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: calc(100vw - 20px) !important;\n  max-width: none !important;\n  height: calc(100vh - 20px) !important;\n  min-height: 560px !important;\n  margin: 10px auto !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  flex: 0 0 auto;\n  align-items: baseline;\n  gap: 9px;\n  min-height: 46px;\n  padding: 11px 14px 9px;\n  color: #175f82;\n  background: #fff;\n  border-radius: 12px 12px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-radar-classic .mainWrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border-radius: 0 0 12px 12px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-section {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-row {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: row !important;\n  align-items: stretch !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_data {\n  position: relative !important;\n  flex: 1 1 auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: auto !important;\n  max-width: none !important;\n  height: 100% !important;\n  background: #d2d2d2 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-container {\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n  min-height: 100% !important;\n}\n\n/* dBZ/mm/h is a radar-rainfall legend, not a lightning legend. */\nhtml.chmi-radar-classic.chmi-radar-classic-lightning-only #div_container_data #div_scl {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic.chmi-radar-classic-web-maps #div_container_data #div_bg {\n  width: 100% !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu {\n  box-sizing: border-box;\n  flex: 0 0 320px !important;\n  align-self: stretch !important;\n  width: 320px !important;\n  max-width: 320px !important;\n  padding: 10px !important;\n  color: #555 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-left: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  min-height: 0 !important;\n  overflow: auto !important;\n  font: 13px/1.35 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-button {\n  min-height: 34px;\n  padding: 7px 8px !important;\n  color: #176b95 !important;\n  background: #f7fbfd !important;\n  border-bottom: 1px solid #b9cbd3 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-body {\n  padding: 8px 0 10px !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu select,\nhtml.chmi-radar-classic #div_container_menu input,\nhtml.chmi-radar-classic #div_container_menu button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar {\n  position: absolute;\n  z-index: 10000;\n  top: 8px;\n  left: 8px;\n  display: block;\n  padding: 3px;\n  background: rgb(255 255 255 / 94%);\n  border: 1px solid #b8cbd4;\n  border-radius: 3px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 22%);\n}\n\nhtml.chmi-radar-classic #div_container_menu #div_radio_display {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar .chmi-radar-classic-options {\n  display: inline-flex !important;\n  flex-wrap: nowrap !important;\n  width: auto !important;\n  white-space: nowrap;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button {\n  box-sizing: border-box;\n  display: inline-block !important;\n  min-width: auto !important;\n  margin: 0 -1px 0 0 !important;\n  padding: 5px 11px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  text-align: center;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:first-child {\n  border-radius: 2px 0 0 2px !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:last-child {\n  margin-right: 0 !important;\n  border-radius: 0 2px 2px 0 !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button[aria-checked=\"true\"] {\n  position: relative;\n  z-index: 1;\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:focus-visible,\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 991px) {\n  html.chmi-radar-classic #wrapper {\n    width: calc(100% - 12px) !important;\n    height: auto !important;\n    min-height: calc(100vh - 12px) !important;\n    margin: 6px auto !important;\n  }\n\n  html.chmi-radar-classic .chmi-radar-classic-app-row {\n    flex-direction: column !important;\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-radar-classic #div_container_data {\n    min-height: 60vh !important;\n    height: 60vh !important;\n  }\n\n  html.chmi-radar-classic #div_container_menu {\n    width: 100% !important;\n    max-width: none !important;\n    border-top: 1px solid #bbb !important;\n    border-left: 0 !important;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar {\n    top: 6px;\n    left: 6px;\n    max-width: calc(100% - 12px);\n    overflow-x: auto;\n  }\n}\n\n@media (max-width: 560px) {\n  html.chmi-radar-classic #chmi-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar button {\n    padding: 5px 8px !important;\n    font-size: 11px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-radar-classic *,\n  html.chmi-radar-classic *::before,\n  html.chmi-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Radar vložený na úvodní stránce ČHMÚ – stylujeme jen jeho sekci. */\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic {\n  box-sizing: border-box;\n  position: relative;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 12px 0 !important;\n  padding: 0 10px 12px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7 !important;\n  border-radius: 10px !important;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 18%);\n  overflow: hidden;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border-bottom: 1px solid #b8cbd4;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-title,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-subtitle {\n  display: none !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n  background: #d2d2d2;\n  border: 1px solid #888 !important;\n  border-radius: 0 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n  min-height: 360px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host img,\nhtml.chmi-home-radar-classic-active img.chmi-home-radar-classic-map-host {\n  display: block;\n  max-width: 100% !important;\n  height: auto !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:not(#chmi-home-radar-classic-brand > button) {\n  border-radius: 2px !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic a:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-anchor {\n  display: block;\n  position: relative;\n  top: -8px;\n  visibility: hidden;\n}\n\n@media (max-width: 640px) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic {\n    margin: 6px 0 !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n    min-height: 300px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::before,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Pravděpodobnost růstu hub – portálová stránka ČHMÚ. */\nhtml.chmi-hub-classic,\nhtml.chmi-hub-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic header#chmu-header,\nhtml.chmi-hub-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-hub-classic .menu-bookmarks,\nhtml.chmi-hub-classic .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-hub-classic footer,\nhtml.chmi-hub-classic #footer,\nhtml.chmi-hub-classic .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-hub-classic main h1 {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main h2,\nhtml.chmi-hub-classic main h3,\nhtml.chmi-hub-classic main h4 {\n  margin-top: 10px !important;\n  margin-bottom: 7px !important;\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-hub-classic main h3 {\n  font-size: 16px !important;\n}\n\nhtml.chmi-hub-classic main h4 {\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-section {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  background: #d2d2d2;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic iframe.chmi-hub-classic-map-host,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n  height: min(78vh, 800px) !important;\n  min-height: 520px !important;\n  border: 1px solid #888;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-host iframe,\nhtml.chmi-hub-classic #chmu-map-container iframe {\n  width: 100% !important;\n  max-width: none !important;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:focus-visible,\nhtml.chmi-hub-classic main button:focus-visible,\nhtml.chmi-hub-classic main a:focus-visible,\nhtml.chmi-hub-classic main select:focus-visible,\nhtml.chmi-hub-classic main input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 640px) {\n  html.chmi-hub-classic main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-hub-classic #chmu-map-container,\n  html.chmi-hub-classic iframe.chmi-hub-classic-map-host,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n    height: 70vh !important;\n    min-height: 420px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-hub-classic *,\n  html.chmi-hub-classic *::before,\n  html.chmi-hub-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* 0.4.1 – dynamické přizpůsobení pracovního prostoru dostupnému oknu. */\nhtml.chmi-radar-classic,\nhtml.chmi-radar-classic body#mbody {\n  overflow: hidden !important;\n}\n\nhtml.chmi-radar-classic #wrapper {\n  width: calc(100vw - 12px) !important;\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  margin: 6px auto !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand {\n  min-height: 40px;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-radar-classic .mainWrapper {\n  padding: 6px 8px 8px !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu {\n  flex: 0 0 clamp(260px, 20vw, 340px) !important;\n  width: clamp(260px, 20vw, 340px) !important;\n  max-width: clamp(260px, 20vw, 340px) !important;\n  overscroll-behavior: contain;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar {\n  top: 8px;\n  left: var(--chmi-radar-toolbar-left, 56px);\n  max-width: calc(100% - var(--chmi-radar-toolbar-left, 56px) - 8px);\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-left {\n  left: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-right {\n  right: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-top {\n  top: 6px !important;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-bottom {\n  bottom: 6px !important;\n}\n\n/* Homepage radar: stejný kompaktní pracovní rám a geometrie jako u produktového radaru. */\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic {\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  margin: 6px 0 8px calc(50% - 50vw + 6px) !important;\n  padding: 0 8px 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 6px;\n  padding: 8px 10px 7px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-section {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  align-items: stretch !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data {\n  position: relative !important;\n  flex: 1 1 auto !important;\n  width: auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-width: none !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_menu {\n  box-sizing: border-box;\n  flex: 0 0 clamp(260px, 20vw, 340px) !important;\n  width: clamp(260px, 20vw, 340px) !important;\n  max-width: clamp(260px, 20vw, 340px) !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  padding: 10px !important;\n  border-left: 1px solid #bbb !important;\n  overflow: auto !important;\n  overscroll-behavior: contain;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n  min-width: 0 !important;\n  max-width: none !important;\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n  min-height: min(360px, 60dvh) !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.leaflet-container,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.maplibregl-map,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host.ol-viewport {\n  height: var(--chmi-home-radar-fit-height, 72dvh) !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar {\n  position: absolute;\n  z-index: 10000;\n  top: 8px;\n  left: var(--chmi-home-radar-toolbar-left, 56px);\n  display: block;\n  max-width: calc(100% - var(--chmi-home-radar-toolbar-left, 56px) - 8px);\n  padding: 3px;\n  overflow-x: auto;\n  white-space: nowrap;\n  background: rgb(255 255 255 / 94%);\n  border: 1px solid #b8cbd4;\n  border-radius: 3px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 22%);\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar .chmi-radar-classic-options {\n  display: inline-flex !important;\n  flex-wrap: nowrap !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button {\n  box-sizing: border-box;\n  margin: 0 -1px 0 0 !important;\n  padding: 5px 10px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  cursor: pointer;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button:first-child {\n  border-radius: 2px 0 0 2px !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button:last-child {\n  margin-right: 0 !important;\n  border-radius: 0 2px 2px 0 !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-toolbar button[aria-checked=\"true\"] {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .leaflet-left,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data .leaflet-left {\n  left: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .leaflet-right,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data .leaflet-right {\n  right: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .maplibregl-ctrl-top-left {\n  top: 6px !important;\n  left: 6px !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host .maplibregl-ctrl-top-right {\n  top: 6px !important;\n  right: 6px !important;\n}\n\n/* Houby: plná šířka okna, mapa vyplní zbylou výšku viewportu. */\nhtml.chmi-hub-classic,\nhtml.chmi-hub-classic body {\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-hub-classic main {\n  width: calc(100vw - 12px) !important;\n  margin: 6px auto 8px !important;\n  padding: 0 8px 8px !important;\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 6px;\n  padding: 8px 10px 7px;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic iframe.chmi-hub-classic-map-host,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n  width: 100% !important;\n  max-width: none !important;\n  height: var(--chmi-hub-fit-height, calc(100dvh - 150px)) !important;\n  min-height: min(420px, calc(100dvh - 120px)) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container > *,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host > * {\n  max-width: 100%;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .leaflet-left,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .leaflet-left {\n  left: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .leaflet-right,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .leaflet-right {\n  right: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .maplibregl-ctrl-top-left,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .maplibregl-ctrl-top-left {\n  top: 8px !important;\n  left: 8px !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container .maplibregl-ctrl-top-right,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host .maplibregl-ctrl-top-right {\n  top: 8px !important;\n  right: 8px !important;\n}\n\n@media (max-width: 760px) {\n  html.chmi-radar-classic,\n  html.chmi-radar-classic body#mbody {\n    overflow: auto !important;\n  }\n\n  html.chmi-radar-classic #wrapper {\n    width: calc(100% - 8px) !important;\n    height: auto !important;\n    min-height: calc(100dvh - 8px) !important;\n    margin: 4px auto !important;\n  }\n\n  html.chmi-radar-classic .chmi-radar-classic-app-row,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row {\n    flex-direction: column !important;\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-radar-classic #div_container_data,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_data,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n    height: 62dvh !important;\n    min-height: 320px !important;\n  }\n\n  html.chmi-radar-classic #div_container_menu,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic-app-row #div_container_menu {\n    flex-basis: auto !important;\n    width: 100% !important;\n    max-width: none !important;\n    height: auto !important;\n    border-top: 1px solid #bbb !important;\n    border-left: 0 !important;\n  }\n\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic {\n    width: calc(100vw - 8px) !important;\n    margin-left: calc(50% - 50vw + 4px) !important;\n  }\n\n  html.chmi-hub-classic main {\n    width: calc(100vw - 8px) !important;\n    margin-top: 4px !important;\n  }\n}\n\n/* Prevent browser default body margins from reintroducing viewport scrollbars in full-window classic apps. */\nhtml.chmi-radar-classic body#mbody,\nhtml.chmi-hub-classic body {\n    margin: 0 !important;\n    padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic,\nhtml.chmi-satellite-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: 100%;\n  min-height: 42px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-satellite-classic-live #content,\nhtml.chmi-satellite-classic-live #wrapper > nav,\nhtml.chmi-satellite-classic-live #footer,\nhtml.chmi-satellite-classic-live #footerBottom,\nhtml.chmi-satellite-classic-live .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #wrapper {\n  width: min(1460px, calc(100% - 20px)) !important;\n  min-height: auto !important;\n  margin: 10px auto 40px !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper {\n  box-sizing: border-box;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-top: 0;\n  border-radius: 0 0 10px 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid {\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid > h1,\nhtml.chmi-satellite-classic-live #btn-desktop-sidebar-toggle,\nhtml.chmi-satellite-classic-live #animation-controls,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-native-choice {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1160px) 250px;\n  justify-content: center;\n  gap: 10px !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .map-col,\nhtml.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n  box-sizing: border-box;\n  width: auto !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title {\n  min-height: 24px;\n  margin: 0 0 4px !important;\n  text-align: left !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title h2 {\n  margin: 0 !important;\n  color: #176b95 !important;\n  font: bold 16px/1.4 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container {\n  max-height: none !important;\n  background: #d2d2d2 !important;\n  border: 1px solid #888;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu {\n  position: static !important;\n  visibility: visible !important;\n  width: 100% !important;\n  min-height: 0 !important;\n  height: calc(100vh - 84px) !important;\n  max-height: 900px;\n  padding: 0 !important;\n  color: #111 !important;\n  background: #fff !important;\n  border: 1px solid #aaa !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  transform: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n  padding: 9px !important;\n  overflow-y: auto !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section {\n  margin: 0 !important;\n  padding: 8px 0 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-bottom: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .section-header,\nhtml.chmi-satellite-classic-live #settingsMenu .form-label {\n  margin-bottom: 4px !important;\n  color: #111 !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .btn-info-icon {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu select,\nhtml.chmi-satellite-classic-live #settingsMenu input,\nhtml.chmi-satellite-classic-live #settingsMenu button {\n  border-radius: 2px !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group {\n  gap: 4px !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group label {\n  min-width: 39px;\n  margin: 0 !important;\n  padding: 4px 7px !important;\n  color: #14387f !important;\n  background: #f8fbff !important;\n  border: 1px solid #14387f !important;\n  border-radius: 2px !important;\n  font: 13px/1.25 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group input:checked + label {\n  color: #fff !important;\n  background: #14387f !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector {\n  margin-bottom: 8px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  margin-bottom: 9px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row label,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector > strong {\n  font-weight: bold;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row select {\n  flex: 1;\n  min-width: 0;\n  padding: 3px 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-matrix {\n  display: grid;\n  gap: 3px;\n  margin-top: 7px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  display: grid;\n  grid-template-columns: minmax(85px, 1fr) repeat(3, 37px);\n  align-items: center;\n  gap: 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span {\n  color: #0645ad;\n  font-weight: bold;\n  text-decoration: underline;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button {\n  min-width: 35px;\n  padding: 2px 4px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button:hover,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button.is-active {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-selection {\n  margin-top: 8px;\n  color: #555;\n  font-size: 11px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding: 8px 0 6px;\n  color: #111;\n  background: #fff;\n  font: 13px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player button,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player select {\n  min-height: 25px;\n  padding: 2px 7px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-player-buttons {\n  display: inline-flex;\n  gap: 3px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"loaded\"],\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"time\"] {\n  white-space: nowrap;\n}\n\nhtml.chmi-satellite-classic-live .product-legend-box {\n  margin-top: 4px !important;\n  padding: 8px !important;\n  background: #fff !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #satInfo {\n  color: #d40000 !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-satellite-classic-portal header#chmu-header,\nhtml.chmi-satellite-classic-portal nav[aria-label*=\"Nach\"],\nhtml.chmi-satellite-classic-portal .menu-bookmarks,\nhtml.chmi-satellite-classic-portal .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-satellite-classic-portal footer,\nhtml.chmi-satellite-classic-portal #footer,\nhtml.chmi-satellite-classic-portal .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-portal main > #chmi-satellite-classic-brand {\n  width: calc(100% + 20px);\n  margin: -1px -10px 0;\n}\n\nhtml.chmi-satellite-classic-portal main h1 {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 7px;\n  margin: 9px 0;\n  padding: 7px 8px;\n  background: #fff;\n  border: 1px solid #aaa;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products > div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a {\n  padding: 3px 8px;\n  color: #0645ad;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.35 Arial, Helvetica, sans-serif;\n  text-decoration: none;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a:hover,\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a[aria-current=\"page\"] {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n  margin-left: auto;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: min(78vh, 800px) !important;\n  min-height: 520px;\n  background: #d2d2d2;\n  border: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic button:focus-visible,\nhtml.chmi-satellite-classic a:focus-visible,\nhtml.chmi-satellite-classic select:focus-visible,\nhtml.chmi-satellite-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 1100px) {\n  html.chmi-satellite-classic-live #main-row {\n    grid-template-columns: minmax(0, 1fr);\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu {\n    height: auto !important;\n    max-height: none !important;\n  }\n}\n\n@media (max-width: 640px) {\n  html.chmi-satellite-classic #chmi-satellite-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-satellite-classic-live #wrapper,\n  html.chmi-satellite-classic-portal main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n  }\n\n  html.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n    grid-template-columns: minmax(82px, 1fr) repeat(3, 34px);\n    gap: 3px;\n  }\n\n  html.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n\n  html.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n    margin-left: 0;\n  }\n\n  html.chmi-satellite-classic-portal #chmu-map-container {\n    min-height: 420px;\n    height: 70vh !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-satellite-classic *,\n  html.chmi-satellite-classic *::before,\n  html.chmi-satellite-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* 0.4.1 – dynamické využití viewportu pro Meteosat a portálové družicové mapy. */\nhtml.chmi-satellite-classic-live,\nhtml.chmi-satellite-classic-live body {\n  width: 100%;\n  height: 100%;\n  min-height: 100dvh;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #wrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  margin: 6px auto !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-brand {\n  flex: 0 0 auto;\n  min-height: 40px;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper {\n  display: flex !important;\n  flex: 1 1 auto !important;\n  min-height: 0 !important;\n  padding: 6px 8px 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid {\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row {\n  display: grid !important;\n  flex: 1 1 auto !important;\n  grid-template-columns: minmax(0, 1fr) clamp(230px, 18vw, 300px) !important;\n  grid-template-rows: minmax(0, 1fr) !important;\n  align-items: stretch !important;\n  justify-content: stretch !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  gap: 8px !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .map-col {\n  display: flex !important;\n  flex-direction: column !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n  display: flex !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title {\n  flex: 0 0 auto;\n  min-height: 20px;\n  margin-bottom: 3px !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  max-width: none !important;\n  min-width: 0 !important;\n  min-height: 180px !important;\n  height: auto !important;\n  max-height: none !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row .map-wrapper {\n  display: flex !important;\n  flex-direction: column !important;\n  flex: 1 1 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\nhtml.chmi-satellite-classic-live #map-container {\n  flex: 1 1 0 !important;\n  aspect-ratio: auto !important;\n}\nhtml.chmi-satellite-classic-live #settingsMenu .chmi-classic-disclosure > summary {\n  display: list-item;\n  cursor: pointer;\n  padding: 4px 0;\n  color: #154e73;\n  font: bold 12px/1.3 Arial, sans-serif;\n}\nhtml.chmi-satellite-classic-live #settingsMenu .chmi-classic-disclosure > summary .section-header {\n  display: inline-flex !important;\n  margin: 0 !important;\n}\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section { padding: 4px 0 !important; }\nhtml.chmi-satellite-classic-live #settingsMenu .form-check { margin-bottom: 3px !important; }\nhtml.chmi-satellite-classic-live #settingsMenu .form-check-label { font-size: 12px !important; }\nhtml.chmi-satellite-classic-live #settingsMenu #satInfo { font: 12px/1.35 Arial, sans-serif !important; }\nhtml.chmi-satellite-classic-live #settingsMenu #satInfo p { font: inherit !important; }\nhtml.chmi-satellite-classic-live #time-range-group label { min-width: 34px; padding: 3px 5px !important; font-size: 12px !important; }\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span { font-size: 12px; }\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row { margin-bottom: 5px; }\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector { margin-bottom: 4px; padding-bottom: 5px; }\n\nhtml.chmi-satellite-classic-live #map-container img,\nhtml.chmi-satellite-classic-live #map-container canvas,\nhtml.chmi-satellite-classic-live #map-container video {\n  max-width: 100% !important;\n  max-height: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  min-width: 0 !important;\n  max-width: 100% !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  max-height: none !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n  box-sizing: border-box;\n  width: 100% !important;\n  min-width: 0 !important;\n  height: 100% !important;\n  min-height: 0 !important;\n  padding: 8px !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector,\nhtml.chmi-satellite-classic-live #time-range-group {\n  box-sizing: border-box;\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group {\n  display: flex !important;\n  flex-wrap: wrap !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu input[type=\"range\"],\nhtml.chmi-satellite-classic-live #settingsMenu select {\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .form-check,\nhtml.chmi-satellite-classic-live #settingsMenu label {\n  min-width: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player {\n  flex: 0 0 auto !important;\n  min-width: 0 !important;\n  padding: 5px 0 1px;\n}\n\n/* Portálové polární/geostacionární mapy vyplní šířku i zbývající výšku okna. */\nhtml.chmi-satellite-classic-portal,\nhtml.chmi-satellite-classic-portal body {\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal main {\n  width: calc(100vw - 12px) !important;\n  max-width: none !important;\n  margin: 6px auto 8px !important;\n  padding: 0 8px 8px !important;\n  overflow-x: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal main > #chmi-satellite-classic-brand {\n  width: calc(100% + 16px);\n  min-height: 40px;\n  margin: -1px -8px 0;\n  padding-top: 8px;\n  padding-bottom: 7px;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n  margin: 6px 0;\n  padding: 5px 7px;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container {\n  width: 100% !important;\n  max-width: none !important;\n  height: var(--chmi-satellite-portal-fit-height, calc(100dvh - 140px)) !important;\n  min-height: min(420px, calc(100dvh - 120px)) !important;\n  overflow: hidden !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container > * {\n  max-width: 100%;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-left {\n  left: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-right {\n  right: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-top {\n  top: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .leaflet-bottom {\n  bottom: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .maplibregl-ctrl-top-left {\n  top: 8px !important;\n  left: 8px !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container .maplibregl-ctrl-top-right {\n  top: 8px !important;\n  right: 8px !important;\n}\n\n@media (max-width: 760px) {\n  html.chmi-satellite-classic-live,\n  html.chmi-satellite-classic-live body {\n    height: auto;\n    overflow: auto !important;\n  }\n\n  html.chmi-satellite-classic-live #wrapper {\n    width: calc(100% - 8px) !important;\n    height: auto !important;\n    min-height: calc(100dvh - 8px) !important;\n    margin: 4px auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live .mainWrapper,\n  html.chmi-satellite-classic-live .mainWrapper > .container-fluid,\n  html.chmi-satellite-classic-live #main-row {\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live #main-row {\n    grid-template-columns: minmax(0, 1fr) !important;\n    grid-template-rows: auto auto !important;\n    height: auto !important;\n  }\n\n  html.chmi-satellite-classic-live #main-row > .map-col,\n  html.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-satellite-classic-live #map-container {\n    height: 58dvh !important;\n    min-height: 320px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu {\n    height: auto !important;\n    max-height: 55dvh !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n    height: auto !important;\n    max-height: 55dvh !important;\n  }\n\n  html.chmi-satellite-classic-portal main {\n    width: calc(100vw - 8px) !important;\n    margin-top: 4px !important;\n  }\n\n  html.chmi-satellite-classic-portal #chmu-map-container {\n    height: 68dvh !important;\n    min-height: 320px !important;\n  }\n}\n\n@media (max-height: 650px) and (min-width: 761px) {\n  html.chmi-satellite-classic-live #chmi-satellite-classic-brand {\n    min-height: 34px;\n    padding-top: 5px;\n    padding-bottom: 4px;\n  }\n\n  html.chmi-satellite-classic-live .mainWrapper {\n    padding-top: 4px !important;\n    padding-bottom: 4px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n    padding: 6px !important;\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu .settings-section {\n    padding-top: 5px !important;\n    padding-bottom: 5px !important;\n  }\n}\n\n/* Full-window satellite views own the viewport; remove UA body margins that would create 8px overflow. */\nhtml.chmi-satellite-classic-live body,\nhtml.chmi-satellite-classic-portal body {\n    margin: 0 !important;\n    padding: 0 !important;\n}\n\n/* Narrow desktop sidebars: keep every mirrored control inside the settings column. */\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-matrix,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  grid-template-columns: minmax(0, 1fr) repeat(3, minmax(35px, 37px)) !important;\n  gap: 3px !important;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span {\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu input[type=\"range\"],\nhtml.chmi-satellite-classic-live #settingsMenu select {\n  box-sizing: border-box !important;\n  width: 100% !important;\n  min-width: 0 !important;\n}\n\n/* Společná kompaktní navigace mezi podporovanými částmi ČHMÚ Classic. */\n#chmi-radar-classic-brand,\n#chmi-home-radar-classic-brand,\n#chmi-satellite-classic-brand,\n#chmi-hub-classic-brand,\n#chmi-synoptic-classic-brand {\n  flex-wrap: wrap !important;\n  row-gap: 5px !important;\n}\n\n.chmi-classic-navigation {\n  box-sizing: border-box;\n  display: inline-flex !important;\n  flex: 0 1 auto;\n  align-items: center;\n  gap: 2px;\n  min-width: 0;\n  margin: 0 4px 0 8px;\n  padding: 0;\n  white-space: nowrap;\n}\n\n.chmi-classic-navigation a {\n  box-sizing: border-box;\n  display: inline-block !important;\n  padding: 3px 6px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #b2cfdb !important;\n  border-radius: 2px !important;\n  font: 11px/1.25 Arial, Helvetica, sans-serif !important;\n  text-decoration: none !important;\n}\n\n.chmi-classic-navigation a:hover,\n.chmi-classic-navigation a.is-active,\n.chmi-classic-navigation a[aria-current=\"page\"] {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\n.chmi-classic-navigation a:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 900px) {\n  .chmi-classic-navigation {\n    order: 3;\n    flex: 1 0 100%;\n    width: 100%;\n    max-width: 100%;\n    margin: 0;\n    flex-wrap: wrap !important;\n    overflow-x: visible;\n    white-space: normal;\n  }\n}\n\n@media (max-width: 520px) {\n  .chmi-classic-navigation a {\n    padding: 3px 5px !important;\n    font-size: 10.5px !important;\n  }\n}\n\n/* Jednotný katalog a kompaktní old-look rám dalších meteorologických výstupů ČHMÚ. */\n\n.chmi-classic-catalog-button,\n#chmi-aladin-four-map-preset,\n#chmi-catalog-classic-brand > button {\n  box-sizing: border-box;\n  flex: 0 0 auto;\n  padding: 3px 8px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 2px !important;\n  font: 12px/1.35 Arial, Helvetica, sans-serif !important;\n  cursor: pointer;\n}\n\n.chmi-classic-catalog-button:hover,\n#chmi-aladin-four-map-preset:hover,\n#chmi-catalog-classic-brand > button:hover {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\n.chmi-classic-catalog-button:focus-visible,\n#chmi-aladin-four-map-preset:focus-visible,\n#chmi-catalog-classic-brand button:focus-visible,\n#chmi-classic-catalog-dialog a:focus-visible,\n#chmi-classic-catalog-dialog button:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\nhtml.chmi-catalog-open,\nhtml.chmi-catalog-open body {\n  overflow: hidden !important;\n}\n\n#chmi-classic-catalog-overlay[hidden] {\n  display: none !important;\n}\n\n#chmi-classic-catalog-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483600;\n  display: grid;\n  place-items: center;\n  box-sizing: border-box;\n  padding: 14px;\n  background: rgb(15 50 65 / 56%);\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\n#chmi-classic-catalog-dialog {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  width: min(1180px, 100%);\n  max-height: calc(100vh - 28px);\n  overflow: hidden;\n  color: #222;\n  background: #fff;\n  border: 1px solid #6b8c9b;\n  border-radius: 7px;\n  box-shadow: 0 8px 28px rgb(0 0 0 / 38%);\n}\n\n#chmi-classic-catalog-dialog > header {\n  display: flex;\n  flex: 0 0 auto;\n  align-items: center;\n  gap: 12px;\n  padding: 9px 11px;\n  color: #176b95;\n  background: #e8f6fb;\n  border-bottom: 1px solid #9cc5d5;\n}\n\n#chmi-classic-catalog-dialog h2 {\n  flex: 1 1 auto;\n  margin: 0 !important;\n  color: #176b95 !important;\n  font: 700 17px/1.25 Arial, Helvetica, sans-serif !important;\n}\n\n#chmi-classic-catalog-dialog .chmi-catalog-close {\n  flex: 0 0 auto;\n  padding: 4px 9px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #8fb9ca;\n  border-radius: 2px;\n  font: 12px/1.35 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\n.chmi-catalog-intro {\n  flex: 0 0 auto;\n  margin: 0 !important;\n  padding: 7px 11px !important;\n  color: #555 !important;\n  background: #fbfbfb;\n  border-bottom: 1px solid #ddd;\n  font: 12px/1.4 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-quick {\n  flex: 0 0 auto;\n  padding: 6px 8px;\n  border-bottom: 1px solid #ddd;\n}\n\n.chmi-catalog-quick .chmi-classic-navigation {\n  display: flex !important;\n  flex-wrap: wrap !important;\n  width: 100%;\n  margin: 0;\n  white-space: normal;\n}\n\n.chmi-catalog-groups {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 9px;\n  min-height: 0;\n  padding: 9px;\n  overflow: auto;\n  overscroll-behavior: contain;\n}\n\n.chmi-catalog-group {\n  min-width: 0;\n  border: 1px solid #b7cbd4;\n  background: #fafcfd;\n}\n\n.chmi-catalog-group > h3 {\n  margin: 0 !important;\n  padding: 6px 8px !important;\n  color: #176b95 !important;\n  background: #eaf5f9;\n  border-bottom: 1px solid #b7cbd4;\n  font: 700 14px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-list {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1px;\n  background: #dfe7ea;\n}\n\n.chmi-catalog-item {\n  min-width: 0;\n  padding: 6px 7px;\n  background: #fff;\n}\n\n.chmi-catalog-item-top {\n  display: flex;\n  align-items: flex-start;\n  gap: 6px;\n}\n\n.chmi-catalog-item a,\n.chmi-catalog-item-label {\n  flex: 1 1 auto;\n  min-width: 0;\n  color: #0645ad !important;\n  font: 700 12.5px/1.3 Arial, Helvetica, sans-serif !important;\n  text-decoration: underline !important;\n  overflow-wrap: anywhere;\n}\n\n.chmi-catalog-item-label {\n  color: #333 !important;\n  text-decoration: none !important;\n}\n\n.chmi-catalog-item.is-unavailable {\n  background: #fff8f8;\n}\n\n.chmi-catalog-item.is-unavailable .chmi-catalog-item-label {\n  color: #b4232d !important;\n  cursor: help;\n  text-decoration: line-through !important;\n  text-decoration-color: #b4232d !important;\n  text-decoration-thickness: 1.5px;\n}\n\n.chmi-catalog-item.is-unavailable .chmi-catalog-item-label:focus-visible {\n  outline: 2px solid #b4232d;\n  outline-offset: 2px;\n}\n\n.chmi-catalog-item a[aria-current=\"page\"] {\n  color: #8b1b1b !important;\n}\n\n.chmi-catalog-item p {\n  margin: 3px 0 0 !important;\n  color: #555 !important;\n  font: 11px/1.35 Arial, Helvetica, sans-serif !important;\n}\n\n.chmi-catalog-status {\n  flex: 0 0 auto;\n  padding: 1px 4px;\n  border: 1px solid #8cad99;\n  border-radius: 2px;\n  color: #28623a;\n  background: #edf8f0;\n  font: 700 9.5px/1.35 Arial, Helvetica, sans-serif !important;\n  text-transform: uppercase;\n  letter-spacing: .02em;\n}\n\n.chmi-catalog-status.is-archive {\n  color: #765100;\n  background: #fff8df;\n  border-color: #c8aa5b;\n}\n\n.chmi-catalog-status.is-legacy {\n  color: #07567e;\n  background: #eaf7fc;\n  border-color: #70a8c0;\n}\n\n.chmi-catalog-status.is-direct {\n  color: #4c3b00;\n  background: #f5f1d5;\n  border-color: #aea45a;\n}\n\n.chmi-catalog-status.is-unavailable {\n  color: #a01825;\n  background: #fff0f1;\n  border-color: #d18a91;\n}\n\n.chmi-catalog-item-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px 8px;\n  margin-top: 4px;\n}\n\n.chmi-catalog-item-actions a {\n  flex: 0 1 auto;\n  font-size: 10.5px !important;\n  font-weight: 600 !important;\n}\n\n/* Old-look rám pro další živé výstupy. Nezasahuje do datového backendu ani logiky formulářů. */\nhtml.chmi-catalog-shell,\nhtml.chmi-catalog-shell body {\n  box-sizing: border-box;\n  min-width: 0 !important;\n  min-height: 100%;\n  margin: 0 !important;\n  overflow-x: hidden !important;\n  color: #111 !important;\n  background: #8bc6da !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-catalog-shell body *,\nhtml.chmi-catalog-shell body *::before,\nhtml.chmi-catalog-shell body *::after {\n  box-sizing: border-box;\n}\n\nhtml.chmi-catalog-shell header#chmu-header,\nhtml.chmi-catalog-shell nav[aria-label*=\"Nach\"],\nhtml.chmi-catalog-shell .menu-bookmarks,\nhtml.chmi-catalog-shell .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-catalog-shell footer,\nhtml.chmi-catalog-shell #footer,\nhtml.chmi-catalog-shell #footerBottom,\nhtml.chmi-catalog-shell .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-catalog-shell main {\n  box-sizing: border-box;\n  width: calc(100% - 12px) !important;\n  max-width: none !important;\n  min-height: min(var(--chmi-catalog-available-height, 640px), calc(100vh - 12px));\n  margin: 6px auto 12px !important;\n  padding: 0 8px 10px !important;\n  overflow: visible !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 7px;\n  box-shadow: 0 3px 8px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand {\n  position: relative;\n  z-index: 1000;\n  display: flex !important;\n  flex-wrap: wrap !important;\n  align-items: center !important;\n  gap: 5px 7px;\n  width: calc(100% + 16px);\n  min-width: 0;\n  min-height: 38px;\n  margin: -1px -8px 7px;\n  padding: 6px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-top: 0;\n  border-radius: 7px 7px 0 0;\n  box-shadow: 0 2px 6px rgb(40 83 101 / 18%);\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand > strong {\n  flex: 0 1 auto;\n  min-width: 0;\n  font-size: 15px;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand > span {\n  flex: 0 0 auto;\n  color: #777;\n  font-size: 11px;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-classic-navigation {\n  flex: 1 1 430px;\n  flex-wrap: wrap !important;\n  margin: 0 2px;\n  white-space: normal;\n}\n\nhtml.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-catalog-new-look {\n  margin-left: auto;\n}\n\nhtml.chmi-catalog-shell main > h1:first-of-type {\n  margin-top: 4px !important;\n  margin-bottom: 8px !important;\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 20px !important;\n}\n\nhtml.chmi-catalog-shell main h2,\nhtml.chmi-catalog-shell main h3,\nhtml.chmi-catalog-shell main h4 {\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-catalog-shell main img,\nhtml.chmi-catalog-shell main iframe,\nhtml.chmi-catalog-shell main svg,\nhtml.chmi-catalog-shell main video {\n  max-width: 100% !important;\n}\n\nhtml.chmi-catalog-shell main table {\n  max-width: 100% !important;\n}\n\nhtml.chmi-catalog-shell main input,\nhtml.chmi-catalog-shell main select,\nhtml.chmi-catalog-shell main textarea,\nhtml.chmi-catalog-shell main button {\n  max-width: 100%;\n}\n\nhtml.chmi-catalog-shell [id*=\"map\" i],\nhtml.chmi-catalog-shell [class*=\"map\" i] {\n  min-width: 0;\n}\n\n/* ALADIN: roztažení pracovního prostoru bez nahrazování map nebo časových ovladačů. */\nhtml.chmi-catalog-aladin .mainWrapper,\nhtml.chmi-catalog-aladin .main-wrapper,\nhtml.chmi-catalog-aladin main > .container,\nhtml.chmi-catalog-aladin main > .container-fluid {\n  width: 100% !important;\n  max-width: none !important;\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n  padding-right: 4px !important;\n  padding-left: 4px !important;\n}\n\nhtml.chmi-catalog-aladin main img {\n  height: auto !important;\n  object-fit: contain;\n}\n\nhtml.chmi-catalog-aladin main form,\nhtml.chmi-catalog-aladin main fieldset {\n  min-width: 0 !important;\n}\n\n@media (max-width: 900px) {\n  .chmi-catalog-groups {\n    grid-template-columns: 1fr;\n  }\n\n  .chmi-catalog-list {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  html.chmi-catalog-shell #chmi-catalog-classic-brand .chmi-classic-navigation {\n    flex-basis: 100%;\n    order: 3;\n  }\n}\n\n@media (max-width: 620px) {\n  #chmi-classic-catalog-overlay {\n    padding: 4px;\n  }\n\n  #chmi-classic-catalog-dialog {\n    max-height: calc(100vh - 8px);\n  }\n\n  .chmi-catalog-list {\n    grid-template-columns: 1fr;\n  }\n\n  html.chmi-catalog-shell main {\n    width: 100% !important;\n    margin-top: 0 !important;\n    border-right: 0;\n    border-left: 0;\n    border-radius: 0;\n  }\n\n  html.chmi-catalog-shell #chmi-catalog-classic-brand {\n    border-radius: 0;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  #chmi-classic-catalog-overlay *,\n  html.chmi-catalog-shell * {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n  }\n}\n\n/*\n * Doložená adaptace historických aplikací ČHMÚ.\n * Nekopíruje původní CSS/JS ani archivní obrázky. Zachovává DOM a nativní\n * ovládání zdrojové aplikace a pouze přidává společný rám a responzivní fit.\n */\nhtml.chmi-legacy-classic,\nhtml.chmi-legacy-classic body {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: 100% !important;\n  min-width: 0 !important;\n  margin: 0 !important;\n  overflow-x: hidden !important;\n  background: #8bc6da !important;\n  color: #111;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-legacy-classic body *,\nhtml.chmi-legacy-classic body *::before,\nhtml.chmi-legacy-classic body *::after {\n  box-sizing: border-box;\n}\n\n#chmi-legacy-classic-header {\n  position: relative;\n  z-index: 2147483000;\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 5px 9px;\n  width: 100%;\n  min-width: 0;\n  padding: 4px 7px;\n  border: 1px solid #3a819e;\n  border-width: 0 0 1px;\n  background: linear-gradient(#eaf8fd, #ccebf5);\n  color: #111;\n  font: 12px/1.25 Arial, Helvetica, sans-serif;\n  box-shadow: 0 1px 2px rgb(0 0 0 / 18%);\n}\n\n#chmi-legacy-classic-header .chmi-legacy-brand,\n#chmi-legacy-classic-header nav,\n#chmi-legacy-classic-header .chmi-legacy-actions {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n}\n\n#chmi-legacy-classic-header .chmi-legacy-brand strong {\n  white-space: nowrap;\n  font-size: 13px;\n}\n\n#chmi-legacy-classic-header .chmi-legacy-badge {\n  padding: 1px 4px;\n  border: 1px solid #c3a65b;\n  background: #fff7dc;\n  color: #6e5000;\n  font-size: 9px;\n  font-weight: 700;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n#chmi-legacy-classic-header nav {\n  flex-wrap: wrap;\n}\n\n#chmi-legacy-classic-header a {\n  display: inline-block;\n  max-width: 100%;\n  padding: 2px 5px;\n  border: 1px solid #87b8cb;\n  border-radius: 2px;\n  background: #f6fcff;\n  color: #064f76 !important;\n  font: 700 10.5px/1.25 Arial, Helvetica, sans-serif !important;\n  text-decoration: none !important;\n  white-space: nowrap;\n}\n\n#chmi-legacy-classic-header a:hover,\n#chmi-legacy-classic-header a:focus-visible {\n  background: #fff;\n  border-color: #397f9c;\n  text-decoration: underline !important;\n}\n\n#chmi-legacy-classic-header .chmi-legacy-actions {\n  justify-content: flex-end;\n  flex-wrap: wrap;\n}\n\n#chmi-legacy-classic-header .chmi-legacy-actions a.is-primary {\n  border-color: #4c8e5e;\n  background: #edf8f0;\n  color: #245d35 !important;\n}\n\nhtml.chmi-legacy-classic body > :not(#chmi-legacy-classic-header) {\n  max-width: 100% !important;\n}\n\nhtml.chmi-legacy-classic img,\nhtml.chmi-legacy-classic canvas,\nhtml.chmi-legacy-classic svg,\nhtml.chmi-legacy-classic video,\nhtml.chmi-legacy-classic object,\nhtml.chmi-legacy-classic embed,\nhtml.chmi-legacy-classic iframe {\n  max-width: 100% !important;\n}\n\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] img,\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] canvas,\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] svg,\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] object,\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] embed,\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"viewer\"] iframe {\n  max-height: var(--chmi-legacy-available-height, calc(100vh - 54px)) !important;\n  object-fit: contain;\n}\n\nhtml.chmi-legacy-classic table {\n  max-width: 100% !important;\n}\n\nhtml.chmi-legacy-classic input,\nhtml.chmi-legacy-classic select,\nhtml.chmi-legacy-classic button,\nhtml.chmi-legacy-classic textarea {\n  max-width: 100%;\n}\n\nhtml.chmi-legacy-classic [style*=\"min-width\"] {\n  min-width: 0 !important;\n}\n\nhtml.chmi-legacy-classic[data-chmi-legacy-layout=\"gallery\"] img {\n  height: auto !important;\n}\n\n@media (max-width: 1050px) {\n  #chmi-legacy-classic-header {\n    grid-template-columns: 1fr auto;\n  }\n\n  #chmi-legacy-classic-header nav {\n    grid-column: 1 / -1;\n    grid-row: 2;\n  }\n}\n\n@media (max-width: 700px) {\n  #chmi-legacy-classic-header {\n    grid-template-columns: 1fr;\n  }\n\n  #chmi-legacy-classic-header nav,\n  #chmi-legacy-classic-header .chmi-legacy-actions {\n    grid-column: 1;\n  }\n\n  #chmi-legacy-classic-header .chmi-legacy-actions {\n    justify-content: flex-start;\n  }\n\n  #chmi-legacy-classic-header .chmi-legacy-brand {\n    flex-wrap: wrap;\n  }\n}\n\nhtml.chmi-aladin-classic,\nhtml.chmi-aladin-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-aladin-classic #wrapper {\n  width: 100% !important;\n  min-height: 100vh !important;\n}\n\nhtml.chmi-aladin-classic #chmu-header,\nhtml.chmi-aladin-classic #wrapper > #content:has(#chmu-header):not(:has(#modelGrid)),\nhtml.chmi-aladin-classic #wrapper > [aria-label*=\"Nach\"],\nhtml.chmi-aladin-classic #wrapper > nav,\nhtml.chmi-aladin-classic #footer,\nhtml.chmi-aladin-classic #footerBottom,\nhtml.chmi-aladin-classic .material-scrolltop,\nhtml.chmi-aladin-classic .mainWrapper > .container-fluid > h1,\nhtml.chmi-aladin-classic #settingsWrapper,\nhtml.chmi-aladin-classic .scroll-controls {\n  display: none !important;\n}\n\nhtml.chmi-aladin-classic .mainWrapper {\n  box-sizing: border-box;\n  width: calc(100% - 16px) !important;\n  max-width: none !important;\n  margin: 8px auto !important;\n  padding: 0 8px 8px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-aladin-classic-embedded,\nhtml.chmi-aladin-classic-embedded body,\nhtml.chmi-aladin-classic-embedded #wrapper {\n  min-height: 100% !important;\n  background: #fff !important;\n}\n\nhtml.chmi-aladin-classic-embedded .mainWrapper {\n  width: 100% !important;\n  margin: 0 !important;\n  border: 0;\n  border-radius: 0;\n  box-shadow: none;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: baseline;\n  gap: 9px;\n  width: calc(100% + 16px);\n  min-height: 42px;\n  margin: 0 -8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border-bottom: 1px solid #9bafb7;\n  border-radius: 10px 10px 0 0;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand > div {\n  display: flex;\n  align-items: baseline;\n  gap: 9px;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand strong {\n  font-size: 17px;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand span {\n  color: #666;\n  font-size: 12px;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls {\n  box-sizing: border-box;\n  display: grid;\n  grid-template-columns: minmax(270px, 1fr) minmax(230px, 0.7fr) minmax(430px, 1.3fr);\n  align-items: center;\n  gap: 8px 14px;\n  margin: 8px 0;\n  padding: 8px 10px;\n  color: #111;\n  background: #edf7fb;\n  border: 1px solid #9bafb7;\n  border-radius: 3px;\n  font: 13px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-products {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-product-chips {\n  display: flex;\n  flex: 1;\n  flex-wrap: wrap;\n  gap: 4px;\n  min-width: 0;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-product-chips > span {\n  padding: 4px 5px;\n  color: #fff;\n  background: #176b95;\n  border: 1px solid #0b587c;\n  text-align: center;\n  white-space: nowrap;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-product-picker {\n  position: relative;\n  flex: none;\n  z-index: 8;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-product-picker > summary {\n  padding: 4px 8px;\n  color: #0645ad;\n  background: #fff;\n  border: 1px solid #8aafc0;\n  border-radius: 2px;\n  cursor: pointer;\n  white-space: nowrap;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-product-options {\n  position: fixed;\n  top: 8px;\n  left: 8px;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 3px 12px;\n  width: min(440px, 88vw);\n  max-height: min(55vh, 340px);\n  padding: 9px;\n  overflow: auto;\n  background: #fff;\n  border: 1px solid #8aafc0;\n  box-shadow: 0 4px 12px rgb(31 72 96 / 25%);\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-product-picker:not([open]) #chmi-aladin-classic-product-options {\n  display: none;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-product-options label {\n  display: flex;\n  align-items: flex-start;\n  gap: 5px;\n  min-width: 0;\n  cursor: pointer;\n  font: 12px/1.25 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-product-options input {\n  flex: none;\n  margin: 1px 0 0;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-run-control,\nhtml.chmi-aladin-classic .chmi-aladin-classic-time-control,\nhtml.chmi-aladin-classic .chmi-aladin-classic-time-control > div {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-run-control label,\nhtml.chmi-aladin-classic .chmi-aladin-classic-time-control > span {\n  font-weight: bold;\n  white-space: nowrap;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-time-control {\n  flex-wrap: wrap;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls select,\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls button {\n  box-sizing: border-box;\n  min-height: 27px;\n  padding: 3px 7px;\n  color: #111;\n  background: #fff;\n  border: 1px solid #888;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls button {\n  min-width: 30px;\n  color: #0645ad;\n  background: #f5f5f5;\n  cursor: pointer;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls button:hover:not(:disabled) {\n  color: #fff;\n  background: #176b95;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-controls button:disabled {\n  color: #999;\n  cursor: default;\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-run {\n  width: min(100%, 190px);\n}\n\nhtml.chmi-aladin-classic #chmi-aladin-classic-time {\n  min-width: 160px;\n  max-width: 230px;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-time-control small {\n  display: block;\n  box-sizing: border-box;\n  flex: 1 0 100%;\n  padding: 5px 8px;\n  color: #153e65;\n  background: #e5f2ff;\n  border-left: 3px solid #2473a8;\n  border-radius: 2px;\n  font: 600 12px/1.35 Arial, sans-serif;\n  white-space: normal;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-playback {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  white-space: nowrap;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-playback label {\n  font-weight: bold;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-playback select {\n  width: 90px;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-classic-status {\n  grid-column: 1 / -1;\n  min-height: 16px;\n  margin: -2px 0 0;\n  color: #555;\n  font-size: 11px;\n}\n\nhtml.chmi-aladin-classic .model-wrapper {\n  position: relative;\n  min-height: min(280px, var(--chmi-aladin-available-height, 70vh));\n  overflow: hidden !important;\n  background: #dce8ed;\n  border: 1px solid #8a9ca4;\n}\n\nhtml.chmi-aladin-classic #loadingDiv {\n  z-index: 5;\n  background: rgb(255 255 255 / 88%) !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid {\n  box-sizing: border-box;\n  display: block !important;\n  width: 100% !important;\n  max-width: none !important;\n  height: auto !important;\n  max-height: var(--chmi-aladin-available-height, 70vh);\n  padding: 0 !important;\n  overflow: hidden !important;\n  scroll-behavior: auto !important;\n  touch-action: pan-x;\n}\n\nhtml.chmi-aladin-classic #modelGrid > .time-row {\n  display: none !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid > .chmi-aladin-classic-time-row.is-active {\n  display: grid !important;\n  align-items: start;\n  gap: 2px;\n  width: 100% !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid > .chmi-aladin-classic-header-row {\n  display: none !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-cell {\n  box-sizing: border-box;\n  order: var(--chmi-aladin-product-order, 9);\n  width: auto !important;\n  min-width: 0 !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-header {\n  min-height: 31px;\n  padding: 6px 4px !important;\n  color: #fff !important;\n  background: #2e3a87 !important;\n  border: 0 !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  text-align: center;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-cell[data-param=\"T\"] {\n  --chmi-aladin-product-order: 1;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-cell[data-param=\"C\"] {\n  --chmi-aladin-product-order: 2;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-cell[data-param=\"R3\"] {\n  --chmi-aladin-product-order: 3;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-cell[data-param=\"W\"] {\n  --chmi-aladin-product-order: 4;\n}\n\nhtml.chmi-aladin-classic #modelGrid .map-bg-wrapper,\nhtml.chmi-aladin-classic #modelGrid a[data-lightbox] {\n  display: block;\n  width: 100% !important;\n}\n\nhtml.chmi-aladin-classic #modelGrid .mapImg {\n  display: block;\n  width: 100% !important;\n  max-width: 100% !important;\n  height: auto !important;\n  max-height: calc(var(--chmi-aladin-available-height, 70vh) - 35px);\n  margin: 0 !important;\n  object-fit: contain;\n  object-position: top center;\n}\n\nhtml.chmi-aladin-classic #modelGrid .mapImgTimeLabel {\n  z-index: 1;\n  top: auto !important;\n  bottom: 0 !important;\n  max-width: calc(100% - 6px);\n  padding: 2px 4px !important;\n  overflow: hidden;\n  font: bold 11px/1.2 Arial, Helvetica, sans-serif !important;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml.chmi-aladin-classic #modelGrid > .chmi-aladin-classic-time-row.is-active {\n  grid-template-columns: repeat(var(--chmi-aladin-columns, 4), var(--chmi-aladin-map-width, 1fr));\n  grid-auto-flow: row !important;\n  justify-content: center;\n}\n\nhtml.chmi-aladin-classic #modelGrid .mapImg {\n  max-height: none;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-cell-title {\n  height: 22px;\n  box-sizing: border-box;\n  padding: 3px;\n  color: #fff;\n  background: #2e3a87;\n  font: bold 12px/16px Arial, sans-serif;\n  text-align: center;\n}\n\nhtml.chmi-aladin-classic .chmi-aladin-empty {\n  aspect-ratio: 700 / 442;\n  height: calc(var(--chmi-aladin-map-width, 700px) * var(--chmi-aladin-map-ratio, 0.631429));\n  min-height: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 4px;\n  box-sizing: border-box;\n  background: #f2f6f8;\n  color: #354d59;\n  text-align: center;\n  font: clamp(9px, calc(var(--chmi-aladin-map-width, 700px) / 12), 13px)/1.3 Arial, sans-serif;\n}\n\n@media (max-width: 1050px) {\n  html.chmi-aladin-classic #chmi-aladin-classic-controls {\n    grid-template-columns: 1fr 1fr;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-products {\n    grid-column: 1 / -1;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-time-control {\n    justify-content: flex-end;\n  }\n}\n\n@media (max-width: 760px) {\n  html.chmi-aladin-classic .mainWrapper {\n    width: 100% !important;\n    margin: 0 !important;\n    border-radius: 0;\n  }\n\n  html.chmi-aladin-classic #chmi-aladin-classic-controls {\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-products {\n    align-self: stretch;\n  }\n\n  html.chmi-aladin-classic #chmi-aladin-classic-product-options {\n    grid-template-columns: 1fr;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-run-control,\n  html.chmi-aladin-classic .chmi-aladin-classic-time-control {\n    justify-content: space-between;\n    flex-wrap: wrap;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-time-control small {\n    width: 100%;\n  }\n\n  html.chmi-aladin-classic #modelGrid .mapImg {\n    max-height: none;\n  }\n}\n\n@media (max-width: 440px) {\n  html.chmi-aladin-classic #chmi-aladin-classic-brand {\n    align-items: center;\n  }\n\n  html.chmi-aladin-classic #chmi-aladin-classic-brand > div {\n    display: block;\n  }\n\n  html.chmi-aladin-classic #chmi-aladin-classic-brand span {\n    display: block;\n  }\n\n  html.chmi-aladin-classic .chmi-aladin-classic-time-control > div {\n    width: 100%;\n  }\n\n  html.chmi-aladin-classic #chmi-aladin-classic-time {\n    flex: 1;\n    min-width: 0;\n  }\n}\n\n/* Familiar intranet shell; no archive data or destructive DOM replacement. */\nhtml.chmi-classic-portal-active { background: #8bc6da !important; }\nhtml.chmi-classic-portal-active body { margin: 0 !important; padding: 6px !important; min-width: 0 !important; background: linear-gradient(#8bc6da,#d7eaf0) !important; }\nhtml.chmi-classic-portal-active body > :not(#chmi-classic-portal):not(script):not(style) { display: none !important; }\n#chmi-classic-portal, #chmi-classic-portal * { box-sizing: border-box; }\n#chmi-classic-portal {\n  --ink: #123477; --edge: #afbbc6;\n  display: flex; flex-direction: column; width: 100%; max-width: none;\n  height: calc(100dvh - 12px); min-height: 480px; margin: 0; padding: 0;\n  color: var(--ink); background: #fff; border: 1px solid #7294a2; border-radius: 6px;\n  overflow: hidden; box-shadow: 0 2px 5px #31566a55; font: 12px/1.3 Arial, Helvetica, sans-serif;\n}\n#chmi-classic-portal [hidden] { display: none !important; }\n#chmi-classic-portal a { color: var(--ink); text-decoration: none; }\n#chmi-classic-portal a:hover { text-decoration: underline; }\n#chmi-classic-portal :focus-visible { outline: 2px solid #d57900; outline-offset: 2px; }\n#chmi-classic-portal button { cursor: pointer; font-family: Arial, Helvetica, sans-serif; }\n#chmi-classic-portal .chmi-portal-topbar { display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; flex: 0 0 auto; min-height: 32px; gap: 3px 8px; padding: 3px 6px; background: linear-gradient(#fff,#dce1e7); border-bottom: 1px solid var(--edge); }\n#chmi-classic-portal .chmi-portal-utilities { display: flex; flex-direction: row; gap: 10px; align-items: center; margin-left: auto; }\n#chmi-classic-portal a.chmi-portal-warning-link { color: #a82020; font-size: 10px; font-weight: bold; white-space: nowrap; }\n#chmi-classic-portal .chmi-portal-button, #chmi-portal-restore { border: 1px solid #8eb4c4; border-radius: 2px; padding: 4px 9px; background: linear-gradient(#fff,#e6f3f7); color: #17577a; font: 12px/1.2 Arial, sans-serif; }\n#chmi-portal-restore { position: fixed; right: 12px; bottom: 12px; z-index: 2147483647; cursor: pointer; }\n#chmi-classic-portal .chmi-portal-primary { display: flex; flex-direction: row; flex-wrap: wrap; flex: 1 1 auto; border: 0; background: transparent; }\n#chmi-classic-portal .chmi-portal-primary a { flex: 1 1 auto; padding: 6px 8px; border-right: 1px solid #c3c5cd; text-align: center; color: #222; font-size: 10px; font-weight: 700; }\n#chmi-classic-portal .chmi-portal-main { display: flex; flex: 1; flex-direction: column; min-height: 0; width: auto; max-width: none; margin: 3px 4px 4px; padding: 0; border: 1px solid var(--edge); background: #fff; }\n#chmi-classic-portal .chmi-portal-tabs { display: flex; flex-direction: row; justify-content: flex-start; flex: 0 0 auto; align-items: center; border: 0; }\n#chmi-classic-portal .chmi-portal-tab { min-width: 80px; height: 25px; margin: 0; padding: 3px 9px; border: 1px solid #b7c1c8; border-radius: 3px; background: linear-gradient(#fff,#dfe4e5); color: var(--ink); font-size: 11px; font-weight: 700; text-align: left; }\n#chmi-classic-portal .chmi-portal-tab[aria-selected=\"true\"] { color: #fff; background: linear-gradient(#77d0e5,#237ba1 75%,#a5d7e6); }\n#chmi-classic-portal .chmi-portal-workspace { display: flex; flex: 1; flex-direction: column; min-height: 280px; }\n#chmi-classic-portal .chmi-portal-app-toolbar { display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 4px 12px; flex: 0 0 auto; min-height: 29px; padding: 3px 6px; background: #edf4f0; border-bottom: 1px solid #c0c8c2; }\n#chmi-classic-portal .chmi-portal-app-title { margin: 0; padding: 0; color: var(--ink); font: bold 12px/1.3 Verdana, sans-serif; }\n#chmi-classic-portal .chmi-portal-status { margin-left: auto; color: #56676a; font-size: 10px; }\n#chmi-classic-portal .chmi-portal-stage { position: relative; display: flex; flex: 1; min-height: 0; background: #fff; }\n#chmi-classic-portal .chmi-portal-app-frame { display: block; width: 100%; height: 100%; min-height: 0; border: 0; }\n#chmi-classic-portal .chmi-portal-notice { position: absolute; left: 8px; right: 8px; bottom: 8px; z-index: 2; padding: 10px; border: 1px solid #b5a978; background: #fffbea; color: #594d20; font-size: 12px; }\n#chmi-classic-portal .chmi-portal-notice p { margin: 0 0 6px; font: inherit; }\n#chmi-classic-portal .chmi-portal-directory { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 0 10px; flex: 0 0 auto; padding: 6px 10px; border-top: 1px solid var(--edge); background: #f8fbfd; }\n#chmi-classic-portal .chmi-portal-link { display: block; padding: 1px 0; font: bold 10px/1.3 Verdana, Arial, sans-serif; overflow-wrap: anywhere; }\n#chmi-classic-portal .chmi-portal-link[aria-current] { color: #006789; text-decoration: underline; }\n#chmi-classic-portal .is-unavailable { color: #a62323; text-decoration: line-through; cursor: help; }\n#chmi-classic-portal .chmi-portal-extra { display: flex; flex-wrap: wrap; gap: 4px 18px; padding: 4px 10px; border-top: 1px solid #dce5e8; }\n#chmi-classic-portal.chmi-portal-expanded { position: fixed; inset: 0; z-index: 2147483600; height: 100dvh; min-height: 0; border-radius: 0; }\n#chmi-classic-portal.chmi-portal-expanded > :not(.chmi-portal-main), #chmi-classic-portal.chmi-portal-expanded .chmi-portal-tabs, #chmi-classic-portal.chmi-portal-expanded .chmi-portal-directory, #chmi-classic-portal.chmi-portal-expanded .chmi-portal-extra { display: none; }\n#chmi-classic-portal.chmi-portal-expanded .chmi-portal-main { margin: 0; border: 0; }\n@media (min-width: 1100px) and (min-height: 850px) {\n  #chmi-classic-portal .chmi-portal-link { font-size: 11px; }\n}\n@media (max-width: 760px) {\n  #chmi-classic-portal { height: auto; min-height: calc(100dvh - 12px); }\n  #chmi-classic-portal .chmi-portal-main { margin: 0 3px 3px; }\n  #chmi-classic-portal .chmi-portal-workspace { flex: none; height: max(420px, 68dvh); }\n  #chmi-classic-portal .chmi-portal-app-toolbar { flex-wrap: wrap; gap: 4px 8px; }\n  #chmi-classic-portal .chmi-portal-status { order: 3; flex-basis: 100%; }\n  #chmi-classic-portal .chmi-portal-app-toolbar button { margin-left: auto; }\n  #chmi-classic-portal .chmi-portal-directory { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }\n  #chmi-classic-portal .chmi-portal-link { padding: 4px 0; }\n  #chmi-classic-portal.chmi-portal-expanded .chmi-portal-workspace { height: 100%; flex: 1; }\n}\n\n/* VODA + OVZDUŠÍ – živé mapy ČHMÚ v kompaktním old-portal obalu. */\nhtml.chmi-hydro-air-classic,\nhtml.chmi-hydro-air-classic body {\n  width: 100%;\n  min-height: 100%;\n  margin: 0 !important;\n  padding: 0 !important;\n  background: #fff !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 12px !important;\n  overflow: hidden !important;\n}\nhtml.chmi-hydro-air-classic header#chmu-header,\nhtml.chmi-hydro-air-classic .lfr-layout-structure-item-chmi---breadcrumbs,\nhtml.chmi-hydro-air-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-hydro-air-classic footer,\nhtml.chmi-hydro-air-classic #footer,\nhtml.chmi-hydro-air-classic #footerBottom,\nhtml.chmi-hydro-air-classic .material-scrolltop {\n  display: none !important;\n}\nhtml.chmi-hydro-air-classic main {\n  box-sizing: border-box;\n  width: calc(100vw - 8px) !important;\n  max-width: none !important;\n  height: calc(100dvh - 8px) !important;\n  min-height: 0 !important;\n  margin: 4px auto !important;\n  padding: 0 5px 5px !important;\n  background: #fff !important;\n  border: 1px solid #8d8d8d !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  overflow-x: hidden !important;\n  overflow-y: hidden !important;\n}\n/* Keep the native, live map component in place; only remove surrounding\n   Liferay article blocks from this compact viewing mode. */\nhtml.chmi-hydro-air-classic .chmi-hydro-air-content > :not(.lfr-layout-structure-item-chmimapcomponent) {\n  display: none !important;\n}\nhtml.chmi-hydro-air-classic .chmi-hydro-air-content,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-content > .lfr-layout-structure-item-chmimapcomponent {\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  width: calc(100% + 10px);\n  min-height: 30px;\n  margin: 0 -5px 5px;\n  padding: 4px 6px;\n  color: #123477;\n  background: linear-gradient(#fff, #e9f2f5);\n  border-bottom: 1px solid #8faab6;\n  font: 12px/1.2 Verdana, Arial, sans-serif;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand strong {\n  font-size: 12px;\n  white-space: nowrap;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav {\n  display: flex;\n  align-items: stretch;\n  gap: 2px;\n  min-width: 0;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav a {\n  display: block;\n  padding: 4px 8px;\n  color: #123477;\n  background: linear-gradient(#fff, #dfe8eb);\n  border: 1px solid #a8bdc6;\n  border-radius: 3px 3px 0 0;\n  font: bold 10px/1.1 Verdana, Arial, sans-serif;\n  text-decoration: none;\n  white-space: nowrap;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav a[aria-current=\"page\"] {\n  color: #fff;\n  background: linear-gradient(#79c7d7, #2579a3);\n  border-color: #397ca0;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand[data-kind=\"air\"] nav a[aria-current=\"page\"] {\n  background: linear-gradient(#a3d66d, #5a9c32);\n  border-color: #599645;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand > span {\n  color: #666;\n  font-size: 11px;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand > a {\n  margin-left: auto;\n  color: #174b79;\n  white-space: nowrap;\n  text-decoration: underline;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand a:focus-visible,\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand button:focus-visible {\n  outline: 2px solid #d57900;\n  outline-offset: 1px;\n}\nhtml.chmi-hydro-air-classic #chmi-hydro-air-classic-brand > button {\n  padding: 2px 6px;\n  color: #174b79;\n  background: #f4f4f4;\n  border: 1px solid #999;\n  border-radius: 0;\n  font: 11px Arial, sans-serif;\n  cursor: pointer;\n}\nhtml.chmi-hydro-air-classic #chmu-map-container,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  height: var(--chmi-hydro-air-fit-height, calc(100dvh - 150px)) !important;\n  min-height: 0 !important;\n  background: #d9d9d9;\n  border: 1px solid #777 !important;\n  border-radius: 0 !important;\n  overflow: hidden !important;\n}\nhtml.chmi-hydro-air-classic #chmu-map-container .leaflet-left,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-map-host .leaflet-left { left: 6px !important; }\nhtml.chmi-hydro-air-classic #chmu-map-container .leaflet-right,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-map-host .leaflet-right { right: 6px !important; }\nhtml.chmi-hydro-air-classic #chmu-map-container .maplibregl-ctrl-top-left,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-map-host .maplibregl-ctrl-top-left { top: 6px !important; left: 6px !important; }\nhtml.chmi-hydro-air-classic #chmu-map-container .maplibregl-ctrl-top-right,\nhtml.chmi-hydro-air-classic .chmi-hydro-air-map-host .maplibregl-ctrl-top-right { top: 6px !important; right: 6px !important; }\nhtml.chmi-classic-embedded.chmi-hydro-air-classic,\nhtml.chmi-classic-embedded.chmi-hydro-air-classic body {\n  height: 100% !important;\n  overflow-x: hidden !important;\n}\nhtml.chmi-classic-embedded.chmi-hydro-air-classic main {\n  width: 100% !important;\n  min-height: 100dvh !important;\n  margin: 0 !important;\n  border: 0 !important;\n}\nhtml.chmi-classic-embedded.chmi-hydro-air-classic #chmi-hydro-air-classic-brand {\n  min-height: 24px;\n  margin-bottom: 4px;\n  padding-top: 3px;\n  padding-bottom: 3px;\n}\nhtml.chmi-classic-embedded.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav {\n  display: none;\n}\n@media (max-width: 700px) {\n  html.chmi-hydro-air-classic main { width: 100% !important; margin: 0 !important; border-width: 0 !important; }\n  html.chmi-hydro-air-classic #chmi-hydro-air-classic-brand { flex-wrap: wrap; gap: 4px 6px; }\n  html.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav { order: 3; width: 100%; }\n  html.chmi-hydro-air-classic #chmi-hydro-air-classic-brand nav a { flex: 1; text-align: center; }\n  html.chmi-hydro-air-classic #chmi-hydro-air-classic-brand > span { display: none; }\n  html.chmi-hydro-air-classic #chmi-hydro-air-classic-brand > a { margin-left: auto; }\n}\n\n/* The live application owns this frame; the parent owns all portal chrome. */\nhtml.chmi-classic-embedded,\nhtml.chmi-classic-embedded body {\n  margin: 0 !important;\n  padding: 0 !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  background: #fff !important;\n}\nhtml.chmi-classic-embedded #chmi-radar-classic-brand,\nhtml.chmi-classic-embedded #chmi-satellite-classic-brand,\nhtml.chmi-classic-embedded #chmi-hub-classic-brand,\nhtml.chmi-classic-embedded #chmi-aladin-classic-brand,\nhtml.chmi-classic-embedded #chmi-catalog-classic-brand {\n  display: none !important;\n}\nhtml.chmi-classic-embedded.chmi-sonde-classic #chmi-sonde-classic-brand {\n  display: none !important;\n}\nhtml.chmi-classic-embedded.chmi-sonde-classic #chmi-sonde-workspace {\n  inset: 0;\n  border: 0;\n  grid-template-rows: auto minmax(0, 1fr);\n}\nhtml.chmi-classic-embedded #div_container_menu {\n  box-sizing: border-box !important;\n}\nhtml.chmi-classic-embedded #div_container_menu > * {\n  box-sizing: border-box !important;\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\nhtml.chmi-classic-embedded.chmi-radar-classic #wrapper,\nhtml.chmi-classic-embedded.chmi-satellite-classic-live #wrapper {\n  width: 100% !important;\n  max-width: none !important;\n  height: 100dvh !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n}\nhtml.chmi-classic-embedded .mainWrapper {\n  border: 0 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  padding: 4px !important;\n}\nhtml.chmi-classic-embedded #chmi-radar-classic-toolbar {\n  max-width: calc(100% - 70px);\n}\nhtml.chmi-classic-embedded #chmi-radar-classic-toolbar .chmi-radar-classic-options {\n  flex-wrap: wrap;\n}\nhtml.chmi-classic-embedded.chmi-satellite-classic-portal main,\nhtml.chmi-classic-embedded.chmi-hub-classic main {\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 4px !important;\n  border: 0 !important;\n  box-shadow: none !important;\n}\n@media (min-width: 761px) {\n  html.chmi-classic-embedded.chmi-radar-classic,\n  html.chmi-classic-embedded.chmi-radar-classic body,\n  html.chmi-classic-embedded.chmi-satellite-classic-live,\n  html.chmi-classic-embedded.chmi-satellite-classic-live body {\n    height: 100% !important;\n    overflow: hidden !important;\n  }\n}\n\n/* Preserve the official live map, filters, camera cards and image timeline. */\nhtml.chmi-webcams-classic #chmi-catalog-classic-brand {\n  flex-direction: row !important;\n  flex-wrap: wrap !important;\n  height: auto !important;\n  min-height: 38px !important;\n}\nhtml.chmi-webcams-classic #chmi-catalog-classic-brand .chmi-classic-navigation {\n  flex: 1 1 auto !important;\n  flex-direction: row !important;\n  height: auto !important;\n}\nhtml.chmi-webcams-classic #chmi-catalog-classic-brand .chmi-catalog-new-look {\n  flex: 0 0 auto !important;\n}\n\nhtml.chmi-webcams-overview main {\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  overflow: hidden !important;\n}\nhtml.chmi-webcams-overview .chmi-webcams-workspace {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1fr) clamp(290px, 25vw, 390px);\n  grid-template-rows: auto minmax(0, 1fr) auto;\n  gap: 5px 8px;\n  height: calc(100% - 47px);\n  min-height: 0;\n}\nhtml.chmi-webcams-overview .chmi-webcams-workspace > .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-webcams-overview .chmi-webcams-workspace > .lfr-layout-structure-item-chmi---menu-z-lo-ky {\n  display: none !important;\n}\nhtml.chmi-webcams-overview .chmi-webcams-workspace > .lfr-layout-structure-item-header {\n  grid-column: 1 / -1;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-webcams-overview .chmi-webcams-workspace h1 {\n  margin: 2px 0 4px !important;\n  color: #174b79 !important;\n  font: bold 18px Arial, sans-serif !important;\n}\nhtml.chmi-webcams-overview .chmi-webcams-map-block,\nhtml.chmi-webcams-overview .chmi-webcams-list-block {\n  min-width: 0 !important;\n  min-height: 0 !important;\n  height: 100% !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n  border: 1px solid #8caec0;\n  background: #fff;\n}\nhtml.chmi-webcams-overview .chmi-webcams-map-block { grid-column: 1; grid-row: 2; }\nhtml.chmi-webcams-overview .chmi-webcams-list-block { grid-column: 2; grid-row: 2; }\nhtml.chmi-webcams-overview .chmi-webcams-map-block > div,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .portlet-boundary,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .portlet,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .portlet-content,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .portlet-content-container,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .portlet-body,\nhtml.chmi-webcams-overview .chmi-webcams-map-block .d-flex,\nhtml.chmi-webcams-overview #chmu-map-container,\nhtml.chmi-webcams-overview #chmu-map-container .chmu-map-component,\nhtml.chmi-webcams-overview #chmu-map-container .chmu-map-query-container,\nhtml.chmi-webcams-overview #chmu-map-container .chmu--map--container,\nhtml.chmi-webcams-overview .chmi-webcams-list-block > div,\nhtml.chmi-webcams-overview .chmi-webcams-list-block .portlet-boundary,\nhtml.chmi-webcams-overview .chmi-webcams-list-block .portlet,\nhtml.chmi-webcams-overview .chmi-webcams-list-block .portlet-content,\nhtml.chmi-webcams-overview .chmi-webcams-list-block .portlet-content-container,\nhtml.chmi-webcams-overview .chmi-webcams-list-block .portlet-body {\n  height: 100% !important;\n  min-height: 0 !important;\n}\nhtml.chmi-webcams-overview [id^=\"chmi-signpost-container-\"] {\n  display: flex !important;\n  flex-direction: column !important;\n  height: 100% !important;\n  min-height: 0 !important;\n  padding: 5px;\n}\nhtml.chmi-webcams-overview [id^=\"chmi-signpost-container-\"] > .signpost_results {\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow-y: auto;\n  grid-template-columns: minmax(0, 1fr) !important;\n  align-content: start;\n  gap: 3px !important;\n}\nhtml.chmi-webcams-overview [id^=\"chmi-signpost-container-\"] > .signpost_results a {\n  display: flex !important;\n  flex-direction: row !important;\n  align-items: center;\n  gap: 6px;\n  width: 100%;\n  min-height: 66px;\n  height: auto !important;\n  padding: 3px !important;\n  color: #174b79 !important;\n  background: #f5fbff;\n  border: 1px solid #c4dae4;\n  font: bold 12px Arial, sans-serif !important;\n}\nhtml.chmi-webcams-overview [id^=\"chmi-signpost-container-\"] > .signpost_results a img {\n  flex: 0 0 88px;\n  width: 88px !important;\n  height: 60px !important;\n  object-fit: cover;\n}\nhtml.chmi-webcams-overview [id^=\"chmi-signpost-container-\"] > .chmi-pagination {\n  flex: 0 0 auto;\n  margin: 2px 0 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-webcams-overview .chmi-webcams-workspace > .lfr-layout-structure-item-text {\n  grid-column: 1 / -1;\n  grid-row: 3;\n  min-height: 0;\n  font-size: 11px;\n}\n\nhtml.chmi-webcams-detail header#chmu-header,\nhtml.chmi-webcams-detail nav[aria-label*=\"Nach\"],\nhtml.chmi-webcams-detail .menu-bookmarks,\nhtml.chmi-webcams-detail footer,\nhtml.chmi-webcams-detail #footer,\nhtml.chmi-webcams-detail #footerBottom { display: none !important; }\nhtml.chmi-webcams-detail main {\n  width: calc(100% - 12px) !important;\n  max-width: none !important;\n  height: calc(100dvh - 12px) !important;\n  min-height: 0 !important;\n  margin: 6px auto !important;\n  padding: 4px !important;\n  overflow: hidden !important;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  box-shadow: 0 2px 6px rgb(40 83 101 / 18%);\n}\nhtml.chmi-webcams-detail main h1 { margin: 2px 0 5px !important; font: bold 18px Arial, sans-serif !important; color: #174b79 !important; }\nhtml.chmi-webcams-detail .chmi-webcams-detail-workspace {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1fr) clamp(290px, 25vw, 390px);\n  grid-template-rows: auto minmax(0, 1fr) auto;\n  gap: 5px 8px;\n  height: calc(100% - 50px);\n  min-height: 0;\n}\nhtml.chmi-webcams-detail .chmi-webcams-detail-workspace > .lfr-layout-structure-item-header { grid-column: 1 / -1; margin: 0 !important; padding: 0 !important; }\nhtml.chmi-webcams-detail .chmi-webcams-detail-workspace > .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-webcams-detail .chmi-webcams-detail-workspace > .lfr-layout-structure-item-text { display: none !important; }\nhtml.chmi-webcams-detail .chmi-webcams-player-block { grid-column: 1; grid-row: 2; }\nhtml.chmi-webcams-detail .chmi-webcams-list-block { grid-column: 2; grid-row: 2; }\nhtml.chmi-webcams-detail .chmi-webcams-detail-workspace > .lfr-layout-structure-item-chmi---cta { grid-column: 1 / -1; grid-row: 3; margin: 0 !important; padding: 0 !important; }\nhtml.chmi-webcams-detail .chmi-webcams-player-block,\nhtml.chmi-webcams-detail .chmi-webcams-list-block { min-width: 0 !important; min-height: 0 !important; height: 100% !important; overflow: hidden !important; border: 1px solid #8caec0; }\nhtml.chmi-webcams-detail .chmi-webcams-player-block > div,\nhtml.chmi-webcams-detail .chmi-webcams-player-block .portlet-boundary,\nhtml.chmi-webcams-detail .chmi-webcams-player-block .portlet,\nhtml.chmi-webcams-detail .chmi-webcams-player-block .portlet-content,\nhtml.chmi-webcams-detail .chmi-webcams-player-block .portlet-content-container,\nhtml.chmi-webcams-detail .chmi-webcams-player-block .portlet-body,\nhtml.chmi-webcams-detail .chmi-webcams-list-block > div,\nhtml.chmi-webcams-detail .chmi-webcams-list-block .portlet-boundary,\nhtml.chmi-webcams-detail .chmi-webcams-list-block .portlet,\nhtml.chmi-webcams-detail .chmi-webcams-list-block .portlet-content,\nhtml.chmi-webcams-detail .chmi-webcams-list-block .portlet-content-container,\nhtml.chmi-webcams-detail .chmi-webcams-list-block .portlet-body { height: 100% !important; min-height: 0 !important; }\nhtml.chmi-webcams-detail #chmi-playabledata { display: flex !important; flex-direction: column !important; width: 100% !important; height: 100% !important; min-height: 0 !important; }\nhtml.chmi-webcams-detail #chmi-playabledata .chmi-timeline { flex: 0 0 auto; }\nhtml.chmi-webcams-detail #chmi-playabledata > div:last-child { flex: 1 1 auto; min-height: 0; }\nhtml.chmi-webcams-detail .playabledata-content-container { width: 100% !important; height: 100% !important; min-height: 0 !important; overflow: hidden; background: #edf6fa; }\nhtml.chmi-webcams-detail .playabledata-content-container .chmi-playableimage-img { width: 100% !important; height: 100% !important; max-height: 100% !important; object-fit: contain !important; }\nhtml.chmi-webcams-detail [id^=\"chmi-signpost-container-\"] { display: flex !important; flex-direction: column !important; height: 100% !important; min-height: 0 !important; padding: 5px; }\nhtml.chmi-webcams-detail [id^=\"chmi-signpost-container-\"] > .signpost_results { flex: 1 1 auto; min-height: 0; overflow-y: auto; grid-template-columns: minmax(0, 1fr) !important; align-content: start; gap: 3px !important; }\nhtml.chmi-webcams-detail [id^=\"chmi-signpost-container-\"] > .signpost_results a { display: flex !important; flex-direction: row !important; align-items: center; gap: 6px; width: 100%; min-height: 66px; height: auto !important; padding: 3px !important; color: #174b79 !important; background: #f5fbff; border: 1px solid #c4dae4; font: bold 12px Arial, sans-serif !important; }\nhtml.chmi-webcams-detail [id^=\"chmi-signpost-container-\"] > .signpost_results a img { flex: 0 0 88px; width: 88px !important; height: 60px !important; object-fit: cover; }\nhtml.chmi-webcams-detail [id^=\"chmi-signpost-container-\"] > .chmi-pagination { flex: 0 0 auto; margin: 2px 0 0 !important; padding: 0 !important; }\nhtml.chmi-classic-embedded.chmi-webcams-overview main { width: 100% !important; height: 100dvh !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }\nhtml.chmi-classic-embedded.chmi-webcams-overview .chmi-webcams-workspace { height: 100%; }\nhtml.chmi-classic-embedded.chmi-webcams-detail main { width: 100% !important; height: 100dvh !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; }\nhtml.chmi-classic-embedded.chmi-webcams-detail .chmi-webcams-detail-workspace { height: 100%; }\nhtml.chmi-classic-embedded.chmi-webcams-classic header#chmu-header,\nhtml.chmi-classic-embedded.chmi-webcams-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-classic-embedded.chmi-webcams-classic .menu-bookmarks,\nhtml.chmi-classic-embedded.chmi-webcams-classic footer,\nhtml.chmi-classic-embedded.chmi-webcams-classic #footer,\nhtml.chmi-classic-embedded.chmi-webcams-classic #footerBottom { display: none !important; }\nhtml.chmi-classic-embedded.chmi-webcams-detail #chmi-legacy-target-bar { display: none !important; }\n\n@media (max-width: 850px) {\n  html.chmi-webcams-overview main { height: auto !important; overflow: visible !important; }\n  html.chmi-webcams-overview .chmi-webcams-workspace { display: flex !important; flex-direction: column; height: auto !important; }\n  html.chmi-webcams-overview .chmi-webcams-map-block { height: 52dvh !important; min-height: 300px !important; }\n  html.chmi-webcams-overview .chmi-webcams-list-block { height: 35dvh !important; min-height: 280px !important; }\n  html.chmi-webcams-overview .chmi-webcams-workspace > .lfr-layout-structure-item-text { max-height: none; order: 4; }\n  html.chmi-webcams-detail main { height: auto !important; overflow: visible !important; }\n  html.chmi-webcams-detail .chmi-webcams-detail-workspace { display: flex !important; flex-direction: column; height: auto !important; }\n  html.chmi-webcams-detail .chmi-webcams-player-block { height: 58dvh !important; min-height: 330px !important; }\n  html.chmi-webcams-detail .chmi-webcams-list-block { height: 30dvh !important; min-height: 260px !important; }\n}\n\n/* The historic selector sits above the live ČHMÚ graph and hourly tables. */\nhtml.chmi-meteogram-classic,\nhtml.chmi-meteogram-classic body { height: 100% !important; overflow: hidden !important; }\nhtml.chmi-meteogram-classic header#chmu-header,\nhtml.chmi-meteogram-classic .lfr-layout-structure-item-chmi---breadcrumbs,\nhtml.chmi-meteogram-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-meteogram-classic footer,\nhtml.chmi-meteogram-classic #footer,\nhtml.chmi-meteogram-classic #footerBottom { display: none !important; }\nhtml.chmi-meteogram-classic main {\n  width: 100% !important;\n  max-width: none !important;\n  height: 100dvh !important;\n  min-height: 0 !important;\n  overflow: hidden !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1fr) minmax(260px, 32%);\n  grid-template-rows: auto auto minmax(0, 1fr) minmax(150px, 35dvh);\n  gap: 5px 8px;\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  min-height: 0;\n  padding: 5px;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-header {\n  grid-column: 1 / -1;\n  grid-row: 1;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-header::before {\n  display: block;\n  margin-bottom: 4px;\n  padding: 5px 8px;\n  color: #fff;\n  background: #176ea2;\n  content: \"Aladin – Meteogramy\";\n  font: bold 14px Arial, sans-serif;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace h1,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace h2 {\n  margin: 0 0 2px !important;\n  color: #174b79 !important;\n  font: bold 16px Arial, sans-serif !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace h2 { font-size: 11px !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-recent {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 3px 5px;\n  margin-top: 3px;\n  color: #174b79;\n  font: 11px Arial, sans-serif;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-recent a {\n  display: inline-block;\n  padding: 2px 6px;\n  border: 1px solid #8fb9ca;\n  color: #174b79;\n  background: #f4faff;\n  text-decoration: none;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-recent a[aria-current=\"page\"] {\n  color: #fff;\n  background: #176ea2;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-recent a:hover,\nhtml.chmi-meteogram-classic .chmi-meteogram-recent a:focus-visible {\n  outline: 2px solid #176ea2;\n  outline-offset: 1px;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmialertscomponent,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmidynamiccta {\n  display: none !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmi---menu-z-lo-ky {\n  grid-column: 1;\n  grid-row: 2;\n  min-width: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks {\n  display: block !important;\n  height: auto !important;\n  overflow: visible !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks ul {\n  display: flex !important;\n  flex-wrap: wrap;\n  gap: 3px;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: visible !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks .journal-content-article { display: contents !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li {\n  flex: 0 0 auto !important;\n  width: auto !important;\n  height: auto !important;\n  min-height: 28px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 1px solid #8fb9ca;\n  background: #f4faff;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li a:not(.full-cover-link) {\n  position: static !important;\n  display: block !important;\n  width: auto !important;\n  height: auto !important;\n  padding: 5px 8px !important;\n  color: #174b79 !important;\n  font: bold 12px Arial, sans-serif !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li a.full-cover-link,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li img,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li small,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li big,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks-arrow-left,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks-arrow-right { display: none !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .menu-bookmarks li p { margin: 0 !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmi---background-block {\n  grid-column: 2;\n  grid-row: 2;\n  min-width: 0;\n  min-height: 0;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  background: none !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .chmu-bg-block { padding: 0 !important; background: none !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .chmu-bg-block > img,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .chmu-bg-block .lfr-layout-structure-item-text { display: none !important; }\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .poi-search_container,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .chmi-search-container,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace input.chmi-search {\n  width: 100% !important;\n  max-width: none !important;\n  height: 29px !important;\n  min-height: 29px !important;\n  margin: 0 !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmigraph {\n  grid-column: 1 / -1;\n  grid-row: 3;\n  min-width: 0;\n  min-height: 0;\n  height: 100% !important;\n  margin: 0 !important;\n  padding: 4px !important;\n  overflow: hidden !important;\n  border: 1px solid #8caec0;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmigraph > div,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .portlet-boundary,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .portlet,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .portlet-content,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .portlet-content-container,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .portlet-body,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .overflow-auto,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace [id*=\"ChmiGraph\"][id$=\"-chart-container\"] {\n  height: 100% !important;\n  min-height: 0 !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph .overflow-auto,\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace [id*=\"ChmiGraph\"][id$=\"-chart-container\"] {\n  max-width: 100% !important;\n  overflow: hidden !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-workspace .lfr-layout-structure-item-chmigraph canvas[id*=\"ChmiGraph\"] {\n  display: block;\n  width: 100% !important;\n  max-width: 100% !important;\n  height: auto !important;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-tables {\n  grid-column: 1 / -1;\n  grid-row: 4;\n  min-width: 0;\n  min-height: 0;\n  overflow: auto;\n  overscroll-behavior: contain;\n  border: 1px solid #8caec0;\n  background: #fff;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-tables-title {\n  position: sticky;\n  z-index: 2;\n  top: 0;\n  padding: 4px 7px;\n  color: #174b79;\n  background: #edf6fa;\n  border-bottom: 1px solid #8caec0;\n  font: bold 11px Arial, sans-serif;\n}\nhtml.chmi-meteogram-classic .chmi-meteogram-tables > .lfr-layout-structure-item-chmidynamictable {\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-classic-embedded.chmi-meteogram-classic main {\n  width: 100% !important;\n  height: 100dvh !important;\n  margin: 0 !important;\n  border: 0 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\nhtml.chmi-classic-embedded.chmi-meteogram-classic .chmi-meteogram-workspace { height: 100%; }\n@media (max-width: 760px) {\n  html.chmi-meteogram-classic .chmi-meteogram-workspace {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-rows: auto auto auto minmax(110px, 18dvh) minmax(135px, 1fr);\n  }\n  html.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmi---menu-z-lo-ky { grid-column: 1; grid-row: 2; }\n  html.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmi---background-block { grid-column: 1; grid-row: 3; }\n  html.chmi-meteogram-classic .chmi-meteogram-workspace > .lfr-layout-structure-item-chmigraph { grid-column: 1; grid-row: 4; }\n  html.chmi-meteogram-classic .chmi-meteogram-tables { grid-column: 1; grid-row: 5; }\n}\n\n/* Restyle the official, live ČHMÚ forecast map without replacing its geometry or data. */\nhtml.chmi-forecast-classic main h1 {\n  color: #174b79;\n  font: 700 clamp(1.45rem, 2.4vw, 2rem)/1.2 Arial, sans-serif;\n}\n\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent {\n  min-width: 0;\n  padding: 6px;\n  border: 1px solid #8caec0;\n  background: #edf6fa;\n}\n\nhtml.chmi-forecast-classic .image-map {\n  min-width: 0;\n  max-width: 100%;\n}\n\nhtml.chmi-forecast-classic #weather-switcher {\n  border: 1px solid #8caec0;\n  box-shadow: 0 1px 4px #174b7926;\n}\n\nhtml.chmi-forecast-classic #weather-switcher .weather-switcher__select {\n  color: #174b79;\n  font: 700 0.82rem/1.3 Arial, sans-serif;\n}\n\nhtml.chmi-forecast-classic #weather-switcher .weather-switcher__select:has(input:checked) {\n  background-color: #ffdb72;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-accessible {\n  margin-top: 6px;\n  padding: 8px 12px;\n  border: 1px solid #8caec0;\n  background: #fff;\n  color: #173b5a;\n  font: 0.9rem/1.4 Arial, sans-serif;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-accessible summary {\n  cursor: pointer;\n  font-weight: 700;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-periods {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 10px;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-periods button {\n  padding: 6px 9px;\n  border: 1px solid #8caec0;\n  border-radius: 3px;\n  background: #f5fbff;\n  color: #174b79;\n  cursor: pointer;\n  font: inherit;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-periods button[aria-pressed=\"true\"] {\n  border-color: #a27610;\n  background: #ffdb72;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-accessible :focus-visible {\n  outline: 3px solid #175d9c;\n  outline-offset: 2px;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-selected-period {\n  margin: 10px 0 4px;\n  font-weight: 700;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-cities {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));\n  gap: 4px 18px;\n  margin: 0;\n  padding-left: 22px;\n}\n\nhtml.chmi-forecast-classic .chmi-forecast-cities a { color: #174b79; }\n\n@media (max-width: 700px) {\n  html.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent { padding: 3px; }\n  html.chmi-forecast-classic .chmi-forecast-accessible { padding: 8px; }\n}\n\n/* Native live geometry/data in the familiar compact intranet workspace. */\nhtml.chmi-forecast-classic,\nhtml.chmi-forecast-classic body {\n  width: 100%; height: 100%; min-width: 0; margin: 0 !important;\n  padding: 0 !important; overflow: hidden !important; background: #89c5d4;\n}\nhtml.chmi-forecast-classic body > :not(#chmi-forecast-workspace) { display: none !important; }\nhtml.chmi-forecast-classic #chmi-forecast-workspace {\n  box-sizing: border-box; position: fixed; inset: 5px; min-width: 0; min-height: 0;\n  display: grid; grid-template-rows: auto minmax(0, 1fr) auto;\n  border: 1px solid #8aa9b8; background: #f2f6e7;\n  color: #123c69; font: 12px/1.35 Verdana, Arial, sans-serif;\n}\n.chmi-forecast-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 8px; border-bottom: 1px solid #a9bdc5; background: #f4fafc; }\n.chmi-forecast-header strong { font-size: 13px; }\n#chmi-forecast-workspace button { padding: 3px 7px; border: 1px solid #8aa9b8; border-radius: 2px; background: #eff7fb; color: #123c69; font: inherit; cursor: pointer; }\n.chmi-forecast-body { display: grid; grid-template-columns: minmax(0, 1fr) clamp(155px, 19vw, 220px); min-height: 0; min-width: 0; }\n.chmi-forecast-sidebar { min-height: 0; min-width: 0; overflow: auto; padding: 8px; border-left: 1px solid #a9bdc5; background: #e7eedc; }\n.chmi-forecast-sidebar > strong { display: block; text-align: center; }\n.chmi-forecast-days { display: grid; gap: 4px; margin: 8px 0; }\n.chmi-forecast-days a { padding: 5px; color: #143c75; text-decoration: none; border: 1px solid #afc1bd; background: #f8fbf0; }\n.chmi-forecast-days a[aria-current] { background: #cfe4ed; font-weight: bold; }\n.chmi-forecast-current { font-size: 11px; margin: 8px 0 0; }\n.chmi-forecast-day-grid { display: grid; margin: 6px 0; }\n.chmi-forecast-day { min-width: 0; padding: 6px 0; border-bottom: 1px solid #b8c6b0; }\n.chmi-forecast-day h3 { margin: 0 0 4px; color: #123c69; font: 700 12px/1.3 Verdana, Arial, sans-serif; text-align: center; }\n.chmi-forecast-day-cells { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }\n.chmi-forecast-day-cell { box-sizing: border-box; min-width: 0; display: grid; justify-items: center; align-content: start; gap: 3px; padding: 3px 1px; color: #122e54; text-decoration: none; font: 10px/1.2 Verdana, Arial, sans-serif; border: 1px solid transparent; }\n.chmi-forecast-day-cell img { width: 38px; height: 38px; object-fit: contain; }\n.chmi-forecast-day-cell strong { font-size: 11px; overflow-wrap: anywhere; }\n.chmi-forecast-day-cell small { max-width: 100%; font-size: 10px; color: #566657; overflow-wrap: anywhere; }\na.chmi-forecast-day-cell:hover, a.chmi-forecast-day-cell[aria-current] { border-color: #8ea8b4; background: #d7e6e9; }\nhtml.chmi-forecast-classic .image-map { min-height: 0 !important; min-width: 0 !important; height: 100% !important; width: 100% !important; margin: 0 !important; position: relative; background: #edf2dc; }\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent { min-height: 0; height: 100%; padding: 0; border: 0; }\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent > div,\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent .portlet-boundary,\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent .portlet,\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent .portlet-content,\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent .portlet-content-container,\nhtml.chmi-forecast-classic .lfr-layout-structure-item-chmiimagemapcomponent .portlet-body { min-height: 0; height: 100%; padding: 0; margin: 0; }\nhtml.chmi-forecast-classic .chmi-image-map__background { display: none !important; }\nhtml.chmi-forecast-classic #weather-mapContainer { height: 100% !important; width: 100% !important; min-height: 0 !important; padding: 10px !important; overflow: hidden; box-sizing: border-box; }\nhtml.chmi-forecast-classic #weather-map { width: 100% !important; height: 100% !important; max-height: 100%; overflow: visible; }\nhtml.chmi-forecast-classic #weather-map path { fill: #d9df9d; stroke: #537596; stroke-width: 2px; }\nhtml.chmi-forecast-classic #weather-map path:hover { fill: #ebde99; }\nhtml.chmi-forecast-classic #weather-map-details .weather-info-container.chmi-forecast-region-centered {\n  transform: translate(-50%, -50%);\n}\nhtml.chmi-forecast-classic .weather-info { background: #ffffffcf; box-shadow: none; font-family: Arial, sans-serif; }\nhtml.chmi-forecast-classic .weather-info__displayValue { font-family: Arial, sans-serif; font-weight: bold; color: #15253b; }\nhtml.chmi-forecast-classic .weather-info__county { background: transparent; color: #143c75; }\nhtml.chmi-forecast-classic .image-map__poi { display: none !important; }\nhtml.chmi-forecast-classic #weather-switcher { display: none !important; }\n.chmi-forecast-sidebar .chmi-forecast-periods { display: grid; }\n.chmi-forecast-sidebar .chmi-forecast-periods button { text-align: left; }\nhtml.chmi-forecast-classic #weather-switcher label { box-sizing: border-box; padding: 6px 4px; gap: 4px; font: inherit; border-top: 1px solid #afc1bd; }\nhtml.chmi-forecast-classic #weather-switcher span { font: inherit; white-space: normal !important; }\nhtml.chmi-forecast-classic #weather-switcher img { width: 32px !important; height: 32px !important; flex-shrink: 0; }\nhtml.chmi-forecast-classic #weather-switcher label.selected { background: #d2e6ec !important; }\n#chmi-forecast-workspace[data-state=\"loading\"] .weather-info__displayValue { opacity: .4; }\nhtml.chmi-forecast-classic .chmi-forecast-accessible { position: relative; margin: 0; padding: 4px 8px; border: 0; border-top: 1px solid #a9bdc5; background: #f4fafc; font: inherit; }\n.chmi-forecast-accessible[open] { max-height: 28vh; overflow: auto; }\nhtml.chmi-forecast-classic .chmi-forecast-periods { gap: 4px; margin-top: 6px; }\n#chmi-forecast-workspace .chmi-forecast-periods button[aria-pressed=\"true\"] { background: #d2e6ec; }\nhtml.chmi-forecast-classic .chmi-forecast-selected-period { margin: 5px 0; }\nhtml.chmi-forecast-classic .chmi-forecast-cities { grid-template-columns: repeat(auto-fit, minmax(min(100%, 165px), 1fr)); gap: 3px 16px; margin: 0; padding-left: 18px; }\n#chmi-forecast-workspace :focus-visible { outline: 2px solid #17609b; outline-offset: 2px; }\nhtml.chmi-classic-embedded #chmi-forecast-workspace { inset: 0; border: 0; grid-template-rows: minmax(0, 1fr) auto; }\nhtml.chmi-classic-embedded .chmi-forecast-header { display: none; }\n@media (max-width: 700px) {\n  .chmi-forecast-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }\n  .chmi-forecast-sidebar { border-left: 0; border-top: 1px solid #a9bdc5; padding: 4px; }\n  .chmi-forecast-sidebar > strong, .chmi-forecast-current { display: none; }\n  .chmi-forecast-days { grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 0 4px; gap: 3px; }\n  .chmi-forecast-days a { padding: 3px; font-size: 10px; overflow-wrap: anywhere; }\n  .chmi-forecast-day-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3px; margin: 0; }\n  .chmi-forecast-day { padding: 3px 0; border-bottom: 0; }\n  .chmi-forecast-day h3 { font-size: 10px; }\n  .chmi-forecast-day-cell { font-size: 9px; }\n  .chmi-forecast-day-cell img { width: 26px; height: 26px; }\n  .chmi-forecast-day-cell strong { font-size: 9px; }\n  html.chmi-forecast-classic #weather-switcher { display: flex; }\n  html.chmi-forecast-classic #weather-switcher label { flex: 1; min-width: 0; font-size: 10px; }\n  html.chmi-forecast-classic #weather-switcher img { width: 24px !important; height: 24px !important; }\n}\n\n/* Keep geography undistorted; use otherwise empty portrait space for live data.\n   Closing the list restores the large map area as an explicit user choice. */\nhtml.chmi-forecast-classic #chmi-forecast-workspace[data-portrait=\"true\"]:has(.chmi-forecast-accessible[open]) {\n  grid-template-rows: auto auto minmax(0, 1fr);\n}\nhtml.chmi-classic-embedded #chmi-forecast-workspace[data-portrait=\"true\"]:has(.chmi-forecast-accessible[open]) {\n  grid-template-rows: auto minmax(0, 1fr);\n}\n#chmi-forecast-workspace[data-portrait=\"true\"]:has(.chmi-forecast-accessible[open]) .chmi-forecast-body {\n  grid-template-rows: auto auto;\n}\nhtml.chmi-forecast-classic #chmi-forecast-workspace[data-portrait=\"true\"]:has(.chmi-forecast-accessible[open]) .lfr-layout-structure-item-chmiimagemapcomponent {\n  height: auto;\n  aspect-ratio: var(--chmi-forecast-map-ratio);\n}\nhtml.chmi-forecast-classic #chmi-forecast-workspace[data-portrait=\"true\"] .chmi-forecast-accessible[open] {\n  box-sizing: border-box;\n  min-height: 0;\n  max-height: none;\n  overflow: auto;\n}\n#chmi-forecast-workspace[data-portrait=\"true\"] .chmi-forecast-accessible .chmi-forecast-periods {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}\n\n/* The original live HPPS viewer supplies every image, timestamp and control. */\nhtml.chmi-rainfall-classic,\nhtml.chmi-rainfall-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #83c3d3;\n}\n\nhtml.chmi-rainfall-classic #page {\n  position: fixed;\n  inset: 4px;\n  box-sizing: border-box;\n  width: auto !important;\n  height: auto !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  border: 1px solid #83aab7;\n  background: #f7faf7;\n  box-shadow: 0 1px 5px #1b567244;\n}\n\nhtml.chmi-rainfall-classic #page > :not(#chmi-rainfall-brand):not(.box),\nhtml.chmi-rainfall-classic body > :not(#page) {\n  display: none !important;\n}\n\nhtml.chmi-rainfall-classic #chmi-rainfall-brand {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 5px 9px;\n  border-bottom: 1px solid #a6bcc4;\n  color: #15446f;\n  background: #eaf5f9;\n  font: 12px/1.3 Arial, sans-serif;\n}\nhtml.chmi-rainfall-classic #chmi-rainfall-brand strong { font-size: 13px; }\nhtml.chmi-rainfall-classic #chmi-rainfall-brand span { color: #51616a; }\nhtml.chmi-rainfall-classic #chmi-rainfall-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #8caebe;\n  color: #16466e;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n}\n\nhtml.chmi-rainfall-classic #page > .box,\nhtml.chmi-rainfall-classic #page > .box > .cont {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n}\nhtml.chmi-rainfall-classic #page > .box { padding: 5px !important; }\nhtml.chmi-rainfall-classic #page > .box > .cont {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) clamp(145px, 18vw, 195px);\n  grid-template-rows: auto minmax(0, 1fr);\n  gap: 5px;\n  padding: 0 !important;\n}\nhtml.chmi-rainfall-classic .cont > h2:first-child,\nhtml.chmi-rainfall-classic .cont > p,\nhtml.chmi-rainfall-classic .cont > br,\nhtml.chmi-rainfall-classic .cont > #tshow { display: none !important; }\nhtml.chmi-rainfall-classic .cont > h2:nth-of-type(2) {\n  grid-column: 1 / -1;\n  grid-row: 1;\n  margin: 0;\n  padding: 5px 8px;\n  border: 1px solid #b7c6cd;\n  background: #e7f0f2;\n  color: #194773;\n  font: bold 13px/1.3 Arial, sans-serif;\n}\nhtml.chmi-rainfall-classic .cont > div:has(> #i_menu) {\n  box-sizing: border-box;\n  grid-column: 2;\n  grid-row: 2;\n  float: none !important;\n  width: 100% !important;\n  height: 100%;\n  min-height: 0;\n  padding: 5px;\n  border: 1px solid #b8c8cd;\n  background: #eaf1f0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\nhtml.chmi-rainfall-classic #i_menu { width: 100% !important; }\nhtml.chmi-rainfall-classic #i_menu p {\n  padding: 4px 3px;\n  margin: 2px 0;\n  color: #124577;\n  border-bottom: 1px solid #ccd8d8;\n  font: 11px/1.25 Arial, sans-serif;\n}\nhtml.chmi-rainfall-classic #i_menu p.active { background: #d0e8ee; font-weight: bold; }\nhtml.chmi-rainfall-classic #i_menu p:hover { background: #d8e9ee; }\nhtml.chmi-rainfall-classic .rainm_tbl { max-width: 100%; }\n\nhtml.chmi-rainfall-classic #bgr {\n  box-sizing: border-box;\n  grid-column: 1;\n  grid-row: 2;\n  width: 100% !important;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\nhtml.chmi-rainfall-classic #bgr > table {\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  width: 100% !important;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  margin: 0;\n}\nhtml.chmi-rainfall-classic #bgr > table > tbody { display: contents; }\nhtml.chmi-rainfall-classic #bgr > table > tbody > tr { display: block; min-height: 0; }\nhtml.chmi-rainfall-classic #bgr > table > tbody > tr:last-child,\nhtml.chmi-rainfall-classic #bgr #map { display: block; height: 100%; min-height: 0; }\nhtml.chmi-rainfall-classic #bgr #map { padding: 0 !important; }\nhtml.chmi-rainfall-classic #bgr th { display: block; padding: 0; }\nhtml.chmi-rainfall-classic #bgr .smenu { display: inline-block; margin: 0 4px 0 0; }\nhtml.chmi-rainfall-classic #bgr .smenu a { color: #164575; font-size: 11px; }\nhtml.chmi-rainfall-classic #iashow {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  padding: 0 !important;\n  background: #e8f0ed;\n}\nhtml.chmi-rainfall-classic #iashow img.srazka_map {\n  box-sizing: border-box !important;\n  width: 100% !important;\n  height: 100% !important;\n  object-fit: contain;\n  object-position: center top;\n  background-size: contain !important;\n  background-position: center top !important;\n  background-repeat: no-repeat !important;\n  border: 0 !important;\n}\nhtml.chmi-classic-embedded.chmi-rainfall-classic #page { inset: 0; border: 0; }\nhtml.chmi-classic-embedded.chmi-rainfall-classic #chmi-rainfall-brand { display: none; }\n\n@media (max-width: 620px) {\n  html.chmi-rainfall-classic #page > .box > .cont {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-rows: auto minmax(0, 1.3fr) minmax(0, 1fr);\n  }\n  html.chmi-rainfall-classic #bgr { grid-column: 1; grid-row: 2; }\n  html.chmi-rainfall-classic .cont > div:has(> #i_menu) {\n    grid-column: 1;\n    grid-row: 3;\n  }\n  html.chmi-rainfall-classic #chmi-rainfall-brand span { display: none; }\n  html.chmi-rainfall-classic #i_menu p { font-size: 10px; }\n}\n\n/* Preserve ČHMÚ's live replay and its native time-slider; only change its layout. */\nhtml.chmi-synoptic-classic,\nhtml.chmi-synoptic-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n  background: #87c4d3;\n}\nhtml.chmi-synoptic-classic body > :not(#chmi-synoptic-workspace) { display: none !important; }\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace {\n  position: fixed;\n  inset: 5px;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #86a8b8;\n  background: #f2f5ee;\n  color: #153d6d;\n  font: 12px/1.35 Verdana, Arial, sans-serif;\n}\nhtml.chmi-synoptic-classic #chmi-synoptic-classic-brand {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n  padding: 5px 9px;\n  border-bottom: 1px solid #a4bdc8;\n  background: #edf6f8;\n}\nhtml.chmi-synoptic-classic #chmi-synoptic-classic-brand strong { font-size: 13px; }\nhtml.chmi-synoptic-classic #chmi-synoptic-classic-brand span { color: #586a70; }\nhtml.chmi-synoptic-classic #chmi-synoptic-classic-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #8caebe;\n  background: #fff;\n  color: #16466e;\n  cursor: pointer;\n  font: inherit;\n}\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace > .portlet,\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace > .portlet .portlet-content,\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace > .portlet .portlet-content-container,\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace > .portlet .portlet-body {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-synoptic-classic #chmi-synoptic-workspace .portlet-header { display: none !important; }\nhtml.chmi-synoptic-classic #chmi-playabledata {\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  padding: 6px;\n  background: #f2f5ee;\n}\nhtml.chmi-synoptic-classic #chmi-timeline {\n  box-sizing: border-box;\n  min-width: 0;\n  margin: 0 !important;\n  padding: 3px 8px !important;\n  border: 1px solid #b5c8cd;\n  background: #e8f1f1;\n}\nhtml.chmi-synoptic-classic #chmi-playableimage-container {\n  box-sizing: border-box;\n  display: grid;\n  place-items: center;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #b5c8cd !important;\n  background: #fff;\n}\nhtml.chmi-synoptic-classic #chmi-playableimage-container > .playabledata-content-container,\nhtml.chmi-synoptic-classic #chmi-playableimage-container > #chmi-playableimage-error {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n}\nhtml.chmi-synoptic-classic .playabledata-content-container { text-align: center; }\nhtml.chmi-synoptic-classic .playabledata-content-container img.chmi-playableimage-img {\n  display: block;\n  width: 100% !important;\n  height: 100% !important;\n  max-width: 100%;\n  max-height: 100%;\n  object-fit: contain;\n}\nhtml.chmi-classic-embedded.chmi-synoptic-classic #chmi-synoptic-workspace { inset: 0; border: 0; }\nhtml.chmi-classic-embedded.chmi-synoptic-classic #chmi-synoptic-classic-brand { display: none; }\n@media (max-width: 600px) {\n  html.chmi-synoptic-classic #chmi-synoptic-classic-brand span { display: none; }\n  html.chmi-synoptic-classic #chmi-playabledata { padding: 2px; }\n  html.chmi-synoptic-classic #chmi-timeline { padding: 2px !important; }\n}\n\n/* Two official ČHMÚ replay portlets and the official product menu stay live. */\nhtml.chmi-sonde-classic,\nhtml.chmi-sonde-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #88bacb;\n}\nhtml.chmi-sonde-classic body > :not(#chmi-sonde-workspace) { display: none !important; }\nhtml.chmi-sonde-classic #chmi-sonde-workspace {\n  position: fixed;\n  inset: 4px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto auto minmax(0, 1fr);\n  gap: 5px;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  padding: 5px;\n  border: 1px solid #779eaf;\n  background: #edf3f4;\n  color: #183f62;\n  font: 12px/1.35 Verdana, Arial, sans-serif;\n}\nhtml.chmi-sonde-classic #chmi-sonde-classic-brand {\n  display: flex;\n  align-items: baseline;\n  flex-wrap: wrap;\n  gap: 2px 12px;\n  min-width: 0;\n  padding: 5px 8px;\n  border: 1px solid #83a9ba;\n  background: #dcebf0;\n}\nhtml.chmi-sonde-classic #chmi-sonde-classic-brand h1 {\n  margin: 0 !important;\n  color: #17456b !important;\n  font: bold 15px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-sonde-classic #chmi-sonde-classic-brand span { color: #536b75; }\nhtml.chmi-sonde-classic #chmi-sonde-classic-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #83a9ba;\n  background: #fff;\n  color: #17456b;\n  cursor: pointer;\n  font: inherit;\n}\nhtml.chmi-sonde-classic #chmi-sonde-classic-brand button:focus-visible {\n  outline: 2px solid #124d79;\n  outline-offset: 2px;\n}\n\n/* Keep the map component as the menu's event-owning ancestor. */\nhtml.chmi-sonde-classic .chmi-sonde-products,\nhtml.chmi-sonde-classic .chmi-sonde-products #chmu-map-container,\nhtml.chmi-sonde-classic .chmi-sonde-products .chmu-map-component,\nhtml.chmi-sonde-classic .chmi-sonde-products .chmu-map-query-container,\nhtml.chmi-sonde-classic .chmi-sonde-products .chmu--map--container {\n  box-sizing: border-box;\n  display: block !important;\n  width: 100% !important;\n  height: auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  max-height: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: visible !important;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .chmu--map--container > .chmi-loader,\nhtml.chmi-sonde-classic .chmi-sonde-products .chmu--map--container > .ol-viewport,\nhtml.chmi-sonde-classic .chmi-sonde-products .ol-menu-button,\nhtml.chmi-sonde-classic .chmi-sonde-products .menu-item--icon--1st { display: none !important; }\nhtml.chmi-sonde-classic .chmi-sonde-products .ol-menu,\nhtml.chmi-sonde-classic .chmi-sonde-products .ol-menu .inner-wrapper {\n  position: static !important;\n  box-sizing: border-box;\n  width: 100% !important;\n  height: auto !important;\n  max-height: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: visible !important;\n  transform: none !important;\n  box-shadow: none !important;\n  background: transparent !important;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu--ul {\n  display: flex !important;\n  flex-wrap: wrap;\n  gap: 4px;\n  width: 100% !important;\n  height: auto !important;\n  max-height: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: visible !important;\n  list-style: none;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu--item {\n  display: block !important;\n  flex: 0 1 auto;\n  min-width: 0;\n  width: auto !important;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 1px solid #88a8b8;\n  background: #f9fcfd;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu--item.__selected {\n  border-color: #326f92;\n  background: #2a7197;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu-item-header {\n  display: block !important;\n  width: auto !important;\n  min-height: 27px;\n  padding: 5px 8px !important;\n  color: #17456b !important;\n  text-decoration: none !important;\n  font: bold 11px/1.35 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu--item.__selected .menu-item-header { color: #fff !important; }\nhtml.chmi-sonde-classic .chmi-sonde-products .menu-item-header:focus-visible {\n  outline: 2px solid #124d79;\n  outline-offset: 2px;\n}\nhtml.chmi-sonde-classic .chmi-sonde-products .menu--item--text { display: block !important; }\n\nhtml.chmi-sonde-classic .chmi-sonde-cards {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 5px;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  margin: 0;\n  overflow: hidden;\n  border: 1px solid #91adba;\n  background: #fff;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card > h2 {\n  flex: 0 0 auto;\n  margin: 0 !important;\n  padding: 5px 8px;\n  color: #17456b !important;\n  background: #dcebf0;\n  border-bottom: 1px solid #a7bfca;\n  font: bold 12px/1.35 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card > .portlet-boundary,\nhtml.chmi-sonde-classic .chmi-sonde-card .portlet,\nhtml.chmi-sonde-classic .chmi-sonde-card .portlet-content,\nhtml.chmi-sonde-classic .chmi-sonde-card .portlet-content-container,\nhtml.chmi-sonde-classic .chmi-sonde-card .portlet-body {\n  box-sizing: border-box;\n  flex: 1 1 auto;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card .portlet-header { display: none !important; }\nhtml.chmi-sonde-classic .chmi-sonde-card #chmi-playabledata {\n  box-sizing: border-box;\n  display: grid !important;\n  grid-template-rows: auto minmax(0, 1fr);\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card #chmi-timeline {\n  box-sizing: border-box;\n  width: 100% !important;\n  min-width: 0;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 4px !important;\n  border-bottom: 1px solid #a7bfca;\n  background: #eef4f5;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card .chmi-timeline--wrapper {\n  flex: 1 1 auto;\n  min-width: 0;\n  overflow-x: auto;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card .chmi-timeline--control { flex: 0 0 auto; }\nhtml.chmi-sonde-classic .chmi-sonde-card #chmi-playableimage-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  text-align: center;\n  background: #fff;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card .playabledata-content-container {\n  box-sizing: border-box;\n  height: 100% !important;\n  min-height: 0;\n}\nhtml.chmi-sonde-classic .chmi-sonde-card img.chmi-playableimage-img {\n  display: block;\n  width: 100% !important;\n  max-width: 100% !important;\n  height: 100% !important;\n  max-height: 100% !important;\n  margin: 0 auto;\n  object-fit: contain;\n}\n\n@media (max-width: 800px) {\n  html.chmi-sonde-classic .chmi-sonde-cards {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-rows: repeat(2, minmax(0, 1fr));\n  }\n  html.chmi-sonde-classic .chmi-sonde-products .menu--item { flex: 1 1 30%; }\n}\n@media (max-height: 500px) {\n  html.chmi-sonde-classic .chmi-sonde-cards { overflow: auto; }\n  html.chmi-sonde-classic .chmi-sonde-card { min-height: 190px; }\n}\n\nhtml.chmi-klementinum-classic,\nhtml.chmi-klementinum-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #86c3d5;\n}\n\nhtml.chmi-klementinum-classic #main-content {\n  position: fixed;\n  inset: 0;\n  z-index: 100;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  overflow: hidden;\n}\nhtml.chmi-klementinum-classic #main-content > :not(.lfr-layout-structure-item-chmi---hlavn--obsah) {\n  display: none !important;\n}\nhtml.chmi-klementinum-classic #main-content > .lfr-layout-structure-item-chmi---hlavn--obsah {\n  position: absolute;\n  inset: 4px;\n  width: auto !important;\n  height: auto !important;\n  min-width: 0;\n  min-height: 0;\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid #8aaebc;\n  background: #fff;\n  box-shadow: 0 1px 5px #1b567244;\n}\nhtml.chmi-klementinum-classic #main-content .lfr-layout-structure-item-chmi---hlavn--obsah > div,\nhtml.chmi-klementinum-classic #main-content .lfr-layout-structure-item-chmi---hlavn--obsah main {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden;\n}\nhtml.chmi-klementinum-classic #main-content .lfr-layout-structure-item-chmi---hlavn--obsah main > div {\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden;\n}\nhtml.chmi-klementinum-classic #main-content .lfr-layout-structure-item-chmi---hlavn--obsah main > div > :not(#chmi-klementinum-brand):not([data-chmi-klementinum-native=\"verified\"]) {\n  display: none !important;\n}\nhtml.chmi-klementinum-classic #chmi-klementinum-brand {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 5px 9px;\n  border-bottom: 1px solid #a6bcc4;\n  color: #15446f;\n  background: #eaf5f9;\n  font: 12px/1.3 Arial, sans-serif;\n}\nhtml.chmi-klementinum-classic #chmi-klementinum-brand strong { font-size: 13px; }\nhtml.chmi-klementinum-classic #chmi-klementinum-brand span { color: #51616a; }\nhtml.chmi-klementinum-classic #chmi-klementinum-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #8caebe;\n  color: #16466e;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0;\n  min-height: 0;\n  margin: 0 !important;\n  padding: 6px !important;\n  overflow: hidden;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] > div:first-child {\n  height: 100%;\n  min-height: 0;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion {\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  width: 100%;\n  height: 100%;\n  min-height: 0;\n  overflow: hidden;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--tabs {\n  grid-row: 1;\n  display: flex;\n  visibility: visible !important;\n  opacity: 1 !important;\n  flex-wrap: nowrap;\n  gap: 2px;\n  width: 100%;\n  min-width: 0;\n  min-height: 29px;\n  margin: 0;\n  overflow-x: auto;\n  background: #eaf0ec;\n  border-bottom: 1px solid #86a7b4;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--tabs .tab {\n  flex: 0 0 auto;\n  min-height: 28px;\n  margin: 0;\n  padding: 4px 12px;\n  border: 1px solid #a9c1c7;\n  border-bottom: 0;\n  border-radius: 4px 4px 0 0;\n  background: linear-gradient(#fff, #d9e5e8);\n  color: #18436c;\n  font: bold 12px Arial, sans-serif;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--tabs .tab.is-active {\n  background: linear-gradient(#7dc6de, #247ca9);\n  color: #fff;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--entry-header-wrapper,\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--entry:not(.is-active) {\n  display: none !important;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--entry.is-active {\n  box-sizing: border-box;\n  grid-row: 2;\n  display: block;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  margin: 0;\n  padding: 8px;\n  overflow: auto;\n  overscroll-behavior: contain;\n  background: #f8fbf9;\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--entry.is-active h2 {\n  margin-top: 0;\n  color: #164575;\n  font-size: clamp(16px, 1.6vw, 21px);\n}\nhtml.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .dynamic-table__wrapper {\n  max-width: 100%;\n  overflow-x: auto;\n}\nhtml.chmi-classic-embedded.chmi-klementinum-classic #main-content > .lfr-layout-structure-item-chmi---hlavn--obsah {\n  inset: 0;\n  border: 0;\n}\nhtml.chmi-classic-embedded.chmi-klementinum-classic #chmi-klementinum-brand { display: none; }\n\n@media (max-width: 620px) {\n  html.chmi-klementinum-classic #chmi-klementinum-brand span { display: none; }\n  html.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--tabs {\n    min-height: 44px;\n  }\n  html.chmi-klementinum-classic #main-content [data-chmi-klementinum-native=\"verified\"] .tabcordion--tabs .tab {\n    padding-inline: 8px;\n    font-size: 11px;\n  }\n}\n\n/* Archive-inspired shell around the still-live ČHMÚ station map. */\nhtml.chmi-stations-classic,\nhtml.chmi-stations-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #89bed0;\n}\nhtml.chmi-stations-classic body > :not(#chmi-stations-workspace) { display: none !important; }\nhtml.chmi-stations-classic #chmi-stations-workspace {\n  position: fixed;\n  inset: 3px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #7da5b5;\n  background: #fff;\n  color: #123d62;\n  font: 12px/1.35 Verdana, Arial, sans-serif;\n}\nhtml.chmi-stations-classic #chmi-stations-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 3px 12px;\n  min-width: 0;\n  padding: 5px 9px;\n  border-bottom: 1px solid #a6c0cb;\n  background: #e4f0f4;\n}\nhtml.chmi-stations-classic #chmi-stations-classic-brand h1 {\n  margin: 0 !important;\n  color: #17456b !important;\n  font: bold 15px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-stations-classic #chmi-stations-classic-brand span { color: #536f7b; }\nhtml.chmi-stations-classic #chmi-stations-classic-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #85abbc;\n  background: #fff;\n  color: #17456b;\n  cursor: pointer;\n  font: inherit;\n}\nhtml.chmi-stations-classic #chmi-stations-classic-brand button:focus-visible,\nhtml.chmi-stations-classic .ol-menu a:focus-visible {\n  outline: 2px solid #13577f;\n  outline-offset: 2px;\n}\n\n/* Preserve the map portlet and all native markers, layers, popups and events. */\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-boundary_ChmiMapComponent_,\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet,\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-content,\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-content-container,\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-body,\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-body > div,\nhtml.chmi-stations-classic #chmi-stations-workspace #chmu-map-container,\nhtml.chmi-stations-classic #chmi-stations-workspace .chmu-map-component,\nhtml.chmi-stations-classic #chmi-stations-workspace .chmu-map-query-container,\nhtml.chmi-stations-classic #chmi-stations-workspace .chmu--map--container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .portlet-header { display: none !important; }\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-viewport { width: 100% !important; height: 100% !important; }\n\n/* The old viewer's compact left-hand layer list, using current official filters. */\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu {\n  box-sizing: border-box;\n  left: 8px !important;\n  right: auto !important;\n  top: 54px !important;\n  width: 205px !important;\n  height: auto !important;\n  max-height: calc(100% - 62px) !important;\n  padding: 4px !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  border: 1px solid #a2b9c1;\n  border-radius: 0;\n  background: rgb(255 255 255 / 94%);\n  box-shadow: 0 1px 5px rgb(0 0 0 / 18%);\n  scrollbar-width: thin;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .inner-wrapper {\n  width: 100% !important;\n  min-width: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu-button {\n  min-height: 29px;\n  width: 100%;\n  padding: 2px 5px;\n  border-bottom: 1px solid #a2b9c1;\n  color: #17456b;\n  font: bold 12px Verdana, Arial, sans-serif;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu--ul {\n  margin: 0 !important;\n  padding: 2px 0 !important;\n  list-style: none;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu--item {\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu-item-header {\n  min-height: 24px !important;\n  padding: 3px 6px !important;\n  color: #173d69 !important;\n  font: 11px/1.35 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu--item.__selected > .menu-item-header {\n  background: #d4e9ef !important;\n  color: #0c466b !important;\n  font-weight: bold !important;\n}\nhtml.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu--item--text { white-space: normal; }\n\n@media (max-width: 700px) {\n  html.chmi-stations-classic #chmi-stations-classic-brand { gap: 2px 6px; padding: 3px 5px; }\n  html.chmi-stations-classic #chmi-stations-classic-brand h1 { font-size: 12px !important; }\n  html.chmi-stations-classic #chmi-stations-classic-brand span { display: none; }\n  html.chmi-stations-classic #chmi-stations-workspace .ol-menu {\n    width: min(155px, 44vw) !important;\n    max-height: min(58%, 390px) !important;\n  }\n  html.chmi-stations-classic #chmi-stations-workspace .ol-menu .menu-item-header { font-size: 10px !important; }\n}\n\n/* The old three-day viewer's blue framing around today's live ČHMÚ map. */\nhtml.chmi-ticks-classic,\nhtml.chmi-ticks-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #89bed0;\n}\nhtml.chmi-ticks-classic body > :not(#chmi-ticks-workspace) { display: none !important; }\nhtml.chmi-ticks-classic #chmi-ticks-workspace {\n  position: fixed;\n  inset: 3px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #829dae;\n  background: #fff;\n  color: #17346c;\n  font: 12px/1.3 Verdana, Arial, sans-serif;\n}\nhtml.chmi-ticks-classic #chmi-ticks-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 3px 12px;\n  min-width: 0;\n  padding: 5px 9px;\n  border-bottom: 2px solid #698ab2;\n  background: #273a83;\n  color: #fff;\n}\nhtml.chmi-ticks-classic #chmi-ticks-classic-brand h1 {\n  margin: 0 !important;\n  color: #fff !important;\n  font: bold 15px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-classic-brand span { color: #e2edff; }\nhtml.chmi-ticks-classic #chmi-ticks-classic-brand button {\n  margin-left: auto;\n  padding: 3px 8px;\n  border: 1px solid #9ab9d9;\n  background: #fff;\n  color: #17346c;\n  cursor: pointer;\n  font: inherit;\n}\nhtml.chmi-ticks-classic #chmi-ticks-classic-brand button:focus-visible,\nhtml.chmi-ticks-classic #chmi-ticks-workspace button:focus-visible {\n  outline: 2px solid #138abc;\n  outline-offset: 2px;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-boundary_ChmiMapComponent_,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-content,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-content-container,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-body,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-body > div,\nhtml.chmi-ticks-classic #chmi-ticks-workspace #chmu-map-container,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu-map-component,\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu-map-query-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .portlet-header { display: none !important; }\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu-map-query-container {\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden;\n}\n/* The three native day stops become the old viewer's compact day strip. */\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--timeline {\n  box-sizing: border-box;\n  flex: 0 0 66px !important;\n  height: 66px !important;\n  min-height: 66px !important;\n  padding: 5px 8px !important;\n  border-bottom: 1px solid #a1b4d1;\n  background: #ecf3fa;\n  color: #17346c;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--timeline .timeline--control {\n  flex: 0 0 36px !important;\n  width: 36px !important;\n  margin-right: 8px !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--timeline .timeline--control button {\n  width: 32px !important;\n  height: 32px !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--timeline .top--label {\n  color: #17346c !important;\n  font: bold 11px/1.2 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--container {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  overflow: hidden;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .ol-viewport {\n  width: 100% !important;\n  height: 100% !important;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .ol-menu {\n  box-sizing: border-box;\n  right: 8px !important;\n  left: auto !important;\n  top: 8px !important;\n  width: min(230px, 45vw) !important;\n  height: auto !important;\n  max-height: calc(100% - 16px) !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  border: 1px solid #a1b4d1;\n  border-radius: 0;\n  background: rgb(255 255 255 / 96%);\n  scrollbar-width: thin;\n}\nhtml.chmi-ticks-classic #chmi-ticks-workspace .ol-menu-button {\n  min-height: 29px;\n  color: #17346c;\n  font: bold 11px Verdana, Arial, sans-serif;\n}\n@media (max-width: 700px) {\n  html.chmi-ticks-classic #chmi-ticks-classic-brand { padding: 3px 5px; gap: 2px 6px; }\n  html.chmi-ticks-classic #chmi-ticks-classic-brand h1 { font-size: 12px !important; }\n  html.chmi-ticks-classic #chmi-ticks-classic-brand span { display: none; }\n  html.chmi-ticks-classic #chmi-ticks-workspace .chmu--map--timeline {\n    flex-basis: 52px !important;\n    height: 52px !important;\n    min-height: 52px !important;\n    padding: 3px !important;\n  }\n  html.chmi-ticks-classic #chmi-ticks-workspace .ol-menu { width: min(155px, 46vw) !important; }\n}\n\n/* Compact intranet-style frame around the official live biometeorology map. */\nhtml.chmi-bio-classic,\nhtml.chmi-bio-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #89bed0;\n}\nhtml.chmi-bio-classic body > :not(#chmi-bio-workspace) { display: none !important; }\nhtml.chmi-bio-classic #chmi-bio-workspace {\n  position: fixed;\n  inset: 3px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #829dae;\n  background: #fff;\n  color: #17346c;\n  font: 12px/1.3 Verdana, Arial, sans-serif;\n}\nhtml.chmi-bio-classic #chmi-bio-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  gap: 3px 10px;\n  min-width: 0;\n  padding: 5px 9px;\n  border-bottom: 2px solid #698ab2;\n  background: #273a83;\n  color: #fff;\n}\nhtml.chmi-bio-classic #chmi-bio-classic-brand h1 {\n  margin: 0 !important;\n  color: #fff !important;\n  font: bold 15px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-bio-classic #chmi-bio-classic-brand span {\n  color: #e2edff;\n  margin-right: auto;\n}\nhtml.chmi-bio-classic #chmi-bio-classic-brand button,\nhtml.chmi-bio-classic #chmi-bio-day-tabs button {\n  padding: 3px 8px;\n  border: 1px solid #9ab9d9;\n  border-radius: 0;\n  background: #fff;\n  color: #17346c;\n  cursor: pointer;\n  font: bold 11px Verdana, Arial, sans-serif;\n}\nhtml.chmi-bio-classic #chmi-bio-classic-brand button:focus-visible,\nhtml.chmi-bio-classic #chmi-bio-day-tabs button:focus-visible {\n  outline: 2px solid #24a5d0;\n  outline-offset: 2px;\n}\nhtml.chmi-bio-classic #chmi-bio-content {\n  position: relative;\n  box-sizing: border-box;\n  display: flex;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\nhtml.chmi-bio-classic #chmi-bio-content > .portlet-boundary_ChmiMapComponent_ {\n  flex: 1 1 auto;\n  min-width: 0;\n}\nhtml.chmi-bio-classic #chmi-bio-content .portlet-boundary_ChmiMapComponent_,\nhtml.chmi-bio-classic #chmi-bio-content .portlet,\nhtml.chmi-bio-classic #chmi-bio-content .portlet-content,\nhtml.chmi-bio-classic #chmi-bio-content .portlet-content-container,\nhtml.chmi-bio-classic #chmi-bio-content .portlet-body,\nhtml.chmi-bio-classic #chmi-bio-content > .portlet-boundary_ChmiMapComponent_ .portlet-body > div,\nhtml.chmi-bio-classic #chmi-bio-content #chmu-map-container,\nhtml.chmi-bio-classic #chmi-bio-content .chmu-map-component,\nhtml.chmi-bio-classic #chmi-bio-content .chmu-map-query-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-bio-classic #chmi-bio-content .portlet-header { display: none !important; }\nhtml.chmi-bio-classic #chmi-bio-content .chmu-map-query-container {\n  display: flex !important;\n  flex-direction: column !important;\n  overflow: hidden;\n}\nhtml.chmi-bio-classic #chmi-bio-content .chmu--map--timeline {\n  box-sizing: border-box;\n  flex: 0 0 58px !important;\n  height: 58px !important;\n  min-height: 58px !important;\n  padding: 4px 7px !important;\n  border-bottom: 1px solid #a1b4d1;\n  background: #ecf3fa;\n  color: #17346c;\n}\nhtml.chmi-bio-classic #chmi-bio-content .chmu--map--timeline .timeline--control {\n  flex: 0 0 30px !important;\n  width: 30px !important;\n  margin-right: 6px !important;\n}\nhtml.chmi-bio-classic #chmi-bio-content .chmu--map--timeline .timeline--control button {\n  width: 28px !important;\n  height: 28px !important;\n}\nhtml.chmi-bio-classic #chmi-bio-content .chmu--map--container {\n  box-sizing: border-box;\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  overflow: hidden;\n}\nhtml.chmi-bio-classic #chmi-bio-content .ol-viewport {\n  width: 100% !important;\n  height: 100% !important;\n}\nhtml.chmi-bio-classic #chmi-bio-content .ol-menu {\n  box-sizing: border-box;\n  top: 8px !important;\n  right: 8px !important;\n  left: auto !important;\n  width: min(215px, 44vw) !important;\n  height: auto !important;\n  max-height: calc(100% - 16px) !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  border: 1px solid #a1b4d1;\n  border-radius: 0;\n  background: rgb(255 255 255 / 96%);\n  scrollbar-width: thin;\n}\nhtml.chmi-bio-classic #chmi-bio-details {\n  box-sizing: border-box;\n  flex: 0 0 clamp(290px, 32vw, 450px);\n  min-width: 0;\n  overflow-y: auto;\n  border-left: 1px solid #a1b4d1;\n  background: #f6f9fc;\n  scrollbar-width: thin;\n}\nhtml.chmi-bio-classic #chmi-bio-details[hidden],\nhtml.chmi-bio-classic #chmi-bio-details .portlet-boundary[hidden] { display: none !important; }\nhtml.chmi-bio-classic #chmi-bio-day-tabs {\n  position: sticky;\n  top: 0;\n  z-index: 1;\n  display: flex;\n  gap: 4px;\n  padding: 6px;\n  border-bottom: 1px solid #a1b4d1;\n  background: #eaf1f8;\n}\nhtml.chmi-bio-classic #chmi-bio-day-tabs button[aria-pressed=\"true\"] {\n  background: #273a83;\n  color: #fff;\n}\nhtml.chmi-bio-classic #chmi-bio-details .portlet-boundary,\nhtml.chmi-bio-classic #chmi-bio-details .portlet,\nhtml.chmi-bio-classic #chmi-bio-details .portlet-content,\nhtml.chmi-bio-classic #chmi-bio-details .portlet-content-container,\nhtml.chmi-bio-classic #chmi-bio-details .portlet-body {\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-bio-classic #chmi-bio-details .dynamic-table__wrapper { overflow-x: auto; }\nhtml.chmi-bio-classic #chmi-bio-details table {\n  width: 100%;\n  border-collapse: collapse;\n  color: #17346c;\n  font: 11px/1.35 Verdana, Arial, sans-serif;\n}\nhtml.chmi-bio-classic #chmi-bio-details th,\nhtml.chmi-bio-classic #chmi-bio-details td {\n  padding: 5px;\n  border: 1px solid #c3d1df;\n  vertical-align: top;\n}\n@media (max-width: 700px) {\n  html.chmi-bio-classic #chmi-bio-classic-brand { padding: 3px 5px; gap: 3px; }\n  html.chmi-bio-classic #chmi-bio-classic-brand h1 { font-size: 12px !important; margin-right: auto !important; }\n  html.chmi-bio-classic #chmi-bio-classic-brand span { display: none; }\n  html.chmi-bio-classic #chmi-bio-details:not([hidden]) {\n    position: absolute;\n    z-index: 3;\n    inset: 0 0 0 auto;\n    width: min(92vw, 390px);\n    box-shadow: -3px 0 10px rgb(0 0 0 / 20%);\n  }\n  html.chmi-bio-classic #chmi-bio-content .ol-menu { width: min(155px, 45vw) !important; }\n}\n\n/* A compact intranet-style shell for live weekly ČHMÚ text and chart. */\nhtml.chmi-week-classic,\nhtml.chmi-week-classic body {\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #89bed0;\n}\nhtml.chmi-week-classic body > :not(#chmi-week-workspace) { display: none !important; }\nhtml.chmi-week-classic #chmi-week-workspace {\n  position: fixed;\n  inset: 3px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-rows: auto auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #829dae;\n  background: #fff;\n  color: #17346c;\n  font: 12px/1.35 Verdana, Arial, sans-serif;\n}\nhtml.chmi-week-classic #chmi-week-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  gap: 3px 9px;\n  min-width: 0;\n  padding: 5px 9px;\n  border-bottom: 2px solid #698ab2;\n  background: #273a83;\n  color: #fff;\n}\nhtml.chmi-week-classic #chmi-week-classic-brand h1 {\n  margin: 0 !important;\n  color: #fff !important;\n  font: bold 15px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-week-classic #chmi-week-classic-brand span {\n  margin-right: auto;\n  color: #e2edff;\n}\nhtml.chmi-week-classic #chmi-week-workspace button {\n  padding: 3px 8px;\n  border: 1px solid #9ab9d9;\n  border-radius: 0;\n  background: #fff;\n  color: #17346c;\n  cursor: pointer;\n  font: bold 11px Verdana, Arial, sans-serif;\n}\nhtml.chmi-week-classic #chmi-week-workspace button:focus-visible {\n  outline: 2px solid #24a5d0;\n  outline-offset: 2px;\n}\nhtml.chmi-week-classic #chmi-week-classic-brand button[aria-pressed=\"true\"] {\n  background: #ddeefa;\n}\nhtml.chmi-week-classic #chmi-week-day-nav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  min-width: 0;\n  padding: 5px;\n  border-bottom: 1px solid #a1b4d1;\n  background: #edf4fb;\n}\nhtml.chmi-week-classic #chmi-week-day-nav button {\n  padding: 3px 6px;\n  white-space: normal;\n}\nhtml.chmi-week-classic #chmi-week-content {\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\nhtml.chmi-week-classic #chmi-week-content > section {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n}\nhtml.chmi-week-classic #chmi-week-content > section[hidden] { display: none !important; }\nhtml.chmi-week-classic #chmi-week-forecast {\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 6px clamp(8px, 3vw, 35px);\n  scrollbar-width: thin;\n}\nhtml.chmi-week-classic #chmi-week-graph {\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 6px 10px;\n  scrollbar-width: thin;\n}\nhtml.chmi-week-classic #chmi-week-content .portlet,\nhtml.chmi-week-classic #chmi-week-content .portlet-content,\nhtml.chmi-week-classic #chmi-week-content .portlet-content-container,\nhtml.chmi-week-classic #chmi-week-content .portlet-body {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  min-width: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-week-classic #chmi-week-content .portlet-header { display: none !important; }\nhtml.chmi-week-classic #chmi-week-forecast .text-forecast,\nhtml.chmi-week-classic #chmi-week-forecast .chmu-forecast-content {\n  box-sizing: border-box;\n  max-width: none !important;\n  max-height: none !important;\n  overflow: visible !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n  background: #fff !important;\n}\nhtml.chmi-week-classic #chmi-week-forecast .chmu-forecast-content h3 {\n  scroll-margin-top: 8px;\n  margin: 15px 0 5px !important;\n  padding: 4px 6px;\n  border-bottom: 1px solid #9cb8d0;\n  background: #e8f0f8;\n  color: #17346c !important;\n  font: bold 14px Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-week-classic #chmi-week-forecast .chmu-forecast-content h4 {\n  margin: 7px 0 3px !important;\n  color: #17346c !important;\n  font: bold 12px Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-week-classic #chmi-week-forecast .chmu-forecast-content p {\n  margin: 4px 0 !important;\n  padding: 0 !important;\n  font: 12px/1.5 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-week-classic #chmi-week-forecast .text-forecast__curtain,\nhtml.chmi-week-classic #chmi-week-forecast .text-forecast__link--close,\nhtml.chmi-week-classic #chmi-week-forecast .text-forecast__link--open { display: none !important; }\nhtml.chmi-week-classic #chmi-week-graph .chmu-chart--active {\n  box-sizing: border-box;\n  width: 100% !important;\n  min-width: 0 !important;\n  max-width: none !important;\n  overflow: hidden !important;\n}\nhtml.chmi-week-classic #chmi-week-graph canvas {\n  display: block;\n  width: 100% !important;\n  max-width: 100% !important;\n  height: auto !important;\n}\n@media (max-width: 700px) {\n  html.chmi-week-classic #chmi-week-classic-brand { flex-wrap: wrap; padding: 3px 5px; }\n  html.chmi-week-classic #chmi-week-classic-brand h1 { font-size: 12px !important; }\n  html.chmi-week-classic #chmi-week-classic-brand span { display: none; }\n  html.chmi-week-classic #chmi-week-day-nav { padding: 3px; gap: 2px; }\n  html.chmi-week-classic #chmi-week-day-nav button { font-size: 10px; padding: 2px 4px; }\n}\n\n/* Regional forecasts: archived blue region menu, living official text. */\nhtml.chmi-regions-classic,\nhtml.chmi-regions-classic body {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  margin: 0 !important;\n  overflow: hidden !important;\n  background: #8ec2d3;\n}\nhtml.chmi-regions-classic body > :not(#chmi-regions-workspace) { display: none !important; }\nhtml.chmi-regions-classic #chmi-regions-workspace {\n  position: fixed;\n  inset: 3px;\n  z-index: 1000;\n  box-sizing: border-box;\n  display: grid;\n  grid-template-columns: clamp(158px, 17vw, 205px) minmax(0, 1fr);\n  grid-template-rows: auto auto minmax(0, 1fr);\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border: 1px solid #819cad;\n  background: #fff;\n  color: #17346c;\n  font: 12px/1.4 Verdana, Arial, sans-serif;\n}\nhtml.chmi-regions-classic #chmi-regions-brand {\n  grid-column: 1 / -1;\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  min-width: 0;\n  padding: 5px 8px;\n  border-bottom: 2px solid #6b8db5;\n  background: #263b83;\n  color: #fff;\n}\nhtml.chmi-regions-classic #chmi-regions-brand h1 {\n  margin: 0 !important;\n  color: #fff !important;\n  font: bold 14px/1.3 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-regions-classic #chmi-regions-brand span { margin-right: auto; color: #e2ecfa; }\nhtml.chmi-regions-classic #chmi-regions-brand button {\n  padding: 3px 7px;\n  border: 1px solid #9cb8d0;\n  border-radius: 0;\n  background: #fff;\n  color: #17346c;\n  cursor: pointer;\n  font: bold 10px Verdana, Arial, sans-serif;\n}\nhtml.chmi-regions-classic #chmi-regions-nav {\n  grid-column: 1;\n  grid-row: 2 / 4;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  border-right: 1px solid #8da9c7;\n  background: #1c5fa4;\n}\nhtml.chmi-regions-classic #chmi-regions-nav h2 {\n  margin: 0 !important;\n  padding: 5px 8px;\n  border-bottom: 1px solid #7399c0;\n  background: #edf0f3;\n  color: #b13939 !important;\n  font: bold 12px Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-regions-classic #chmi-regions-list {\n  box-sizing: border-box;\n  max-height: calc(100% - 27px);\n  overflow-y: auto;\n  scrollbar-width: thin;\n}\nhtml.chmi-regions-classic #chmi-regions-list a {\n  display: block;\n  padding: 4px 8px;\n  border-bottom: 1px solid #3574ad;\n  color: #fff !important;\n  text-decoration: none !important;\n  font: bold 11px Verdana, Arial, sans-serif;\n}\nhtml.chmi-regions-classic #chmi-regions-list a:hover,\nhtml.chmi-regions-classic #chmi-regions-list a[aria-current=\"page\"] {\n  background: #d6e8f7;\n  color: #14387f !important;\n}\nhtml.chmi-regions-classic #chmi-regions-select { display: none; }\nhtml.chmi-regions-classic #chmi-regions-periods {\n  grid-column: 2;\n  grid-row: 2;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  padding: 4px 6px;\n  border-bottom: 1px solid #a7bacf;\n  background: #edf4fa;\n}\nhtml.chmi-regions-classic #chmi-regions-periods a {\n  padding: 3px 8px;\n  border: 1px solid #abc0d6;\n  background: #fff;\n  color: #17346c !important;\n  text-decoration: none !important;\n  font: bold 11px Verdana, Arial, sans-serif;\n}\nhtml.chmi-regions-classic #chmi-regions-periods a[aria-current=\"page\"] { background: #d3e7f6; }\nhtml.chmi-regions-classic #chmi-regions-forecast {\n  grid-column: 2;\n  grid-row: 3;\n  box-sizing: border-box;\n  min-width: 0;\n  min-height: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 6px clamp(8px, 2vw, 26px);\n  scrollbar-width: thin;\n  background: #fff;\n}\nhtml.chmi-regions-classic #chmi-regions-forecast .portlet,\nhtml.chmi-regions-classic #chmi-regions-forecast .portlet-content,\nhtml.chmi-regions-classic #chmi-regions-forecast .portlet-content-container,\nhtml.chmi-regions-classic #chmi-regions-forecast .portlet-body {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  min-width: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\nhtml.chmi-regions-classic #chmi-regions-forecast .portlet-header,\nhtml.chmi-regions-classic #chmi-regions-forecast .text-forecast__curtain,\nhtml.chmi-regions-classic #chmi-regions-forecast .text-forecast__link--close,\nhtml.chmi-regions-classic #chmi-regions-forecast .text-forecast__link--open { display: none !important; }\nhtml.chmi-regions-classic #chmi-regions-forecast .text-forecast,\nhtml.chmi-regions-classic #chmi-regions-forecast .chmu-forecast-content {\n  box-sizing: border-box;\n  max-width: none !important;\n  max-height: none !important;\n  overflow: visible !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n  background: #fff !important;\n}\nhtml.chmi-regions-classic #chmi-regions-forecast h3 {\n  margin: 12px 0 4px !important;\n  padding: 5px 6px;\n  border-bottom: 1px solid #a6bfd2;\n  background: #e9f0f6;\n  color: #b13939 !important;\n  font: bold 13px Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-regions-classic #chmi-regions-forecast h4 {\n  margin: 8px 0 3px !important;\n  color: #17346c !important;\n  font: bold 12px Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-regions-classic #chmi-regions-forecast p {\n  margin: 3px 0 !important;\n  padding: 0 !important;\n  font: 12px/1.5 Verdana, Arial, sans-serif !important;\n}\nhtml.chmi-regions-classic #chmi-regions-workspace a:focus-visible,\nhtml.chmi-regions-classic #chmi-regions-workspace select:focus-visible,\nhtml.chmi-regions-classic #chmi-regions-workspace button:focus-visible {\n  outline: 2px solid #d85524;\n  outline-offset: 1px;\n}\n@media (max-width: 700px) {\n  html.chmi-regions-classic #chmi-regions-workspace {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-rows: auto auto auto minmax(0, 1fr);\n  }\n  html.chmi-regions-classic #chmi-regions-brand { flex-wrap: wrap; }\n  html.chmi-regions-classic #chmi-regions-nav {\n    grid-column: 1;\n    grid-row: 2;\n    border-right: 0;\n    padding: 4px;\n  }\n  html.chmi-regions-classic #chmi-regions-nav h2,\n  html.chmi-regions-classic #chmi-regions-list { display: none; }\n  html.chmi-regions-classic #chmi-regions-select {\n    display: block;\n    box-sizing: border-box;\n    width: 100%;\n    padding: 3px 5px;\n    border: 1px solid #b9cce0;\n    background: #fff;\n    color: #17346c;\n    font: bold 11px Verdana, Arial, sans-serif;\n  }\n  html.chmi-regions-classic #chmi-regions-periods { grid-column: 1; grid-row: 3; }\n  html.chmi-regions-classic #chmi-regions-forecast { grid-column: 1; grid-row: 4; }\n}\n\n\n#chmi-classic-userscript-restore {\n  position: fixed;\n  right: 12px;\n  bottom: 12px;\n  z-index: 2147483647;\n  padding: 7px 12px;\n  border: 1px solid #1677a8;\n  border-radius: 2px;\n  background: #eaf7fc;\n  color: #07567e;\n  font: 600 13px Arial, sans-serif;\n  cursor: pointer;\n  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);\n}");
  renderRestoreButton();
})();

(() => {
  "use strict";
  if (globalThis.__chmiClassicApps) return;

  // Only explicit reconstructed adapters may become clickable in the portal.
  // An existing modern URL alone is not proof of an old-look application.
  const apps = {
    forecast: { title: "Počasí v České republice – předpověď", url: "https://www.chmi.cz/predpoved-pocasi/dnes", family: "forecast", section: "weather" },
    radar: { title: "Aktuální radarová data", url: "https://produkty.chmi.cz/radar/", family: "radar", section: "weather" },
    lightning: { title: "Detekce blesků – živá vrstva radaru", url: "https://produkty.chmi.cz/radar/?chmi_classic_lightning=1", family: "radar", section: "weather" },
    rainfall: { title: "Radarové odhady srážek", url: "https://hydro.chmi.cz/hppsoldv/main_rain.php", family: "rainfall", section: "weather" },
    synoptic: { title: "Synoptická situace", url: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace", family: "synoptic", section: "weather" },
    sonde: { title: "Sondážní měření – Praha-Libuš", url: "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa", family: "sonde", section: "weather" },
    klementinum: { title: "Měření z Klementina", url: "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum", family: "klementinum", section: "weather" },
    stations: { title: "Meteorologické stanice ČHMÚ", url: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke", family: "stations", section: "weather" },
    ticks: { title: "Aktivita klíšťat", url: "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat", family: "ticks", section: "weather" },
    bio: { title: "Biometeorologická předpověď", url: "https://www.chmi.cz/predpoved-pocasi/bio-predpoved", family: "bio", section: "weather" },
    week: { title: "Týdenní předpověď", url: "https://www.chmi.cz/predpoved-pocasi/tyden", family: "week", section: "weather" },
    regions: { title: "Předpovědi pro kraje", url: "https://www.chmi.cz/predpoved-pocasi/karlovarsky-kraj/dnes", family: "regions", section: "weather" },
    meteosat: { title: "Snímky z družic MSG / Meteosat", url: "https://produkty.chmi.cz/druzice/?time_range=24", family: "satellite", section: "weather" },
    aladin: { title: "ALADIN – mapy", url: "https://produkty.chmi.cz/aladin/", family: "aladin", section: "weather" },
    "aladin-animation": { title: "ALADIN – animace", url: "https://produkty.chmi.cz/aladin/?chmi_classic_animation=1", family: "aladin", section: "weather" },
    meteogram: { title: "ALADIN – meteogramy", url: "https://www.chmi.cz/meteogram/355-praha", family: "meteogram", section: "weather" },
    webcams: { title: "Webové kamery", url: "https://www.chmi.cz/namerena-data/webkamery", family: "webcams", section: "weather" },
    polar: { title: "Snímky z polárních družic", url: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color", family: "polar", section: "weather" },
    geo: { title: "Geostacionární družice", url: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", family: "geo", section: "weather" },
    mushrooms: { title: "Pravděpodobnost růstu hub", url: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", family: "mushrooms", section: "weather" },
    water: { title: "VODA – aktuální vodní stavy a povodňová mapa", url: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa", family: "water", section: "water" },
    air: { title: "OVZDUŠÍ – aktuální mapy kvality ovzduší", url: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr", family: "air", section: "air" }
  };
  const pending = (label, reason = "Původní zobrazení této aplikace zatím není obnoveno. Samotný odkaz na nový web nepovažujeme za rekonstrukci.") => ({ label, reason });
  const columns = [
    [{ label: "Předpověď pro ČR", app: "forecast" }, { label: "Předpovědi pro kraje", app: "regions" }, { label: "Týdenní předpověď", app: "week" }, ...["Měsíční výhled", "Synoptická předpověď"].map(label => pending(label)), { label: "Bio předpověď", app: "bio" }, ...["Počasí pro létání", "Sněhové zpravodajství", "Předpovědi pro hory"].map(label => pending(label))],
    [{ label: "Aladin – animace", app: "aladin-animation" }, { label: "Aladin – mapy", app: "aladin" }, { label: "Aladin – meteogramy", app: "meteogram" }, pending("Přehled počasí v ČR"), { label: "Synoptická situace", app: "synoptic" }, ...["Ozonové zpravodajství", "Družicová měření ozonu", "Pylový semafor"].map(label => pending(label)), { label: "Aktivita klíšťat", app: "ticks" }],
    [{ label: "Aktuální radarová data", app: "radar" }, { label: "Snímky z družic MSG", app: "meteosat" }, { label: "Snímky z družic NOAA", app: "polar" }, { label: "Detekce blesků", app: "lightning" }, { label: "Radarové odhady srážek", app: "rainfall" }, pending("Aktuální mapy"), pending("Grafy automat. stanic"), { label: "Sondážní měření", app: "sonde" }, pending("Počasí a kůrovec")],
    [{ label: "Webové kamery", app: "webcams" }, pending("Meteo zprávy – Infomet"), { label: "Měření z Klementina", app: "klementinum" }, ...["Mapa zatížení sněhem", "Nalezli jste radiosondu?", "Vertikální profily větru", "Monitoring sucha"].map(label => pending(label)), { label: "Meteorologické stanice", app: "stations" }]
  ];
  const supplementary = [{ label: "Geostacionární družice", app: "geo" }, { label: "Pravděpodobnost růstu hub", app: "mushrooms" }];
  const regionSlugs = new Set(["karlovarsky-kraj", "plzensky-kraj", "ustecky-kraj", "stredocesky-kraj", "praha", "jihocesky-kraj", "liberecky-kraj", "kralovehradecky-kraj", "pardubicky-kraj", "kraj-vysocina", "olomoucky-kraj", "jihomoravsky-kraj", "moravskoslezsky-kraj", "zlinsky-kraj"]);
  const normalPath = path => path.replace(/\/+$/, "") || "/";
  const registry = {
    apps, columns, supplementary,
    get(id) { return Object.hasOwn(apps, id) ? apps[id] : null; },
    isHomepage(url) {
      return ["www.chmi.cz", "chmi.cz"].includes(url.hostname) && ["/", "/uvod"].includes(normalPath(url.pathname));
    },
    isHomeLink(url) {
      return url.protocol === "https:" && this.isHomepage(url);
    },
    matches(id, url) {
      const app = this.get(id);
      if (!app) return false;
      const target = new URL(app.url);
      if (id === "forecast" && url.origin === target.origin) return /^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.test(url.pathname);
      if (id === "regions" && url.origin === target.origin) {
        const match = /^\/predpoved-pocasi\/([a-z-]+)\/(dnes|zitra|pozitri|dalsi-dny)\/?$/.exec(url.pathname);
        return Boolean(match && regionSlugs.has(match[1]));
      }
      if (id === "meteogram" && url.origin === target.origin) return /^\/meteogram\/\d+-[a-z0-9-]+\/?$/.test(url.pathname);
      if (id === "webcams" && url.origin === target.origin && /^\/namerena-data\/webkamera\/[a-z0-9_-]+\/?$/.test(url.pathname)) return true;
      if (id === "radar" || id === "lightning") return url.origin === target.origin &&
        normalPath(url.pathname) === normalPath(target.pathname) &&
        (url.searchParams.get("chmi_classic_lightning") === "1") === (id === "lightning");
      if (id === "aladin" || id === "aladin-animation") return url.origin === target.origin &&
        normalPath(url.pathname) === normalPath(target.pathname) &&
        (url.searchParams.get("chmi_classic_animation") === "1") === (id === "aladin-animation");
      return url.origin === target.origin && normalPath(url.pathname) === normalPath(target.pathname);
    },
    frameURL(id, session) {
      const app = this.get(id);
      if (!app) return null;
      const url = new URL(app.url);
      url.searchParams.set("chmi_classic_embed", id);
      url.searchParams.set("chmi_classic_session", session);
      return url.href;
    },
    frameName(id, session) {
      return this.get(id) && /^[a-zA-Z0-9-]{8,80}$/.test(session ?? "") ?
        `chmi-classic:${id}:${session}` : "";
    },
    embeddedContext(url, name) {
      // Meteosat rewrites its query before document-idle. The frame name stays
      // bound to this browsing context and is independent of native URL state.
      const named = /^chmi-classic:([a-z-]+):([a-zA-Z0-9-]{8,80})$/.exec(name ?? "");
      const id = named?.[1] ?? url.searchParams.get("chmi_classic_embed");
      const session = named?.[2] ?? url.searchParams.get("chmi_classic_session");
      return this.matches(id, url) && /^[a-zA-Z0-9-]{8,80}$/.test(session ?? "") ? { id, session } : null;
    },
    shouldOpenInPanel(event) {
      return !event.defaultPrevented && event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    },
    route(hash) {
      if (!hash) return "forecast";
      const id = /^#classic=([a-z-]+)$/.exec(hash)?.[1];
      return this.get(id) ? id : "radar";
    },
    accepts(event, frame, id, session) {
      const app = this.get(id);
      return Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-status" &&
        event.data.session === session && event.data.app === id &&
        ["ready", "loading"].includes(event.data.state));
    },
    acceptsNavigation(event, frame, id, session) {
      const app = this.get(id);
      return Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-navigate" &&
        event.data.session === session && event.data.app === id && event.data.target === "home");
    }
  };
  globalThis.__chmiClassicApps = Object.freeze(registry);
})();


(() => {
  "use strict";
  const registry = globalThis.__chmiClassicApps;
  if (!registry || window.top === window || window.__chmiClassicEmbedded) return;
  const url = new URL(location.href);
  const context = registry.embeddedContext(url, window.name);
  if (!context) return;
  const { id, session } = context;
  let parentURL;
  try { parentURL = new URL(document.referrer); } catch { return; }
  const nativeNavigation = ["webcams", "forecast", "meteogram", "rainfall"].includes(id) && registry.matches(id, parentURL);
  if (parentURL.protocol !== "https:" || !(registry.isHomepage(parentURL) || nativeNavigation) ||
      !registry.matches(id, url) || !/^[a-zA-Z0-9-]{8,80}$/.test(session ?? "")) return;

  window.__chmiClassicEmbedded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    document.documentElement.classList.add("chmi-classic-embedded");
    // A native breadcrumb inside the iframe must return to the parent classic
    // portal, not replace this small panel with the modern ČHMÚ homepage.
    document.addEventListener("click", event => {
      if (!registry.shouldOpenInPanel(event) || !(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link || (link.target && link.target !== "_self")) return;
      let destination;
      try { destination = new URL(link.href); } catch { return; }
      if (!registry.isHomeLink(destination)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.postMessage({ type: "chmi-classic-navigate", app: id, session, target: "home" }, parentURL.origin);
    }, true);
    // Readiness is deliberately based on a laid-out adapter AND real media,
    // never merely on the iframe load event or a classic header.
    function report() {
      const visible = node => node && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0 && getComputedStyle(node).visibility !== "hidden";
      const app = registry.get(id);
      const adapter = id === "lightning" ? document.querySelector("html.chmi-radar-classic-lightning-only #chmi-radar-classic-toolbar") :
        app.family === "radar" ? document.getElementById("chmi-radar-classic-toolbar") :
        app.family === "satellite" ? document.getElementById("chmi-satellite-classic-selector") :
        app.family === "aladin" ? document.querySelector("[data-chmi-aladin-native='verified'] #chmi-aladin-classic-controls") :
        app.family === "webcams" ? document.querySelector("html.chmi-webcams-classic [data-chmi-webcams-native='verified']") :
        app.family === "meteogram" ? document.querySelector("html.chmi-meteogram-classic .chmi-meteogram-workspace") :
        app.family === "forecast" ? document.querySelector("#chmi-forecast-workspace[data-state='ready']") :
        app.family === "synoptic" ? document.querySelector("html.chmi-synoptic-classic #chmi-playabledata[data-chmi-synoptic-native='verified']") :
        app.family === "sonde" ? document.querySelector("html.chmi-sonde-classic #chmi-sonde-workspace .chmi-sonde-card") :
        app.family === "klementinum" ? document.querySelector("html.chmi-klementinum-classic #main-content [data-chmi-klementinum-native='verified']") :
        app.family === "stations" ? document.querySelector("html.chmi-stations-classic #chmi-stations-workspace #chmu-map-container") :
        app.family === "ticks" ? document.querySelector("html.chmi-ticks-classic #chmi-ticks-workspace #chmu-map-container") :
        app.family === "bio" ? document.querySelector("html.chmi-bio-classic #chmi-bio-workspace #chmu-map-container") :
        app.family === "week" ? document.querySelector("html.chmi-week-classic #chmi-week-workspace #chmi-week-forecast") :
        app.family === "regions" ? document.querySelector("html.chmi-regions-classic #chmi-regions-workspace #chmi-regions-forecast") :
        app.family === "rainfall" ? document.getElementById("chmi-rainfall-brand") :
        ["water", "air"].includes(app.family) ? document.getElementById("chmi-hydro-air-classic-brand") :
        document.getElementById(app.family === "mushrooms" ? "chmi-hub-classic-brand" : "chmi-satellite-classic-portal-products");
      const nativeMap = document.getElementById("chmu-map-container");
      const mapMedia = nativeMap && visible(nativeMap) && Boolean(nativeMap.querySelector(
        "canvas, img[src], .leaflet-tile-loaded, .maplibregl-canvas, .ol-layer canvas, svg path"
      ));
      const forecastMedia = app.family === "forecast" && visible(document.getElementById("weather-map")) &&
        document.querySelectorAll("#weather-map path").length > 0 &&
        document.querySelectorAll("#weather-map-details a.weather-info").length > 0;
      const weekMedia = app.family === "week" && (
        (visible(document.getElementById("chmi-week-forecast")) &&
          document.querySelectorAll("#chmi-week-forecast .chmu-forecast-content h3").length >= 5) ||
        (visible(document.querySelector("#chmi-week-graph canvas")) &&
          document.querySelector("#chmi-week-graph canvas")?.width >= 500)
      );
      const regionsMedia = app.family === "regions" &&
        visible(document.getElementById("chmi-regions-forecast")) &&
        document.querySelector("#chmi-regions-forecast .chmu-forecast-content h3")?.textContent?.trim();
      const meteogramCanvas = document.querySelector(".chmi-meteogram-workspace canvas[id*='ChmiGraph']");
      const meteogramMedia = app.family === "meteogram" && visible(meteogramCanvas) &&
        meteogramCanvas.width > 300 && meteogramCanvas.height > 150;
      const rainfallImage = document.querySelector("#iashow img.active");
      const rainfallMedia = app.family === "rainfall" && visible(rainfallImage) && rainfallImage.complete && rainfallImage.naturalWidth > 32;
      const synopticImage = document.querySelector("#chmi-playabledata .playabledata-content-container img.chmi-playableimage-img");
      const synopticMedia = app.family === "synoptic" && visible(synopticImage) && synopticImage.complete && synopticImage.naturalWidth > 32;
      const sondeImages = [...document.querySelectorAll("#chmi-sonde-workspace .chmi-sonde-card img.chmi-playableimage-img")];
      const sondeMedia = app.family === "sonde" && sondeImages.length === 2 &&
        sondeImages.every(node => visible(node) && node.complete && node.naturalWidth >= 500 && node.naturalHeight >= 400);
      const klementinumTable = document.querySelector("[data-chmi-klementinum-native='verified'] [id^='p_p_id_ChmiDynamicTable_INSTANCE_'] table");
      const klementinumMedia = app.family === "klementinum" && visible(klementinumTable) &&
        klementinumTable.tBodies[0]?.rows.length > 0;
      const lightningMedia = id === "lightning" && [...document.querySelectorAll('#div_container_data img[src*="/input_data/blesk/"]')]
        .some(node => visible(node) && node.complete && node.naturalWidth > 32 &&
          Number(getComputedStyle(node.parentElement).opacity) > 0);
      const media = id === "lightning" ? lightningMedia : app.family === "sonde" ? sondeMedia : app.family === "klementinum" ? klementinumMedia : forecastMedia || weekMedia || regionsMedia || meteogramMedia || rainfallMedia || synopticMedia || mapMedia || [...document.querySelectorAll("#div_container_data img, #div_gmaps canvas, #map-container img, #map-container canvas, #chmu-map-container canvas, #chmu-map-container img, #modelGrid .is-active img, .playabledata-content-container .chmi-playableimage-img")]
        .some(node => visible(node) && (node.tagName === "CANVAS" ? node.width > 0 && node.height > 0 : node.complete && node.naturalWidth > 32));
      window.parent.postMessage({ type: "chmi-classic-status", app: id, session, state: adapter && media ? "ready" : "loading" }, parentURL.origin);
    }
    report();
    const timer = setInterval(report, 1500);
    window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();


(() => {
  "use strict";
  const registry = globalThis.__chmiClassicApps;
  if (!registry || window.top !== window || window.__chmiClassicPortalLoaded || !registry.isHomepage(new URL(location.href))) return;
  window.__chmiClassicPortalLoaded = true;
  // Reserve the homepage before asynchronous extension storage lookup.
  window.__chmiClassicPortalCandidate = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const KEY = "chmiRadarClassicEnabled";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function link(text, url, className) {
    const node = el("a", className, text);
    node.href = url;
    return node;
  }
  function button(text, action, className = "chmi-portal-button") {
    const node = el("button", className, text);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }
  function external(text, href) {
    const node = link(text, href);
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    node.title = "Současná informační stránka ČHMÚ (nová karta)";
    return node;
  }

  function build() {
    if (document.getElementById("chmi-classic-portal")) return;
    let current = null;
    let frame = null;
    let session = null;
    let timeout = null;
    let selectedSection = "weather";
    document.documentElement.classList.add("chmi-classic-portal-active");
    const root = el("div");
    root.id = "chmi-classic-portal";
    const utilities = el("div", "chmi-portal-utilities");
    utilities.title = "ČHMÚ Classic · neoficiální uživatelská úprava";
    const newLook = button("Nový vzhled", () => {
      storage?.set({ [KEY]: false });
      document.documentElement.classList.remove("chmi-classic-portal-active");
      root.remove();
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("hashchange", onHash);
      // Restore the original DOM, not a destructive replacement or timed reload.
      const restore = button("Klasický vzhled", () => {
        storage?.set({ [KEY]: true });
        restore.remove();
        build();
      });
      restore.id = "chmi-portal-restore";
      document.body.append(restore);
      window.dispatchEvent(new Event("resize"));
    });
    const warnings = external("! VÝSTRAHY", "https://vystrahy-cr.chmi.cz/");
    warnings.className = "chmi-portal-warning-link";
    warnings.title = "Ověřit aktuální výstrahy na oficiálním webu ČHMÚ (nová karta)";
    utilities.append(warnings, newLook);
    const primary = el("nav", "chmi-portal-primary");
    primary.setAttribute("aria-label", "Hlavní nabídka");
    for (const [text, href] of [["PŘEDPOVĚDI", "https://www.chmi.cz/predpoved-pocasi"], ["AKTUÁLNÍ SITUACE", "https://www.chmi.cz/namerena-data"], ["HISTORICKÁ DATA", "https://www.chmi.cz/namerena-data/historicka-data"], ["INFORMACE A SLUŽBY", "https://www.chmi.cz/o-chmu/produkty-a-sluzby"], ["O NÁS", "https://www.chmi.cz/o-chmu"], ["KONTAKTY", "https://www.chmi.cz/o-chmu/kontakty"]]) primary.append(external(text, href));
    // Never infer warning status from an archive screenshot or failed request.
    const main = el("main", "chmi-portal-main");
    const tabs = el("div", "chmi-portal-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Produkty ČHMÚ");
    for (const [key, title] of [["weather", "☼ POČASÍ"], ["water", "≋ VODA"], ["air", "☘ OVZDUŠÍ"]]) {
      const tab = button(title, () => selectSection(key), "chmi-portal-tab");
      tab.dataset.section = key;
      tab.id = `chmi-portal-tab-${key}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "chmi-portal-workspace");
      tabs.append(tab);
    }
    tabs.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const list = [...tabs.querySelectorAll("button")];
      const index = list.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
      list[next].focus();
      selectSection(list[next].dataset.section);
    });
    const workspace = el("section", "chmi-portal-workspace");
    workspace.id = "chmi-portal-workspace";
    workspace.setAttribute("role", "tabpanel");
    const toolbar = el("div", "chmi-portal-app-toolbar");
    const title = el("h1", "chmi-portal-app-title");
    const status = el("span", "chmi-portal-status");
    status.setAttribute("role", "status");
    const expand = button("Zvětšit panel", () => {
      const expanded = root.classList.toggle("chmi-portal-expanded");
      expand.textContent = expanded ? "Zpět na portál" : "Zvětšit panel";
      expand.setAttribute("aria-pressed", String(expanded));
    });
    expand.setAttribute("aria-pressed", "false");
    const standalone = external("Otevřít samostatně ↗", registry.get("radar").url);
    standalone.className = "chmi-portal-button chmi-portal-standalone";
    standalone.title = "Otevřít tuto aplikaci v nové záložce v klasickém vzhledu";
    toolbar.append(title, status, standalone, expand);
    const stage = el("div", "chmi-portal-stage");
    stage.id = "chmi-portal-stage";
    const notice = el("div", "chmi-portal-notice");
    const noticeText = el("p");
    notice.append(noticeText, button("Zkusit znovu", () => openApp(current ?? "radar", true)));
    notice.hidden = true;
    stage.append(notice);
    workspace.append(toolbar, stage);
    const directory = el("nav", "chmi-portal-directory");
    directory.setAttribute("aria-label", "Původní rozcestník aplikací");
    function item(entry) {
      if (!entry.app || !registry.get(entry.app)) {
        const span = el("span", "chmi-portal-link is-unavailable", `>> ${entry.label}`);
        span.title = entry.reason;
        span.tabIndex = 0;
        span.setAttribute("aria-disabled", "true");
        span.setAttribute("aria-label", `${entry.label}. ${entry.reason}`);
        return span;
      }
      const anchor = link(`>> ${entry.label}`, registry.get(entry.app).url, "chmi-portal-link");
      anchor.dataset.app = entry.app;
      anchor.title = "Kliknutí: centrální panel. Ctrl/⌘+klik nebo prostřední tlačítko: nová záložka.";
      anchor.addEventListener("click", event => {
        if (!registry.shouldOpenInPanel(event)) return;
        event.preventDefault();
        const hash = `#classic=${entry.app}`;
        if (location.hash === hash) {
          if (selectedSection !== "weather") selectSection("weather");
          else openApp(entry.app);
        } else location.hash = hash;
      });
      return anchor;
    }
    for (const column of registry.columns) {
      const group = el("div", "chmi-portal-link-column");
      group.append(...column.map(item));
      directory.append(group);
    }
    const extra = el("nav", "chmi-portal-extra");
    extra.setAttribute("aria-label", "Další obnovené aplikace");
    extra.append(...registry.supplementary.map(item));
    const topbar = el("header", "chmi-portal-topbar");
    topbar.append(tabs, primary, utilities);
    main.append(workspace, directory, extra);
    root.append(topbar, main);
    document.body.append(root);

    function setStatus(state) {
      stage.dataset.state = state;
      status.textContent = state === "ready" ? "Oficiální živá aplikace ČHMÚ" : "Načítám aplikaci a její data…";
      workspace.setAttribute("aria-busy", String(state !== "ready"));
      if (state === "ready") { clearTimeout(timeout); notice.hidden = true; }
    }
    function selectSection(key) {
      selectedSection = key;
      for (const tab of tabs.querySelectorAll("button")) {
        const active = tab.dataset.section === key;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      }
      workspace.setAttribute("aria-labelledby", `chmi-portal-tab-${key}`);
      directory.hidden = extra.hidden = key !== "weather";
      standalone.hidden = false;
      if (key === "weather") { openApp(registry.route(location.hash)); return; }
      if (key === "water" || key === "air") {
        openApp(key);
        return;
      }
    }
    function openApp(id, force = false) {
      const app = registry.get(id);
      if (!app || (current === id && frame && !force)) return;
      clearTimeout(timeout);
      frame?.remove();
      current = id;
      session = crypto.randomUUID();
      title.textContent = app.title;
      standalone.href = app.url;
      notice.hidden = true;
      notice.querySelector("button").hidden = false;
      for (const anchor of root.querySelectorAll("[data-app]")) {
        if (anchor.dataset.app === id) anchor.setAttribute("aria-current", "true");
        else anchor.removeAttribute("aria-current");
      }
      frame = el("iframe", "chmi-portal-app-frame");
      frame.name = registry.frameName(id, session);
      frame.title = `${app.title} – klasické rozhraní`;
      frame.referrerPolicy = "strict-origin";
      frame.src = registry.frameURL(id, session);
      setStatus("loading");
      stage.append(frame);
      timeout = setTimeout(() => {
        status.textContent = "Načtení aplikace zatím nebylo potvrzeno";
        noticeText.textContent = "ČHMÚ může odpovídat pomalu nebo chybí oprávnění userscriptu uvnitř rámce. Panel neoznačujeme za funkční, dokud se nepotvrdí jeho rozhraní a mapové podklady.";
        notice.hidden = false;
        workspace.setAttribute("aria-busy", "false");
      }, 25000);
    }
    const onMessage = event => {
      if (!root.isConnected) return;
      if (registry.acceptsNavigation(event, frame, current, session)) {
        if (location.hash !== "#classic=forecast") location.hash = "#classic=forecast";
        else selectSection("weather");
        return;
      }
      if (registry.accepts(event, frame, current, session)) setStatus(event.data.state);
    };
    const onHash = () => {
      if (!root.isConnected) return;
      if (selectedSection !== "weather") selectSection("weather");
      else openApp(registry.route(location.hash));
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("hashchange", onHash);
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && root.classList.contains("chmi-portal-expanded")) expand.click();
    });
    selectSection("weather");
  }
  function initialize(result) {
    if (result[KEY] === false) { window.__chmiClassicPortalCandidate = false; return; }
    if (document.body) build();
    else document.addEventListener("DOMContentLoaded", build, { once: true });
  }
  if (storage) storage.get({ [KEY]: true }, initialize);
  else initialize({ [KEY]: true });
})();

(() => {
  "use strict";
  if (window.__chmiHydroAirClassicLoaded || window.__chmiClassicPortalCandidate) return;

  const path = location.pathname.replace(/\/+$/, "") || "/";
  const kind = ["www.chmi.cz", "chmi.cz"].includes(location.hostname) &&
    path === "/voda/aktualni-stav-rek-povodnova-mapa" ? "water" :
    ["www.chmi.cz", "chmi.cz"].includes(location.hostname) &&
    path === "/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr" ? "air" : null;
  if (!kind) return;
  window.__chmiHydroAirClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-hydro-air-classic";
  const BRAND_ID = "chmi-hydro-air-classic-brand";
  const MAP_CLASS = "chmi-hydro-air-map-host";
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const title = kind === "water" ? "ČHMÚ – VODA" : "ČHMÚ – OVZDUŠÍ";
  const tableURL = kind === "water" ?
    "https://www.chmi.cz/voda/tabulka-hydrologie" :
    "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-kvality-ovzdusi";
  let enabled = true;
  let refreshScheduled = false;
  let geometryScheduled = false;
  let resizeDispatchScheduled = false;
  let observedMap = null;
  let resizeObserver = null;

  function savePreference(value) {
    storage?.set({ [STORAGE_KEY]: value });
    setMode(value);
  }

  function ensureBrand() {
    if (document.getElementById(BRAND_ID)) return false;
    const main = document.querySelector("main");
    if (!main) return false;
    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.dataset.kind = kind;
    brand.innerHTML = `<strong>${title}</strong><nav aria-label="Původní záložky portálu"><a href="https://www.chmi.cz/">POČASÍ</a><a href="https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa">VODA</a><a href="https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr">OVZDUŠÍ</a></nav><span>živá data ČHMÚ</span><a class="chmi-hydro-air-table" target="_blank" rel="noopener noreferrer">Tabulka dat ↗</a><button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>`;
    brand.querySelector(".chmi-hydro-air-table").href = tableURL;
    brand.querySelector(`nav a:nth-child(${kind === "water" ? 2 : 3})`).setAttribute("aria-current", "page");
    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    main.insertBefore(brand, main.firstChild);
    return true;
  }

  function findMap() {
    return document.getElementById("chmu-map-container");
  }

  function markMap() {
    const map = findMap();
    if (!map) return false;
    const content = map.closest(".lfr-layout-structure-item-chmimapcomponent")?.parentElement;
    if (!content) return false;
    const changed = !map.classList.contains(MAP_CLASS) || !content.classList.contains("chmi-hydro-air-content");
    content.classList.add("chmi-hydro-air-content");
    map.classList.add(MAP_CLASS);
    return changed;
  }

  function dispatchResize() {
    if (resizeDispatchScheduled) return;
    resizeDispatchScheduled = true;
    requestAnimationFrame(() => {
      resizeDispatchScheduled = false;
      window.dispatchEvent(new Event("resize"));
    });
  }

  function updateGeometry() {
    if (!enabled) return;
    const map = findMap();
    if (!map) return;
    const rect = map.getBoundingClientRect();
    const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 6);
    document.documentElement.style.setProperty("--chmi-hydro-air-fit-height", `${Math.max(0, available)}px`);
    if (globalThis.ResizeObserver && observedMap !== map) {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => scheduleGeometry(false));
      resizeObserver.observe(map);
      observedMap = map;
    }
  }

  function scheduleGeometry(notify = true) {
    if (!enabled || geometryScheduled) return;
    geometryScheduled = true;
    requestAnimationFrame(() => {
      geometryScheduled = false;
      updateGeometry();
      if (notify) dispatchResize();
    });
  }

  function applyMode() {
    // A late or failed native map must not leave an otherwise useful page blank.
    if (!findMap()?.closest(".lfr-layout-structure-item-chmimapcomponent")) return;
    const first = !document.documentElement.classList.contains(ROOT_CLASS);
    document.documentElement.classList.add(ROOT_CLASS);
    const brandChanged = ensureBrand();
    const changed = markMap() || brandChanged;
    updateGeometry();
    if (first || changed) dispatchResize();
  }

  function removeMode() {
    document.getElementById(BRAND_ID)?.remove();
    document.querySelectorAll(`.${MAP_CLASS}`).forEach(node => node.classList.remove(MAP_CLASS));
    document.querySelectorAll(".chmi-hydro-air-content").forEach(node => node.classList.remove("chmi-hydro-air-content"));
    resizeObserver?.disconnect();
    resizeObserver = null;
    observedMap = null;
    document.documentElement.style.removeProperty("--chmi-hydro-air-fit-height");
    document.documentElement.classList.remove(ROOT_CLASS);
    dispatchResize();
  }

  function setMode(value) {
    enabled = Boolean(value);
    if (enabled) applyMode();
    else removeMode();
  }

  function scheduleRefresh() {
    if (!enabled || refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      applyMode();
    });
  }

  window.addEventListener("resize", () => { if (enabled) requestAnimationFrame(updateGeometry); });
  window.addEventListener("scroll", () => scheduleGeometry(false), { passive: true });
  new MutationObserver(scheduleRefresh).observe(document.documentElement, { childList: true, subtree: true });

  if (storage) storage.get({ [STORAGE_KEY]: true }, result => setMode(result[STORAGE_KEY]));
  else setMode(true);
})();


(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicPortalCandidate || window.__chmiClassicNavigationLoaded) {
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
    if (pathname === "/voda/aktualni-stav-rek-povodnova-mapa") {
      return "water";
    }
    if (pathname === "/predpoved-pocasi/synopticka-situace") {
      return "synoptic";
    }
    if (pathname === "/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa") {
      return "sonde";
    }
    if (pathname === "/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum") {
      return "klementinum";
    }
    if (pathname === "/namerena-data/umisteni-mericich-stanic/meteorologicke") {
      return "stations";
    }
    if (pathname === "/predpoved-pocasi/rizika/aktivita-klistat") {
      return "ticks";
    }
    if (pathname === "/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr") {
      return "air";
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
    hub: "#chmi-hub-classic-brand",
    water: "#chmi-hydro-air-classic-brand",
    air: "#chmi-hydro-air-classic-brand",
    synoptic: "#chmi-synoptic-classic-brand",
    sonde: "#chmi-sonde-classic-brand",
    klementinum: "#chmi-klementinum-brand",
    stations: "#chmi-stations-classic-brand",
    ticks: "#chmi-ticks-classic-brand"
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
    },
    {
      key: "water",
      label: "Voda – aktuální stavy a povodňová mapa",
      shortLabel: "Voda",
      href: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa"
    },
    {
      key: "air",
      label: "Ovzduší – aktuální mapy kvality ovzduší",
      shortLabel: "Ovzduší",
      href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr"
    },
    {
      key: "synoptic",
      label: "Synoptická situace – živé mapy",
      shortLabel: "Synoptika",
      href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"
    },
    {
      key: "sonde",
      label: "Sondážní měření – Praha-Libuš",
      shortLabel: "Sondáže",
      href: "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa"
    },
    {
      key: "klementinum",
      label: "Měření z Klementina",
      shortLabel: "Klementinum",
      href: "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum"
    },
    {
      key: "stations",
      label: "Meteorologické stanice ČHMÚ",
      shortLabel: "Stanice",
      href: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke"
    },
    {
      key: "ticks",
      label: "Předpověď aktivity klíšťat",
      shortLabel: "Klíšťata",
      href: "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat"
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

  if ((window.top !== window && !window.__chmiClassicEmbedded) || window.__chmiClassicPortalCandidate) {
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
  const LIGHTNING_CLASS = "chmi-radar-classic-lightning-only";
  const lightningMode = new URLSearchParams(location.search).get("chmi_classic_lightning") === "1";

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
  let lightningPresetApplied = false;
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

  function latestLightningFrame(select, range) {
    const selected = [...(select?.selectedOptions ?? [])];
    // The native list is newest-first, while its playback slider is oldest-first.
    const newestAvailable = selected.findIndex((option) => option.value.includes("/input_data/blesk/"));
    if (newestAvailable < 0) return null;
    const index = selected.length - 1 - newestAvailable;
    const min = Number(range.min);
    const max = Number(range.max);
    return Number.isInteger(min) && Number.isInteger(max) && index >= min && index <= max ? String(index) : null;
  }

  function stopOnLatestFrame() {
    const range = findAnimationRange();
    if (!range) {
      return false;
    }

    const target = lightningMode ? latestLightningFrame(document.getElementById("select_img_list"), range) : range.max;
    if (target === null) return false;
    if (target !== "" && range.value !== target) {
      range.value = target;
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

  function applyLightningPreset() {
    if (!lightningMode || lightningPresetApplied) return false;
    const product = document.getElementById("select_prod");
    const radarOpacity = document.getElementById("input_opa_slider_data1");
    const lightningOpacity = document.getElementById("input_opa_slider_data2");
    if (!product || !radarOpacity || !lightningOpacity) return false;

    if (product.value !== "maxz_mask-li") {
      product.value = "maxz_mask-li";
      product.dispatchEvent(new Event("change", { bubbles: true }));
      defaultPlaybackApplied = false;
      setTimeout(scheduleRefresh, 250);
      return false;
    }
    if (!defaultDisplayApplied || !defaultPlaybackApplied) return false;

    for (const [control, value] of [[radarOpacity, "0"], [lightningOpacity, "1"]]) {
      if (control.value === value) continue;
      control.value = value;
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
    lightningPresetApplied = true;
    document.documentElement.classList.add(LIGHTNING_CLASS);
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
            applyLightningPreset();
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
      <strong>${lightningMode ? "ČHMÚ · Detekce blesků" : "ČHMÚ Radar"}</strong>
      <span>${lightningMode ? "klasické rozhraní · živá vrstva za 10 min" : "klasické rozhraní"}</span>
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
    const lightningChanged = applyLightningPreset();

    if (!hadRootClass || sectionsChanged || layoutChanged || brandChanged || toolbarChanged || lightningChanged) {
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
    document.documentElement.classList.remove(LIGHTNING_CLASS);
    lightningPresetApplied = false;
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

  document.addEventListener("input", (event) => {
    if (!lightningMode || !["input_opa_slider_data1", "input_opa_slider_data2"].includes(event.target?.id)) return;
    document.documentElement.classList.toggle(LIGHTNING_CLASS,
      document.getElementById("select_prod")?.value === "maxz_mask-li" &&
      Number(document.getElementById("input_opa_slider_data1")?.value) === 0);
  });
  document.addEventListener("change", (event) => {
    if (lightningMode && event.target?.id === "select_prod") {
      document.documentElement.classList.toggle(LIGHTNING_CLASS,
        event.target.value === "maxz_mask-li" &&
        Number(document.getElementById("input_opa_slider_data1")?.value) === 0);
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

  if ((window.top !== window && !window.__chmiClassicEmbedded) || window.__chmiSatelliteClassicLoaded) {
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
  const compactSections = [];
  const movedInfo = [];

  function compactLiveControls() {
    const sidebar = document.querySelector("#settingsMenu .offcanvas-body");
    if (!sidebar) return;
    for (const section of sidebar.querySelectorAll(".settings-section")) {
      if (section.classList.contains("chmi-satellite-classic-native-choice") ||
          section.querySelector("#time-range-group, .chmi-classic-disclosure")) continue;
      const header = section.querySelector(".section-header");
      if (!header) continue;
      const details = document.createElement("details");
      details.className = "chmi-classic-disclosure";
      const summary = document.createElement("summary");
      const nodes = [...section.childNodes];
      summary.append(header);
      details.append(summary, ...nodes.filter(node => node !== header));
      section.append(details);
      compactSections.push({ section, nodes, details });
    }
    if (!document.getElementById("chmi-satellite-classic-info")) {
      const nodes = [...document.querySelectorAll(".map-wrapper > .product-legend-box, .map-wrapper > #satInfo")];
      if (!nodes.length) return;
      const details = document.createElement("details");
      details.id = "chmi-satellite-classic-info";
      details.className = "chmi-classic-disclosure";
      const summary = document.createElement("summary");
      summary.textContent = "Legenda a informace ke snímku";
      details.append(summary);
      for (const node of nodes) {
        const placeholder = document.createComment("chmi-classic-info-position");
        node.before(placeholder);
        movedInfo.push({ node, placeholder });
        details.append(node);
      }
      sidebar.append(details);
    }
  }

  function restoreLiveControls() {
    for (const { section, nodes, details } of compactSections.splice(0)) {
      section.append(...nodes);
      details.remove();
    }
    for (const { node, placeholder } of movedInfo.splice(0)) placeholder.replaceWith(node);
    document.getElementById("chmi-satellite-classic-info")?.remove();
  }

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
    compactLiveControls();

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
    restoreLiveControls();
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
  if (window.__chmiClassicWebcamsLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname)) return;
  const overview = /^\/namerena-data\/webkamery\/?$/.test(location.pathname);
  const detail = /^\/namerena-data\/webkamera\/[a-z0-9_-]+\/?$/.test(location.pathname);
  if (!overview && !detail) return;
  window.__chmiClassicWebcamsLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    const adapt = () => {
      if (overview) {
        const map = document.getElementById("chmu-map-container");
        const signpost = document.querySelector("[id^='chmi-signpost-container-']");
        const mapBlock = map?.closest(".lfr-layout-structure-item-chmimapcomponent");
        const listBlock = signpost?.closest(".lfr-layout-structure-item-chmidynamicsignpost");
        if (mapBlock && listBlock && mapBlock.parentElement === listBlock.parentElement) {
          const workspace = mapBlock.parentElement;
          workspace.classList.add("chmi-webcams-workspace");
          mapBlock.classList.add("chmi-webcams-map-block");
          listBlock.classList.add("chmi-webcams-list-block");
          map.dataset.chmiWebcamsNative = "verified";
          document.documentElement.classList.add("chmi-webcams-classic", "chmi-webcams-overview");
          requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
          return true;
        }
      } else {
        const player = document.getElementById("chmi-playabledata");
        const image = player?.querySelector(".chmi-playableimage-img");
        if (image) {
          const playerBlock = player.closest(".lfr-layout-structure-item-chmiimagesreplay");
          const signpost = document.querySelector("[id^='chmi-signpost-container-']");
          const listBlock = signpost?.closest(".lfr-layout-structure-item-chmidynamicsignpost");
          if (playerBlock && listBlock && playerBlock.parentElement === listBlock.parentElement) {
            playerBlock.parentElement.classList.add("chmi-webcams-detail-workspace");
            playerBlock.classList.add("chmi-webcams-player-block");
            listBlock.classList.add("chmi-webcams-list-block");
          }
          player.dataset.chmiWebcamsNative = "verified";
          document.documentElement.classList.add("chmi-webcams-classic", "chmi-webcams-detail");
          return true;
        }
      }
      return false;
    };
    if (adapt()) return;
    const observer = new MutationObserver(() => { if (adapt()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 30000);
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  if (window.__chmiClassicMeteogramLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/meteogram\/[a-z0-9-]+\/?$/.test(location.pathname)) return;
  window.__chmiClassicMeteogramLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const recentKey = "chmiClassicMeteogramRecentV1";
  const validPlace = entry => {
    if (!entry || typeof entry.url !== "string" || typeof entry.label !== "string") return null;
    try {
      const url = new URL(entry.url);
      if (url.protocol !== "https:" || url.port || url.username || url.password ||
          !["www.chmi.cz", "chmi.cz"].includes(url.hostname) ||
          !/^\/meteogram\/\d+-[a-z0-9-]+\/?$/.test(url.pathname)) return null;
      const label = entry.label.trim().slice(0, 80);
      return label ? { url: url.origin + url.pathname, label } : null;
    } catch { return null; }
  };

  const addRecentPlaces = root => {
    const header = root.querySelector(":scope > .lfr-layout-structure-item-header");
    const heading = header?.querySelector("h1");
    const current = validPlace({
      url: location.href,
      label: heading?.textContent.replace(/^Předpověď počasí:\s*/i, "") ?? ""
    });
    if (!current || header.querySelector(".chmi-meteogram-recent")) return;

    let saved = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(recentKey) ?? "[]");
      if (Array.isArray(parsed)) saved = parsed.map(validPlace).filter(Boolean);
    } catch { /* Private browsing or an invalid older value: keep the current place. */ }
    const places = [current, ...saved.filter(place => place.url !== current.url)]
      .filter((place, index, all) => all.findIndex(other => other.url === place.url) === index)
      .slice(0, 4);
    try { localStorage.setItem(recentKey, JSON.stringify(places)); } catch { /* Optional convenience only. */ }

    const nav = document.createElement("nav");
    nav.className = "chmi-meteogram-recent";
    nav.setAttribute("aria-label", "Poslední místa meteogramu");
    const label = document.createElement("span");
    label.textContent = "Poslední místa:";
    nav.append(label);
    for (const place of places) {
      const link = document.createElement("a");
      link.href = place.url;
      link.textContent = place.label;
      if (place.url === current.url) link.setAttribute("aria-current", "page");
      nav.append(link);
    }
    header.append(nav);
  };

  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    const adapt = () => {
      const root = document.querySelector("main > div");
      const graph = root?.querySelector(":scope > .lfr-layout-structure-item-chmigraph");
      const search = root?.querySelector(":scope > .lfr-layout-structure-item-chmi---background-block input.chmi-search");
      const tables = root && [...root.children].filter(child =>
        child.classList.contains("lfr-layout-structure-item-chmidynamictable"));
      const canvas = graph?.querySelector("canvas[id*='ChmiGraph']");
      // The native page creates a 300 × 150 placeholder before its data fetch.
      // A failed fetch must leave the original page visible, not an empty shell.
      if (!canvas || canvas.width <= 300 || canvas.height <= 150 || !search || !tables?.length) return false;

      // Move the existing table portlets, not their contents: ČHMÚ retains its
      // data source, search, chart and event handlers. Only the layout changes.
      const panel = document.createElement("section");
      panel.className = "chmi-meteogram-tables";
      panel.setAttribute("aria-label", "Hodinová předpověď");
      const title = document.createElement("div");
      title.className = "chmi-meteogram-tables-title";
      title.textContent = "Hodinová předpověď · tabulku lze posouvat, graf zůstává viditelný";
      panel.append(title, ...tables);
      root.append(panel);
      addRecentPlaces(root);
      root.classList.add("chmi-meteogram-workspace");
      graph.dataset.chmiMeteogramNative = "verified";
      document.documentElement.classList.add("chmi-meteogram-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    };

    if (adapt()) return;
    const observer = new MutationObserver(() => { if (adapt()) stop(); });
    const stop = () => {
      observer.disconnect();
      clearInterval(poller);
      clearTimeout(expiration);
    };
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Chart.js can paint into an existing canvas without changing the DOM.
    const poller = setInterval(() => { if (adapt()) stop(); }, 1000);
    const expiration = setTimeout(stop, 30000);
    window.addEventListener("pagehide", stop, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  const DAYS = ["dnes", "zitra", "pozitri"];
  function normalizePeriods(payload) {
    if (!Array.isArray(payload?.data)) return [];
    return payload.data.slice(0, 20).flatMap(item => {
      const token = typeof item?.mapDataRequestToken === "string" && /^(dnes|zitra|pozitri)-(rano|odpoledne)$/.exec(item.mapDataRequestToken);
      const title = typeof item?.title === "string" && item.title.length <= 160 && /^(.+?)\s+(ráno|odpoledne)\s+(.+?)\s*°C$/iu.exec(item.title.trim());
      const icon = String(item?.weatherIcon ?? "");
      if (!token || !title || !/^\d{1,4}$/.test(icon) ||
          (title[2].toLowerCase() === "ráno" ? "rano" : "odpoledne") !== token[2]) return [];
      return [{ token: token[0], day: token[1], part: token[2], weekday: title[1],
        temperature: title[3].trim(), icon, title: item.title.trim(),
        weather: typeof item.weatherAlt === "string" ? item.weatherAlt.slice(0, 160) : "Předpověď" }];
    });
  }

  function mergePeriods(responses) {
    const periods = new Map();
    for (const response of responses) {
      if (!DAYS.includes(response.day) || !Array.isArray(response.periods)) continue;
      for (const period of response.periods) {
        if (!DAYS.includes(period.day) || !/^(dnes|zitra|pozitri)-(rano|odpoledne)$/.test(period.token)) continue;
        const priority = period.day === response.day ? 2 : 1;
        if ((periods.get(period.token)?.priority ?? 0) < priority) periods.set(period.token, { priority, period });
      }
    }
    return [...periods.values()].map(item => item.period);
  }

  function periodURL(base, token) {
    const match = /^(dnes|zitra|pozitri)-(rano|odpoledne)$/.exec(token);
    if (!match) return null;
    try {
      const url = new URL(base);
      if (url.protocol !== "https:" || !["www.chmi.cz", "chmi.cz"].includes(url.hostname)) return null;
      url.pathname = `/predpoved-pocasi/${match[1]}`;
      url.search = "";
      url.hash = "";
      url.searchParams.set("obdobi", token);
      return url.href;
    } catch { return null; }
  }

  function usePortraitCityList(width, height) {
    return Number.isFinite(width) && Number.isFinite(height) && width > 0 &&
      width <= 700 && height >= Math.max(600, width * 1.4);
  }

  function mapAspectRatio(viewBox) {
    if (typeof viewBox !== "string" || !viewBox.trim()) return null;
    const values = viewBox.trim().split(/[\s,]+/).map(Number);
    if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) return null;
    const ratio = values[2] / values[3];
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
  }
  function regionCardCenter(region, host) {
    if (![region?.left, region?.top, region?.width, region?.height,
      host?.left, host?.top, host?.width, host?.height].every(Number.isFinite) ||
      region.width <= 0 || region.height <= 0 || host.width <= 0 || host.height <= 0) return null;
    return { left: region.left + region.width / 2 - host.left,
      top: region.top + region.height / 2 - host.top };
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { normalizePeriods, mergePeriods, periodURL, usePortraitCityList, mapAspectRatio, regionCardCenter };
    return;
  }

  if (window.__chmiClassicForecastLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.test(location.pathname)) return;
  window.__chmiClassicForecastLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    let map;
    let workspace;
    let cityObserver;
    let layoutObserver;
    let updateLayout;
    let scheduled = false;
    let awaitingData = false;
    let initialRefresh;
    let summaryPeriods = [];
    let summaryLoading = true;
    const summaryRows = new Map();
    const requests = new Set();

    const chooseNativePeriod = input => {
      awaitingData = true;
      scheduleRender();
      if (input.checked) input.closest("label").dispatchEvent(new Event("input", { bubbles: true }));
      else input.click();
    };

    const renderSummary = () => {
      const selected = map.querySelector('#weather-switcher input:checked')?.value;
      for (const [day, row] of summaryRows) {
        const entries = summaryPeriods.filter(period => period.day === day);
        if (entries.length) row.querySelector("h3").textContent = entries[0].weekday;
        const cells = row.querySelector(".chmi-forecast-day-cells");
        const signature = JSON.stringify([summaryLoading, entries]);
        if (row.dataset.signature === signature) {
          for (const cell of cells.querySelectorAll("a[data-period]")) {
            if (cell.dataset.period === selected) cell.setAttribute("aria-current", "true");
            else cell.removeAttribute("aria-current");
          }
          continue; // Preserve keyboard focus during native data updates.
        }
        row.dataset.signature = signature;
        cells.replaceChildren(...["rano", "odpoledne"].map(part => {
          const period = entries.find(entry => entry.part === part);
          const label = part === "rano" ? "Ráno" : "Odpoledne";
          const cell = document.createElement(period ? "a" : "span");
          cell.className = "chmi-forecast-day-cell";
          const caption = document.createElement("span");
          caption.textContent = label;
          cell.append(caption);
          if (!period) {
            const status = document.createElement("small");
            status.textContent = summaryLoading ? "Načítání…" : "Není údaj";
            cell.title = summaryLoading ? "Načítání z oficiálního zdroje ČHMÚ" : "ČHMÚ toto období v aktuální nabídce neposkytuje. Hodnota není doplněna odhadem.";
            cell.append(status);
            return cell;
          }
          cell.href = periodURL(location.href, period.token);
          cell.dataset.sennaOff = "true";
          cell.dataset.period = period.token;
          cell.setAttribute("aria-label", `${period.weekday} ${label}: ${period.temperature} °C, ${period.weather}`);
          if (period.token === selected) cell.setAttribute("aria-current", "true");
          const icon = document.createElement("img");
          icon.src = new URL(`/o/chmu-theme/images/icon/${period.icon}.svg`, location.origin).href;
          icon.alt = period.weather;
          const temperature = document.createElement("strong");
          temperature.textContent = period.temperature;
          cell.append(icon, temperature);
          cell.addEventListener("click", event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
            const input = [...map.querySelectorAll('#weather-switcher input')].find(item => item.value === period.token);
            if (!input || !location.pathname.replace(/\/$/, "").endsWith(`/${period.day}`)) return;
            event.preventDefault();
            if (!awaitingData) chooseNativePeriod(input);
          });
          return cell;
        }));
      }
    };

    const loadSummary = async () => {
      // Same official endpoint used by the native image-map component. Only
      // days with verified native navigation links are requested; no archive data.
      const responses = await Promise.all([...summaryRows.keys()].map(async day => {
        const controller = new AbortController();
        requests.add(controller);
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(`https://data-provider.chmi.cz/api/imageMap/timeRangeSwitch/999/${day}`, { signal: controller.signal });
          if (!response.ok) throw new Error("Forecast unavailable");
          return { day, periods: normalizePeriods(await response.json()) };
        } catch { return { day, periods: [] }; }
        finally { clearTimeout(timeout); requests.delete(controller); }
      }));
      if (!workspace.isConnected) return;
      summaryPeriods = mergePeriods(responses);
      summaryLoading = false;
      renderSummary();
    };

    const cityData = candidate => [...candidate.querySelectorAll("#weather-map-details a.weather-info")]
      .map(link => {
        const href = new URL(link.getAttribute("href") || "", location.href);
        const name = link.querySelector(".weather-info__county")?.textContent.trim();
        const value = link.querySelector(".weather-info__displayValue")?.textContent.trim();
        const weather = link.querySelector(".weather-info__icon img")?.getAttribute("alt")?.trim();
        return href.origin === location.origin && /^\/predpoved-pocasi\/[a-z0-9-]+\/(dnes|zitra|pozitri)\/?$/.test(href.pathname) &&
          name && value ? { href: href.href, name, value, weather } : null;
      }).filter(Boolean);

    const positionCityCards = () => {
      const host = map?.querySelector("#weather-map-details .position-relative");
      const svg = map?.querySelector("#weather-map");
      if (!host || !svg) return;
      const hostRect = host.getBoundingClientRect();
      // Only the 13 country-map cards use this position. Hidden city/POI
      // cards have their own coordinates and must stay untouched when opened.
      for (const card of host.querySelectorAll('.weather-info-container[data-region-id="999"]')) {
        const region = card.dataset.region;
        // The official SVG and cards are siblings. The native percentage
        // positions target city coordinates and drift when the map is resized.
        // Use the region path's *rendered* bounds, including SVG letterboxing.
        if (!/^[a-z0-9-]+$/.test(region)) continue;
        const path = svg.querySelector(`path[data-region="${region}"]`);
        const center = path && regionCardCenter(path.getBoundingClientRect(), hostRect);
        if (!center) continue;
        card.style.left = `${center.left}px`;
        card.style.top = `${center.top}px`;
        card.classList.add("chmi-forecast-region-centered");
      }
    };

    const render = () => {
      scheduled = false;
      if (!map?.isConnected) return;
      const companion = document.getElementById("chmi-forecast-accessible");
      if (!companion) return;
      const periods = [...workspace.querySelectorAll("#weather-switcher label.weather-switcher__select")]
        .map(label => ({ label: label.querySelector("span")?.textContent.trim(), input: label.querySelector('input[type="radio"][name="tod"]') }))
        .filter(item => item.label && item.input);
      const cities = cityData(map);
      positionCityCards();
      if (!periods.length) return;

      for (const controls of workspace.querySelectorAll(".chmi-forecast-periods")) {
        if (controls.children.length !== periods.length ||
            periods.some((item, index) => controls.children[index]?.textContent !== item.label)) {
          controls.replaceChildren(...periods.map(({ label, input }) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => {
              chooseNativePeriod(input);
            });
            return button;
          }));
        }
        periods.forEach((item, index) => {
          controls.children[index].setAttribute("aria-pressed", String(item.input.checked));
          controls.children[index].disabled = awaitingData;
        });
      }
      workspace.dataset.state = awaitingData ? "loading" : cities.length ? "ready" : "error";
      renderSummary();
      workspace.querySelector(".chmi-forecast-current").textContent = awaitingData ? "Načítání předpovědi…" :
        !cities.length ? "ČHMÚ pro toto období nevrátil údaje. Kliknutím na období zkuste načtení znovu." :
        periods.find(item => item.input.checked)?.label ?? "Předpověď pro ČR";
      if (awaitingData || !cities.length) return;
      companion.querySelector(".chmi-forecast-selected-period").textContent =
        periods.find(item => item.input.checked)?.label ?? "";

      const list = companion.querySelector(".chmi-forecast-cities");
      list.removeAttribute("aria-busy");
      list.replaceChildren(...cities.map(({ href, name, value, weather }) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = `${name}: ${value}${weather ? `, ${weather}` : ""}`;
        item.append(link);
        return item;
      }));
    };

    const scheduleRender = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(render);
    };

    const adapt = () => {
      const candidate = document.querySelector('.lfr-layout-structure-item-chmiimagemapcomponent .image-map[id^="chmi-image-map-"]');
      if (!candidate?.querySelector("#weather-map[viewBox], #weather-map[viewbox]")) return false;
      if (!candidate.querySelector("#weather-switcher input:checked") ||
          !candidate.querySelector("#weather-map-details a.weather-info")) return false;
      if (!cityData(candidate).length) return false;

      map = candidate;
      // Keep native geometry, positioning, listeners and live data nodes.
      workspace = document.createElement("section");
      workspace.id = "chmi-forecast-workspace";
      workspace.dataset.state = "loading";
      workspace.setAttribute("aria-label", "Počasí v České republice – živá předpověď ČHMÚ");
      const header = document.createElement("header");
      header.className = "chmi-forecast-header";
      const heading = document.createElement("strong");
      heading.textContent = "Počasí v České republice";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.addEventListener("click", () => {
        storage?.set({ chmiRadarClassicEnabled: false });
        location.reload();
      });
      header.append(heading, restore);
      const body = document.createElement("div");
      body.className = "chmi-forecast-body";
      const aside = document.createElement("aside");
      aside.className = "chmi-forecast-sidebar";
      const title = document.createElement("strong");
      title.textContent = "Předpověď pro ČR";
      const days = document.createElement("nav");
      days.className = "chmi-forecast-day-grid";
      days.setAttribute("aria-label", "Třídenní předpověď – ráno a odpoledne");
      const seen = new Map();
      for (const link of document.querySelectorAll('a[href]')) {
        let href;
        try { href = new URL(link.getAttribute("href"), location.href); } catch { continue; }
        const day = /^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.exec(href.pathname)?.[1];
        const text = link.textContent.trim().replace(/\s+/g, " ");
        if (href.origin !== location.origin || href.hash || !day || !/^(Dnes|Zítra|Pozítří)/.test(text)) continue;
        // Prefer the official day cards (date + range) to duplicate menu links.
        const score = text.includes("°C") ? 2 : 1;
        const previous = seen.get(day);
        if (previous?.score >= score) continue;
        const copy = document.createElement("a");
        copy.href = href.href;
        copy.dataset.sennaOff = "true";
        copy.textContent = text;
        if (href.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) copy.setAttribute("aria-current", "page");
        seen.set(day, { score, link: copy });
      }
      for (const day of DAYS) {
        const native = seen.get(day)?.link;
        if (!native) continue;
        const row = document.createElement("section");
        row.className = "chmi-forecast-day";
        const heading = document.createElement("h3");
        heading.textContent = native.textContent.replace(/\s+-?\d.*$/, "");
        const cells = document.createElement("div");
        cells.className = "chmi-forecast-day-cells";
        row.append(heading, cells);
        days.append(row);
        summaryRows.set(day, row);
      }
      const current = document.createElement("p");
      current.className = "chmi-forecast-current";
      current.setAttribute("aria-live", "polite");
      aside.append(title, days, current);
      // Preserve the portlet ancestry as well: native async initialization
      // queries that container. Moving only the SVG or switcher breaks it.
      body.append(candidate.closest('.lfr-layout-structure-item-chmiimagemapcomponent'), aside);
      workspace.append(header, body);
      document.body.append(workspace);
      const companion = document.createElement("details");
      companion.id = "chmi-forecast-accessible";
      companion.className = "chmi-forecast-accessible";
      companion.innerHTML = '<summary>Předpověď pro města – přístupný seznam</summary>' +
        '<div class="chmi-forecast-periods" role="group" aria-label="Období předpovědi"></div>' +
        '<p class="chmi-forecast-selected-period" aria-live="polite"></p>' +
        '<ul class="chmi-forecast-cities"></ul>';
      workspace.append(companion);
      document.documentElement.classList.add("chmi-forecast-classic");
      candidate.dataset.chmiForecastNative = "verified";
      // In a tall narrow viewport the SVG already fills the available width.
      // Use its native aspect ratio instead of adding blank vertical bands,
      // and give the spare room to the existing live, accessible city list.
      const ratio = mapAspectRatio(candidate.querySelector("#weather-map")?.getAttribute("viewBox"));
      let userChoseListState = false;
      companion.querySelector("summary").addEventListener("click", () => { userChoseListState = true; });
      if (ratio) workspace.style.setProperty("--chmi-forecast-map-ratio", String(ratio));
      updateLayout = () => {
        const bounds = workspace.getBoundingClientRect();
        const portrait = Boolean(ratio && usePortraitCityList(bounds.width, bounds.height));
        // The SVG may have acquired new letterboxing even when the portrait
        // breakpoint itself did not change.
        requestAnimationFrame(positionCityCards);
        if (workspace.dataset.portrait === String(portrait)) return;
        workspace.dataset.portrait = String(portrait);
        if (!userChoseListState) companion.open = portrait;
      };
      updateLayout();
      if (typeof ResizeObserver === "function") {
        layoutObserver = new ResizeObserver(updateLayout);
        layoutObserver.observe(workspace);
      } else window.addEventListener("resize", updateLayout);
      workspace.addEventListener("change", event => {
        if (!event.target.matches('#weather-switcher input[type="radio"][name="tod"]')) return;
        awaitingData = true;
        workspace.dataset.state = "loading";
        current.textContent = "Načítání předpovědi…";
        companion.querySelector(".chmi-forecast-selected-period").textContent = "Načítání předpovědi…";
        const list = companion.querySelector(".chmi-forecast-cities");
        list.setAttribute("aria-busy", "true");
        list.replaceChildren();
        scheduleRender();
      });
      cityObserver = new MutationObserver(() => {
        awaitingData = false;
        scheduleRender();
      });
      cityObserver.observe(candidate.querySelector("#weather-map-details"), { childList: true, subtree: true, characterData: true });
      // Native initialization starts both the query-selected request and a
      // first-period fallback concurrently. Refresh the selected period once
      // after the initial DOM settles, using its existing native input handler.
      const refreshInitialPeriod = () => {
        clearTimeout(initialRefresh);
        initialRefresh = setTimeout(() => {
          const selected = map.querySelector('#weather-switcher input:checked');
          if (!selected || !workspace.isConnected) return;
          awaitingData = true;
          scheduleRender();
          selected.closest("label").dispatchEvent(new Event("input", { bubbles: true }));
        }, 200);
      };
      if (document.readyState === "complete") refreshInitialPeriod();
      else window.addEventListener("load", refreshInitialPeriod, { once: true });
      renderSummary();
      loadSummary();
      scheduleRender();
      return true;
    };

    // Native code updates checked after its asynchronous data render. Batch
    // DOM notifications to the next frame so we do not miss that property-only
    // change (which itself does not produce a MutationObserver notification).
    let adaptScheduled = false;
    const observer = new MutationObserver(() => {
      if (adaptScheduled) return;
      adaptScheduled = true;
      requestAnimationFrame(() => {
        adaptScheduled = false;
        if (adapt()) observer.disconnect();
      });
    });
    if (!adapt()) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 30000);
    }
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      cityObserver?.disconnect();
      layoutObserver?.disconnect();
      if (updateLayout) window.removeEventListener("resize", updateLayout);
      clearTimeout(initialRefresh);
      for (const controller of requests) controller.abort();
    }, { once: true });
  };

  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  function firstUsableFrame(images) {
    return images.find(image => /^mapa_\d+$/.test(image.id) && image.complete && image.naturalWidth > 32)?.id ?? null;
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { firstUsableFrame };
    return;
  }

  if (window.__chmiClassicRainfallLoaded || location.hostname !== "hydro.chmi.cz" ||
      location.pathname !== "/hppsoldv/main_rain.php") return;
  window.__chmiClassicRainfallLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    function adapt() {
      const page = document.getElementById("page");
      const content = page?.querySelector(".box > .cont");
      const map = document.getElementById("iashow");
      const menu = document.getElementById("i_menu");
      if (!page || !content || !map || !menu || !document.getElementById("bgr")) return false;

      const brand = document.createElement("header");
      brand.id = "chmi-rainfall-brand";
      const heading = document.createElement("strong");
      heading.textContent = "ČHMÚ · Radarové odhady srážek";
      const caption = document.createElement("span");
      caption.textContent = "klasické rozhraní · živá data ČHMÚ";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
      restore.addEventListener("click", () => {
        storage?.set({ chmiRadarClassicEnabled: false });
        location.reload();
      });
      brand.append(heading, caption, restore);
      page.prepend(brand);
      document.documentElement.classList.add("chmi-rainfall-classic");

      // The newest official PNG can briefly be missing. Use the first already
      // loaded native frame and its own time control, without replacing data.
      let userSelected = false;
      let fallbackDone = false;
      menu.addEventListener("click", event => {
        if (event.target.closest("p[id^='imenu_']")) userSelected = true;
      }, true);
      const selectLoaded = () => {
        if (fallbackDone || userSelected) return;
        const active = map.querySelector("img.active");
        if (!active || !active.complete || active.naturalWidth > 32) return;
        const frameId = firstUsableFrame([...map.querySelectorAll("img[id^='mapa_']")]);
        const choice = frameId && document.getElementById(frameId.replace("mapa_", "imenu_"));
        if (choice) {
          fallbackDone = true;
          choice.click();
        }
      };
      const wired = new WeakSet();
      const wireImages = () => {
        for (const image of map.querySelectorAll("img[id^='mapa_']")) {
          if (wired.has(image)) continue;
          wired.add(image);
          image.addEventListener("load", selectLoaded);
          image.addEventListener("error", selectLoaded);
        }
        selectLoaded();
      };
      const imagesObserver = new MutationObserver(wireImages);
      imagesObserver.observe(map, { childList: true, subtree: true });
      window.addEventListener("pagehide", () => imagesObserver.disconnect(), { once: true });
      wireImages();
      return true;
    }

    if (adapt()) return;
    const observer = new MutationObserver(() => {
      if (adapt()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  function replayReady(slider, image) {
    return slider?.type === "range" && Number.isFinite(Number(slider.min)) &&
      Number.isFinite(Number(slider.max)) && Number(slider.max) > Number(slider.min) &&
      image?.complete === true && image.naturalWidth > 32 && image.naturalHeight > 32 &&
      Boolean(image.currentSrc || image.src) &&
      !/\/synop-bez-dat(?:[?#]|$)/.test(image.currentSrc || image.src);
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { replayReady };
    return;
  }

  if (window.__chmiClassicSynopticLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/synopticka-situace\/?$/.test(location.pathname)) return;
  window.__chmiClassicSynopticLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    let observer;
    let deadline;
    const onImageLoad = event => {
      if (event.target.matches?.("#chmi-playabledata .playabledata-content-container img.chmi-playableimage-img")) adapt();
    };
    const stopWaiting = () => {
      observer?.disconnect();
      clearTimeout(deadline);
      document.removeEventListener("load", onImageLoad, true);
    };

    function adapt() {
      const replay = document.getElementById("chmi-playabledata");
      const slider = replay?.querySelector("#imageSlider");
      const image = replay?.querySelector(".playabledata-content-container img.chmi-playableimage-img");
      const portlet = replay?.closest('[id^="portlet_ChmiImagesReplay_"]');
      if (!portlet || !replayReady(slider, image)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-synoptic-workspace";
      workspace.setAttribute("aria-label", "Synoptická situace – živé mapy ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-synoptic-classic-brand";
      const heading = document.createElement("strong");
      heading.textContent = "ČHMÚ · Synoptická situace";
      const caption = document.createElement("span");
      caption.textContent = "Atlantik – Evropa · klasické rozhraní";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
      restore.addEventListener("click", () => {
        storage?.set({ chmiRadarClassicEnabled: false });
        location.reload();
      });
      header.append(heading, caption, restore);
      workspace.append(header, portlet);
      document.body.append(workspace);
      replay.dataset.chmiSynopticNative = "verified";
      document.documentElement.classList.add("chmi-synoptic-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }

    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["src", "max"] });
    document.addEventListener("load", onImageLoad, true);
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // A decoded native graph, rather than the initial placeholder, is the gate
  // for hiding the official page. Keep this helper independent of the DOM.
  function replayReady(slider, image) {
    const src = image?.currentSrc || image?.src || "";
    return slider?.type === "range" && Number.isFinite(Number(slider.min)) &&
      Number.isFinite(Number(slider.max)) && Number(slider.max) > Number(slider.min) &&
      image?.complete === true && image.naturalWidth >= 500 &&
      image.naturalHeight >= 400 && /^(?:data:image\/|https:\/\/www\.chmi\.cz\/)/.test(src);
  }

  function sondeReady(replays) {
    return Array.isArray(replays) && replays.length === 2 &&
      replays.every(({ slider, image }) => replayReady(slider, image));
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { replayReady, sondeReady };
    return;
  }

  if (window.__chmiClassicSondeLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/letectvi\/aerologicka-data\/11520-praha-libus-[a-z0-9-]+\/?$/.test(location.pathname)) return;
  window.__chmiClassicSondeLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    let observer;
    let deadline;
    const stopWaiting = () => {
      observer?.disconnect();
      clearTimeout(deadline);
      document.removeEventListener("load", onImageLoad, true);
    };
    const onImageLoad = event => {
      if (event.target.matches?.('section.portlet[id^="portlet_ChmiImagesReplay_INSTANCE_"] img.chmi-playableimage-img')) adapt();
    };

    function adapt() {
      const portlets = [...document.querySelectorAll('section.portlet[id^="portlet_ChmiImagesReplay_INSTANCE_"]')];
      const replays = portlets.map(portlet => {
        const player = portlet.querySelector("#chmi-playabledata");
        return {
          player,
          slider: player?.querySelector('input#imageSlider[type="range"]'),
          image: player?.querySelector("img.chmi-playableimage-img"),
          boundary: portlet.parentElement
        };
      });
      const map = document.querySelector("main #chmu-map-container");
      const menu = map?.querySelector(".ol-menu .menu--ul");
      const items = menu && [...menu.querySelectorAll(":scope > .menu--item")];
      const productNames = ["Emagram do 100 hPa", "Emagram do 500 hPa", "Skew-T diagram", "Profil větru", "Hodograf", "ASCII Tabulka"];
      const title = document.querySelector("main h1")?.textContent.trim();
      const labels = [...document.querySelectorAll("main h2")].map(node => node.textContent.trim());
      const ascent = labels.find(label => / - vzestup$/i.test(label));
      const descent = labels.find(label => / - sestup$/i.test(label));

      // The map hosts the official product links and their handlers. The
      // portlet boundaries hold the two original players and their handlers.
      if (!sondeReady(replays) || !map || !menu || items?.length !== 6 ||
          !productNames.every(name => items.some(item => item.querySelector("a.menu-item-header[href='#']")?.getAttribute("aria-label") === name)) ||
          items.filter(item => item.classList.contains("__selected")).length !== 1 ||
          !title?.startsWith("Praha - Libuš:") || !ascent || !descent ||
          replays.some(({ player, boundary }) => !boundary?.classList.contains("portlet-boundary_ChmiImagesReplay_") ||
            !player?.querySelector("#chmi-timeline") || !player.querySelector("#chmi-playableimage-container"))) return false;

      stopWaiting();
      const workspace = document.createElement("section");
      workspace.id = "chmi-sonde-workspace";
      workspace.setAttribute("aria-label", "Radiosondáž Praha-Libuš – měřená data ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-sonde-classic-brand";
      header.className = "chmi-sonde-header";
      const heading = document.createElement("h1");
      heading.textContent = title;
      const note = document.createElement("span");
      note.textContent = "Měřená data ČHMÚ · časy UTC";
      header.append(heading, note);
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }
      const products = document.createElement("nav");
      products.className = "chmi-sonde-products";
      products.setAttribute("aria-label", "Sondážní produkty ČHMÚ");
      products.append(map);
      const cards = document.createElement("div");
      cards.className = "chmi-sonde-cards";
      replays.forEach(({ boundary }, index) => {
        const card = document.createElement("article");
        card.className = "chmi-sonde-card";
        const cardHeading = document.createElement("h2");
        cardHeading.textContent = index === 0 ? ascent : descent;
        card.append(cardHeading, boundary);
        cards.append(card);
      });
      workspace.append(header, products, cards);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-sonde-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }

    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ["src", "max"]
    });
    document.addEventListener("load", onImageLoad, true);
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  const stationPath = "/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum";
  const matchesStation = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === "www.chmi.cz" &&
        parsed.pathname.replace(/\/$/, "") === stationPath;
    } catch { return false; }
  };
  const disableClassic = (storage, reload, isUserscriptBridge) => {
    if (typeof storage?.set !== "function") return;
    let reloaded = false;
    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      reload();
    };
    const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
    if (typeof write?.then === "function") write.then(reloadOnce, () => {});
    if (isUserscriptBridge) reloadOnce();
  };
  if (typeof module === "object" && module.exports) {
    module.exports = { matchesStation, disableClassic };
    return;
  }
  if (window.__chmiClassicKlementinumLoaded || !matchesStation(location.href)) return;
  window.__chmiClassicKlementinumLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    const adapt = () => {
      const root = document.getElementById("main-content");
      const workspace = root?.querySelector(".lfr-layout-structure-item-chmi---hlavn--obsah main > div");
      const tabsBlock = workspace?.querySelector(":scope > .lfr-layout-structure-item-chmi---tabs");
      const tabs = tabsBlock?.querySelector(".tabcordion");
      const table = tabs?.querySelector("[id^='p_p_id_ChmiDynamicTable_INSTANCE_'] table");
      if (!workspace || !tabsBlock || !tabs || !table?.tBodies[0]?.rows?.length ||
          !workspace.querySelector("h1")?.textContent.includes("Klementinum") ||
          !tabs.querySelector("[role='tab'][data-id='klima']")) return false;

      const brand = document.createElement("header");
      brand.id = "chmi-klementinum-brand";
      const heading = document.createElement("strong");
      heading.textContent = "ČHMÚ · Měření z Klementina";
      const note = document.createElement("span");
      note.textContent = "klasické rozhraní · aktuální údaje ČHMÚ";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
      restore.addEventListener("click", () => {
        disableClassic(storage, () => location.reload(), storage === globalThis.__chmiClassicStorage);
      });
      brand.append(heading, note, restore);
      workspace.prepend(brand);
      tabsBlock.dataset.chmiKlementinumNative = "verified";
      document.documentElement.classList.add("chmi-klementinum-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    };
    if (adapt()) return;
    const observer = new MutationObserver(() => { if (adapt()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const expiration = setTimeout(() => observer.disconnect(), 30000);
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      clearTimeout(expiration);
    }, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // Keep the official OpenLayers component and its handlers intact. The
  // archive is a visual reference, never a data source for this adapter.
  function stationMapReady(map) {
    if (!map?.querySelector('.chmu-map-component[data-config-url^="https://data-provider.chmi.cz/api/map/init/stanice.meteo-vse"]')) return false;
    const canvas = map.querySelector(".ol-viewport canvas");
    const menu = map.querySelector(".ol-menu .menu--ul");
    if (!canvas || canvas.width < 300 || canvas.height < 200 || !menu) return false;
    const items = [...menu.querySelectorAll("li[data-menu-id]")];
    const ids = new Set(items.map(item => item.dataset.menuId));
    return ["101", "103", "104", "105", "106", "107"].every(id => ids.has(id)) &&
      items.some(item => item.classList.contains("__selected"));
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { stationMapReady };
    return;
  }

  if (window.__chmiClassicStationsLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/namerena-data\/umisteni-mericich-stanic\/meteorologicke\/?$/.test(location.pathname)) return;
  window.__chmiClassicStationsLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const map = document.querySelector("main #chmu-map-container");
      const boundary = map?.closest(".portlet-boundary_ChmiMapComponent_");
      if (!boundary || !stationMapReady(map)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-stations-workspace";
      workspace.setAttribute("aria-label", "Meteorologické stanice ČHMÚ – živá mapa");
      const header = document.createElement("header");
      header.id = "chmi-stations-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Meteorologické stanice ČHMÚ";
      const note = document.createElement("span");
      note.textContent = "Živá mapa a detaily stanic ČHMÚ · současné datové vrstvy";
      header.append(heading, note);
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }
      workspace.append(header, boundary);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-stations-classic");

      // The old station viewer kept its layer list visible on the map's left.
      // This is the native menu, not a duplicate disconnected from ČHMÚ data.
      const menuButton = map.querySelector(".ol-menu-button");
      if (menuButton?.getAttribute("aria-expanded") === "false") menuButton.click();
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["width", "height", "data-config-url"]
    });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // The archived viewer supplied three dated images. Keep today's official
  // OpenLayers map and three-step timeline; the archive is a visual reference.
  function tickMapReady(map) {
    if (!map?.querySelector('.chmu-map-component[data-config-url="https://data-provider.chmi.cz/api/map/init/rizika.klistata"]')) return false;
    const canvas = map.querySelector(".ol-viewport canvas");
    const timeline = map.querySelector('.chmu--map--timeline[timelineid="tlKliste"] input[aria-label="Časová osa"]');
    const selected = map.querySelector('.ol-menu li[data-menu-id="501"].__selected');
    return Boolean(canvas && canvas.width >= 300 && canvas.height >= 200 &&
      timeline && Number(timeline.max) >= 2 && selected);
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { tickMapReady };
    return;
  }

  if (window.__chmiClassicTicksLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/rizika\/aktivita-klistat\/?$/.test(location.pathname)) return;
  window.__chmiClassicTicksLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const map = document.querySelector("main #chmu-map-container");
      const boundary = map?.closest(".portlet-boundary_ChmiMapComponent_");
      if (!boundary || !tickMapReady(map)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-ticks-workspace";
      workspace.setAttribute("aria-label", "Aktivita klíšťat – živá předpovědní mapa ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-ticks-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Aktivita klíšťat";
      const note = document.createElement("span");
      note.textContent = "Živá třídenní předpověď ČHMÚ";
      header.append(heading, note);
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }
      workspace.append(header, boundary);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-ticks-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["width", "height", "data-config-url"]
    });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // Keep ČHMÚ's own map, time control and tables. The archived homepage proves
  // the old menu destination, but its biometeorology viewer was not recovered.
  function bioDataReady(map, today, tomorrow) {
    if (!map?.querySelector('.chmu-map-component[data-config-url="https://data-provider.chmi.cz/api/map/init/bio-pocasi.bio-predpoved"]')) return false;
    const canvas = map.querySelector(".ol-viewport canvas");
    const timeline = map.querySelector('.chmu--map--timeline[timelineid="tlBioPredpoved"] input[aria-label="Časová osa"]');
    return Boolean(canvas && canvas.width >= 300 && canvas.height >= 200 &&
      timeline && Number(timeline.max) >= 1 && today?.querySelector("tbody tr") &&
      tomorrow?.querySelector("tbody tr"));
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { bioDataReady };
    return;
  }

  if (window.__chmiClassicBioLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/bio-predpoved\/?$/.test(location.pathname)) return;
  window.__chmiClassicBioLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const map = document.querySelector("main #chmu-map-container");
      const mapBoundary = map?.closest(".portlet-boundary_ChmiMapComponent_");
      const today = document.getElementById("p_p_id_ChmiDynamicTable_INSTANCE_cpru_");
      const tomorrow = document.getElementById("p_p_id_ChmiDynamicTable_INSTANCE_npiz_");
      if (!mapBoundary || !bioDataReady(map, today, tomorrow)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-bio-workspace";
      workspace.setAttribute("aria-label", "Biometeorologická předpověď – živá data ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-bio-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Biometeorologická předpověď";
      const note = document.createElement("span");
      note.textContent = "Aktuální mapa a oblastní přehled ČHMÚ";
      header.append(heading, note);

      const detailsButton = document.createElement("button");
      detailsButton.type = "button";
      detailsButton.textContent = "Oblastní přehled";
      detailsButton.setAttribute("aria-controls", "chmi-bio-details");
      detailsButton.setAttribute("aria-expanded", "false");
      header.append(detailsButton);
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }

      const content = document.createElement("div");
      content.id = "chmi-bio-content";
      const details = document.createElement("aside");
      details.id = "chmi-bio-details";
      details.hidden = true;
      details.setAttribute("aria-label", "Podrobná biometeorologická předpověď podle oblastí");
      const tabs = document.createElement("div");
      tabs.id = "chmi-bio-day-tabs";
      const dayButtons = ["Dnes", "Zítra"].map((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.setAttribute("aria-pressed", String(index === 0));
        button.addEventListener("click", () => {
          today.hidden = index !== 0;
          tomorrow.hidden = index !== 1;
          dayButtons.forEach((node, day) => node.setAttribute("aria-pressed", String(index === day)));
        });
        return button;
      });
      tabs.append(...dayButtons);
      tomorrow.hidden = true;
      details.append(tabs, today, tomorrow);
      content.append(mapBoundary, details);
      workspace.append(header, content);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-bio-classic");
      detailsButton.addEventListener("click", () => {
        details.hidden = !details.hidden;
        detailsButton.setAttribute("aria-expanded", String(!details.hidden));
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      });
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["width", "height", "data-config-url"]
    });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // The archive confirms a plain weekly-text destination, but not its dynamic
  // forecast body. Retain today's official Chart.js canvas and forecast DOM.
  function weekDataReady(graph, forecast) {
    const canvas = graph?.querySelector("#ChmiGraph_INSTANCE_mlse_LAYOUT_64-chart");
    return Boolean(canvas && canvas.width >= 500 && canvas.height >= 200 &&
      forecast?.querySelectorAll("h3").length >= 5 &&
      forecast.querySelectorAll("p").length >= 5);
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { weekDataReady };
    return;
  }

  if (window.__chmiClassicWeekLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/tyden\/?$/.test(location.pathname)) return;
  window.__chmiClassicWeekLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const graphBoundary = document.getElementById("p_p_id_ChmiGraph_INSTANCE_mlse_");
      const forecastBoundary = document.getElementById("p_p_id_ChmiForecastComponent_INSTANCE_oswr_");
      if (!weekDataReady(graphBoundary, forecastBoundary)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-week-workspace";
      workspace.setAttribute("aria-label", "Týdenní předpověď – živý text a graf ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-week-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Týdenní předpověď";
      const note = document.createElement("span");
      note.textContent = "Aktuální předpověď ČHMÚ";
      header.append(heading, note);

      const viewButtons = ["Text", "Graf"].map((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.setAttribute("aria-pressed", String(index === 0));
        header.append(button);
        return button;
      });
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }

      const dayNav = document.createElement("nav");
      dayNav.id = "chmi-week-day-nav";
      dayNav.setAttribute("aria-label", "Přejít na den předpovědi");
      const content = document.createElement("div");
      content.id = "chmi-week-content";
      const forecastPanel = document.createElement("section");
      forecastPanel.id = "chmi-week-forecast";
      const graphPanel = document.createElement("section");
      graphPanel.id = "chmi-week-graph";
      graphPanel.hidden = true;
      forecastPanel.append(forecastBoundary);
      graphPanel.append(graphBoundary);
      content.append(forecastPanel, graphPanel);
      for (const day of forecastBoundary.querySelectorAll(".chmu-forecast-content h3")) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = day.textContent.trim().replace(/^Předpověď na /, "");
        button.addEventListener("click", () => {
          graphPanel.hidden = true;
          forecastPanel.hidden = false;
          viewButtons.forEach((node, index) => node.setAttribute("aria-pressed", String(index === 0)));
          day.scrollIntoView({ block: "start", behavior: "smooth" });
        });
        dayNav.append(button);
      }
      viewButtons.forEach((button, index) => button.addEventListener("click", () => {
        forecastPanel.hidden = index === 1;
        graphPanel.hidden = index === 0;
        viewButtons.forEach((node, day) => node.setAttribute("aria-pressed", String(day === index)));
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      }));
      workspace.append(header, dayNav, content);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-week-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  // The archived regional page preserves this order and its left-hand menu,
  // but not the dynamically supplied forecast body. Text stays live at ČHMÚ.
  const regionSlugs = [
    "karlovarsky-kraj", "plzensky-kraj", "ustecky-kraj", "stredocesky-kraj",
    "praha", "jihocesky-kraj", "liberecky-kraj", "kralovehradecky-kraj",
    "pardubicky-kraj", "kraj-vysocina", "olomoucky-kraj",
    "jihomoravsky-kraj", "moravskoslezsky-kraj", "zlinsky-kraj"
  ];
  const periods = ["dnes", "zitra", "pozitri", "dalsi-dny"];
  const periodNames = { dnes: "Dnes", zitra: "Zítra", pozitri: "Pozítří", "dalsi-dny": "Další dny" };
  const regionSet = new Set(regionSlugs);

  function parseRegionRoute(path) {
    const match = /^\/predpoved-pocasi\/([a-z-]+)\/(dnes|zitra|pozitri|dalsi-dny)\/?$/.exec(path);
    return match && regionSet.has(match[1]) ? { slug: match[1], period: match[2] } : null;
  }

  function regionDataReady(forecast, regionCount) {
    const content = forecast?.querySelector(".chmu-forecast-content");
    const body = content?.textContent?.trim() ?? "";
    return Boolean(content && body.length > 20 &&
      !body.includes("není v tuto chvíli dostupná") &&
      forecast.querySelectorAll("h3").length >= 1 && regionCount === regionSlugs.length);
  }

  function regionHref(native, period) {
    if (!native || !regionSet.has(native.slug) || !periods.includes(period)) return null;
    if (native.period === period) return native.url.href;
    // The official region directory can point to "pozitri" while viewing "dalsi-dny".
    // Keep the selected period on the same verified ČHMÚ route family.
    return new URL(`/predpoved-pocasi/${native.slug}/${period}`, native.url.origin).href;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { parseRegionRoute, regionDataReady, regionHref, regionSlugs };
    return;
  }

  const route = parseRegionRoute(location.pathname);
  if (window.__chmiClassicRegionsLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) || !route) return;
  window.__chmiClassicRegionsLoaded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function officialLink(anchor) {
    try {
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return null;
      const destination = parseRegionRoute(url.pathname);
      return destination ? { anchor, url, ...destination } : null;
    } catch { return null; }
  }

  function start(settings) {
    if (settings.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const forecastBoundary = document.querySelector('[id^="p_p_id_ChmiForecastComponent_INSTANCE_"]');
      const links = [...document.querySelectorAll('a[href*="/predpoved-pocasi/"]')]
        .map(officialLink).filter(Boolean);
      const regionLinks = new Map();
      const periodLinks = new Map();
      for (const link of links) {
        if (!link.anchor.textContent.trim()) continue;
        if (!regionLinks.has(link.slug) || link.period === route.period) regionLinks.set(link.slug, link);
        if (link.slug === route.slug && !periodLinks.has(link.period)) periodLinks.set(link.period, link);
      }
      if (!regionDataReady(forecastBoundary, regionLinks.size) || periodLinks.size !== periods.length) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-regions-workspace";
      workspace.setAttribute("aria-label", "Předpovědi pro kraje – živá data ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-regions-brand";
      const title = document.createElement("h1");
      title.textContent = "Předpovědi pro kraje";
      const subtitle = document.createElement("span");
      subtitle.textContent = regionLinks.get(route.slug).anchor.textContent.trim();
      header.append(title, subtitle);
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
        restore.addEventListener("click", () => {
          let reloaded = false;
          const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            location.reload();
          };
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }

      const regionsNav = document.createElement("nav");
      regionsNav.id = "chmi-regions-nav";
      regionsNav.setAttribute("aria-label", "Vybrat kraj");
      const navTitle = document.createElement("h2");
      navTitle.textContent = "Kraje";
      const regionList = document.createElement("div");
      regionList.id = "chmi-regions-list";
      const regionSelect = document.createElement("select");
      regionSelect.id = "chmi-regions-select";
      regionSelect.setAttribute("aria-label", "Vybrat kraj");
      for (const slug of regionSlugs) {
        const native = regionLinks.get(slug);
        const name = native.anchor.textContent.trim();
        const link = document.createElement("a");
        link.href = regionHref(native, route.period);
        link.textContent = name;
        if (slug === route.slug) link.setAttribute("aria-current", "page");
        regionList.append(link);
        const option = document.createElement("option");
        option.value = regionHref(native, route.period);
        option.textContent = name;
        option.selected = slug === route.slug;
        regionSelect.append(option);
      }
      regionSelect.addEventListener("change", () => { location.href = regionSelect.value; });
      regionsNav.append(navTitle, regionList, regionSelect);

      const periodNav = document.createElement("nav");
      periodNav.id = "chmi-regions-periods";
      periodNav.setAttribute("aria-label", "Den předpovědi");
      for (const period of periods) {
        const link = document.createElement("a");
        link.href = periodLinks.get(period).url.href;
        link.textContent = periodNames[period];
        if (period === route.period) link.setAttribute("aria-current", "page");
        periodNav.append(link);
      }
      const forecastPanel = document.createElement("main");
      forecastPanel.id = "chmi-regions-forecast";
      forecastPanel.append(forecastBoundary);
      workspace.append(header, regionsNav, periodNav, forecastPanel);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-regions-classic");
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  }
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();

(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicPortalCandidate || window.__chmiAladinClassicLoaded || window.__chmiClassicCatalogLoaded) {
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
      title: "Historické aplikace – původní endpointy",
      items: [
        {
          label: "ALADIN animace (alanim)",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveHref: "https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "legacy",
          note: "Doložená stará aplikace s animací, krokováním a volbami proměnné velikosti, 4× a GoogleMaps. Historický endpoint může být po odstavení intranet.chmi.cz nedostupný; ČHMÚ Classic na něj aplikuje pouze responzivní rám a zachová nativní ovládání."
        },
        {
          label: "ALADIN – původní mapy",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveHref: "https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "legacy",
          note: "Historický mapový výstup ALADIN. HTML potvrzuje výběr veličin a předpovědních termínů; obrázky se načítaly z adresářů běhů modelu, takže snapshot bez datového backendu nemusí vykreslit mapy."
        },
        {
          label: "ALADIN – původní meteogramy",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveHref: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "legacy",
          note: "Doložený starý vyhledávač meteogramů podle místa a běhu modelu. Stránka načítá seznam běhů, seznam ID míst a následně PNG; pokud historický backend nefunguje, použijte současné meteogramy ČHMÚ."
        },
        {
          label: "Meteogramy – příklad lokality Prostějov",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)",
          archiveHref: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "legacy",
          note: "Ověřený formát starého odkazu s lokalitou v hashi URL. Výběr názvu se po načtení porovnává se souborem nameid; samotný hash proto nenahrazuje chybějící historická data."
        },
        {
          label: "Starý panel POČASÍ – mapa ČR",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/CR.html",
          archiveHref: "https://web.archive.org/web/20260825190443/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/CR.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/*",
          replacementHref: "https://www.chmi.cz/",
          status: "legacy",
          note: "Samostatný panel, který stará homepage načítala do záložky POČASÍ; obsahoval mapu ČR, legendu a rozcestník produktů."
        },
        {
          label: "Starý panel VODA – hydrologická mapa",
          href: "https://intranet.chmi.cz/files/portal/docs/hydro/hydro_map.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/hydro/*",
          replacementHref: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa",
          status: "legacy",
          note: "Homepage jej načítala po kliknutí na HYDROLOGIE. Wayback nyní nemá samostatný snapshot hydro_map.html; zachován je původní endpoint a index celé hydro větve."
        },
        {
          label: "Starý panel OVZDUŠÍ – mapa kvality ovzduší",
          href: "https://intranet.chmi.cz/files/portal/docs/uoco/map_uoco_portal/air.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/*",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr",
          status: "legacy",
          note: "Homepage jej načítala po kliknutí na OVZDUŠÍ; panel měl vlastní legendu a rozcestník airqual-links.html. Samostatný snapshot map_uoco_portal/* se ve Waybacku nepodařilo ověřit."
        },
        {
          label: "Webkamery – původní celorepublikový přehled",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "legacy",
          note: "Historický přehled s filtrováním kamer. Archivní fotografie se nekopírují; původní stránka uváděla copyright ČHMÚ / All Rights Reserved."
        },
        {
          label: "Webkamera – původní detail a animace",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "legacy",
          note: "Původní viewer podporoval animaci a odkaz na meteorologické informace. Bez parametru kamery nejde o konkrétní živý snímek; katalog nevytváří smyšlený parametr."
        },
        {
          label: "Blesky – JSCeldnView",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "legacy",
          note: "Doložený historický interaktivní prohlížeč blesků ČHMÚ. ČHMÚ Classic nekopíruje jeho zdrojový kód, pouze podporuje původní DOM a přidává fit-to-window."
        },
        {
          label: "Radar – původní statický PNG výstup",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
          replacementHref: "https://produkty.chmi.cz/radar/",
          status: "legacy",
          note: "Historická stránka s aktuálním sloučeným radarovým obrázkem a odkazem na interaktivní viewer. Dostupnost starého datového toku již není garantována."
        },
        {
          label: "Blesky – původní statický PNG výstup",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "legacy",
          note: "Historická statická stránka bleskových dat s odkazem na interaktivní viewer."
        },
        {
          label: "Blesky – adresář původních PNG",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data/",
          status: "direct",
          note: "Doložený oficiální adresář historických/timestampovaných PNG. Odkazuje přímo na server ČHMÚ a nic nestahuje ani neobchází; po odstavení legacy hostu může přestat fungovat."
        },
        {
          label: "Meteosat VIS-IR – adresář JPG",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/sat/msg_hrit/img-msgeu-1160x800-vis-ir/",
          status: "direct",
          note: "Doložený oficiální adresář timestampovaných JPG VIS-IR. Data/obrazové produkty mohou podléhat podmínkám ČHMÚ a EUMETSAT; projekt je nevkládá do balíku."
        }
      ]
    },
    {
      title: "Starý portál – stanice, synoptika, historie a letectví",
      items: [
        {
          label: "Starý portál ČHMÚ – původní rozcestník",
          href: "https://intranet.chmi.cz/",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Historická homepage přímo odkazovala na ALADIN animaci/mapy/meteogramy, radar, kamery, MSG/NOAA, blesky, Klementinum, synoptiku, vertikální profily, sondáže, stanice, sníh a další výstupy."
        },
        {
          label: "Mapa starého portálu",
          href: "https://intranet.chmi.cz/sitemap",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická taxonomie produktů – vhodná jako referenční rozcestník pro výstupy, u nichž se samostatný viewer nepodařilo bezpečně rekonstruovat."
        },
        {
          label: "Souhrnný přehled aktuálního počasí",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/souhrnny-prehled",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Původní portálový rozcestník naměřených dat, stanic, radarů, družic, blesků, kamer, sondáží a sněhu."
        },
        {
          label: "Aktuální mapy – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložený starý rozcestník aktuálních map, srážek radar+srážkoměry, ozonu/UV a sněhového zpravodajství."
        },
        {
          label: "Srážky – radar + srážkoměry (starý portál)",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          note: "Konkrétní historická vstupní stránka kombinovaného radarového a srážkoměrného výstupu."
        },
        {
          label: "Ozonové a UV zpravodajství – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická stránka s aktuálním UV indexem a ozonovým/UV zpravodajstvím."
        },
        {
          label: "Družicové měření ozonu – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Konkrétní historická stránka družicového měření ozonu; pokud původní vložený obsah již nefunguje, rozšíření jej nesimuluje."
        },
        {
          label: "Vertikální profil ozonu – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložený historický sondážní výstup vertikálního profilu ozonu."
        },
        {
          label: "Staniční data – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic",
          note: "Starý rozcestník profesionálních stanic: mapy, přehled stanic a tabulky meteorologických veličin."
        },
        {
          label: "Stanice – mapa teploty a vlhkosti",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          note: "Doložená původní mapa teploty a vlhkosti profesionální staniční sítě."
        },
        {
          label: "Stanice – mapa tlaku vzduchu",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložená původní mapa tlaku vzduchu profesionální staniční sítě."
        },
        {
          label: "Sněhové zpravodajství – Sníh ČR / hory",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická stránka sněhového zpravodajství; další podprodukty staré navigace jsou evidovány samostatně podle míry ověření."
        },
        {
          label: "Automatické sněhoměrné stanice – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Konkrétní historická stránka automatických sněhoměrných stanic."
        },
        {
          label: "Stanice – grafy automatických stanic",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          note: "Doložená historická aplikace s 10minutovými měřeními a grafy podle poboček; stará stránka výslovně uváděla, že data nejsou verifikována a grafy nemají archiv."
        },
        {
          label: "Stanice – synoptický detail Praha-Libuš",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke",
          note: "Původní hodinový přehled synoptických veličin včetně historie -1/-2/-3 h. Slouží jako doložený vzor starého staničního detailu."
        },
        {
          label: "Stanice – mapa srážek a sněhu",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek",
          note: "Doložená původní mapa profesionálních stanic."
        },
        {
          label: "Stanice – mapa větru",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru",
          note: "Doložená původní mapa větru profesionální staniční sítě."
        },
        {
          label: "Stanice – oblačnost a sluneční svit",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložená původní staniční mapa oblačnosti a slunečního svitu."
        },
        {
          label: "Vertikální profily směru a rychlosti větru",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/aerologicka-mereni",
          note: "Původní portálová aplikace pro vertikální profily větru; current replacement je aerologický rozcestník."
        },
        {
          label: "Sondážní měření Praha-Libuš",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni",
          note: "Doložená stará stránka sondážního měření observatoře Praha-Libuš."
        },
        {
          label: "Evropa – výškové analýzy",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          note: "Konkrétní historická stránka výškových analýz starého portálu. Pokud původní obrazový zdroj již není dostupný, rozšíření nevytváří náhradní mapu."
        },
        {
          label: "Přechody front přes Prahu – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/prechody-front-pres-prahu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu",
          note: "Doložená historická stránka, zachována jako rychlý odkaz vedle současné náhrady."
        },
        {
          label: "Praha-Klementinum – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/praha-klementinum",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          note: "Starý portál obsahoval klementinské rekordy a odkazy na základní/stahovatelná data."
        },
        {
          label: "Praha-Klementinum – původní tabulka základních dat",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          note: "Doložený statický historický výstup se základními údaji, dlouhodobými průměry a rekordními hodnotami."
        },
        {
          label: "Historické mapy stanic – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/mapy-stanic",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Doložená položka historického portálu."
        },
        {
          label: "Měsíční přehledy pozorování – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Původní tabulkový výstup měsíčních teplot, srážek a dalších staničních charakteristik."
        },
        {
          label: "Letecký ALADIN – oblačnost, srážky a vlhkost (WMO bulletin)",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/olm/p_oblbln.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          note: "Doložený starý textový výstup ALADIN pro letiště: nízká/střední/vysoká oblačnost, hodinové srážky a relativní vlhkost."
        },
        {
          label: "Sportovní létání – původní textová předpověď",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložená stará textová předpověď s konvekcí, nízkou oblačností, přízemním/výškovým větrem a dalšími parametry."
        },
        {
          label: "Letecké námrazy FL075/FL100 – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložená historická letecká stránka."
        },
        {
          label: "Letecký SIGMET – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/sigmet",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste",
          note: "Historická vstupní stránka SIGMET; živá náhrada zůstává oficiální současný produkt ČHMÚ."
        },
        {
          label: "Letecký přízemní vítr/teplota/tlak – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložený ALADIN letištní bulletin starého portálu."
        },
        {
          label: "Letecká oblačnost/srážky/vlhkost – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost/",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          note: "Doložená stará stránka letištních předpovědí oblačnosti, srážek a relativní vlhkosti."
        }
      ]
    },
    {
      title: "Web Archive – konkrétní zachycené prohlížeče",
      items: [
        {
          label: "Starý intranet – homepage POČASÍ / VODA / OVZDUŠÍ – snapshot 2026-08-25 19:04:37",
          href: "https://web.archive.org/web/20260825190437/https://intranet.chmi.cz/",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/*",
          replacementHref: "https://www.chmi.cz/",
          status: "archive",
          note: "Referenční snapshot společného portálu se záložkami POČASÍ, HYDROLOGIE a OVZDUŠÍ. Homepage načítá jednotlivé panely dynamicky; nejde o statickou kopii živých dat."
        },
        {
          label: "Starý radar INCA – snapshot 2026-08-16 18:05:03",
          href: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
          replacementHref: "https://produkty.chmi.cz/radar/",
          status: "archive",
          note: "Konkrétní snapshot původního nowcasting vieweru. Archiv zachycuje Dle okna / Zoom / Web Maps, animaci a další původní ovládání; nejde o živá data."
        },
        {
          label: "Starý Meteosat MSG – snapshot 2026-02-10 15:05:46",
          href: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
          replacementHref: "https://produkty.chmi.cz/druzice/?time_range=24",
          status: "archive",
          note: "Konkrétní snapshot původního MSG vieweru s IR, IR BT, VIS-IR, WV, Airmass, 24h-M a Night-M. Některé archivované assety mohou v Internet Archive chybět."
        },
        {
          label: "Starý polární AVHRR – snapshot 2026-06-14 09:55:13",
          href: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color",
          status: "archive",
          note: "Konkrétní snapshot původního AVHRR vieweru. Archivní obsah není vydáván za živý."
        },
        {
          label: "ALADIN animace – snapshot 2026-02-10 16:09:17",
          href: "https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Ověřený HTML snapshot původní animace s volbami produktu, průhlednosti, velikosti, rychlosti animace, posledního snímku a navigačního kříže."
        },
        {
          label: "ALADIN animace – snapshot s presetem Praha-Libuš",
          href: "https://web.archive.org/web/20260512092211/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html?display=var&gmap_zoom=7&prod=prec&opa1=0.81&opa2=1&nselect=73&nselect_fct=undefined&di=1&rep=3&add=4&update=5&lat=50.008&lon=14.447&lang=CZ",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Archivní URL zachovává nastavení `display=var`, produkt srážek a polohu Praha-Libuš; stará stránka výslovně uvádí, že parametry URL mají přednost před cookies."
        },
        {
          label: "ALADIN mapy – snapshot 2026-05-12 09:02:06",
          href: "https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Ověřený HTML snapshot původních map; inline JavaScript skládá mapovou tabulku z běhu modelu, veličiny a termínu platnosti."
        },
        {
          label: "ALADIN meteogramy – snapshot 2026-06-14 10:30:03",
          href: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "archive",
          note: "Ověřený HTML snapshot starého výběru meteogramů. Archiv obsahuje i CSS a podpůrné knihovny, ale běhy modelu, nameid a PNG nemusí být zachyceny."
        },
        {
          label: "Webkamery – index Web Archive",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "archive",
          note: "Archivní index přehledu kamer; fotografie ani nedoložené assety nejsou součástí ČHMÚ Classic."
        },
        {
          label: "Blesky JSCeldnView – index Web Archive",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "archive",
          note: "Archivní index historického prohlížeče; konkrétní timestamp se nepodařilo z dostupného rozhraní ověřit."
        }
      ]
    },
    {
      title: "Historicky doložené výstupy bez bezpečně obnoveného vieweru",
      items: [
        {
          label: "Mapa sněhu – hodnoty",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Název je doložen ve staré navigaci ČHMÚ, ale samostatný bezpečně ověřený endpoint mapového vieweru se v této etapě nepodařilo určit."
        },
        {
          label: "Sníh – zásoby vody",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Historická navigace položku potvrzuje, ale přesná vstupní URL/viewer nebyly bezpečně ověřeny; proto není vytvořeno falešné ovládání."
        },
        {
          label: "Mapa zatížení sněhem",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Stará homepage tento výstup přímo uváděla. Konkrétní samostatný historický endpoint nebyl při průzkumu spolehlivě získán."
        },
        {
          label: "Synoptická předpověď – původní samostatný výstup",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          note: "Historická homepage uváděla Synoptickou předpověď odděleně od Synoptické situace, ale bezpečně ověřená samostatná původní URL se nepodařila získat."
        },
        {
          label: "CLIMAT / typizace povětrnostních situací / význačné počasí",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Kategorie jsou doloženy historickou navigací, avšak bez jednoho ověřeného kompletního vieweru a assetového stromu; katalog je proto eviduje pouze jako historické."
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
    if (status === "legacy") {
      return "Legacy";
    }
    if (status === "direct") {
      return "Přímá data";
    }
    if (status === "unavailable") {
      return "Nedostupné";
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
    intro.innerHTML = "<strong>Živě</strong> = současný oficiální zdroj. <strong>Legacy</strong> = původní endpoint ČHMÚ, jehož dostupnost/aktuálnost už není garantována. <strong>Archiv</strong> = historická kopie bez živých dat. <strong>Přímá data</strong> = doložený oficiální adresář/soubor. <strong>Nedostupné</strong> = historicky doložený výstup bez bezpečně obnoveného vieweru.";
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
        const isUnavailable = item.status === "unavailable";
        const article = document.createElement("article");
        article.className = `chmi-catalog-item is-${item.status}`;
        if (isUnavailable) {
          article.setAttribute("aria-disabled", "true");
        }

        const top = document.createElement("div");
        top.className = "chmi-catalog-item-top";
        const link = item.href && !isUnavailable ? document.createElement("a") : document.createElement("span");
        if (item.href && !isUnavailable) {
          link.href = item.href;
          if (item.status === "archive") {
            link.target = "_blank";
            link.rel = "noreferrer";
          }
          if (currentPageMatches(item.href)) {
            link.setAttribute("aria-current", "page");
          }
        } else {
          link.className = "chmi-catalog-item-label";
          if (isUnavailable) {
            const explanation = item.note || "Rekonstruovaná aplikace není dostupná.";
            link.classList.add("is-unavailable");
            link.title = `Nedostupné: ${explanation}`;
            link.setAttribute("aria-label", `${item.label}. ${explanation}`);
            link.tabIndex = 0;
          }
        }
        link.textContent = item.label;
        top.append(link);

        const badge = document.createElement("span");
        badge.className = `chmi-catalog-status is-${item.status}`;
        badge.textContent = statusText(item.status);
        top.append(badge);
        article.append(top);

        const note = document.createElement("p");
        note.textContent = item.note;
        article.append(note);

        if (!isUnavailable && (item.archiveHref || item.replacementHref)) {
          const actions = document.createElement("div");
          actions.className = "chmi-catalog-item-actions";
          if (item.archiveHref) {
            const archiveLink = document.createElement("a");
            archiveLink.href = item.archiveHref;
            archiveLink.target = "_blank";
            archiveLink.rel = "noreferrer";
            archiveLink.textContent = "Web Archive";
            actions.append(archiveLink);
          }
          if (item.archiveIndexHref) {
            const archiveIndexLink = document.createElement("a");
            archiveIndexLink.href = item.archiveIndexHref;
            archiveIndexLink.target = "_blank";
            archiveIndexLink.rel = "noreferrer";
            archiveIndexLink.textContent = "Všechny snapshoty";
            actions.append(archiveIndexLink);
          }
          if (item.replacementHref) {
            const replacementLink = document.createElement("a");
            replacementLink.href = item.replacementHref;
            replacementLink.textContent = "Aktuální náhrada";
            actions.append(replacementLink);
          }
          article.append(actions);
        }
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

(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicLegacyLoaded) {
    return;
  }

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-legacy-classic";
  const HEADER_ID = "chmi-legacy-classic-header";
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function portalApp(key, label, path, replacement, layout = "content") {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      key,
      label,
      match: new RegExp(`${escaped}/?$`, "i"),
      replacement,
      archive: `https://web.archive.org/web/*/https://intranet.chmi.cz${path}`,
      layout
    };
  }

  const apps = [
    {
      key: "radar",
      label: "Radar INCA",
      match: /\/meteo\/rad\/inca-cz\/short\.html$/i,
      replacement: "https://produkty.chmi.cz/radar/",
      archive: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
      layout: "viewer"
    },
    {
      key: "radar-static",
      label: "Radar PNG",
      match: /\/meteo\/rad\/data\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
      layout: "viewer"
    },
    {
      key: "msg",
      label: "Meteosat MSG",
      match: /\/meteo\/sat\/data_jsmsgview\.html$/i,
      replacement: "https://produkty.chmi.cz/druzice/?time_range=24",
      archive: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
      layout: "viewer"
    },
    {
      key: "avhrr",
      label: "Polární AVHRR",
      match: /\/meteo\/sat\/data_jsavhrrview\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color",
      archive: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
      layout: "viewer"
    },
    {
      key: "alanim",
      label: "ALADIN animace",
      match: /\/meteo\/ov\/aladin\/alanim\/alanim\.html$/i,
      replacement: "https://produkty.chmi.cz/aladin/",
      archive: "https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
      layout: "viewer"
    },
    {
      key: "aladin-maps",
      label: "ALADIN mapy",
      match: /\/meteo\/ov\/aladin\/results\/ala\.html$/i,
      replacement: "https://produkty.chmi.cz/aladin/",
      archive: "https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
      layout: "content"
    },
    {
      key: "meteogram",
      label: "Meteogramy",
      match: /\/meteo\/ov\/aladin\/results\/public\/meteogramy\/mhtml\/m\.html$/i,
      replacement: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
      archive: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
      layout: "content"
    },
    {
      key: "hydrology-map",
      label: "Hydrologie – původní mapa",
      match: /\/files\/portal\/docs\/hydro\/hydro_map\.html$/i,
      replacement: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/hydro/hydro_map.html",
      layout: "viewer"
    },
    {
      key: "air-map",
      label: "Ovzduší – původní mapa kvality",
      match: /\/files\/portal\/docs\/uoco\/map_uoco_portal\/air\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/map_uoco_portal/air.html",
      layout: "viewer"
    },
    {
      key: "webcams",
      label: "Webkamery",
      match: /\/meteo\/kam\/?$/i,
      replacement: "https://www.chmi.cz/namerena-data/webkamery",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
      layout: "gallery"
    },
    {
      key: "webcam",
      label: "Detail kamery",
      match: /\/meteo\/kam\/prohlizec\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/webkamery",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
      layout: "viewer"
    },
    {
      key: "lightning",
      label: "Blesky CELDN",
      match: /\/meteo\/blesk\/data_jsceldnview\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
      layout: "viewer"
    },
    {
      key: "lightning-static",
      label: "Blesky PNG",
      match: /\/meteo\/blesk\/data\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
      layout: "viewer"
    },
    portalApp("legacy-home", "Starý portál ČHMÚ", "/", "https://www.chmi.cz/"),
    portalApp("legacy-sitemap", "Mapa starého portálu", "/sitemap", "https://www.chmi.cz/"),
    portalApp("current-summary", "Souhrnný přehled", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/souhrnny-prehled", "https://www.chmi.cz/namerena-data"),
    portalApp("current-maps", "Aktuální mapy", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy", "https://www.chmi.cz/namerena-data"),
    portalApp("radar-gauges", "Radar + srážkoměry", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery", "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky"),
    portalApp("ozone-uv", "Ozonové a UV zpravodajství", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi", "https://www.chmi.cz/"),
    portalApp("ozone-satellite", "Družicové měření ozonu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu", "https://www.chmi.cz/"),
    portalApp("ozone-profile", "Vertikální profil ozonu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu", "https://www.chmi.cz/letectvi/aerologicka-mereni"),
    portalApp("station-data", "Staniční data", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic"),
    portalApp("station-graphs", "Grafy automatických stanic", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"),
    portalApp("station-temperature", "Mapa teploty a vlhkosti", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"),
    portalApp("station-pressure", "Mapa tlaku vzduchu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu", "https://www.chmi.cz/namerena-data"),
    portalApp("station-wind", "Mapa větru", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru"),
    portalApp("station-precip", "Mapa srážek a sněhu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek"),
    portalApp("station-cloud", "Oblačnost a sluneční svit", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit", "https://www.chmi.cz/namerena-data"),
    portalApp("station-libus", "Synoptický detail Praha-Libuš", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus", "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke"),
    portalApp("wind-profile", "Vertikální profily větru", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru", "https://www.chmi.cz/letectvi/aerologicka-mereni"),
    portalApp("sounding-libus", "Sondáž Praha-Libuš", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus", "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni"),
    portalApp("height-analysis", "Výškové analýzy Evropa", "/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy", "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"),
    portalApp("snow-hills", "Sněhové zpravodajství", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory", "https://www.chmi.cz/"),
    portalApp("snow-auto", "Automatické sněhoměrné stanice", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice", "https://www.chmi.cz/"),
    portalApp("fronts", "Přechody front přes Prahu", "/historicka-data/pocasi/prechody-front-pres-prahu", "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu"),
    portalApp("klementinum", "Praha-Klementinum", "/historicka-data/pocasi/praha-klementinum", "https://www.chmi.cz/namerena-data/historicka-data/klementinum"),
    portalApp("historic-station-maps", "Historické mapy stanic", "/historicka-data/pocasi/mapy-stanic", "https://www.chmi.cz/namerena-data/historicka-data"),
    portalApp("monthly-observations", "Měsíční přehledy pozorování", "/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani", "https://www.chmi.cz/namerena-data/historicka-data"),
    portalApp("aviation-icing", "Námrazy FL075/FL100", "/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100", "https://www.chmi.cz/letectvi"),
    portalApp("aviation-sigmet", "SIGMET", "/predpovedi/predpovedi-pocasi/letecke/sigmet", "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste"),
    portalApp("aviation-surface", "Letecký vítr/teplota/tlak", "/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen", "https://www.chmi.cz/letectvi"),
    portalApp("aviation-cloud", "Letecká oblačnost/srážky/vlhkost", "/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost", "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti"),
    portalApp("klementinum-static", "Klementinum – základní data", "/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html", "https://www.chmi.cz/namerena-data/historicka-data/klementinum"),
    portalApp("aviation-wmo", "Letecký ALADIN WMO bulletin", "/files/portal/docs/meteo/olm/p_oblbln.html", "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti"),
    portalApp("aviation-sport", "Sportovní létání – text", "/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html", "https://www.chmi.cz/letectvi")
  ];

  const quickLinks = [
    ["Radar", "https://produkty.chmi.cz/radar/"],
    ["ALADIN", "https://produkty.chmi.cz/aladin/"],
    ["Meteogramy", "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce"],
    ["Webkamery", "https://www.chmi.cz/namerena-data/webkamery"],
    ["Meteosat", "https://produkty.chmi.cz/druzice/?time_range=24"],
    ["Polární", "https://www.chmi.cz/namerena-data/polarni-druzice/true-color"],
    ["Geo", "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color"],
    ["Blesky", "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky"],
    ["Stanice", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"],
    ["Synoptika", "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"],
    ["Letectví", "https://www.chmi.cz/letectvi"],
    ["Houby", "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub"],
    ["Voda", "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa"],
    ["Ovzduší", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr"],
    ["Produkty", "https://www.chmi.cz/#chmi-classic-products"]
  ];

  function normalizePath() {
    return location.pathname.replace(/\/+$/, "") || "/";
  }

  function currentApp() {
    const path = normalizePath();
    return apps.find((app) => app.match.test(path)) ?? null;
  }

  function pageIsLegacyCandidate() {
    const host = location.hostname.toLowerCase();
    if (host === "intranet.chmi.cz" || host === "portal.chmi.cz") {
      return true;
    }
    return host === "www.chmi.cz" && /\/files\/portal\/docs\/meteo\//i.test(location.pathname);
  }

  function getPreference(callback) {
    if (!storage) {
      callback(true);
      return;
    }
    storage.get({ [STORAGE_KEY]: true }, (result) => callback(result?.[STORAGE_KEY] !== false));
  }

  function createLink(label, href, className = "") {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    if (className) {
      link.className = className;
    }
    return link;
  }

  function ensureHeader(app) {
    if (document.getElementById(HEADER_ID) || !document.body) {
      return;
    }

    const header = document.createElement("header");
    header.id = HEADER_ID;

    const brand = document.createElement("div");
    brand.className = "chmi-legacy-brand";
    const title = document.createElement("strong");
    title.textContent = app?.label ?? "Starý výstup ČHMÚ";
    const badge = document.createElement("span");
    badge.className = "chmi-legacy-badge";
    badge.textContent = location.hostname === "intranet.chmi.cz" ? "historický endpoint" : "klasické rozhraní";
    brand.append(title, badge);
    header.append(brand);

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "ČHMÚ Classic – historické a současné výstupy");
    for (const [label, href] of quickLinks) {
      nav.append(createLink(label, href));
    }
    header.append(nav);

    if (app) {
      const actions = document.createElement("div");
      actions.className = "chmi-legacy-actions";
      actions.append(createLink("Aktuální náhrada", app.replacement, "is-primary"));
      actions.append(createLink("Web Archive", app.archive));
      header.append(actions);
    }

    document.body.insertBefore(header, document.body.firstChild);
  }

  let updateQueued = false;
  let dispatchingLayoutResize = false;

  function fitLegacyPage(app) {
    if (!document.body) {
      return;
    }

    document.documentElement.classList.add(ROOT_CLASS);
    document.documentElement.dataset.chmiLegacyLayout = app?.layout ?? "content";
    if (app?.key) {
      document.documentElement.dataset.chmiLegacyApp = app.key;
    }

    const header = document.getElementById(HEADER_ID);
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const available = Math.max(320, Math.floor(window.innerHeight - headerHeight - 8));
    document.documentElement.style.setProperty("--chmi-legacy-available-height", `${available}px`);

    // Staré aplikace často používaly pevné šířky přímo v HTML. Neodstraňujeme
    // jejich vlastní ovládání ani event handlery; pouze uvolníme geometrii.
    for (const node of document.querySelectorAll('[width]:not(img):not(canvas):not(svg), [style*="width:"]')) {
      if (node.closest(`#${HEADER_ID}`)) {
        continue;
      }
      const width = node.getBoundingClientRect().width;
      if (width > window.innerWidth - 8) {
        node.style.maxWidth = "100%";
        node.style.boxSizing = "border-box";
      }
    }

    dispatchingLayoutResize = true;
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("chmi-classic-layout"));
    dispatchingLayoutResize = false;
  }

  function scheduleFit(app) {
    if (updateQueued) {
      return;
    }
    updateQueued = true;
    requestAnimationFrame(() => {
      updateQueued = false;
      ensureHeader(app);
      fitLegacyPage(app);
    });
  }

  function initialize(enabled) {
    if (!enabled || !pageIsLegacyCandidate()) {
      return;
    }

    const app = currentApp();
    // Neznámé historické cesty stále dostanou bezpečný responzivní rám a
    // navigaci, ale bez tvrzení o konkrétní funkčnosti produktu.
    ensureHeader(app);
    fitLegacyPage(app);

    window.addEventListener("resize", () => {
      if (!dispatchingLayoutResize) {
        scheduleFit(app);
      }
    }, { passive: true });
    if (globalThis.ResizeObserver && document.body) {
      const observer = new ResizeObserver(() => scheduleFit(app));
      observer.observe(document.body);
    }

    const mutationObserver = new MutationObserver(() => scheduleFit(app));
    mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  getPreference(initialize);
})();
