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
  if (parentURL.protocol !== "https:" || !registry.isHomepage(parentURL) ||
      !registry.matches(id, url) || !/^[a-zA-Z0-9-]{8,80}$/.test(session ?? "")) return;

  window.__chmiClassicEmbedded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    document.documentElement.classList.add("chmi-classic-embedded");
    // Readiness is deliberately based on a laid-out adapter AND real media,
    // never merely on the iframe load event or a classic header.
    function report() {
      const visible = node => node && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0 && getComputedStyle(node).visibility !== "hidden";
      const app = registry.get(id);
      const adapter = app.family === "radar" ? document.getElementById("chmi-radar-classic-toolbar") :
        app.family === "satellite" ? document.getElementById("chmi-satellite-classic-selector") :
        app.family === "aladin" ? document.querySelector("[data-chmi-aladin-native='verified'] #chmi-aladin-classic-controls") :
        document.getElementById(app.family === "mushrooms" ? "chmi-hub-classic-brand" : "chmi-satellite-classic-portal-products");
      const media = [...document.querySelectorAll("#div_container_data img, #div_gmaps canvas, #map-container img, #map-container canvas, #chmu-map-container canvas, #chmu-map-container img, #modelGrid .is-active img")]
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
