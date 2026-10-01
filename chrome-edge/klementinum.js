(() => {
  "use strict";

  const stationPath = "/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum";
  const matchesStation = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === "www.chmi.cz" &&
        parsed.pathname.replace(/\/$/, "") === stationPath;
    } catch { return false; }
  };
  const disableClassic = (storage, reload, isUserscriptBridge) => {
    if (typeof storage?.set !== "function") return;
    let reloaded = false;
    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      reload();
    };
    const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
    if (typeof write?.then === "function") write.then(reloadOnce, () => {});
    if (isUserscriptBridge) reloadOnce();
  };
  if (typeof module === "object" && module.exports) {
    module.exports = { matchesStation, disableClassic };
    return;
  }
  if (window.__chmiClassicKlementinumLoaded || !matchesStation(location.href)) return;
  window.__chmiClassicKlementinumLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    const adapt = () => {
      const root = document.getElementById("main-content");
      const workspace = root?.querySelector(".lfr-layout-structure-item-chmi---hlavn--obsah main > div");
      const tabsBlock = workspace?.querySelector(":scope > .lfr-layout-structure-item-chmi---tabs");
      const tabs = tabsBlock?.querySelector(".tabcordion");
      const table = tabs?.querySelector("[id^='p_p_id_ChmiDynamicTable_INSTANCE_'] table");
      if (!workspace || !tabsBlock || !tabs || !table?.tBodies[0]?.rows?.length ||
          !workspace.querySelector("h1")?.textContent.includes("Klementinum") ||
          !tabs.querySelector("[role='tab'][data-id='klima']")) return false;

      const brand = document.createElement("header");
      brand.id = "chmi-klementinum-brand";
      const heading = document.createElement("strong");
      heading.textContent = "ČHMÚ · Měření z Klementina";
      const note = document.createElement("span");
      note.textContent = "klasické rozhraní · aktuální údaje ČHMÚ";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
      restore.addEventListener("click", () => {
        disableClassic(storage, () => location.reload(), storage === globalThis.__chmiClassicStorage);
      });
      brand.append(heading, note, restore);
      workspace.prepend(brand);
      tabsBlock.dataset.chmiKlementinumNative = "verified";
      document.documentElement.classList.add("chmi-klementinum-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    };
    if (adapt()) return;
    const observer = new MutationObserver(() => { if (adapt()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const expiration = setTimeout(() => observer.disconnect(), 30000);
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      clearTimeout(expiration);
    }, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
