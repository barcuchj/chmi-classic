(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicCatalogLoaded) {
    return;
  }
  window.__chmiClassicCatalogLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-catalog-shell";
  const BRAND_ID = "chmi-catalog-classic-brand";
  const DIALOG_ID = "chmi-classic-catalog-dialog";
  const OVERLAY_ID = "chmi-classic-catalog-overlay";
  const BUTTON_CLASS = "chmi-classic-catalog-button";
  const ALADIN_PRESET_ID = "chmi-aladin-four-map-preset";
  const CATALOG_HASH = "#chmi-classic-products";
  let hashBeforeCatalog = "";

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  const corePaths = [
    ["https://produkty.chmi.cz/radar/", "Radar"],
    ["https://www.chmi.cz/#chmi-classic-home-radar", "Radar ČHMÚ"],
    ["https://produkty.chmi.cz/druzice/?time_range=24", "Meteosat"],
    ["https://www.chmi.cz/namerena-data/polarni-druzice/true-color", "Polární"],
    ["https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", "Geo"],
    ["https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", "Houby"]
  ];

  const groups = [
    {
      title: "ALADIN a meteogramy",
      items: [
        {
          label: "ALADIN – předpovědní mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Živý model ČHMÚ. Klasický rám přidává rychlou volbu 4 map: teplota, oblačnost, srážky za 3 h a vítr."
        },
        {
          label: "Meteogramy – obce",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "live",
          note: "Meteogramy ALADIN pro obce a konkrétní místa."
        },
        {
          label: "Meteogramy – letiště",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "Oficiální meteogramy ČHMÚ pro letiště."
        },
        {
          label: "Meteogramy – hory a lyžařská střediska",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/hory-a-lyzarska-strediska",
          status: "live",
          note: "Oficiální výběr horských lokalit."
        },
        {
          label: "Meteogramy – vodní plochy",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/vodni-plochy",
          status: "live",
          note: "Oficiální výběr vodních ploch."
        },
        {
          label: "Meteogram pro bod na mapě",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/meteogram-pro-bod-na-mape",
          status: "live",
          note: "Výběr bodu přímo z mapy."
        }
      ]
    },
    {
      title: "Webkamery a aktuální měření",
      items: [
        {
          label: "Webkamery ČR",
          href: "https://www.chmi.cz/namerena-data/webkamery",
          status: "live",
          note: "Rychlý přehled oficiálních kamer. Detail a doprovodná data zůstávají podle možností zdrojové stránky."
        },
        {
          label: "Aktuální teplota",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          status: "live",
          note: "Mapa a tabulka aktuálních měření stanic."
        },
        {
          label: "Denní teplotní mapy",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/maximalni-teplota",
          status: "live",
          note: "Oficiální staniční a interpolované mapy denních teplotních charakteristik; nativní stránka nabízí maximální, minimální a průměrné denní hodnoty."
        },
        {
          label: "Denní a aktuální srážky",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek",
          status: "live",
          note: "Srážkové mapy a tabulky ČHMÚ."
        },
        {
          label: "Aktuální srážkoměry HPPS",
          href: "https://hydro.chmi.cz/hpps/srz?lng=CZE",
          status: "live",
          note: "Hydrologická mapa a tabulka srážkoměrů."
        },
        {
          label: "Meteorologické stanice",
          href: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke",
          status: "live",
          note: "Přehled a rozmístění měřicích stanic."
        },
        {
          label: "Tlak vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tlak-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Vlhkost vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/vlhkost-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Tabulka větru",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru",
          status: "live",
          note: "Aktuální staniční údaje o větru."
        },
        {
          label: "Radar – srážky a blesky",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Aktuální radarová a blesková data; pokročilý prohlížeč zůstává na oficiálním backendu."
        },
        {
          label: "Otevřená data a exporty",
          href: "https://www.chmi.cz/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni",
          status: "live",
          note: "Oficiální rozcestník pro data, stažení a další zpracování."
        }
      ]
    },
    {
      title: "Synoptika",
      items: [
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy a textový popis situace."
        },
        {
          label: "Synoptické situace v minulosti",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticke-situace-v-minulosti",
          status: "live",
          note: "Historický přehled a klasifikace synoptických situací."
        },
        {
          label: "Počasí v Evropě – synoptické stanice",
          href: "https://www.chmi.cz/predpoved-pocasi/pocasi-evropa",
          status: "live",
          note: "Mapa staničních/synoptických hlášení pro Evropu."
        },
        {
          label: "Synoptické stanice / aktuální hlášení ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinově aktualizovaný přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "Výšková mapa větru FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Ověřená současná výšková mapa ČHMÚ; samostatná klasická výšková synoptická mapa nebyla při implementaci spolehlivě doložena."
        }
      ]
    },
    {
      title: "Letecká meteorologie",
      items: [
        {
          label: "Letecké počasí – rozcestník",
          href: "https://www.chmi.cz/letectvi",
          status: "live",
          note: "Oficiální vstup k METAR/SPECI, TAF, SIGMET, SWL a dalším produktům."
        },
        {
          label: "Základny / nízká oblačnost",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          status: "live",
          note: "Oficiální předpověď nízké oblačnosti."
        },
        {
          label: "Meteogramy letišť",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "ALADIN meteogramy pro letiště."
        },
        {
          label: "Aktuální počasí pro létání v ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinový přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "METAR / SPECI",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/zpravy-metar-speci",
          status: "live",
          note: "Aktuální letecká staniční hlášení v mapě a textu podle dostupnosti zdroje."
        },
        {
          label: "SIGMET a výstrahy pro letiště",
          href: "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste",
          status: "live",
          note: "Aktuální výstražné informace pro FIR Praha a letiště z oficiálního zdroje ČHMÚ."
        },
        {
          label: "TAF",
          href: "https://www.chmi.cz/letectvi/textove-predpovedi-pro-letani/predpovedi-taf",
          status: "live",
          note: "Aktuální letištní předpovědi ČHMÚ."
        },
        {
          label: "SWL mapa",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/swl-mapa",
          status: "live",
          note: "Mapa význačného počasí od země do FL100 včetně front, tlakových útvarů a nulové izotermy."
        },
        {
          label: "Výškový vítr 2000 ft",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-vysku-2000ft",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru."
        },
        {
          label: "Výškový vítr FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru. Další hladiny zůstávají dostupné v nativní navigaci ČHMÚ."
        },
        {
          label: "Radiosondážní měření",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni",
          status: "live",
          note: "Vertikální měření atmosféry; další aerologické produkty jsou dostupné v nativní navigaci."
        },
        {
          label: "Aerologie a pseudosondáže",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni",
          status: "live",
          note: "Rozcestník radiosond, windprofilerů, radarových profilů větru a pseudosondáží modelu ALADIN."
        },
        {
          label: "Družice VIS-IR",
          href: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/vis-ir",
          status: "live",
          note: "Aktuální geostacionární produkt VIS-IR."
        },
        {
          label: "Blesky a radar",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Radarový a bleskový přehled z oficiálního zdroje."
        },
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy jako doplněk pro letecké použití."
        },
        {
          label: "ALADIN mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Současná živá náhrada starého ALADIN mapového prohlížeče."
        }
      ]
    },
    {
      title: "Historická data, rekordy a zprávy",
      items: [
        {
          label: "Přechody front přes Prahu",
          href: "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu",
          status: "live",
          note: "Historická řada a související data ČHMÚ."
        },
        {
          label: "Klementinum – rekordy a data",
          href: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          status: "live",
          note: "Klementinská měření, rekordy a odkazy na otevřená data."
        },
        {
          label: "Historické mapy teploty vzduchu",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-teploty-vzduchu",
          status: "live",
          note: "Historické klimatologické mapy teplotních charakteristik; aktuální denní mapy jsou samostatně v části Naměřená data."
        },
        {
          label: "Historické mapy srážkových úhrnů",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-srazkovych-uhrnu",
          status: "live",
          note: "Historické klimatologické mapy srážkových úhrnů; aktuální denní mapa je samostatně v části Naměřená data."
        },
        {
          label: "Územní teplota a srážky",
          href: "https://www.chmi.cz/namerena-data/historicka-data/uzemni-teplota-a-srazky",
          status: "live",
          note: "Územní časové řady a souhrny."
        },
        {
          label: "Zprávy a datové přehledy – počasí, voda a ovzduší",
          href: "https://www.chmi.cz/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy/pocasi-voda-a-ovzdusi-v-cr",
          status: "live",
          note: "Oficiální zprávy a PDF, pokud je ČHMÚ u konkrétního výstupu publikuje."
        },
        {
          label: "Otevřená data ČHMÚ",
          href: "https://opendata.chmi.cz/",
          status: "live",
          note: "Oficiální datový server pro stažení a další zpracování."
        }
      ]
    },
    {
      title: "Archiv starých prohlížečů",
      items: [
        {
          label: "Starý radar INCA",
          href: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
          status: "archive",
          note: "Webový archiv vypnuté aplikace intranet.chmi.cz; nejde o živá data."
        },
        {
          label: "Starý Meteosat MSG",
          href: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
          status: "archive",
          note: "Webový archiv původního MSG prohlížeče; živou náhradou je Meteosat na produkty.chmi.cz."
        },
        {
          label: "Starý polární AVHRR",
          href: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
          status: "archive",
          note: "Webový archiv původního AVHRR prohlížeče; nejde o živá data."
        },
        {
          label: "Starý ALADIN – archivní index",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/aladin/*",
          status: "archive",
          note: "Vyhledání archivovaných URL původního ALADINu. Dostupnost konkrétních zachycených stránek se může lišit; živá náhrada je ALADIN na produkty.chmi.cz."
        }
      ]
    }
  ];

  const shellRoutes = [
    ["produkty.chmi.cz", "/aladin", "ALADIN – předpovědní mapy"],
    ["www.chmi.cz", "/predpoved-pocasi/meteogramy-aladin", "Meteogramy ALADIN"],
    ["www.chmi.cz", "/meteogram/", "Meteogram ALADIN"],
    ["www.chmi.cz", "/namerena-data/webkamery", "Webkamery ČHMÚ"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticka-situace", "Synoptická situace"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticke-situace-v-minulosti", "Synoptické situace v minulosti"],
    ["www.chmi.cz", "/predpoved-pocasi/pocasi-evropa", "Počasí v Evropě"],
    ["www.chmi.cz", "/predpoved-pocasi/prechody-front-pres-prahu", "Přechody front přes Prahu"],
    ["www.chmi.cz", "/namerena-data/data-z-mericich-stanic", "Naměřená data stanic"],
    ["www.chmi.cz", "/namerena-data/umisteni-mericich-stanic/meteorologicke", "Meteorologické stanice"],
    ["www.chmi.cz", "/namerena-data/radar-nowcast/srazky-a-blesky", "Srážky a blesky"],
    ["www.chmi.cz", "/namerena-data/historicka-data", "Historická data"],
    ["www.chmi.cz", "/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni", "Data a vyhodnocení"],
    ["www.chmi.cz", "/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy", "Zprávy a datové přehledy"],
    ["www.chmi.cz", "/letectvi", "Letecká meteorologie"],
    ["hydro.chmi.cz", "/hpps/srz", "Aktuální srážkoměry"]
  ];

  function normalizePath(pathname = location.pathname) {
    return pathname.replace(/\/+$/, "") || "/";
  }

  function isCorePage() {
    const path = normalizePath();
    if (location.hostname === "produkty.chmi.cz") {
      return path.startsWith("/radar") || path.startsWith("/druzice");
    }
    if (location.hostname !== "www.chmi.cz") {
      return false;
    }
    return (
      path === "/" ||
      path === "/namerena-data/pravdepodobnost-rustu-hub" ||
      path.includes("/polarni-druzice/") ||
      path.includes("/geostacionarni-druzice/")
    );
  }

  function shellRoute() {
    const path = normalizePath();
    return shellRoutes.find(([host, prefix]) => location.hostname === host && path.startsWith(prefix)) ?? null;
  }

  function pageIsSupported() {
    return isCorePage() || Boolean(shellRoute());
  }

  function getPreference(callback) {
    if (!storage) {
      callback(true);
      return;
    }
    storage.get({ [STORAGE_KEY]: true }, (result) => callback(result?.[STORAGE_KEY] !== false));
  }

  function setPreference(enabled) {
    storage?.set({ [STORAGE_KEY]: enabled });
  }

  function currentPageMatches(href) {
    try {
      const target = new URL(href);
      return target.hostname === location.hostname && normalizePath(target.pathname) === normalizePath();
    } catch {
      return false;
    }
  }

  function createCoreNavigation() {
    const nav = document.createElement("nav");
    nav.className = "chmi-classic-navigation chmi-catalog-core-navigation";
    nav.setAttribute("aria-label", "ČHMÚ Classic – hlavní aplikace");
    for (const [href, label] of corePaths) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (currentPageMatches(href)) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }
    return nav;
  }

  function addCatalogButton(host) {
    if (!host || host.querySelector(`.${BUTTON_CLASS}`)) {
      return false;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.textContent = "Produkty";
    button.title = "Všechny živé a archivní meteorologické výstupy ČHMÚ Classic";
    button.addEventListener("click", () => openCatalog());
    const newLookButton = [...host.querySelectorAll(":scope > button")].find((candidate) =>
      /nový vzhled|současn.*vzhled/i.test(`${candidate.textContent} ${candidate.title}`)
    );
    host.insertBefore(button, newLookButton ?? null);
    return true;
  }

  function ensureCatalogOnCoreHeader() {
    const header = document.querySelector(
      "#chmi-radar-classic-brand, #chmi-home-radar-classic-brand, #chmi-satellite-classic-brand, #chmi-hub-classic-brand"
    );
    return addCatalogButton(header);
  }

  function createShellBrand(title) {
    if (document.getElementById(BRAND_ID)) {
      return document.getElementById(BRAND_ID);
    }
    const host = document.querySelector("main") ?? document.body;
    if (!host) {
      return null;
    }
    const brand = document.createElement("div");
    brand.id = BRAND_ID;

    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    brand.append(titleNode);

    const subtitle = document.createElement("span");
    subtitle.textContent = "klasické rozhraní";
    brand.append(subtitle);

    brand.append(createCoreNavigation());

    const catalogButton = document.createElement("button");
    catalogButton.type = "button";
    catalogButton.className = BUTTON_CLASS;
    catalogButton.textContent = "Produkty";
    catalogButton.addEventListener("click", () => openCatalog());
    brand.append(catalogButton);

    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      const presetButton = document.createElement("button");
      presetButton.type = "button";
      presetButton.id = ALADIN_PRESET_ID;
      presetButton.textContent = "4 mapy";
      presetButton.title = "Vybrat teplotu, oblačnost, srážky za 3 h a vítr";
      presetButton.addEventListener("click", applyAladinFourMapPreset);
      brand.append(presetButton);
    }

    const newLookButton = document.createElement("button");
    newLookButton.type = "button";
    newLookButton.className = "chmi-catalog-new-look";
    newLookButton.textContent = "Nový vzhled";
    newLookButton.title = "Vypnout klasické rozhraní na podporovaných stránkách";
    newLookButton.addEventListener("click", () => {
      setPreference(false);
      location.reload();
    });
    brand.append(newLookButton);

    host.insertBefore(brand, host.firstChild);
    return brand;
  }

  function statusText(status) {
    if (status === "archive") {
      return "Archiv";
    }
    if (status === "external") {
      return "Externí";
    }
    return "Živě";
  }

  function buildCatalog() {
    if (document.getElementById(DIALOG_ID)) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeCatalog();
      }
    });

    const dialog = document.createElement("section");
    dialog.id = DIALOG_ID;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "chmi-classic-catalog-title");

    const header = document.createElement("header");
    const heading = document.createElement("h2");
    heading.id = "chmi-classic-catalog-title";
    heading.textContent = "ČHMÚ Classic – meteorologické výstupy";
    header.append(heading);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "chmi-catalog-close";
    closeButton.setAttribute("aria-label", "Zavřít katalog");
    closeButton.textContent = "Zavřít";
    closeButton.addEventListener("click", closeCatalog);
    header.append(closeButton);
    dialog.append(header);

    const intro = document.createElement("p");
    intro.className = "chmi-catalog-intro";
    intro.innerHTML = "<strong>Živě</strong> = současný oficiální zdroj ČHMÚ. <strong>Archiv</strong> = historická kopie bez živých dat. Přímé PNG/JPG/PDF odkazy se nevytvářejí, pokud je ČHMÚ na zdrojové stránce neposkytuje stabilně.";
    dialog.append(intro);

    const quick = document.createElement("div");
    quick.className = "chmi-catalog-quick";
    quick.append(createCoreNavigation());
    dialog.append(quick);

    const body = document.createElement("div");
    body.className = "chmi-catalog-groups";

    for (const group of groups) {
      const section = document.createElement("section");
      section.className = "chmi-catalog-group";
      const h3 = document.createElement("h3");
      h3.textContent = group.title;
      section.append(h3);

      const list = document.createElement("div");
      list.className = "chmi-catalog-list";
      for (const item of group.items) {
        const article = document.createElement("article");
        article.className = `chmi-catalog-item is-${item.status}`;

        const top = document.createElement("div");
        top.className = "chmi-catalog-item-top";
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        if (item.status === "archive") {
          link.target = "_blank";
          link.rel = "noreferrer";
        }
        if (currentPageMatches(item.href)) {
          link.setAttribute("aria-current", "page");
        }
        top.append(link);

        const badge = document.createElement("span");
        badge.className = `chmi-catalog-status is-${item.status}`;
        badge.textContent = statusText(item.status);
        top.append(badge);
        article.append(top);

        const note = document.createElement("p");
        note.textContent = item.note;
        article.append(note);
        list.append(article);
      }
      section.append(list);
      body.append(section);
    }
    dialog.append(body);
    overlay.append(dialog);
    document.body.append(overlay);
  }

  function openCatalog() {
    buildCatalog();
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = false;
    document.documentElement.classList.add("chmi-catalog-open");
    const closeButton = overlay.querySelector(".chmi-catalog-close");
    closeButton?.focus();
    if (location.hash !== CATALOG_HASH) {
      hashBeforeCatalog = location.hash;
      history.replaceState(null, "", `${location.pathname}${location.search}${CATALOG_HASH}`);
    }
  }

  function closeCatalog() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("chmi-catalog-open");
    if (location.hash === CATALOG_HASH) {
      history.replaceState(null, "", `${location.pathname}${location.search}${hashBeforeCatalog}`);
      hashBeforeCatalog = "";
    }
  }

  function associatedText(input) {
    const id = input.id;
    const forLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const closestLabel = input.closest("label");
    const text = forLabel?.textContent || closestLabel?.textContent || input.parentElement?.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function dispatchControlChange(input, checked) {
    if (input.checked === checked) {
      return false;
    }
    input.checked = checked;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function applyAladinFourMapPreset() {
    const controls = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
    const known = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i,
      /(?:nízká.*oblačnost|oblačnost.*nízká)/i,
      /(?:střední.*oblačnost|oblačnost.*střední)/i,
      /(?:vysoká.*oblačnost|oblačnost.*vysoká)/i,
      /relativní\s+vlhkost/i,
      /ventilační\s+index/i,
      /minimální\s+teplota/i,
      /maximální\s+teplota/i,
      /srážky\s+za\s+24\s*h/i
    ];
    const wanted = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i
    ];

    let matched = 0;
    for (const control of controls) {
      const text = associatedText(control);
      if (!known.some((pattern) => pattern.test(text))) {
        continue;
      }
      const shouldBeChecked = wanted.some((pattern) => pattern.test(text));
      dispatchControlChange(control, shouldBeChecked);
      if (shouldBeChecked) {
        matched += 1;
      }
    }

    const selectCandidates = [...document.querySelectorAll("select")];
    for (const select of selectCandidates) {
      const context = `${select.previousElementSibling?.textContent || ""} ${select.parentElement?.textContent || ""}`;
      if (!/rozložení|sloup/i.test(context)) {
        continue;
      }
      const option = [...select.options].find((candidate) =>
        /(^|\D)4(\D|$)|4\s*sloup|čtyř/i.test(`${candidate.textContent} ${candidate.value}`)
      );
      if (option && select.value !== option.value) {
        select.value = option.value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      break;
    }

    const button = document.getElementById(ALADIN_PRESET_ID);
    if (button) {
      button.dataset.chmiPresetMatched = String(matched);
      button.title = matched >= 4
        ? "Vybrány 4 klasické mapy z původních ovládacích prvků ČHMÚ."
        : `Nalezeno ${matched}/4 požadovaných ovládacích prvků; stránka ČHMÚ mohla změnit strukturu.`;
    }
  }

  let resizeScheduled = false;
  function updateShellGeometry() {
    if (!document.documentElement.classList.contains(ROOT_CLASS)) {
      return;
    }
    const main = document.querySelector("main");
    if (!main) {
      return;
    }
    const top = Math.max(0, main.getBoundingClientRect().top);
    document.documentElement.style.setProperty(
      "--chmi-catalog-available-height",
      `${Math.max(360, Math.floor(window.innerHeight - top - 10))}px`
    );
  }

  function scheduleGeometry() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      updateShellGeometry();
      window.dispatchEvent(new Event("chmi-classic-layout"));
    });
  }

  function enableShell(route) {
    document.documentElement.classList.add(ROOT_CLASS);
    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      document.documentElement.classList.add("chmi-catalog-aladin");
    }
    createShellBrand(route[2]);
    updateShellGeometry();
    window.addEventListener("resize", scheduleGeometry, { passive: true });
    if (globalThis.ResizeObserver) {
      const main = document.querySelector("main");
      if (main) {
        const observer = new ResizeObserver(scheduleGeometry);
        observer.observe(main);
      }
    }
  }

  function initialize(enabled) {
    if (!enabled || !pageIsSupported()) {
      return;
    }

    const route = shellRoute();
    if (route && !isCorePage()) {
      enableShell(route);
    }

    let scheduled = false;
    const refresh = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        ensureCatalogOnCoreHeader();
        if (route && !isCorePage()) {
          createShellBrand(route[2]);
        }
      });
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    refresh();

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !document.getElementById(OVERLAY_ID)?.hidden) {
        closeCatalog();
      }
    });

    if (location.hash === CATALOG_HASH) {
      openCatalog();
    }
  }

  getPreference(initialize);
})();
