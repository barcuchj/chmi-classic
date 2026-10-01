(() => {
  "use strict";
  if (globalThis.__chmiClassicApps) return;

  // Only explicit reconstructed adapters may become clickable in the portal.
  // An existing modern URL alone is not proof of an old-look application.
  const apps = {
    forecast: { title: "Počasí v České republice – předpověď", url: "https://www.chmi.cz/predpoved-pocasi/dnes", family: "forecast", section: "weather" },
    radar: { title: "Aktuální radarová data", url: "https://produkty.chmi.cz/radar/", family: "radar", section: "weather" },
    lightning: { title: "Detekce blesků – živá vrstva radaru", url: "https://produkty.chmi.cz/radar/?chmi_classic_lightning=1", family: "radar", section: "weather" },
    rainfall: { title: "Radarové odhady srážek", url: "https://hydro.chmi.cz/hppsoldv/main_rain.php", family: "rainfall", section: "weather" },
    synoptic: { title: "Synoptická situace", url: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace", family: "synoptic", section: "weather" },
    sonde: { title: "Sondážní měření – Praha-Libuš", url: "https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa", family: "sonde", section: "weather" },
    klementinum: { title: "Měření z Klementina", url: "https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum", family: "klementinum", section: "weather" },
    stations: { title: "Meteorologické stanice ČHMÚ", url: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke", family: "stations", section: "weather" },
    ticks: { title: "Aktivita klíšťat", url: "https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat", family: "ticks", section: "weather" },
    bio: { title: "Biometeorologická předpověď", url: "https://www.chmi.cz/predpoved-pocasi/bio-predpoved", family: "bio", section: "weather" },
    meteosat: { title: "Snímky z družic MSG / Meteosat", url: "https://produkty.chmi.cz/druzice/?time_range=24", family: "satellite", section: "weather" },
    aladin: { title: "ALADIN – mapy", url: "https://produkty.chmi.cz/aladin/", family: "aladin", section: "weather" },
    "aladin-animation": { title: "ALADIN – animace", url: "https://produkty.chmi.cz/aladin/?chmi_classic_animation=1", family: "aladin", section: "weather" },
    meteogram: { title: "ALADIN – meteogramy", url: "https://www.chmi.cz/meteogram/355-praha", family: "meteogram", section: "weather" },
    webcams: { title: "Webové kamery", url: "https://www.chmi.cz/namerena-data/webkamery", family: "webcams", section: "weather" },
    polar: { title: "Snímky z polárních družic", url: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color", family: "polar", section: "weather" },
    geo: { title: "Geostacionární družice", url: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", family: "geo", section: "weather" },
    mushrooms: { title: "Pravděpodobnost růstu hub", url: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", family: "mushrooms", section: "weather" },
    water: { title: "VODA – aktuální vodní stavy a povodňová mapa", url: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa", family: "water", section: "water" },
    air: { title: "OVZDUŠÍ – aktuální mapy kvality ovzduší", url: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr", family: "air", section: "air" }
  };
  const pending = (label, reason = "Původní zobrazení této aplikace zatím není obnoveno. Samotný odkaz na nový web nepovažujeme za rekonstrukci.") => ({ label, reason });
  const columns = [
    [{ label: "Předpověď pro ČR", app: "forecast" }, ...["Předpovědi pro kraje", "Týdenní předpověď", "Měsíční výhled", "Synoptická předpověď"].map(label => pending(label)), { label: "Bio předpověď", app: "bio" }, ...["Počasí pro létání", "Sněhové zpravodajství", "Předpovědi pro hory"].map(label => pending(label))],
    [{ label: "Aladin – animace", app: "aladin-animation" }, { label: "Aladin – mapy", app: "aladin" }, { label: "Aladin – meteogramy", app: "meteogram" }, pending("Přehled počasí v ČR"), { label: "Synoptická situace", app: "synoptic" }, ...["Ozonové zpravodajství", "Družicová měření ozonu", "Pylový semafor"].map(label => pending(label)), { label: "Aktivita klíšťat", app: "ticks" }],
    [{ label: "Aktuální radarová data", app: "radar" }, { label: "Snímky z družic MSG", app: "meteosat" }, { label: "Snímky z družic NOAA", app: "polar" }, { label: "Detekce blesků", app: "lightning" }, { label: "Radarové odhady srážek", app: "rainfall" }, pending("Aktuální mapy"), pending("Grafy automat. stanic"), { label: "Sondážní měření", app: "sonde" }, pending("Počasí a kůrovec")],
    [{ label: "Webové kamery", app: "webcams" }, pending("Meteo zprávy – Infomet"), { label: "Měření z Klementina", app: "klementinum" }, ...["Mapa zatížení sněhem", "Nalezli jste radiosondu?", "Vertikální profily větru", "Monitoring sucha"].map(label => pending(label)), { label: "Meteorologické stanice", app: "stations" }]
  ];
  const supplementary = [{ label: "Geostacionární družice", app: "geo" }, { label: "Pravděpodobnost růstu hub", app: "mushrooms" }];
  const normalPath = path => path.replace(/\/+$/, "") || "/";
  const registry = {
    apps, columns, supplementary,
    get(id) { return Object.hasOwn(apps, id) ? apps[id] : null; },
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
      if (id === "forecast" && url.origin === target.origin) return /^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.test(url.pathname);
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
    frameURL(id, session) {
      const app = this.get(id);
      if (!app) return null;
      const url = new URL(app.url);
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
      return Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-navigate" &&
        event.data.session === session && event.data.app === id && event.data.target === "home");
    }
  };
  globalThis.__chmiClassicApps = Object.freeze(registry);
})();
