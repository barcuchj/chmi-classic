// ==UserScript==
// @name         ČHMÚ Classic – radar, družice a mapy
// @namespace    https://github.com/
// @version      0.4.0
// @description  Vrací klasický vzhled radaru, družicových snímků a vybraných map ČHMÚ.
// @author       ČHMÚ Classic contributors
// @homepageURL  https://github.com/barcuchj/chmi-classic
// @supportURL   https://github.com/barcuchj/chmi-classic/issues
// @downloadURL  https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @updateURL    https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js
// @match        https://produkty.chmi.cz/radar/*
// @match        https://produkty.chmi.cz/druzice/*
// @match        https://www.chmi.cz/namerena-data/polarni-druzice/*
// @match        https://www.chmi.cz/namerena-data/geostacionarni-druzice/*
// @match        https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub*
// @match        https://www.chmi.cz/
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

  function renderRestoreButton() {
    document.getElementById(restoreId)?.remove();
    if (isEnabled()) {
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

  GM_addStyle("html.chmi-radar-classic,\nhtml.chmi-radar-classic body#mbody {\n  width: 100%;\n  height: 100%;\n  min-height: 100vh;\n  background: #8bc6da !important;\n  color: #555 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-radar-classic #content,\nhtml.chmi-radar-classic #wrapper > nav,\nhtml.chmi-radar-classic #footer,\nhtml.chmi-radar-classic #footerBottom,\nhtml.chmi-radar-classic .material-scrolltop,\nhtml.chmi-radar-classic .chmi-radar-classic-hidden {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #wrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: column !important;\n  width: calc(100vw - 20px) !important;\n  max-width: none !important;\n  height: calc(100vh - 20px) !important;\n  min-height: 560px !important;\n  margin: 10px auto !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex;\n  flex: 0 0 auto;\n  align-items: baseline;\n  gap: 9px;\n  min-height: 46px;\n  padding: 11px 14px 9px;\n  color: #175f82;\n  background: #fff;\n  border-radius: 12px 12px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-radar-classic .mainWrapper {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border-radius: 0 0 12px 12px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-section {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: column !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-radar-classic .chmi-radar-classic-app-row {\n  box-sizing: border-box;\n  display: flex !important;\n  flex: 1 1 auto !important;\n  flex-direction: row !important;\n  align-items: stretch !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_data {\n  position: relative !important;\n  flex: 1 1 auto !important;\n  min-width: 0 !important;\n  min-height: 0 !important;\n  width: auto !important;\n  max-width: none !important;\n  height: 100% !important;\n  background: #d2d2d2 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-radar-classic #div_container_data .leaflet-container {\n  width: 100% !important;\n  max-width: none !important;\n  height: 100% !important;\n  min-height: 100% !important;\n}\n\nhtml.chmi-radar-classic.chmi-radar-classic-web-maps #div_container_data #div_bg {\n  width: 100% !important;\n  height: 100% !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu {\n  box-sizing: border-box;\n  flex: 0 0 320px !important;\n  align-self: stretch !important;\n  width: 320px !important;\n  max-width: 320px !important;\n  padding: 10px !important;\n  color: #555 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-left: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  min-height: 0 !important;\n  overflow: auto !important;\n  font: 13px/1.35 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-button {\n  min-height: 34px;\n  padding: 7px 8px !important;\n  color: #176b95 !important;\n  background: #f7fbfd !important;\n  border-bottom: 1px solid #b9cbd3 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu .accordion-body {\n  padding: 8px 0 10px !important;\n}\n\nhtml.chmi-radar-classic #div_container_menu select,\nhtml.chmi-radar-classic #div_container_menu input,\nhtml.chmi-radar-classic #div_container_menu button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar {\n  position: absolute;\n  z-index: 10000;\n  top: 8px;\n  left: 8px;\n  display: block;\n  padding: 3px;\n  background: rgb(255 255 255 / 94%);\n  border: 1px solid #b8cbd4;\n  border-radius: 3px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 22%);\n}\n\nhtml.chmi-radar-classic #div_container_menu #div_radio_display {\n  display: none !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar .chmi-radar-classic-options {\n  display: inline-flex !important;\n  flex-wrap: nowrap !important;\n  width: auto !important;\n  white-space: nowrap;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button {\n  box-sizing: border-box;\n  display: inline-block !important;\n  min-width: auto !important;\n  margin: 0 -1px 0 0 !important;\n  padding: 5px 11px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #8fc2d8 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  font: 12px/1.25 Arial, Helvetica, sans-serif !important;\n  text-align: center;\n  cursor: pointer;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:first-child {\n  border-radius: 2px 0 0 2px !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:last-child {\n  margin-right: 0 !important;\n  border-radius: 0 2px 2px 0 !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button[aria-checked=\"true\"] {\n  position: relative;\n  z-index: 1;\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\nhtml.chmi-radar-classic #chmi-radar-classic-toolbar button:focus-visible,\nhtml.chmi-radar-classic #chmi-radar-classic-brand button:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 991px) {\n  html.chmi-radar-classic #wrapper {\n    width: calc(100% - 12px) !important;\n    height: auto !important;\n    min-height: calc(100vh - 12px) !important;\n    margin: 6px auto !important;\n  }\n\n  html.chmi-radar-classic .chmi-radar-classic-app-row {\n    flex-direction: column !important;\n    height: auto !important;\n    overflow: visible !important;\n  }\n\n  html.chmi-radar-classic #div_container_data {\n    min-height: 60vh !important;\n    height: 60vh !important;\n  }\n\n  html.chmi-radar-classic #div_container_menu {\n    width: 100% !important;\n    max-width: none !important;\n    border-top: 1px solid #bbb !important;\n    border-left: 0 !important;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar {\n    top: 6px;\n    left: 6px;\n    max-width: calc(100% - 12px);\n    overflow-x: auto;\n  }\n}\n\n@media (max-width: 560px) {\n  html.chmi-radar-classic #chmi-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-radar-classic #chmi-radar-classic-toolbar button {\n    padding: 5px 8px !important;\n    font-size: 11px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-radar-classic *,\n  html.chmi-radar-classic *::before,\n  html.chmi-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Radar vložený na úvodní stránce ČHMÚ – stylujeme jen jeho sekci. */\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic {\n  box-sizing: border-box;\n  position: relative;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 12px 0 !important;\n  padding: 0 10px 12px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7 !important;\n  border-radius: 10px !important;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 18%);\n  overflow: hidden;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border-bottom: 1px solid #b8cbd4;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand strong {\n  color: #176b95;\n  font-size: 16px;\n  letter-spacing: 0.01em;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #eef8fc;\n  border: 1px solid #91c4d9;\n  border-radius: 3px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand > button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-title,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-native-subtitle {\n  display: none !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n  background: #d2d2d2;\n  border: 1px solid #888 !important;\n  border-radius: 0 !important;\n  overflow: hidden;\n}\n\nhtml.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n  min-height: 360px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-map-host img,\nhtml.chmi-home-radar-classic-active img.chmi-home-radar-classic-map-host {\n  display: block;\n  max-width: 100% !important;\n  height: auto !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button {\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:not(#chmi-home-radar-classic-brand > button) {\n  border-radius: 2px !important;\n}\n\nhtml.chmi-home-radar-classic-active #chmi-home-radar-classic-brand button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic button:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic a:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic select:focus-visible,\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\nhtml.chmi-home-radar-classic-active .chmi-home-radar-classic-anchor {\n  display: block;\n  position: relative;\n  top: -8px;\n  visibility: hidden;\n}\n\n@media (max-width: 640px) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic {\n    margin: 6px 0 !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-home-radar-classic-active #chmi-home-radar-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-home-radar-classic-active iframe.chmi-home-radar-classic-map-host {\n    min-height: 300px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::before,\n  html.chmi-home-radar-classic-active .chmi-home-radar-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Pravděpodobnost růstu hub – portálová stránka ČHMÚ. */\nhtml.chmi-hub-classic,\nhtml.chmi-hub-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic header#chmu-header,\nhtml.chmi-hub-classic nav[aria-label*=\"Nach\"],\nhtml.chmi-hub-classic .menu-bookmarks,\nhtml.chmi-hub-classic .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-hub-classic footer,\nhtml.chmi-hub-classic #footer,\nhtml.chmi-hub-classic .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: calc(100% + 20px);\n  min-height: 42px;\n  margin: -1px -10px 8px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-hub-classic main h1 {\n  display: none !important;\n}\n\nhtml.chmi-hub-classic main h2,\nhtml.chmi-hub-classic main h3,\nhtml.chmi-hub-classic main h4 {\n  margin-top: 10px !important;\n  margin-bottom: 7px !important;\n  color: #176b95 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-hub-classic main h3 {\n  font-size: 16px !important;\n}\n\nhtml.chmi-hub-classic main h4 {\n  font-size: 14px !important;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-section {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host {\n  box-sizing: border-box;\n  width: 100% !important;\n  max-width: none !important;\n  background: #d2d2d2;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-hub-classic #chmu-map-container,\nhtml.chmi-hub-classic iframe.chmi-hub-classic-map-host,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\nhtml.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n  height: min(78vh, 800px) !important;\n  min-height: 520px !important;\n  border: 1px solid #888;\n}\n\nhtml.chmi-hub-classic .chmi-hub-classic-map-host iframe,\nhtml.chmi-hub-classic #chmu-map-container iframe {\n  width: 100% !important;\n  max-width: none !important;\n}\n\nhtml.chmi-hub-classic #chmi-hub-classic-brand button:focus-visible,\nhtml.chmi-hub-classic main button:focus-visible,\nhtml.chmi-hub-classic main a:focus-visible,\nhtml.chmi-hub-classic main select:focus-visible,\nhtml.chmi-hub-classic main input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 640px) {\n  html.chmi-hub-classic main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n    padding-right: 6px !important;\n    padding-left: 6px !important;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand {\n    width: calc(100% + 12px);\n    margin-right: -6px;\n    margin-left: -6px;\n  }\n\n  html.chmi-hub-classic #chmi-hub-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-hub-classic #chmu-map-container,\n  html.chmi-hub-classic iframe.chmi-hub-classic-map-host,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.leaflet-container,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.maplibregl-map,\n  html.chmi-hub-classic .chmi-hub-classic-map-host.ol-viewport {\n    height: 70vh !important;\n    min-height: 420px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-hub-classic *,\n  html.chmi-hub-classic *::before,\n  html.chmi-hub-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\nhtml.chmi-satellite-classic,\nhtml.chmi-satellite-classic body {\n  min-height: 100%;\n  background: #8bc6da !important;\n  color: #111 !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n  font-size: 14px !important;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand {\n  box-sizing: border-box;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: baseline !important;\n  gap: 9px;\n  width: 100%;\n  min-height: 42px;\n  padding: 10px 12px 8px;\n  color: #176b95;\n  background: #fff;\n  border: 1px solid #9bafb7;\n  border-bottom: 0;\n  border-radius: 10px 10px 0 0;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand strong {\n  font-size: 16px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand span {\n  color: #777;\n  font-size: 12px;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button {\n  margin-left: auto;\n  padding: 3px 9px;\n  color: #176b95;\n  background: #f7fcfe;\n  border: 1px solid #8fc2d8;\n  border-radius: 2px;\n  font: 12px/1.4 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic #chmi-satellite-classic-brand button:hover {\n  background: #dff1f8;\n}\n\nhtml.chmi-satellite-classic-live #content,\nhtml.chmi-satellite-classic-live #wrapper > nav,\nhtml.chmi-satellite-classic-live #footer,\nhtml.chmi-satellite-classic-live #footerBottom,\nhtml.chmi-satellite-classic-live .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #wrapper {\n  width: min(1460px, calc(100% - 20px)) !important;\n  min-height: auto !important;\n  margin: 10px auto 40px !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper {\n  box-sizing: border-box;\n  width: 100% !important;\n  margin: 0 !important;\n  padding: 8px 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-top: 0;\n  border-radius: 0 0 10px 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid {\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live .mainWrapper > .container-fluid > h1,\nhtml.chmi-satellite-classic-live #btn-desktop-sidebar-toggle,\nhtml.chmi-satellite-classic-live #animation-controls,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-native-choice {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1160px) 250px;\n  justify-content: center;\n  gap: 10px !important;\n  margin: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #main-row > .map-col,\nhtml.chmi-satellite-classic-live #main-row > .desktop-sidebar-col {\n  box-sizing: border-box;\n  width: auto !important;\n  max-width: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title {\n  min-height: 24px;\n  margin: 0 0 4px !important;\n  text-align: left !important;\n}\n\nhtml.chmi-satellite-classic-live #loaded-product-title h2 {\n  margin: 0 !important;\n  color: #176b95 !important;\n  font: bold 16px/1.4 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #map-container {\n  max-height: none !important;\n  background: #d2d2d2 !important;\n  border: 1px solid #888;\n  border-radius: 0 !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu {\n  position: static !important;\n  visibility: visible !important;\n  width: 100% !important;\n  min-height: 0 !important;\n  height: calc(100vh - 84px) !important;\n  max-height: 900px;\n  padding: 0 !important;\n  color: #111 !important;\n  background: #fff !important;\n  border: 1px solid #aaa !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  transform: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .offcanvas-body {\n  padding: 9px !important;\n  overflow-y: auto !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .settings-section {\n  margin: 0 !important;\n  padding: 8px 0 !important;\n  background: #fff !important;\n  border: 0 !important;\n  border-bottom: 1px solid #bbb !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .section-header,\nhtml.chmi-satellite-classic-live #settingsMenu .form-label {\n  margin-bottom: 4px !important;\n  color: #111 !important;\n  font: bold 13px/1.3 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu .btn-info-icon {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-live #settingsMenu select,\nhtml.chmi-satellite-classic-live #settingsMenu input,\nhtml.chmi-satellite-classic-live #settingsMenu button {\n  border-radius: 2px !important;\n  font-family: Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group {\n  gap: 4px !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group label {\n  min-width: 39px;\n  margin: 0 !important;\n  padding: 4px 7px !important;\n  color: #14387f !important;\n  background: #f8fbff !important;\n  border: 1px solid #14387f !important;\n  border-radius: 2px !important;\n  font: 13px/1.25 Arial, Helvetica, sans-serif !important;\n}\n\nhtml.chmi-satellite-classic-live #time-range-group input:checked + label {\n  color: #fff !important;\n  background: #14387f !important;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector {\n  margin-bottom: 8px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  margin-bottom: 9px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row label,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-selector > strong {\n  font-weight: bold;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-satellite-row select {\n  flex: 1;\n  min-width: 0;\n  padding: 3px 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-matrix {\n  display: grid;\n  gap: 3px;\n  margin-top: 7px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n  display: grid;\n  grid-template-columns: minmax(85px, 1fr) repeat(3, 37px);\n  align-items: center;\n  gap: 5px;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row span {\n  color: #0645ad;\n  font-weight: bold;\n  text-decoration: underline;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button {\n  min-width: 35px;\n  padding: 2px 4px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n  cursor: pointer;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button:hover,\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-product-row button.is-active {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-selection {\n  margin-top: 8px;\n  color: #555;\n  font-size: 11px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding: 8px 0 6px;\n  color: #111;\n  background: #fff;\n  font: 13px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player button,\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player select {\n  min-height: 25px;\n  padding: 2px 7px;\n  color: #111;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.3 Arial, Helvetica, sans-serif;\n}\n\nhtml.chmi-satellite-classic-live .chmi-satellite-classic-player-buttons {\n  display: inline-flex;\n  gap: 3px;\n}\n\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"loaded\"],\nhtml.chmi-satellite-classic-live #chmi-satellite-classic-player [data-role=\"time\"] {\n  white-space: nowrap;\n}\n\nhtml.chmi-satellite-classic-live .product-legend-box {\n  margin-top: 4px !important;\n  padding: 8px !important;\n  background: #fff !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n}\n\nhtml.chmi-satellite-classic-live #satInfo {\n  color: #d40000 !important;\n  font-size: 13px !important;\n}\n\nhtml.chmi-satellite-classic-portal header#chmu-header,\nhtml.chmi-satellite-classic-portal nav[aria-label*=\"Nach\"],\nhtml.chmi-satellite-classic-portal .menu-bookmarks,\nhtml.chmi-satellite-classic-portal .lfr-layout-structure-item-chmi---spacer,\nhtml.chmi-satellite-classic-portal footer,\nhtml.chmi-satellite-classic-portal #footer,\nhtml.chmi-satellite-classic-portal .material-scrolltop {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal main {\n  box-sizing: border-box;\n  width: min(1460px, calc(100% - 20px)) !important;\n  max-width: none !important;\n  margin: 10px auto 40px !important;\n  padding: 0 10px 14px !important;\n  background: #fff !important;\n  border: 1px solid #9bafb7;\n  border-radius: 10px;\n  box-shadow: 0 4px 9px rgb(40 83 101 / 22%);\n}\n\nhtml.chmi-satellite-classic-portal main > #chmi-satellite-classic-brand {\n  width: calc(100% + 20px);\n  margin: -1px -10px 0;\n}\n\nhtml.chmi-satellite-classic-portal main h1 {\n  display: none !important;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 7px;\n  margin: 9px 0;\n  padding: 7px 8px;\n  background: #fff;\n  border: 1px solid #aaa;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products > div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a {\n  padding: 3px 8px;\n  color: #0645ad;\n  background: #f3f3f3;\n  border: 1px solid #999;\n  border-radius: 2px;\n  font: 12px/1.35 Arial, Helvetica, sans-serif;\n  text-decoration: none;\n}\n\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a:hover,\nhtml.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products a[aria-current=\"page\"] {\n  color: #fff;\n  background: #4ea8d3;\n  border-color: #2588ba;\n}\n\nhtml.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n  margin-left: auto;\n}\n\nhtml.chmi-satellite-classic-portal #chmu-map-container {\n  box-sizing: border-box;\n  width: 100% !important;\n  height: min(78vh, 800px) !important;\n  min-height: 520px;\n  background: #d2d2d2;\n  border: 1px solid #888;\n}\n\nhtml.chmi-satellite-classic button:focus-visible,\nhtml.chmi-satellite-classic a:focus-visible,\nhtml.chmi-satellite-classic select:focus-visible,\nhtml.chmi-satellite-classic input:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 1100px) {\n  html.chmi-satellite-classic-live #main-row {\n    grid-template-columns: minmax(0, 1fr);\n  }\n\n  html.chmi-satellite-classic-live #settingsMenu {\n    height: auto !important;\n    max-height: none !important;\n  }\n}\n\n@media (max-width: 640px) {\n  html.chmi-satellite-classic #chmi-satellite-classic-brand span {\n    display: none;\n  }\n\n  html.chmi-satellite-classic-live #wrapper,\n  html.chmi-satellite-classic-portal main {\n    width: calc(100% - 8px) !important;\n    margin-top: 4px !important;\n  }\n\n  html.chmi-satellite-classic-live .chmi-satellite-classic-product-row {\n    grid-template-columns: minmax(82px, 1fr) repeat(3, 34px);\n    gap: 3px;\n  }\n\n  html.chmi-satellite-classic-portal #chmi-satellite-classic-portal-products {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n\n  html.chmi-satellite-classic-portal .chmi-satellite-classic-live-link {\n    margin-left: 0;\n  }\n\n  html.chmi-satellite-classic-portal #chmu-map-container {\n    min-height: 420px;\n    height: 70vh !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.chmi-satellite-classic *,\n  html.chmi-satellite-classic *::before,\n  html.chmi-satellite-classic *::after {\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n  }\n}\n\n/* Společná kompaktní navigace mezi podporovanými částmi ČHMÚ Classic. */\n#chmi-radar-classic-brand,\n#chmi-home-radar-classic-brand,\n#chmi-satellite-classic-brand,\n#chmi-hub-classic-brand {\n  flex-wrap: wrap !important;\n  row-gap: 5px !important;\n}\n\n.chmi-classic-navigation {\n  box-sizing: border-box;\n  display: inline-flex !important;\n  flex: 0 1 auto;\n  align-items: center;\n  gap: 2px;\n  min-width: 0;\n  margin: 0 4px 0 8px;\n  padding: 0;\n  white-space: nowrap;\n}\n\n.chmi-classic-navigation a {\n  box-sizing: border-box;\n  display: inline-block !important;\n  padding: 3px 6px !important;\n  color: #176b95 !important;\n  background: #f7fcfe !important;\n  border: 1px solid #b2cfdb !important;\n  border-radius: 2px !important;\n  font: 11px/1.25 Arial, Helvetica, sans-serif !important;\n  text-decoration: none !important;\n}\n\n.chmi-classic-navigation a:hover,\n.chmi-classic-navigation a.is-active,\n.chmi-classic-navigation a[aria-current=\"page\"] {\n  color: #fff !important;\n  background: #4ea8d3 !important;\n  border-color: #2588ba !important;\n}\n\n.chmi-classic-navigation a:focus-visible {\n  outline: 3px solid #f5a623 !important;\n  outline-offset: 2px;\n}\n\n@media (max-width: 900px) {\n  .chmi-classic-navigation {\n    order: 3;\n    flex: 1 0 100%;\n    width: 100%;\n    max-width: 100%;\n    margin: 0;\n    overflow-x: auto;\n    scrollbar-width: thin;\n  }\n}\n\n@media (max-width: 520px) {\n  .chmi-classic-navigation a {\n    padding: 3px 5px !important;\n    font-size: 10.5px !important;\n  }\n}\n\n\n#chmi-classic-userscript-restore {\n  position: fixed;\n  right: 12px;\n  bottom: 12px;\n  z-index: 2147483647;\n  padding: 7px 12px;\n  border: 1px solid #1677a8;\n  border-radius: 2px;\n  background: #eaf7fc;\n  color: #07567e;\n  font: 600 13px Arial, sans-serif;\n  cursor: pointer;\n  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);\n}");
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
        requestAnimationFrame(syncDisplayToolbar);
      });

      dataContainer.prepend(toolbar);
      syncDisplayToolbar();
      return true;
    }

    syncDisplayToolbar();
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
    const portalStorage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
    let enabled = true;
    let refreshScheduled = false;
    let anchorScrolled = false;

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
      scrollToHomepageRadarIfRequested(section);

      if (!hadRootClass || sectionChanged || brandChanged) {
        notifyHomepageLayoutChanged();
      }
    }

    function removeHomepageClassicMode() {
      document.getElementById(brandId)?.remove();
      document.getElementById(anchorId)?.remove();
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

    function notifyMushroomLayoutChanged() {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }

    function applyMushroomClassicMode() {
      const hadRootClass = document.documentElement.classList.contains(rootClass);
      document.documentElement.classList.add(rootClass);
      const brandChanged = ensureMushroomBrand();
      const mapChanged = markMushroomMap();

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

  function savePreference(enabled) {
    if (storage) {
      storage.set({ [STORAGE_KEY]: enabled });
    }
    setClassicMode(enabled);
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

    if (brandChanged || selectorChanged || playerChanged) {
      window.dispatchEvent(new Event("resize"));
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
    if (changed) {
      window.dispatchEvent(new Event("resize"));
    }
  }

  function removeClassicMode() {
    [BRAND_ID, SELECTOR_ID, PLAYER_ID, PORTAL_PRODUCTS_ID].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    document.querySelectorAll(".chmi-satellite-classic-native-choice").forEach((element) => {
      element.classList.remove("chmi-satellite-classic-native-choice");
    });
    document.documentElement.classList.remove(
      ROOT_CLASS,
      "chmi-satellite-classic-live",
      "chmi-satellite-classic-portal",
      "chmi-satellite-classic-polar",
      "chmi-satellite-classic-geo"
    );
    window.dispatchEvent(new Event("resize"));
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
