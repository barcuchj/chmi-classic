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
