(() => {
  "use strict";

  // Shared shell for the official three-day risk maps. Only the tick viewer's
  // body was recovered from the archive; pollen has a verified directory link.
  // Never substitute archived images for today's native OpenLayers data.
  const riskMaps = {
    "aktivita-klistat": { title: "Aktivita klíšťat", config: "rizika.klistata", timeline: "tlKliste", layer: "501" },
    "pylovy-semafor": { title: "Pylový semafor", config: "rizika.pyl", timeline: "tlBioBase", layer: "502" }
  };
  function riskMapReady(map, settings) {
    const config = `https://data-provider.chmi.cz/api/map/init/${settings.config}`;
    if (!map?.querySelector(`.chmu-map-component[data-config-url="${config}"], .chmu-map-component[data-config-url="${config}?client=mobile"]`)) return false;
    const canvas = map.querySelector(".ol-viewport canvas");
    const timeline = map.querySelector(`.chmu--map--timeline[timelineid="${settings.timeline}"] input[aria-label="Časová osa"]`);
    const selected = map.querySelector(`.ol-menu li[data-menu-id="${settings.layer}"].__selected`);
    return Boolean(canvas && canvas.width >= 300 && canvas.height >= 200 &&
      timeline && !timeline.disabled && Number(timeline.max) >= 2 && selected);
  }
  const tickMapReady = map => riskMapReady(map, riskMaps["aktivita-klistat"]);
  const pollenMapReady = map => riskMapReady(map, riskMaps["pylovy-semafor"]);

  if (typeof module === "object" && module.exports) {
    module.exports = { tickMapReady, pollenMapReady };
    return;
  }

  const route = /^\/predpoved-pocasi\/rizika\/(aktivita-klistat|pylovy-semafor)\/?$/.exec(location.pathname);
  if (window.__chmiClassicTicksLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) || !route) return;
  const settings = riskMaps[route[1]];
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
      if (!boundary || !riskMapReady(map, settings)) return false;
      stopWaiting();
      // The native page keeps these wrapper flags even after its controls
      // become enabled (also reproduced with Classic switched off). Expose
      // the working controls only after the real map/timeline readiness check;
      // never remove disabled attributes from a loading button or slider.
      map.setAttribute("aria-hidden", "false");
      map.setAttribute("aria-disabled", "false");

      const workspace = document.createElement("section");
      workspace.id = "chmi-ticks-workspace";
      workspace.setAttribute("aria-label", `${settings.title} – živá předpovědní mapa ČHMÚ`);
      const header = document.createElement("header");
      header.id = "chmi-ticks-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = settings.title;
      const note = document.createElement("span");
      note.textContent = "Živá třídenní předpověď ČHMÚ";
      header.append(heading, note);
      if (route[1] === "pylovy-semafor") {
        // Retain the official explanation, which would otherwise be hidden
        // with the surrounding article. A separate tab leaves the map in view.
        const info = document.querySelector('main a[href="/predpoved-pocasi/rizika/pylovy-semafor/vice-o-pylovem-semaforu"], main a[href="https://www.chmi.cz/predpoved-pocasi/rizika/pylovy-semafor/vice-o-pylovem-semaforu"]');
        if (info) {
          info.className = "chmi-risk-info";
          info.textContent = "O pylovém semaforu ↗";
          info.target = "_blank";
          info.rel = "noopener";
          header.append(info);
        }
      }
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
      attributeFilter: ["width", "height", "data-config-url", "disabled", "max", "class"]
    });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
