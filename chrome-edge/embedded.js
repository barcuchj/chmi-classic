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
