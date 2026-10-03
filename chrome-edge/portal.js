(() => {
  "use strict";
  const registry = globalThis.__chmiClassicApps;
  if (!registry || window.top !== window || window.__chmiClassicPortalLoaded || !registry.isHomepage(new URL(location.href))) return;
  window.__chmiClassicPortalLoaded = true;
  // Reserve the homepage before asynchronous extension storage lookup.
  window.__chmiClassicPortalCandidate = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const KEY = "chmiRadarClassicEnabled";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function link(text, url, className) {
    const node = el("a", className, text);
    node.href = url;
    return node;
  }
  function button(text, action, className = "chmi-portal-button") {
    const node = el("button", className, text);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }
  function external(text, href) {
    const node = link(text, href);
    node.target = "_blank";
    node.rel = "noopener noreferrer";
    node.title = "Současná informační stránka ČHMÚ (nová karta)";
    return node;
  }

  function build() {
    if (document.getElementById("chmi-classic-portal")) return;
    let current = null;
    let frame = null;
    let session = null;
    let timeout = null;
    let selectedSection = "weather";
    let weatherApp = "forecast";
    document.documentElement.classList.add("chmi-classic-portal-active");
    const root = el("div");
    root.id = "chmi-classic-portal";
    const utilities = el("div", "chmi-portal-utilities");
    utilities.title = "ČHMÚ Classic · neoficiální uživatelská úprava";
    const newLook = button("Nový vzhled", () => {
      storage?.set({ [KEY]: false });
      document.documentElement.classList.remove("chmi-classic-portal-active");
      root.remove();
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("hashchange", onHash);
      // Restore the original DOM, not a destructive replacement or timed reload.
      const restore = button("Klasický vzhled", () => {
        storage?.set({ [KEY]: true });
        restore.remove();
        build();
      });
      restore.id = "chmi-portal-restore";
      document.body.append(restore);
      window.dispatchEvent(new Event("resize"));
    });
    const warnings = external("! VÝSTRAHY", "https://vystrahy-cr.chmi.cz/");
    warnings.className = "chmi-portal-warning-link";
    warnings.title = "Ověřit aktuální výstrahy na oficiálním webu ČHMÚ (nová karta)";
    utilities.append(warnings, newLook);
    const primary = el("nav", "chmi-portal-primary");
    primary.setAttribute("aria-label", "Hlavní nabídka");
    for (const [text, href] of [["PŘEDPOVĚDI", "https://www.chmi.cz/predpoved-pocasi"], ["AKTUÁLNÍ SITUACE", "https://www.chmi.cz/namerena-data"], ["HISTORICKÁ DATA", "https://www.chmi.cz/namerena-data/historicka-data"], ["INFORMACE A SLUŽBY", "https://www.chmi.cz/o-chmu/produkty-a-sluzby"], ["O NÁS", "https://www.chmi.cz/o-chmu"], ["KONTAKTY", "https://www.chmi.cz/o-chmu/kontakty"]]) primary.append(external(text, href));
    // Never infer warning status from an archive screenshot or failed request.
    const main = el("main", "chmi-portal-main");
    const tabs = el("div", "chmi-portal-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Produkty ČHMÚ");
    for (const [key, title] of [["weather", "☼ POČASÍ"], ["water", "≋ VODA"], ["air", "☘ OVZDUŠÍ"]]) {
      const tab = button(title, () => selectSection(key), "chmi-portal-tab");
      tab.dataset.section = key;
      tab.id = `chmi-portal-tab-${key}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "chmi-portal-workspace");
      tabs.append(tab);
    }
    tabs.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const list = [...tabs.querySelectorAll("button")];
      const index = list.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
      list[next].focus();
      selectSection(list[next].dataset.section);
    });
    const workspace = el("section", "chmi-portal-workspace");
    workspace.id = "chmi-portal-workspace";
    workspace.setAttribute("role", "tabpanel");
    const toolbar = el("div", "chmi-portal-app-toolbar");
    const title = el("h1", "chmi-portal-app-title");
    const status = el("span", "chmi-portal-status");
    status.setAttribute("role", "status");
    const expand = button("Zvětšit panel", () => {
      const expanded = root.classList.toggle("chmi-portal-expanded");
      expand.textContent = expanded ? "Zpět na portál" : "Zvětšit panel";
      expand.setAttribute("aria-pressed", String(expanded));
    });
    expand.setAttribute("aria-pressed", "false");
    const standalone = external("Otevřít samostatně ↗", registry.get("radar").url);
    standalone.className = "chmi-portal-button chmi-portal-standalone";
    standalone.title = "Otevřít tuto aplikaci v nové záložce v klasickém vzhledu";
    toolbar.append(title, status, standalone, expand);
    const stage = el("div", "chmi-portal-stage");
    stage.id = "chmi-portal-stage";
    const notice = el("div", "chmi-portal-notice");
    const noticeText = el("p");
    notice.append(noticeText, button("Zkusit znovu", () => openApp(current ?? "radar", true)));
    notice.hidden = true;
    stage.append(notice);
    workspace.append(toolbar, stage);
    const directory = el("nav", "chmi-portal-directory");
    directory.setAttribute("aria-label", "Původní rozcestník aplikací");
    function item(entry) {
      if (!entry.app || !registry.get(entry.app)) {
        const span = el("span", "chmi-portal-link is-unavailable", `>> ${entry.label}`);
        span.title = entry.reason;
        span.tabIndex = 0;
        span.setAttribute("aria-disabled", "true");
        span.setAttribute("aria-label", `${entry.label}. ${entry.reason}`);
        return span;
      }
      const anchor = link(`>> ${entry.label}`, registry.get(entry.app).url, "chmi-portal-link");
      anchor.dataset.app = entry.app;
      anchor.title = "Kliknutí: centrální panel. Ctrl/⌘+klik nebo prostřední tlačítko: nová záložka.";
      anchor.addEventListener("click", event => {
        if (!registry.shouldOpenInPanel(event)) return;
        event.preventDefault();
        const hash = `#classic=${entry.app}`;
        if (location.hash === hash) {
          weatherApp = entry.app;
          selectSection("weather");
        } else location.hash = hash;
      });
      return anchor;
    }
    for (const column of registry.columns) {
      const group = el("div", "chmi-portal-link-column");
      group.append(...column.map(item));
      directory.append(group);
    }
    const extra = el("nav", "chmi-portal-extra");
    extra.setAttribute("aria-label", "Další obnovené aplikace");
    extra.append(...registry.supplementary.map(item));
    const topbar = el("header", "chmi-portal-topbar");
    topbar.append(tabs, primary, utilities);
    main.append(workspace, directory, extra);
    root.append(topbar, main);
    document.body.append(root);

    function setStatus(state) {
      stage.dataset.state = state;
      status.textContent = state === "ready" ? "Oficiální živá aplikace ČHMÚ" : "Načítám aplikaci a její data…";
      workspace.setAttribute("aria-busy", String(state !== "ready"));
      if (state === "ready") { clearTimeout(timeout); notice.hidden = true; }
    }
    function selectSection(key, updateHash = true) {
      selectedSection = key;
      for (const tab of tabs.querySelectorAll("button")) {
        const active = tab.dataset.section === key;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      }
      workspace.setAttribute("aria-labelledby", `chmi-portal-tab-${key}`);
      directory.hidden = extra.hidden = key !== "weather";
      standalone.hidden = false;
      const id = key === "weather" ? weatherApp : key;
      openApp(id);
      if (updateHash && location.hash !== `#classic=${id}`) location.hash = `#classic=${id}`;
    }
    function openApp(id, force = false) {
      const app = registry.get(id);
      if (!app || (current === id && frame && !force)) return;
      if ((app.section ?? "weather") === "weather") weatherApp = id;
      clearTimeout(timeout);
      frame?.remove();
      current = id;
      session = crypto.randomUUID();
      title.textContent = app.title;
      standalone.href = app.url;
      notice.hidden = true;
      notice.querySelector("button").hidden = false;
      for (const anchor of root.querySelectorAll("[data-app]")) {
        if (anchor.dataset.app === id) anchor.setAttribute("aria-current", "true");
        else anchor.removeAttribute("aria-current");
      }
      frame = el("iframe", "chmi-portal-app-frame");
      frame.name = registry.frameName(id, session);
      frame.title = `${app.title} – klasické rozhraní`;
      frame.referrerPolicy = "strict-origin";
      frame.src = registry.frameURL(id, session);
      setStatus("loading");
      stage.append(frame);
      timeout = setTimeout(() => {
        status.textContent = "Načtení aplikace zatím nebylo potvrzeno";
        noticeText.textContent = "ČHMÚ může odpovídat pomalu nebo chybí oprávnění userscriptu uvnitř rámce. Panel neoznačujeme za funkční, dokud se nepotvrdí jeho rozhraní a mapové podklady.";
        notice.hidden = false;
        workspace.setAttribute("aria-busy", "false");
      }, 25000);
    }
    const onMessage = event => {
      if (!root.isConnected) return;
      if (registry.acceptsNavigation(event, frame, current, session)) {
        if (location.hash !== "#classic=forecast") location.hash = "#classic=forecast";
        else selectSection("weather");
        return;
      }
      if (registry.accepts(event, frame, current, session)) setStatus(event.data.state);
    };
    const onHash = () => {
      if (!root.isConnected) return;
      const id = registry.route(location.hash);
      const section = registry.get(id)?.section ?? "weather";
      if (section === "weather") weatherApp = id;
      selectSection(section, false);
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("hashchange", onHash);
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && root.classList.contains("chmi-portal-expanded")) expand.click();
    });
    onHash();
  }
  function initialize(result) {
    if (result[KEY] === false) { window.__chmiClassicPortalCandidate = false; return; }
    if (document.body) build();
    else document.addEventListener("DOMContentLoaded", build, { once: true });
  }
  if (storage) storage.get({ [KEY]: true }, initialize);
  else initialize({ [KEY]: true });
})();

(() => {
  "use strict";
  if (window.__chmiHydroAirClassicLoaded || window.__chmiClassicPortalCandidate) return;

  const path = location.pathname.replace(/\/+$/, "") || "/";
  const kind = ["www.chmi.cz", "chmi.cz"].includes(location.hostname) &&
    path === "/voda/aktualni-stav-rek-povodnova-mapa" ? "water" :
    ["www.chmi.cz", "chmi.cz"].includes(location.hostname) &&
    path === "/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr" ? "air" : null;
  if (!kind) return;
  window.__chmiHydroAirClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-hydro-air-classic";
  const BRAND_ID = "chmi-hydro-air-classic-brand";
  const MAP_CLASS = "chmi-hydro-air-map-host";
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const title = kind === "water" ? "ČHMÚ – VODA" : "ČHMÚ – OVZDUŠÍ";
  const tableURL = kind === "water" ?
    "https://www.chmi.cz/voda/tabulka-hydrologie" :
    "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-kvality-ovzdusi";
  let enabled = true;
  let refreshScheduled = false;
  let geometryScheduled = false;
  let resizeDispatchScheduled = false;
  let observedMap = null;
  let resizeObserver = null;
  const originalAria = new Map();

  function nativeMapReady(map) {
    const config = `https://data-provider.chmi.cz/api/map/init/${kind === "water" ? "hydrologie.povrchove-vody" : "ovzdusi.kvalita"}`;
    const component = map?.querySelector(`.chmu-map-component[data-config-url="${config}"], .chmu-map-component[data-config-url="${config}?client=mobile"]`);
    const canvas = map?.querySelector(".ol-viewport canvas");
    const timeline = map?.querySelector('input[aria-label="Časová osa"]');
    return Boolean(component && canvas?.width >= 300 && canvas?.height >= 200 &&
      timeline && !timeline.disabled && Number(timeline.max) > 1);
  }

  function savePreference(value) {
    storage?.set({ [STORAGE_KEY]: value });
    setMode(value);
  }

  function ensureBrand() {
    if (document.getElementById(BRAND_ID)) return false;
    const main = document.querySelector("main");
    if (!main) return false;
    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.dataset.kind = kind;
    brand.innerHTML = `<strong>${title}</strong><nav aria-label="Původní záložky portálu"><a href="https://www.chmi.cz/">POČASÍ</a><a href="https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa">VODA</a><a href="https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr">OVZDUŠÍ</a></nav><span>živá data ČHMÚ</span><a class="chmi-hydro-air-table" target="_blank" rel="noopener noreferrer">Tabulka dat ↗</a><button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>`;
    brand.querySelector(".chmi-hydro-air-table").href = tableURL;
    brand.querySelector(`nav a:nth-child(${kind === "water" ? 2 : 3})`).setAttribute("aria-current", "page");
    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    main.insertBefore(brand, main.firstChild);
    return true;
  }

  function findMap() {
    return document.getElementById("chmu-map-container");
  }

  function markMap() {
    const map = findMap();
    if (!map) return false;
    const content = map.closest(".lfr-layout-structure-item-chmimapcomponent")?.parentElement;
    if (!content) return false;
    const changed = !map.classList.contains(MAP_CLASS) || !content.classList.contains("chmi-hydro-air-content");
    content.classList.add("chmi-hydro-air-content");
    map.classList.add(MAP_CLASS);
    return changed;
  }

  function dispatchResize() {
    if (resizeDispatchScheduled) return;
    resizeDispatchScheduled = true;
    requestAnimationFrame(() => {
      resizeDispatchScheduled = false;
      window.dispatchEvent(new Event("resize"));
    });
  }

  function updateGeometry() {
    if (!enabled) return;
    const map = findMap();
    if (!map) return;
    const rect = map.getBoundingClientRect();
    const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 6);
    document.documentElement.style.setProperty("--chmi-hydro-air-fit-height", `${Math.max(0, available)}px`);
    requestAnimationFrame(() => {
      if (!enabled) return;
      for (const panel of map.querySelectorAll?.(".ol-legend.__expanded .base-map-wrapper") ?? []) {
        const rect = panel.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const previous = parseFloat(panel.style.getPropertyValue("--chmi-legend-shift-x")) || 0;
        const previousY = parseFloat(panel.style.getPropertyValue("--chmi-legend-shift-y")) || 0;
        const bounds = map.getBoundingClientRect();
        const shift = globalThis.__chmiClassicApps.panelShiftX({ left: rect.left - previous, width: rect.width }, bounds);
        panel.style.setProperty("--chmi-legend-shift-x", `${shift}px`);
        const button = panel.closest(".ol-legend")?.querySelector(".ol-legend-button");
        if (button) {
          const shiftY = globalThis.__chmiClassicApps.panelShiftY({ top: rect.top - previousY, height: rect.height }, bounds, button.getBoundingClientRect());
          panel.style.setProperty("--chmi-legend-shift-y", `${shiftY}px`);
        }
      }
    });
    if (globalThis.ResizeObserver && observedMap !== map) {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => scheduleGeometry(false));
      resizeObserver.observe(map);
      observedMap = map;
      map.addEventListener("click", () => scheduleGeometry(false));
    }
  }

  function scheduleGeometry(notify = true) {
    if (!enabled || geometryScheduled) return;
    geometryScheduled = true;
    requestAnimationFrame(() => {
      geometryScheduled = false;
      updateGeometry();
      if (notify) dispatchResize();
    });
  }

  function applyMode() {
    // A late or failed native map must not leave an otherwise useful page blank.
    const map = findMap();
    if (!map?.closest(".lfr-layout-structure-item-chmimapcomponent") || !nativeMapReady(map)) return;
    if (!originalAria.has(map)) originalAria.set(map, [map.getAttribute("aria-hidden"), map.getAttribute("aria-disabled")]);
    map.setAttribute("aria-hidden", "false");
    map.setAttribute("aria-disabled", "false");
    map.dataset.chmiHydroAirNative = "verified";
    const first = !document.documentElement.classList.contains(ROOT_CLASS);
    document.documentElement.classList.add(ROOT_CLASS);
    const brandChanged = ensureBrand();
    const changed = markMap() || brandChanged;
    updateGeometry();
    if (first || changed) dispatchResize();
  }

  function removeMode() {
    document.getElementById(BRAND_ID)?.remove();
    document.querySelectorAll(`.${MAP_CLASS}`).forEach(node => node.classList.remove(MAP_CLASS));
    document.querySelectorAll(".chmi-hydro-air-content").forEach(node => node.classList.remove("chmi-hydro-air-content"));
    resizeObserver?.disconnect();
    resizeObserver = null;
    observedMap = null;
    document.documentElement.style.removeProperty("--chmi-hydro-air-fit-height");
    document.documentElement.classList.remove(ROOT_CLASS);
    for (const [map, values] of originalAria) {
      for (const [index, name] of ["aria-hidden", "aria-disabled"].entries()) {
        if (values[index] == null) map.removeAttribute(name);
        else map.setAttribute(name, values[index]);
      }
      delete map.dataset.chmiHydroAirNative;
      for (const panel of map.querySelectorAll?.(".ol-legend .base-map-wrapper") ?? []) {
        panel.style.removeProperty("--chmi-legend-shift-x");
        panel.style.removeProperty("--chmi-legend-shift-y");
      }
    }
    originalAria.clear();
    dispatchResize();
  }

  function setMode(value) {
    enabled = Boolean(value);
    if (enabled) applyMode();
    else removeMode();
  }

  function scheduleRefresh() {
    if (!enabled || refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      applyMode();
    });
  }

  window.addEventListener("resize", () => { if (enabled) requestAnimationFrame(updateGeometry); });
  window.addEventListener("scroll", () => scheduleGeometry(false), { passive: true });
  new MutationObserver(scheduleRefresh).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["width", "height", "data-config-url", "disabled", "max"]
  });

  if (storage) storage.get({ [STORAGE_KEY]: true }, result => setMode(result[STORAGE_KEY]));
  else setMode(true);
})();
