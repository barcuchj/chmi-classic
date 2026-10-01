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
