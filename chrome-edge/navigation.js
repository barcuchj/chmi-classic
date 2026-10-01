(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicPortalCandidate || window.__chmiClassicNavigationLoaded) {
    return;
  }

  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const pageKey = (() => {
    if (location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/radar/")) {
      return "radar";
    }
    if (location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/druzice/")) {
      return "meteosat";
    }
    if (location.hostname !== "www.chmi.cz") {
      return null;
    }
    if (pathname === "/") {
      return "home-radar";
    }
    if (pathname.includes("/polarni-druzice/")) {
      return "polar";
    }
    if (pathname.includes("/geostacionarni-druzice/")) {
      return "geo";
    }
    if (pathname === "/namerena-data/pravdepodobnost-rustu-hub") {
      return "hub";
    }
    if (pathname === "/voda/aktualni-stav-rek-povodnova-mapa") {
      return "water";
    }
    if (pathname === "/predpoved-pocasi/synopticka-situace") {
      return "synoptic";
    }
    if (pathname === "/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa") {
      return "sonde";
    }
    if (pathname === "/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum") {
      return "klementinum";
    }
    if (pathname === "/namerena-data/umisteni-mericich-stanic/meteorologicke") {
      return "stations";
    }
    if (pathname === "/predpoved-pocasi/rizika/aktivita-klistat") {
      return "ticks";
    }
    if (pathname === "/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr") {
      return "air";
    }
    return null;
  })();

  if (!pageKey) {
    return;
  }

  window.__chmiClassicNavigationLoaded = true;

  const NAV_CLASS = "chmi-classic-navigation";
  const HEADER_BY_PAGE = {
    radar: "#chmi-radar-classic-brand",
    "home-radar": "#chmi-home-radar-classic-brand",
    meteosat: "#chmi-satellite-classic-brand",
    polar: "#chmi-satellite-classic-brand",
    geo: "#chmi-satellite-classic-brand",
    hub: "#chmi-hub-classic-brand",
    water: "#chmi-hydro-air-classic-brand",
    air: "#chmi-hydro-air-classic-brand",
    synoptic: "#chmi-synoptic-classic-brand",
    sonde: "#chmi-sonde-classic-brand",
    klementinum: "#chmi-klementinum-brand",
    stations: "#chmi-stations-classic-brand",
    ticks: "#chmi-ticks-classic-brand"
  };

  const pages = [
    {
      key: "radar",
      label: "Radar produkt",
      shortLabel: "Radar",
      href: "https://produkty.chmi.cz/radar/"
    },
    {
      key: "home-radar",
      label: "Radar na úvodní stránce ČHMÚ",
      shortLabel: "Radar ČHMÚ",
      href: "https://www.chmi.cz/#chmi-classic-home-radar"
    },
    {
      key: "meteosat",
      label: "Meteosat / animovaný prohlížeč družic",
      shortLabel: "Meteosat",
      href: "https://produkty.chmi.cz/druzice/?time_range=24"
    },
    {
      key: "polar",
      label: "Polární družice",
      shortLabel: "Polární",
      href: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color"
    },
    {
      key: "geo",
      label: "Geostacionární družice",
      shortLabel: "Geo",
      href: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color"
    },
    {
      key: "hub",
      label: "Pravděpodobnost růstu hub",
      shortLabel: "Houby",
      href: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub"
    },
    {
      key: "water",
      label: "Voda – aktuální stavy a povodňová mapa",
      shortLabel: "Voda",
      href: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa"
    },
    {
      key: "air",
      label: "Ovzduší – aktuální mapy kvality ovzduší",
      shortLabel: "Ovzduší",
      href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr"
    },
    {
      key: "synoptic",
      label: "Synoptická situace – živé mapy",
      shortLabel: "Synoptika",
      href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace"
    },
    {
      key: "sonde",
      label: "Sondážní měření – Praha-Libuš",
      shortLabel: "Sondáže",
      href: "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa"
    },
    {
      key: "klementinum",
      label: "Měření z Klementina",
      shortLabel: "Klementinum",
      href: "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum"
    },
    {
      key: "stations",
      label: "Meteorologické stanice ČHMÚ",
      shortLabel: "Stanice",
      href: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke"
    },
    {
      key: "ticks",
      label: "Předpověď aktivity klíšťat",
      shortLabel: "Klíšťata",
      href: "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat"
    }
  ];

  function currentHref(item) {
    if (item.key !== pageKey) {
      return item.href;
    }

    if (pageKey === "home-radar") {
      const url = new URL(location.href);
      url.hash = "chmi-classic-home-radar";
      return url.href;
    }

    return location.href;
  }

  function buildNavigation() {
    const nav = document.createElement("nav");
    nav.className = NAV_CLASS;
    nav.setAttribute("aria-label", "ČHMÚ Classic – rychlá navigace");

    for (const item of pages) {
      const link = document.createElement("a");
      link.href = currentHref(item);
      link.textContent = item.shortLabel;
      link.title = item.label;
      link.dataset.chmiClassicPage = item.key;
      if (item.key === pageKey) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }

    return nav;
  }

  function ensureNavigation() {
    const header = document.querySelector(HEADER_BY_PAGE[pageKey]);
    if (!header || header.querySelector(`.${NAV_CLASS}`)) {
      return false;
    }

    const navigation = buildNavigation();
    const newLookButton = [...header.querySelectorAll("button")].find((button) =>
      /nový vzhled|současn.*vzhled/i.test(`${button.textContent} ${button.title}`)
    );
    header.insertBefore(navigation, newLookButton ?? null);
    return true;
  }

  let updateScheduled = false;
  function scheduleRefresh() {
    if (updateScheduled) {
      return;
    }
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      ensureNavigation();
    });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  ensureNavigation();
})();
