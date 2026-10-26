(() => {
  "use strict";
  const slugs = ["sumava-a-novohradske-hory", "cesky-les-a-slavkovsky-les", "krusne-hory", "jizerske-hory", "krkonose", "orlicke-hory", "jeseniky-a-kralicky-sneznik", "beskydy", "zdarske-vrchy", "bile-karpaty-a-hostynsko-vsetinske-vrchy"];
  const prefix = "/predpoved-pocasi/lyzarska-strediska-a-hory/";
  function route(path) {
    const slug = path.startsWith(prefix) ? path.slice(prefix.length).replace(/\/$/, "") : "";
    return slugs.includes(slug) ? slug : null;
  }
  function ready(main, links) {
    const table = main?.querySelector('[id^="ChmiDynamicTable_"] table');
    const forecast = main?.querySelector('[id^="ChmiForecastComponent_"] .chmu-forecast-content');
    const legend = main?.querySelector('.explanatory .dropdown [data-toggle="dropdown"]');
    return Boolean(main?.querySelector("h1") && table?.tHead?.rows.length &&
      table.tBodies[0]?.rows.length && table.tHead.rows[0].cells.length > 1 &&
      forecast?.textContent.trim() && legend && slugs.every(slug => links.has(slug)));
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { slugs, route, ready };
    return;
  }
  const slug = route(location.pathname);
  if (!slug || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) || window.__chmiClassicMountainForecastLoaded) return;
  window.__chmiClassicMountainForecastLoaded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  function start(settings) {
    if (settings.chmiRadarClassicEnabled === false) return;
    let observer, deadline;
    function stop() { observer?.disconnect(); clearTimeout(deadline); }
    function adapt() {
      const main = document.querySelector('main[role="main"]');
      if (!main) return false;
      const links = new Map();
      for (const anchor of main.querySelectorAll('a[href]')) {
        let url;
        try { url = new URL(anchor.href, location.href); } catch { continue; }
        const target = url.origin === location.origin && route(url.pathname);
        if (target && anchor.textContent.trim()) links.set(target, anchor);
      }
      if (!ready(main, links)) return false;
      stop();
      const workspace = document.createElement("section");
      workspace.id = "chmi-mountain-forecast-workspace";
      workspace.setAttribute("aria-label", "Předpovědi pro hory – živá data ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-mountain-forecast-brand";
      const title = document.createElement("strong");
      title.textContent = "ČHMÚ · Předpovědi pro hory";
      header.append(title);
      if (typeof storage?.set === "function") {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Nový vzhled";
        button.addEventListener("click", () => {
          let done = false;
          const reload = () => { if (!done) { done = true; location.reload(); } };
          const result = storage.set({ chmiRadarClassicEnabled: false }, reload);
          if (result?.then) result.then(reload, () => {});
          if (storage === globalThis.__chmiClassicStorage) reload();
        });
        header.append(button);
      }
      const nav = document.createElement("nav");
      nav.id = "chmi-mountain-forecast-nav";
      nav.setAttribute("aria-label", "Vybrat pohoří");
      for (const name of slugs) {
        const native = links.get(name);
        const a = document.createElement("a");
        a.href = native.href;
        a.textContent = native.textContent.trim();
        if (name === slug) a.setAttribute("aria-current", "page");
        nav.append(a);
      }
      // Embedded session values are retained only after embedded.js has validated
      // the parent and frame identity. Other destinations remain native links.
      workspace.addEventListener("click", event => {
        if (!window.__chmiClassicEmbedded || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.target.closest?.("a[href]");
        if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
        const current = new URL(location.href), next = new URL(anchor.href);
        if (next.origin !== location.origin || !route(next.pathname)) return;
        for (const key of ["chmi_classic_embed", "chmi_classic_session"]) {
          if (current.searchParams.has(key)) next.searchParams.set(key, current.searchParams.get(key));
        }
        event.preventDefault();
        location.href = next.href;
      });
      main.dataset.chmiMountainForecastNative = "verified";
      workspace.append(header, nav, main);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-mountain-forecast-classic");
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    deadline = setTimeout(stop, 120000);
    window.addEventListener("pagehide", stop, { once: true });
  }
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
