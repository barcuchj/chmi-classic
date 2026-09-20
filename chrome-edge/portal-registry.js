(() => {
  "use strict";
  if (globalThis.__chmiClassicApps) return;

  // Only explicit reconstructed adapters may become clickable in the portal.
  // An existing modern URL alone is not proof of an old-look application.
  const apps = {
    radar: { title: "Aktuální radarová data", url: "https://produkty.chmi.cz/radar/", family: "radar", section: "weather" },
    meteosat: { title: "Snímky z družic MSG / Meteosat", url: "https://produkty.chmi.cz/druzice/?time_range=24", family: "satellite", section: "weather" },
    aladin: { title: "ALADIN – mapy", url: "https://produkty.chmi.cz/aladin/", family: "aladin", section: "weather" },
    polar: { title: "Snímky z polárních družic", url: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color", family: "polar", section: "weather" },
    geo: { title: "Geostacionární družice", url: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", family: "geo", section: "weather" },
    mushrooms: { title: "Pravděpodobnost růstu hub", url: "https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", family: "mushrooms", section: "weather" }
  };
  const pending = (label, reason = "Původní zobrazení této aplikace zatím není obnoveno. Samotný odkaz na nový web nepovažujeme za rekonstrukci.") => ({ label, reason });
  const columns = [
    ["Předpověď pro ČR", "Předpovědi pro kraje", "Týdenní předpověď", "Měsíční výhled", "Synoptická předpověď", "Bio předpověď", "Počasí pro létání", "Sněhové zpravodajství", "Předpovědi pro hory"].map(label => pending(label)),
    [{ label: "Aladin – animace", app: "aladin" }, { label: "Aladin – mapy", app: "aladin" }, ...["Aladin – meteogramy", "Přehled počasí v ČR", "Synoptická situace", "Ozonové zpravodajství", "Družicová měření ozonu", "Pylový semafor", "Aktivita klíšťat"].map(label => pending(label))],
    [{ label: "Aktuální radarová data", app: "radar" }, { label: "Snímky z družic MSG", app: "meteosat" }, { label: "Snímky z družic NOAA", app: "polar" }, ...["Detekce blesků", "Radarové odhady srážek", "Aktuální mapy", "Grafy automat. stanic", "Sondážní měření", "Počasí a kůrovec"].map(label => pending(label))],
    [...["Webové kamery", "Meteo zprávy – Infomet", "Měření z Klementina", "Mapa zatížení sněhem", "Nalezli jste radiosondu?", "Vertikální profily větru", "Monitoring sucha", "Meteorologické stanice"].map(label => pending(label))]
  ];
  const supplementary = [{ label: "Geostacionární družice", app: "geo" }, { label: "Pravděpodobnost růstu hub", app: "mushrooms" }];
  const normalPath = path => path.replace(/\/+$/, "") || "/";
  const registry = {
    apps, columns, supplementary,
    get(id) { return Object.hasOwn(apps, id) ? apps[id] : null; },
    isHomepage(url) {
      return ["www.chmi.cz", "chmi.cz"].includes(url.hostname) && ["/", "/uvod"].includes(normalPath(url.pathname));
    },
    matches(id, url) {
      const app = this.get(id);
      if (!app) return false;
      const target = new URL(app.url);
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
      const id = /^#classic=([a-z-]+)$/.exec(hash)?.[1];
      return this.get(id) ? id : "radar";
    },
    accepts(event, frame, id, session) {
      const app = this.get(id);
      return Boolean(app && frame && event.source === frame.contentWindow &&
        event.origin === new URL(app.url).origin && event.data?.type === "chmi-classic-status" &&
        event.data.session === session && event.data.app === id &&
        ["ready", "loading"].includes(event.data.state));
    }
  };
  globalThis.__chmiClassicApps = Object.freeze(registry);
})();
