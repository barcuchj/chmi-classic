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
