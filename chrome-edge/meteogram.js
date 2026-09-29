(() => {
  "use strict";

  if (window.__chmiClassicMeteogramLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/meteogram\/[a-z0-9-]+\/?$/.test(location.pathname)) return;
  window.__chmiClassicMeteogramLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const recentKey = "chmiClassicMeteogramRecentV1";
  const validPlace = entry => {
    if (!entry || typeof entry.url !== "string" || typeof entry.label !== "string") return null;
    try {
      const url = new URL(entry.url);
      if (url.protocol !== "https:" || url.port || url.username || url.password ||
          !["www.chmi.cz", "chmi.cz"].includes(url.hostname) ||
          !/^\/meteogram\/\d+-[a-z0-9-]+\/?$/.test(url.pathname)) return null;
      const label = entry.label.trim().slice(0, 80);
      return label ? { url: url.origin + url.pathname, label } : null;
    } catch { return null; }
  };

  const addRecentPlaces = root => {
    const header = root.querySelector(":scope > .lfr-layout-structure-item-header");
    const heading = header?.querySelector("h1");
    const current = validPlace({
      url: location.href,
      label: heading?.textContent.replace(/^Předpověď počasí:\s*/i, "") ?? ""
    });
    if (!current || header.querySelector(".chmi-meteogram-recent")) return;

    let saved = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(recentKey) ?? "[]");
      if (Array.isArray(parsed)) saved = parsed.map(validPlace).filter(Boolean);
    } catch { /* Private browsing or an invalid older value: keep the current place. */ }
    const places = [current, ...saved.filter(place => place.url !== current.url)]
      .filter((place, index, all) => all.findIndex(other => other.url === place.url) === index)
      .slice(0, 4);
    try { localStorage.setItem(recentKey, JSON.stringify(places)); } catch { /* Optional convenience only. */ }

    const nav = document.createElement("nav");
    nav.className = "chmi-meteogram-recent";
    nav.setAttribute("aria-label", "Poslední místa meteogramu");
    const label = document.createElement("span");
    label.textContent = "Poslední místa:";
    nav.append(label);
    for (const place of places) {
      const link = document.createElement("a");
      link.href = place.url;
      link.textContent = place.label;
      if (place.url === current.url) link.setAttribute("aria-current", "page");
      nav.append(link);
    }
    header.append(nav);
  };

  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    const adapt = () => {
      const root = document.querySelector("main > div");
      const graph = root?.querySelector(":scope > .lfr-layout-structure-item-chmigraph");
      const search = root?.querySelector(":scope > .lfr-layout-structure-item-chmi---background-block input.chmi-search");
      const tables = root && [...root.children].filter(child =>
        child.classList.contains("lfr-layout-structure-item-chmidynamictable"));
      const canvas = graph?.querySelector("canvas[id*='ChmiGraph']");
      // The native page creates a 300 × 150 placeholder before its data fetch.
      // A failed fetch must leave the original page visible, not an empty shell.
      if (!canvas || canvas.width <= 300 || canvas.height <= 150 || !search || !tables?.length) return false;

      // Move the existing table portlets, not their contents: ČHMÚ retains its
      // data source, search, chart and event handlers. Only the layout changes.
      const panel = document.createElement("section");
      panel.className = "chmi-meteogram-tables";
      panel.setAttribute("aria-label", "Hodinová předpověď");
      const title = document.createElement("div");
      title.className = "chmi-meteogram-tables-title";
      title.textContent = "Hodinová předpověď · tabulku lze posouvat, graf zůstává viditelný";
      panel.append(title, ...tables);
      root.append(panel);
      addRecentPlaces(root);
      root.classList.add("chmi-meteogram-workspace");
      graph.dataset.chmiMeteogramNative = "verified";
      document.documentElement.classList.add("chmi-meteogram-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    };

    if (adapt()) return;
    const observer = new MutationObserver(() => { if (adapt()) stop(); });
    const stop = () => {
      observer.disconnect();
      clearInterval(poller);
      clearTimeout(expiration);
    };
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Chart.js can paint into an existing canvas without changing the DOM.
    const poller = setInterval(() => { if (adapt()) stop(); }, 1000);
    const expiration = setTimeout(stop, 30000);
    window.addEventListener("pagehide", stop, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
