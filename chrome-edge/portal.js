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
          if (selectedSection !== "weather") selectSection("weather");
          else openApp(entry.app);
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
    function selectSection(key) {
      selectedSection = key;
      for (const tab of tabs.querySelectorAll("button")) {
        const active = tab.dataset.section === key;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      }
      workspace.setAttribute("aria-labelledby", `chmi-portal-tab-${key}`);
      directory.hidden = extra.hidden = key !== "weather";
      standalone.hidden = key !== "weather";
      if (key === "weather") { openApp(registry.route(location.hash)); return; }
      clearTimeout(timeout);
      frame?.remove();
      frame = null;
      current = null;
      title.textContent = key === "water" ? "VODA" : "OVZDUŠÍ";
      status.textContent = "Rekonstrukce zatím není dokončena";
      workspace.setAttribute("aria-busy", "false");
      noticeText.textContent = "Původní mapový panel a jeho ovládání připravujeme podle archivních podkladů. Historické hodnoty zde nevydáváme za aktuální měření.";
      notice.querySelector("button").hidden = true;
      notice.hidden = false;
    }
    function openApp(id, force = false) {
      const app = registry.get(id);
      if (!app || (current === id && frame && !force)) return;
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
      if (root.isConnected && registry.accepts(event, frame, current, session)) setStatus(event.data.state);
    };
    const onHash = () => {
      if (!root.isConnected) return;
      if (selectedSection !== "weather") selectSection("weather");
      else openApp(registry.route(location.hash));
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("hashchange", onHash);
    root.addEventListener("keydown", event => {
      if (event.key === "Escape" && root.classList.contains("chmi-portal-expanded")) expand.click();
    });
    selectSection("weather");
  }
  function initialize(result) {
    if (result[KEY] === false) { window.__chmiClassicPortalCandidate = false; return; }
    if (document.body) build();
    else document.addEventListener("DOMContentLoaded", build, { once: true });
  }
  if (storage) storage.get({ [KEY]: true }, initialize);
  else initialize({ [KEY]: true });
})();
