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
