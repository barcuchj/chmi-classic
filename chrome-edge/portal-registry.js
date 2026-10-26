(() => {
  "use strict";
  if (globalThis.__chmiClassicApps) return;

  // Explicit application adapters and first-party information sections.
  // Information pages retain their native content inside the classic shell.
  const apps = {
    forecasts: { title: "Předpovědi", url: "https://www.chmi.cz/predpoved-pocasi", family: "information", section: "weather" },
    observations: { title: "Aktuální situace – naměřená data", url: "https://www.chmi.cz/namerena-data", family: "information", section: "weather" },
    history: { title: "Historická data", url: "https://www.chmi.cz/namerena-data/historicka-data", family: "information", section: "weather" },
    services: { title: "Informace a služby", url: "https://www.chmi.cz/o-chmu/produkty-a-sluzby", family: "information", section: "weather" },
    about: { title: "O ČHMÚ", url: "https://www.chmi.cz/o-chmu", family: "information", section: "weather" },
    contacts: { title: "Kontakty", url: "https://www.chmi.cz/o-chmu/kontakty", family: "information", section: "weather" },
    aviation: { title: "Počasí pro létání – rozcestník ČHMÚ", url: "https://www.chmi.cz/letectvi", family: "information", section: "weather" },
    forecast: { title: "Počasí v České republice – předpověď", url: "https://www.chmi.cz/predpoved-pocasi/dnes", family: "forecast", section: "weather" },
    radar: { title: "Aktuální radarová data", url: "https://produkty.chmi.cz/radar/", family: "radar", section: "weather" },
    lightning: { title: "Detekce blesků – živá vrstva radaru", url: "https://produkty.chmi.cz/radar/?chmi_classic_lightning=1", family: "radar", section: "weather" },
    rainfall: { title: "Radarové odhady srážek", url: "https://hydro.chmi.cz/hppsoldv/main_rain.php", family: "rainfall", section: "weather" },
    synoptic: { title: "Synoptická situace", url: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace", family: "synoptic", section: "weather" },
    "synoptic-forecast": { title: "Synoptická předpověď", url: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace?chmi_classic_synoptic_forecast=1", family: "synoptic", section: "weather" },
    sonde: { title: "Sondážní měření – Praha-Libuš", url: "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa", family: "sonde", section: "weather" },
    klementinum: { title: "Měření z Klementina", url: "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum", family: "klementinum", section: "weather" },
    stations: { title: "Meteorologické stanice ČHMÚ", url: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke", family: "stations", section: "weather" },
    ticks: { title: "Aktivita klíšťat", url: "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat", family: "ticks", section: "weather" },
    pollen: { title: "Pylový semafor", url: "https://www.chmi.cz/predpoved-pocasi/rizika/pylovy-semafor", family: "ticks", section: "weather" },
    bio: { title: "Biometeorologická předpověď", url: "https://www.chmi.cz/predpoved-pocasi/bio-predpoved", family: "bio", section: "weather" },
    week: { title: "Týdenní předpověď", url: "https://www.chmi.cz/predpoved-pocasi/tyden", family: "week", section: "weather" },
    monthly: { title: "Měsíční výhled počasí", url: "https://www.chmi.cz/predpoved-pocasi/mesic", family: "monthly", section: "weather" },
    regions: { title: "Předpovědi pro kraje", url: "https://www.chmi.cz/predpoved-pocasi/karlovarsky-kraj/dnes", family: "regions", section: "weather" },
    meteosat: { title: "Snímky z družic MSG / Meteosat", url: "https://produkty.chmi.cz/druzice/?time_range=24", family: "satellite", section: "weather" },
    aladin: { title: "ALADIN – mapy", url: "https://produkty.chmi.cz/aladin/", family: "aladin", section: "weather" },
    "aladin-animation": { title: "ALADIN – animace", url: "https://produkty.chmi.cz/aladin/?chmi_classic_animation=1", family: "aladin", section: "weather" },
    meteogram: { title: "ALADIN – meteogramy", url: "https://www.chmi.cz/meteogram/355-praha", family: "meteogram", section: "weather" },
    webcams: { title: "Webové kamery", url: "https://www.chmi.cz/namerena-data/webkamery", family: "webcams", section: "weather" },
    polar: { title: "Snímky z polárních družic", url: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color", family: "polar", section: "weather" },
    geo: { title: "Geostacionární družice", url: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", family: "geo", section: "weather" },
    mushrooms: { title: "Pravděpodobnost růstu hub", url: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", family: "mushrooms", section: "weather" },
    snow: { title: "Sněhové zpravodajství", url: "https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php", family: "snow", section: "weather" },
    mountains: { title: "Předpovědi pro hory", url: "https://www.chmi.cz/predpoved-pocasi/lyzarska-strediska-a-hory/sumava-a-novohradske-hory", family: "mountains", section: "weather" },
    water: { title: "VODA – aktuální vodní stavy a povodňová mapa", url: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa", family: "water", section: "water" },
    air: { title: "OVZDUŠÍ – aktuální mapy kvality ovzduší", url: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr", family: "air", section: "air" }
  };
  const pending = (label, reason = "Původní zobrazení této aplikace zatím není obnoveno. Samotný odkaz na nový web nepovažujeme za rekonstrukci.") => ({ label, reason });
  const columns = [
    [{ label: "Předpověď pro ČR", app: "forecast" }, { label: "Předpovědi pro kraje", app: "regions" }, { label: "Týdenní předpověď", app: "week" }, { label: "Měsíční výhled", app: "monthly" }, { label: "Synoptická předpověď", app: "synoptic-forecast" }, { label: "Bio předpověď", app: "bio" }, { label: "Počasí pro létání", app: "aviation" }, { label: "Sněhové zpravodajství", app: "snow" }, { label: "Předpovědi pro hory", app: "mountains" }],
    [{ label: "Aladin – animace", app: "aladin-animation" }, { label: "Aladin – mapy", app: "aladin" }, { label: "Aladin – meteogramy", app: "meteogram" }, pending("Přehled počasí v ČR"), { label: "Synoptická situace", app: "synoptic" }, ...["Ozonové zpravodajství", "Družicová měření ozonu"].map(label => pending(label)), { label: "Pylový semafor", app: "pollen" }, { label: "Aktivita klíšťat", app: "ticks" }],
    [{ label: "Aktuální radarová data", app: "radar" }, { label: "Snímky z družic MSG", app: "meteosat" }, { label: "Snímky z družic NOAA", app: "polar" }, { label: "Detekce blesků", app: "lightning" }, { label: "Radarové odhady srážek", app: "rainfall" }, pending("Aktuální mapy"), pending("Grafy automat. stanic"), { label: "Sondážní měření", app: "sonde" }, pending("Počasí a kůrovec")],
    [{ label: "Webové kamery", app: "webcams" }, pending("Meteo zprávy – Infomet"), { label: "Měření z Klementina", app: "klementinum" }, ...["Mapa zatížení sněhem", "Nalezli jste radiosondu?", "Vertikální profily větru", "Monitoring sucha"].map(label => pending(label)), { label: "Meteorologické stanice", app: "stations" }]
  ];
  const supplementary = [{ label: "Geostacionární družice", app: "geo" }, { label: "Pravděpodobnost růstu hub", app: "mushrooms" }];
  const regionSlugs = new Set(["karlovarsky-kraj", "plzensky-kraj", "ustecky-kraj", "stredocesky-kraj", "praha", "jihocesky-kraj", "liberecky-kraj", "kralovehradecky-kraj", "pardubicky-kraj", "kraj-vysocina", "olomoucky-kraj", "jihomoravsky-kraj", "moravskoslezsky-kraj", "zlinsky-kraj"]);
  const normalPath = path => path.replace(/\/+$/, "") || "/";
  const registry = {
    apps, columns, supplementary,
    get(id) { return Object.hasOwn(apps, id) ? apps[id] : null; },
    nativeAppFor(url) {
      if (url.origin === "https://www.chmi.cz" && normalPath(url.pathname) === "/namerena-data/radar-nowcast/srazky-a-blesky") return "radar";
      return Object.keys(apps).find(id => apps[id].family !== "information" && this.matches(id, url)) ?? null;
    },
    isHomepage(url) {
      return ["www.chmi.cz", "chmi.cz"].includes(url.hostname) && ["/", "/uvod"].includes(normalPath(url.pathname));
    },
    isHomeLink(url) {
      return url.protocol === "https:" && this.isHomepage(url);
    },
    matches(id, url) {
      const app = this.get(id);
      if (!app) return false;
      const target = new URL(app.url);
      if ((id === "synoptic" || id === "synoptic-forecast") && url.origin === target.origin && normalPath(url.pathname) === normalPath(target.pathname)) {
        return (url.searchParams.get("chmi_classic_synoptic_forecast") === "1") === (id === "synoptic-forecast");
      }
      if (id === "snow" && url.origin === target.origin) return /^\/hppsoldv\/hpps_snh_(?:list|detail)\.php\/?$/.test(url.pathname);
      if (id === "mountains" && url.origin === target.origin) return /^\/predpoved-pocasi\/lyzarska-strediska-a-hory\/(?:sumava-a-novohradske-hory|cesky-les-a-slavkovsky-les|krusne-hory|jizerske-hory|krkonose|orlicke-hory|jeseniky-a-kralicky-sneznik|beskydy|zdarske-vrchy|bile-karpaty-a-hostynsko-vsetinske-vrchy)\/?$/.test(url.pathname);
      if (app.family === "information") return url.origin === target.origin &&
        ["/predpoved-pocasi", "/namerena-data", "/o-chmu", "/voda", "/letectvi"]
          .some(path => normalPath(url.pathname) === path || url.pathname.startsWith(path + "/"));
      if (["geo", "polar"].includes(id) && url.origin === target.origin) {
        const prefix = id === "geo" ? "/namerena-data/geostacionarni-druzice/" : "/namerena-data/polarni-druzice/";
        const slugs = id === "geo" ? ["sandwich-ir-bt", "ir", "true-color", "vis-ir", "airmass", "24h-m", "cloud-type"] :
          ["sandwich-ir-bt", "true-color", "vis-ir", "24h-m", "cloud-type", "night-overview"];
        return slugs.some(slug => normalPath(url.pathname) === prefix + slug);
      }
      if (id === "air" && url.origin === target.origin) return [normalPath(target.pathname),
        "/namerena-data/data-z-mericich-stanic/pm10-hodinovy-prumer"].includes(normalPath(url.pathname));
      if (id === "forecast" && url.origin === target.origin) return /^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.test(url.pathname);
      if (id === "regions" && url.origin === target.origin) {
        const match = /^\/predpoved-pocasi\/([a-z-]+)\/(dnes|zitra|pozitri|dalsi-dny)\/?$/.exec(url.pathname);
        return Boolean(match && regionSlugs.has(match[1]));
      }
      if (id === "meteogram" && url.origin === target.origin) return /^\/meteogram\/\d+-[a-z0-9-]+\/?$/.test(url.pathname);
      if (id === "webcams" && url.origin === target.origin && /^\/namerena-data\/webkamera\/[a-z0-9_-]+\/?$/.test(url.pathname)) return true;
      if (id === "radar" || id === "lightning") return url.origin === target.origin &&
        normalPath(url.pathname) === normalPath(target.pathname) &&
        (url.searchParams.get("chmi_classic_lightning") === "1") === (id === "lightning");
      if (id === "aladin" || id === "aladin-animation") return url.origin === target.origin &&
        normalPath(url.pathname) === normalPath(target.pathname) &&
        (url.searchParams.get("chmi_classic_animation") === "1") === (id === "aladin-animation");
      return url.origin === target.origin && normalPath(url.pathname) === normalPath(target.pathname);
    },
    frameURL(id, session, destination = null) {
      const app = this.get(id);
      if (!app) return null;
      let url;
      try { url = new URL(destination ?? app.url); } catch { return null; }
      if (!this.matches(id, url) || url.username || url.password) return null;
      url.searchParams.set("chmi_classic_embed", id);
      url.searchParams.set("chmi_classic_session", session);
      return url.href;
    },
    frameName(id, session) {
      return this.get(id) && /^[a-zA-Z0-9-]{8,80}$/.test(session ?? "") ?
        `chmi-classic:${id}:${session}` : "";
    },
    embeddedContext(url, name) {
      // Meteosat rewrites its query before document-idle. The frame name stays
      // bound to this browsing context and is independent of native URL state.
      const named = /^chmi-classic:([a-z-]+):([a-zA-Z0-9-]{8,80})$/.exec(name ?? "");
      const id = named?.[1] ?? url.searchParams.get("chmi_classic_embed");
      const session = named?.[2] ?? url.searchParams.get("chmi_classic_session");
      return this.matches(id, url) && /^[a-zA-Z0-9-]{8,80}$/.test(session ?? "") ? { id, session } : null;
    },
    shouldOpenInPanel(event) {
      return !event.defaultPrevented && event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    },
    panelShiftX(panel, viewport) {
      const left = viewport.left + 4;
      const right = Math.max(left, viewport.right - panel.width - 4);
      return Math.min(right, Math.max(left, panel.left)) - panel.left;
    },
    panelShiftY(panel, viewport, anchor) {
      let top = panel.top;
      if (top < viewport.top + 4 || top + panel.height > viewport.bottom - 4 ||
          (top <= anchor.bottom && top + panel.height >= anchor.top)) {
        top = anchor.bottom + 4 + panel.height <= viewport.bottom - 4
          ? anchor.bottom + 4 : anchor.top - panel.height - 4;
      }
      return top - panel.top + this.panelShiftX({ left: top, width: panel.height },
        { left: viewport.top, right: viewport.bottom });
    },
    route(hash) {
      if (!hash) return "forecast";
      const id = /^#classic=([a-z-]+)$/.exec(hash)?.[1];
      return this.get(id) ? id : "radar";
    },
    accepts(event, frame, id, session) {
      const app = this.get(id);
      return Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-status" &&
        event.data.session === session && event.data.app === id &&
        ["ready", "loading"].includes(event.data.state));
    },
    acceptsNavigation(event, frame, id, session) {
      const app = this.get(id);
      const authorized = Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-navigate" &&
        event.data.session === session && event.data.app === id);
      if (!authorized) return false;
      if (event.data.target === "home") return event.data.url == null;
      return app.family === "information" && Boolean(this.get(event.data.target)) &&
        (event.data.url == null || this.frameURL(event.data.target, session, event.data.url) !== null);
    }
  };
  globalThis.__chmiClassicApps = Object.freeze(registry);
})();
