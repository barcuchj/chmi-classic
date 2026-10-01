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
