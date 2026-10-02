(() => {
  "use strict";

  // The archived regional page preserves this order and its left-hand menu,
  // but not the dynamically supplied forecast body. Text stays live at ČHMÚ.
  const regionSlugs = [
    "karlovarsky-kraj", "plzensky-kraj", "ustecky-kraj", "stredocesky-kraj",
    "praha", "jihocesky-kraj", "liberecky-kraj", "kralovehradecky-kraj",
    "pardubicky-kraj", "kraj-vysocina", "olomoucky-kraj",
    "jihomoravsky-kraj", "moravskoslezsky-kraj", "zlinsky-kraj"
  ];
  const periods = ["dnes", "zitra", "pozitri", "dalsi-dny"];
  const periodNames = { dnes: "Dnes", zitra: "Zítra", pozitri: "Pozítří", "dalsi-dny": "Další dny" };
  const regionSet = new Set(regionSlugs);

  function parseRegionRoute(path) {
    const match = /^\/predpoved-pocasi\/([a-z-]+)\/(dnes|zitra|pozitri|dalsi-dny)\/?$/.exec(path);
    return match && regionSet.has(match[1]) ? { slug: match[1], period: match[2] } : null;
  }

  function regionDataReady(forecast, regionCount) {
    const content = forecast?.querySelector(".chmu-forecast-content");
    const body = content?.textContent?.trim() ?? "";
    return Boolean(content && body.length > 20 &&
      !body.includes("není v tuto chvíli dostupná") &&
      forecast.querySelectorAll("h3").length >= 1 && regionCount === regionSlugs.length);
  }

  function regionHref(native, period) {
    if (!native || !regionSet.has(native.slug) || !periods.includes(period)) return null;
    if (native.period === period) return native.url.href;
    // The official region directory can point to "pozitri" while viewing "dalsi-dny".
    // Keep the selected period on the same verified ČHMÚ route family.
    return new URL(`/predpoved-pocasi/${native.slug}/${period}`, native.url.origin).href;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { parseRegionRoute, regionDataReady, regionHref, regionSlugs };
    return;
  }

  const route = parseRegionRoute(location.pathname);
  if (window.__chmiClassicRegionsLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) || !route) return;
  window.__chmiClassicRegionsLoaded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function officialLink(anchor) {
    try {
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return null;
      const destination = parseRegionRoute(url.pathname);
      return destination ? { anchor, url, ...destination } : null;
    } catch { return null; }
  }

  function start(settings) {
    if (settings.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const forecastBoundary = document.querySelector('[id^="p_p_id_ChmiForecastComponent_INSTANCE_"]');
      const links = [...document.querySelectorAll('a[href*="/predpoved-pocasi/"]')]
        .map(officialLink).filter(Boolean);
      const regionLinks = new Map();
      const periodLinks = new Map();
      for (const link of links) {
        if (!link.anchor.textContent.trim()) continue;
        if (!regionLinks.has(link.slug) || link.period === route.period) regionLinks.set(link.slug, link);
        if (link.slug === route.slug && !periodLinks.has(link.period)) periodLinks.set(link.period, link);
      }
      if (!regionDataReady(forecastBoundary, regionLinks.size) || periodLinks.size !== periods.length) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-regions-workspace";
      workspace.setAttribute("aria-label", "Předpovědi pro kraje – živá data ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-regions-brand";
      const title = document.createElement("h1");
      title.textContent = "Předpovědi pro kraje";
      const subtitle = document.createElement("span");
      subtitle.textContent = regionLinks.get(route.slug).anchor.textContent.trim();
      header.append(title, subtitle);
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

      const regionsNav = document.createElement("nav");
      regionsNav.id = "chmi-regions-nav";
      regionsNav.setAttribute("aria-label", "Vybrat kraj");
      const navTitle = document.createElement("h2");
      navTitle.textContent = "Kraje";
      const regionList = document.createElement("div");
      regionList.id = "chmi-regions-list";
      const regionSelect = document.createElement("select");
      regionSelect.id = "chmi-regions-select";
      regionSelect.setAttribute("aria-label", "Vybrat kraj");
      for (const slug of regionSlugs) {
        const native = regionLinks.get(slug);
        const name = native.anchor.textContent.trim();
        const link = document.createElement("a");
        link.href = regionHref(native, route.period);
        link.textContent = name;
        if (slug === route.slug) link.setAttribute("aria-current", "page");
        regionList.append(link);
        const option = document.createElement("option");
        option.value = regionHref(native, route.period);
        option.textContent = name;
        option.selected = slug === route.slug;
        regionSelect.append(option);
      }
      regionSelect.addEventListener("change", () => { location.href = regionSelect.value; });
      regionsNav.append(navTitle, regionList, regionSelect);

      const periodNav = document.createElement("nav");
      periodNav.id = "chmi-regions-periods";
      periodNav.setAttribute("aria-label", "Den předpovědi");
      for (const period of periods) {
        const link = document.createElement("a");
        link.href = periodLinks.get(period).url.href;
        link.textContent = periodNames[period];
        if (period === route.period) link.setAttribute("aria-current", "page");
        periodNav.append(link);
      }
      const forecastPanel = document.createElement("main");
      forecastPanel.id = "chmi-regions-forecast";
      forecastPanel.append(forecastBoundary);
      workspace.append(header, regionsNav, periodNav, forecastPanel);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-regions-classic");
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  }
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
