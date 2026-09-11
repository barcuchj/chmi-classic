(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicLegacyLoaded) {
    return;
  }

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-legacy-classic";
  const HEADER_ID = "chmi-legacy-classic-header";
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function portalApp(key, label, path, replacement, layout = "content") {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      key,
      label,
      match: new RegExp(`${escaped}/?$`, "i"),
      replacement,
      archive: `https://web.archive.org/web/*/https://intranet.chmi.cz${path}`,
      layout
    };
  }

  const apps = [
    {
      key: "radar",
      label: "Radar INCA",
      match: /\/meteo\/rad\/inca-cz\/short\.html$/i,
      replacement: "https://produkty.chmi.cz/radar/",
      archive: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
      layout: "viewer"
    },
    {
      key: "radar-static",
      label: "Radar PNG",
      match: /\/meteo\/rad\/data\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
      layout: "viewer"
    },
    {
      key: "msg",
      label: "Meteosat MSG",
      match: /\/meteo\/sat\/data_jsmsgview\.html$/i,
      replacement: "https://produkty.chmi.cz/druzice/?time_range=24",
      archive: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
      layout: "viewer"
    },
    {
      key: "avhrr",
      label: "Polární AVHRR",
      match: /\/meteo\/sat\/data_jsavhrrview\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color",
      archive: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
      layout: "viewer"
    },
    {
      key: "alanim",
      label: "ALADIN animace",
      match: /\/meteo\/ov\/aladin\/alanim\/alanim\.html$/i,
      replacement: "https://produkty.chmi.cz/aladin/",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
      layout: "viewer"
    },
    {
      key: "aladin-maps",
      label: "ALADIN mapy",
      match: /\/meteo\/ov\/aladin\/results\/ala\.html$/i,
      replacement: "https://produkty.chmi.cz/aladin/",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
      layout: "content"
    },
    {
      key: "meteogram",
      label: "Meteogramy",
      match: /\/meteo\/ov\/aladin\/results\/public\/meteogramy\/mhtml\/m\.html$/i,
      replacement: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
      layout: "content"
    },
    {
      key: "webcams",
      label: "Webkamery",
      match: /\/meteo\/kam\/?$/i,
      replacement: "https://www.chmi.cz/namerena-data/webkamery",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
      layout: "gallery"
    },
    {
      key: "webcam",
      label: "Detail kamery",
      match: /\/meteo\/kam\/prohlizec\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/webkamery",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
      layout: "viewer"
    },
    {
      key: "lightning",
      label: "Blesky CELDN",
      match: /\/meteo\/blesk\/data_jsceldnview\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
      layout: "viewer"
    },
    {
      key: "lightning-static",
      label: "Blesky PNG",
      match: /\/meteo\/blesk\/data\.html$/i,
      replacement: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
      archive: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
      layout: "viewer"
    },
    portalApp("legacy-home", "Starý portál ČHMÚ", "/", "https://www.chmi.cz/"),
    portalApp("legacy-sitemap", "Mapa starého portálu", "/sitemap", "https://www.chmi.cz/"),
    portalApp("current-summary", "Souhrnný přehled", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/souhrnny-prehled", "https://www.chmi.cz/namerena-data"),
    portalApp("current-maps", "Aktuální mapy", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy", "https://www.chmi.cz/namerena-data"),
    portalApp("radar-gauges", "Radar + srážkoměry", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery", "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky"),
    portalApp("ozone-uv", "Ozonové a UV zpravodajství", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi", "https://www.chmi.cz/"),
    portalApp("ozone-satellite", "Družicové měření ozonu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu", "https://www.chmi.cz/"),
    portalApp("ozone-profile", "Vertikální profil ozonu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu", "https://www.chmi.cz/letectvi/aerologicka-mereni"),
    portalApp("station-data", "Staniční data", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic"),
    portalApp("station-graphs", "Grafy automatických stanic", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"),
    portalApp("station-temperature", "Mapa teploty a vlhkosti", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"),
    portalApp("station-pressure", "Mapa tlaku vzduchu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu", "https://www.chmi.cz/namerena-data"),
    portalApp("station-wind", "Mapa větru", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru"),
    portalApp("station-precip", "Mapa srážek a sněhu", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek"),
    portalApp("station-cloud", "Oblačnost a sluneční svit", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit", "https://www.chmi.cz/namerena-data"),
    portalApp("station-libus", "Synoptický detail Praha-Libuš", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus", "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke"),
    portalApp("wind-profile", "Vertikální profily větru", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru", "https://www.chmi.cz/letectvi/aerologicka-mereni"),
    portalApp("sounding-libus", "Sondáž Praha-Libuš", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus", "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni"),
    portalApp("height-analysis", "Výškové analýzy Evropa", "/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy", "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"),
    portalApp("snow-hills", "Sněhové zpravodajství", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory", "https://www.chmi.cz/"),
    portalApp("snow-auto", "Automatické sněhoměrné stanice", "/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice", "https://www.chmi.cz/"),
    portalApp("fronts", "Přechody front přes Prahu", "/historicka-data/pocasi/prechody-front-pres-prahu", "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu"),
    portalApp("klementinum", "Praha-Klementinum", "/historicka-data/pocasi/praha-klementinum", "https://www.chmi.cz/namerena-data/historicka-data/klementinum"),
    portalApp("historic-station-maps", "Historické mapy stanic", "/historicka-data/pocasi/mapy-stanic", "https://www.chmi.cz/namerena-data/historicka-data"),
    portalApp("monthly-observations", "Měsíční přehledy pozorování", "/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani", "https://www.chmi.cz/namerena-data/historicka-data"),
    portalApp("aviation-icing", "Námrazy FL075/FL100", "/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100", "https://www.chmi.cz/letectvi"),
    portalApp("aviation-sigmet", "SIGMET", "/predpovedi/predpovedi-pocasi/letecke/sigmet", "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste"),
    portalApp("aviation-surface", "Letecký vítr/teplota/tlak", "/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen", "https://www.chmi.cz/letectvi"),
    portalApp("aviation-cloud", "Letecká oblačnost/srážky/vlhkost", "/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost", "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti"),
    portalApp("klementinum-static", "Klementinum – základní data", "/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html", "https://www.chmi.cz/namerena-data/historicka-data/klementinum"),
    portalApp("aviation-wmo", "Letecký ALADIN WMO bulletin", "/files/portal/docs/meteo/olm/p_oblbln.html", "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti"),
    portalApp("aviation-sport", "Sportovní létání – text", "/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html", "https://www.chmi.cz/letectvi")
  ];

  const quickLinks = [
    ["Radar", "https://produkty.chmi.cz/radar/"],
    ["ALADIN", "https://produkty.chmi.cz/aladin/"],
    ["Meteogramy", "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce"],
    ["Webkamery", "https://www.chmi.cz/namerena-data/webkamery"],
    ["Meteosat", "https://produkty.chmi.cz/druzice/?time_range=24"],
    ["Polární", "https://www.chmi.cz/namerena-data/polarni-druzice/true-color"],
    ["Geo", "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color"],
    ["Blesky", "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky"],
    ["Stanice", "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota"],
    ["Synoptika", "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"],
    ["Letectví", "https://www.chmi.cz/letectvi"],
    ["Houby", "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub"],
    ["Produkty", "https://www.chmi.cz/#chmi-classic-products"]
  ];

  function normalizePath() {
    return location.pathname.replace(/\/+$/, "") || "/";
  }

  function currentApp() {
    const path = normalizePath();
    return apps.find((app) => app.match.test(path)) ?? null;
  }

  function pageIsLegacyCandidate() {
    const host = location.hostname.toLowerCase();
    if (host === "intranet.chmi.cz" || host === "portal.chmi.cz") {
      return true;
    }
    return host === "www.chmi.cz" && /\/files\/portal\/docs\/meteo\//i.test(location.pathname);
  }

  function getPreference(callback) {
    if (!storage) {
      callback(true);
      return;
    }
    storage.get({ [STORAGE_KEY]: true }, (result) => callback(result?.[STORAGE_KEY] !== false));
  }

  function createLink(label, href, className = "") {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    if (className) {
      link.className = className;
    }
    return link;
  }

  function ensureHeader(app) {
    if (document.getElementById(HEADER_ID) || !document.body) {
      return;
    }

    const header = document.createElement("header");
    header.id = HEADER_ID;

    const brand = document.createElement("div");
    brand.className = "chmi-legacy-brand";
    const title = document.createElement("strong");
    title.textContent = app?.label ?? "Starý výstup ČHMÚ";
    const badge = document.createElement("span");
    badge.className = "chmi-legacy-badge";
    badge.textContent = location.hostname === "intranet.chmi.cz" ? "historický endpoint" : "klasické rozhraní";
    brand.append(title, badge);
    header.append(brand);

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "ČHMÚ Classic – historické a současné výstupy");
    for (const [label, href] of quickLinks) {
      nav.append(createLink(label, href));
    }
    header.append(nav);

    if (app) {
      const actions = document.createElement("div");
      actions.className = "chmi-legacy-actions";
      actions.append(createLink("Aktuální náhrada", app.replacement, "is-primary"));
      actions.append(createLink("Web Archive", app.archive));
      header.append(actions);
    }

    document.body.insertBefore(header, document.body.firstChild);
  }

  let updateQueued = false;
  let dispatchingLayoutResize = false;

  function fitLegacyPage(app) {
    if (!document.body) {
      return;
    }

    document.documentElement.classList.add(ROOT_CLASS);
    document.documentElement.dataset.chmiLegacyLayout = app?.layout ?? "content";
    if (app?.key) {
      document.documentElement.dataset.chmiLegacyApp = app.key;
    }

    const header = document.getElementById(HEADER_ID);
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const available = Math.max(320, Math.floor(window.innerHeight - headerHeight - 8));
    document.documentElement.style.setProperty("--chmi-legacy-available-height", `${available}px`);

    // Staré aplikace často používaly pevné šířky přímo v HTML. Neodstraňujeme
    // jejich vlastní ovládání ani event handlery; pouze uvolníme geometrii.
    for (const node of document.querySelectorAll('[width]:not(img):not(canvas):not(svg), [style*="width:"]')) {
      if (node.closest(`#${HEADER_ID}`)) {
        continue;
      }
      const width = node.getBoundingClientRect().width;
      if (width > window.innerWidth - 8) {
        node.style.maxWidth = "100%";
        node.style.boxSizing = "border-box";
      }
    }

    dispatchingLayoutResize = true;
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("chmi-classic-layout"));
    dispatchingLayoutResize = false;
  }

  function scheduleFit(app) {
    if (updateQueued) {
      return;
    }
    updateQueued = true;
    requestAnimationFrame(() => {
      updateQueued = false;
      ensureHeader(app);
      fitLegacyPage(app);
    });
  }

  function initialize(enabled) {
    if (!enabled || !pageIsLegacyCandidate()) {
      return;
    }

    const app = currentApp();
    // Neznámé historické cesty stále dostanou bezpečný responzivní rám a
    // navigaci, ale bez tvrzení o konkrétní funkčnosti produktu.
    ensureHeader(app);
    fitLegacyPage(app);

    window.addEventListener("resize", () => {
      if (!dispatchingLayoutResize) {
        scheduleFit(app);
      }
    }, { passive: true });
    if (globalThis.ResizeObserver && document.body) {
      const observer = new ResizeObserver(() => scheduleFit(app));
      observer.observe(document.body);
    }

    const mutationObserver = new MutationObserver(() => scheduleFit(app));
    mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  getPreference(initialize);
})();
