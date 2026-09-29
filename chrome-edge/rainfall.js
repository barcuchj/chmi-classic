(() => {
  "use strict";

  function firstUsableFrame(images) {
    return images.find(image => /^mapa_\d+$/.test(image.id) && image.complete && image.naturalWidth > 32)?.id ?? null;
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { firstUsableFrame };
    return;
  }

  if (window.__chmiClassicRainfallLoaded || location.hostname !== "hydro.chmi.cz" ||
      location.pathname !== "/hppsoldv/main_rain.php") return;
  window.__chmiClassicRainfallLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    function adapt() {
      const page = document.getElementById("page");
      const content = page?.querySelector(".box > .cont");
      const map = document.getElementById("iashow");
      const menu = document.getElementById("i_menu");
      if (!page || !content || !map || !menu || !document.getElementById("bgr")) return false;

      const brand = document.createElement("header");
      brand.id = "chmi-rainfall-brand";
      const heading = document.createElement("strong");
      heading.textContent = "ČHMÚ · Radarové odhady srážek";
      const caption = document.createElement("span");
      caption.textContent = "klasické rozhraní · živá data ČHMÚ";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
      restore.addEventListener("click", () => {
        storage?.set({ chmiRadarClassicEnabled: false });
        location.reload();
      });
      brand.append(heading, caption, restore);
      page.prepend(brand);
      document.documentElement.classList.add("chmi-rainfall-classic");

      // The newest official PNG can briefly be missing. Use the first already
      // loaded native frame and its own time control, without replacing data.
      let userSelected = false;
      let fallbackDone = false;
      menu.addEventListener("click", event => {
        if (event.target.closest("p[id^='imenu_']")) userSelected = true;
      }, true);
      const selectLoaded = () => {
        if (fallbackDone || userSelected) return;
        const active = map.querySelector("img.active");
        if (!active || !active.complete || active.naturalWidth > 32) return;
        const frameId = firstUsableFrame([...map.querySelectorAll("img[id^='mapa_']")]);
        const choice = frameId && document.getElementById(frameId.replace("mapa_", "imenu_"));
        if (choice) {
          fallbackDone = true;
          choice.click();
        }
      };
      const wired = new WeakSet();
      const wireImages = () => {
        for (const image of map.querySelectorAll("img[id^='mapa_']")) {
          if (wired.has(image)) continue;
          wired.add(image);
          image.addEventListener("load", selectLoaded);
          image.addEventListener("error", selectLoaded);
        }
        selectLoaded();
      };
      const imagesObserver = new MutationObserver(wireImages);
      imagesObserver.observe(map, { childList: true, subtree: true });
      window.addEventListener("pagehide", () => imagesObserver.disconnect(), { once: true });
      wireImages();
      return true;
    }

    if (adapt()) return;
    const observer = new MutationObserver(() => {
      if (adapt()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
