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
