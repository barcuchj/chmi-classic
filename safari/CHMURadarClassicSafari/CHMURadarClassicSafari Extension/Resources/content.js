(() => {
  "use strict";

  if (window.top !== window) {
    return;
  }

  const isRadarPage =
    location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/radar/");
  const isMushroomPage =
    location.hostname === "www.chmi.cz" &&
    location.pathname.replace(/\/+$/, "") === "/namerena-data/pravdepodobnost-rustu-hub";
  const isHomepage =
    location.hostname === "www.chmi.cz" && (location.pathname === "/" || location.pathname === "");

  if (!isRadarPage && !isMushroomPage && !isHomepage) {
    return;
  }

  if (isMushroomPage) {
    initMushroomClassic();
    return;
  }

  if (isHomepage) {
    initHomepageRadarClassic();
    return;
  }

  if (window.__chmiRadarClassicLoaded) {
    return;
  }

  window.__chmiRadarClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-radar-classic";
  const TOOLBAR_ID = "chmi-radar-classic-toolbar";
  const BRAND_ID = "chmi-radar-classic-brand";
  const HIDDEN_CLASS = "chmi-radar-classic-hidden";
  const APP_SECTION_CLASS = "chmi-radar-classic-app-section";
  const APP_ROW_CLASS = "chmi-radar-classic-app-row";
  const WEB_MAPS_CLASS = "chmi-radar-classic-web-maps";

  const classicLabels = {
    radio_display1: "Dle okna",
    radio_display2: "Zoom 4x",
    radio_display3: "Zoom 8x",
    radio_display4: "Web Maps"
  };

  let classicEnabled = true;
  let updateScheduled = false;
  let defaultDisplayApplied = false;
  let defaultPlaybackApplied = false;
  let layoutResizeObserver = null;
  let observedLayoutElement = null;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  function savePreference(enabled) {
    if (storage) {
      storage.set({ [STORAGE_KEY]: enabled });
    }
    setClassicMode(enabled);
  }

  function markNonApplicationSections() {
    const mainWrapper = document.querySelector(".mainWrapper");
    if (!mainWrapper) {
      return false;
    }

    let changed = false;

    for (const section of mainWrapper.children) {
      if (
        section.id === "div_modal" ||
        section.querySelector("#div_container_data") ||
        section.querySelector("#div_fake_container_data")
      ) {
        continue;
      }

      const text = section.textContent.replace(/\s+/g, " ").trim();
      const isTitle = section.querySelector("h1")?.textContent.trim() === "Radar";
      const isDescription = text.startsWith("Aplikace určená k detailní analýze počasí");
      const isSpacer = text.length === 0;

      if ((isTitle || isDescription || isSpacer) && !section.classList.contains(HIDDEN_CLASS)) {
        section.classList.add(HIDDEN_CLASS);
        changed = true;
      }
    }

    return changed;
  }

  function findCommonAncestor(first, second, boundary) {
    if (!first || !second) {
      return null;
    }

    let current = first;
    while (current && current !== boundary?.parentElement) {
      if (current.contains(second)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function ensureResponsiveLayout() {
    const mainWrapper = document.querySelector(".mainWrapper");
    const dataContainer = document.getElementById("div_container_data");
    const menuContainer = document.getElementById("div_container_menu");

    if (!mainWrapper || !dataContainer || !menuContainer) {
      return false;
    }

    let changed = false;
    const appRow = findCommonAncestor(dataContainer, menuContainer, mainWrapper);
    if (appRow && appRow !== mainWrapper && !appRow.classList.contains(APP_ROW_CLASS)) {
      appRow.classList.add(APP_ROW_CLASS);
      changed = true;
    }

    const appSection = [...mainWrapper.children].find((child) => child.contains(dataContainer));
    if (appSection && !appSection.classList.contains(APP_SECTION_CLASS)) {
      appSection.classList.add(APP_SECTION_CLASS);
      changed = true;
    }

    const resizeTarget = appRow ?? dataContainer;
    if (globalThis.ResizeObserver && observedLayoutElement !== resizeTarget) {
      layoutResizeObserver?.disconnect();
      layoutResizeObserver = new ResizeObserver(() => notifyLayoutChanged());
      layoutResizeObserver.observe(resizeTarget);
      observedLayoutElement = resizeTarget;
    }

    return changed;
  }

  function updateRadarFitGeometry() {
    const dataContainer = document.getElementById("div_container_data");
    if (!dataContainer) {
      return;
    }

    const nativeControls = dataContainer.querySelector(
      ".leaflet-top.leaflet-left, .maplibregl-ctrl-top-left"
    );
    let toolbarLeft = 56;
    if (nativeControls) {
      const dataRect = dataContainer.getBoundingClientRect();
      const controlsRect = nativeControls.getBoundingClientRect();
      if (controlsRect.width > 0) {
        toolbarLeft = Math.max(56, Math.ceil(controlsRect.right - dataRect.left + 8));
      }
    }
    dataContainer.style.setProperty("--chmi-radar-toolbar-left", `${toolbarLeft}px`);
  }

  function describeControl(element) {
    if (!element) {
      return "";
    }

    const attributes = [
      element.id,
      element.className,
      element.getAttribute?.("name"),
      element.getAttribute?.("title"),
      element.getAttribute?.("aria-label"),
      element.getAttribute?.("alt"),
      element.getAttribute?.("value"),
      element.getAttribute?.("src")
    ];

    return `${attributes.filter(Boolean).join(" ")} ${element.innerHTML ?? ""}`.toLowerCase();
  }

  function findAnimationRange() {
    const ranges = [...document.querySelectorAll('input[type="range"]')];
    if (ranges.length === 0) {
      return null;
    }

    const scored = ranges.map((range) => {
      const max = Number(range.max);
      const min = Number(range.min);
      const step = Number(range.step || 1);
      const context = range.parentElement?.parentElement?.textContent?.toLowerCase() ?? "";
      let score = 0;

      if (Number.isFinite(max) && Number.isFinite(min) && max > min + 2) {
        score += 5;
      }
      if (Number.isFinite(step) && step >= 1) {
        score += 2;
      }
      if (!range.closest(".accordion-body")) {
        score += 5;
      }
      if (/měření|předp|snímk|anim/.test(context)) {
        score += 4;
      }
      if (/odraziv|blesk|opacity|průhled/.test(context)) {
        score -= 8;
      }

      return { range, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0 ? scored[0].range : null;
  }

  function findPlaybackToggle(range) {
    if (!range) {
      return null;
    }

    const knownToggle = document.getElementById("input_play_pause");
    if (knownToggle instanceof HTMLInputElement && knownToggle.type === "checkbox") {
      return knownToggle;
    }

    const scopes = [];
    let current = range.parentElement;
    for (let depth = 0; current && depth < 4; depth += 1, current = current.parentElement) {
      scopes.push(current);
    }

    for (const scope of scopes) {
      const controls = [...scope.querySelectorAll('button, input[type="button"], input[type="image"], input[type="checkbox"], [role="button"]')];
      const candidates = controls
        .map((control) => ({ control, description: describeControl(control) }))
        .filter(({ description }) => /play|pause|stop|anim|přehr|spust|zastav|pozastav|bi-play|bi-pause|fa-play|fa-pause/.test(description));

      if (candidates.length > 0) {
        return candidates[0].control;
      }
    }

    return null;
  }

  function stopOnLatestFrame() {
    const range = findAnimationRange();
    if (!range) {
      return false;
    }

    if (range.max !== "" && range.value !== range.max) {
      range.value = range.max;
      range.dispatchEvent(new Event("input", { bubbles: true }));
      range.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const toggle = findPlaybackToggle(range);
    if (toggle) {
      const description = describeControl(toggle);
      const appearsToBePlaying =
        toggle instanceof HTMLInputElement && toggle.type === "checkbox"
          ? toggle.checked
          : /pause|stop|zastav|pozastav|bi-pause|fa-pause/.test(description) ||
            toggle.getAttribute?.("aria-pressed") === "true";

      if (appearsToBePlaying) {
        toggle.click();
      }
    }

    return true;
  }

  function applyInitialRadarState() {
    if (!defaultDisplayApplied) {
      const webMaps = document.getElementById("radio_display4");
      if (!webMaps) {
        return;
      }

      if (!webMaps.checked) {
        webMaps.click();
        defaultDisplayApplied = true;
        setTimeout(() => {
          if (classicEnabled && !defaultPlaybackApplied) {
            defaultPlaybackApplied = stopOnLatestFrame();
          }
        }, 250);
        return;
      }

      defaultDisplayApplied = true;
    }

    if (!defaultPlaybackApplied) {
      defaultPlaybackApplied = stopOnLatestFrame();
    }
  }

  function ensureBrand() {
    if (document.getElementById(BRAND_ID)) {
      return false;
    }

    const mainWrapper = document.querySelector(".mainWrapper");
    if (!mainWrapper?.parentElement) {
      return false;
    }

    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <strong>ČHMÚ Radar</strong>
      <span>klasické rozhraní</span>
      <button type="button" title="Dočasně zobrazit původní vzhled stránky">Nový vzhled</button>
    `;

    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    mainWrapper.parentElement.insertBefore(brand, mainWrapper);
    return true;
  }

  function ensureDisplayToolbar() {
    const dataContainer = document.getElementById("div_container_data");
    const displayInputs = Object.keys(classicLabels).map((id) => document.getElementById(id));

    if (!dataContainer || displayInputs.some((input) => !input)) {
      return false;
    }

    let toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = TOOLBAR_ID;
      toolbar.setAttribute("aria-label", "Režim zobrazení mapy");
      toolbar.innerHTML = `
        <div class="chmi-radar-classic-options" role="radiogroup" aria-label="Režim zobrazení mapy">
          ${Object.entries(classicLabels).map(([inputId, label]) => `
            <button type="button" role="radio" data-input-id="${inputId}">${label}</button>
          `).join("")}
        </div>
      `;

      toolbar.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-input-id]");
        if (!button) {
          return;
        }

        document.getElementById(button.dataset.inputId)?.click();
        requestAnimationFrame(() => {
          syncDisplayToolbar();
          notifyLayoutChanged();
        });
      });

      dataContainer.prepend(toolbar);
      syncDisplayToolbar();
      updateRadarFitGeometry();
      return true;
    }

    syncDisplayToolbar();
    updateRadarFitGeometry();
    return false;
  }

  function syncDisplayToolbar() {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) {
      return;
    }

    toolbar.querySelectorAll("button[data-input-id]").forEach((button) => {
      const input = document.getElementById(button.dataset.inputId);
      const selected = Boolean(input?.checked);
      button.setAttribute("aria-checked", String(selected));
      button.classList.toggle("is-active", selected);
    });

    document.documentElement.classList.toggle(
      WEB_MAPS_CLASS,
      Boolean(document.getElementById("radio_display4")?.checked)
    );
  }

  function notifyLayoutChanged() {
    requestAnimationFrame(() => {
      updateRadarFitGeometry();
      window.dispatchEvent(new Event("resize"));
    });
  }

  function applyClassicMode() {
    const hadRootClass = document.documentElement.classList.contains(ROOT_CLASS);
    document.documentElement.classList.add(ROOT_CLASS);
    const sectionsChanged = markNonApplicationSections();
    const layoutChanged = ensureResponsiveLayout();
    const brandChanged = ensureBrand();
    const toolbarChanged = ensureDisplayToolbar();
    applyInitialRadarState();

    if (!hadRootClass || sectionsChanged || layoutChanged || brandChanged || toolbarChanged) {
      notifyLayoutChanged();
    }
  }

  function removeClassicMode() {
    document.getElementById(TOOLBAR_ID)?.remove();
    document.getElementById(BRAND_ID)?.remove();
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(HIDDEN_CLASS);
    });
    document.querySelectorAll(`.${APP_SECTION_CLASS}, .${APP_ROW_CLASS}`).forEach((element) => {
      element.classList.remove(APP_SECTION_CLASS, APP_ROW_CLASS);
    });
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = null;
    observedLayoutElement = null;
    document.getElementById("div_container_data")?.style.removeProperty("--chmi-radar-toolbar-left");
    document.documentElement.classList.remove(ROOT_CLASS);
    document.documentElement.classList.remove(WEB_MAPS_CLASS);
    notifyLayoutChanged();
  }

  function setClassicMode(enabled) {
    classicEnabled = Boolean(enabled);
    if (classicEnabled) {
      applyClassicMode();
    } else {
      removeClassicMode();
    }
  }

  function scheduleRefresh() {
    if (!classicEnabled || updateScheduled) {
      return;
    }

    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      applyClassicMode();
    });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "radio_display") {
      syncDisplayToolbar();
    }
  });

  window.addEventListener("resize", () => {
    if (classicEnabled) {
      requestAnimationFrame(updateRadarFitGeometry);
    }
  });

  if (storage) {
    storage.get({ [STORAGE_KEY]: true }, (result) => {
      setClassicMode(result[STORAGE_KEY]);
    });

    globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === "sync" && changes[STORAGE_KEY]) {
        setClassicMode(changes[STORAGE_KEY].newValue);
      }
    });
  } else {
    setClassicMode(true);
  }

  function initHomepageRadarClassic() {
    if (window.__chmiHomepageRadarClassicLoaded) {
      return;
    }
    window.__chmiHomepageRadarClassicLoaded = true;

    const storageKey = "chmiRadarClassicEnabled";
    const rootClass = "chmi-home-radar-classic-active";
    const sectionClass = "chmi-home-radar-classic";
    const brandId = "chmi-home-radar-classic-brand";
    const anchorId = "chmi-classic-home-radar";
    const mapHostClass = "chmi-home-radar-classic-map-host";
    const nativeTitleClass = "chmi-home-radar-classic-native-title";
    const nativeSubtitleClass = "chmi-home-radar-classic-native-subtitle";
    const appSectionClass = "chmi-home-radar-classic-app-section";
    const appRowClass = "chmi-home-radar-classic-app-row";
    const toolbarId = "chmi-home-radar-classic-toolbar";
    const displayLabels = {
      radio_display1: "Dle okna",
      radio_display2: "Zoom 4x",
      radio_display3: "Zoom 8x",
      radio_display4: "Web Maps"
    };
    const portalStorage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
    let enabled = true;
    let refreshScheduled = false;
    let geometryScheduled = false;
    let anchorScrolled = false;
    let homepageResizeObserver = null;
    let homepageObservedElement = null;

    function normalizeText(value) {
      return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function saveHomepagePreference(value) {
      if (portalStorage) {
        portalStorage.set({ [storageKey]: value });
      }
      setHomepageClassicMode(value);
    }

    function findRadarHeading() {
      return [...document.querySelectorAll("main h1, main h2, main h3, main h4")].find((heading) =>
        /^srážky podle radaru$/i.test(normalizeText(heading.textContent))
      ) ?? null;
    }

    function radarEvidenceScore(element, heading) {
      if (!element || !element.contains(heading)) {
        return Number.NEGATIVE_INFINITY;
      }

      const descriptor = `${element.id ?? ""} ${element.className ?? ""}`.toLowerCase();
      let score = 0;
      if (/radar/.test(descriptor)) {
        score += 8;
      }
      if (/lfr-layout-structure-item/.test(descriptor)) {
        score += 2;
      }
      if (element.querySelector("iframe, canvas, .leaflet-container, .maplibregl-map, .ol-viewport")) {
        score += 5;
      }
      if (element.querySelector('[id*="radar" i], [class*="radar" i], input[type="range"]')) {
        score += 4;
      }
      if ([...element.querySelectorAll("img")].some((image) =>
        /radar/i.test(`${image.alt ?? ""} ${image.src ?? ""}`)
      )) {
        score += 4;
      }

      const otherMajorHeadings = [...element.querySelectorAll("h1, h2")].filter(
        (candidate) => candidate !== heading && normalizeText(candidate.textContent).length > 0
      );
      score -= otherMajorHeadings.length * 6;
      return score;
    }

    function findHomepageRadarSection() {
      const heading = findRadarHeading();
      const main = document.querySelector("main");
      if (!heading || !main) {
        return null;
      }

      let best = null;
      let current = heading.parentElement;
      for (let depth = 0; current && current !== main && depth < 8; depth += 1) {
        const score = radarEvidenceScore(current, heading);
        if (!best || score > best.score) {
          best = { element: current, score };
        }
        current = current.parentElement;
      }

      if (best?.score >= 2) {
        return best.element;
      }

      return heading.closest("section, article, [class*='lfr-layout-structure-item']") ?? heading.parentElement;
    }

    function findHomepageRadarMapHost(section) {
      if (!section) {
        return null;
      }

      const direct = section.querySelector([
        "#chmu-map-container",
        "[id*='radar-map' i]",
        "[class*='radar-map' i]",
        ".leaflet-container",
        ".maplibregl-map",
        ".ol-viewport",
        "iframe[src*='radar' i]",
        "canvas"
      ].join(","));
      if (direct) {
        return direct.closest('[class*="radar" i]') ?? direct;
      }

      const radarImage = [...section.querySelectorAll("img")].find((image) =>
        /radar/i.test(`${image.alt ?? ""} ${image.src ?? ""}`)
      );
      if (radarImage) {
        return radarImage.closest("a, picture, figure, div") ?? radarImage;
      }

      return null;
    }

    function findHomepageAppLayout(section) {
      const dataContainer = section?.querySelector("#div_container_data") ?? null;
      const menuContainer = section?.querySelector("#div_container_menu") ?? null;
      if (!dataContainer || !menuContainer) {
        return { dataContainer, menuContainer, appRow: null, appSection: null };
      }

      let appRow = dataContainer;
      while (appRow && appRow !== section && !appRow.contains(menuContainer)) {
        appRow = appRow.parentElement;
      }
      if (!appRow || appRow === section) {
        appRow = dataContainer.parentElement;
      }

      const appSection = [...section.children].find((child) => child.contains(dataContainer)) ?? appRow;
      return { dataContainer, menuContainer, appRow, appSection };
    }

    function syncHomepageDisplayToolbar() {
      const toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        return;
      }
      toolbar.querySelectorAll("button[data-input-id]").forEach((button) => {
        const input = document.getElementById(button.dataset.inputId);
        const selected = Boolean(input?.checked);
        button.setAttribute("aria-checked", String(selected));
      });
    }

    function ensureHomepageDisplayToolbar(section) {
      const { dataContainer } = findHomepageAppLayout(section);
      const inputs = Object.keys(displayLabels).map((id) => document.getElementById(id));
      if (!dataContainer || inputs.some((input) => !input)) {
        return false;
      }

      let toolbar = document.getElementById(toolbarId);
      if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = toolbarId;
        toolbar.setAttribute("aria-label", "Režim zobrazení mapy");
        toolbar.innerHTML = `
          <div class="chmi-radar-classic-options" role="radiogroup" aria-label="Režim zobrazení mapy">
            ${Object.entries(displayLabels).map(([inputId, label]) => `
              <button type="button" role="radio" data-input-id="${inputId}">${label}</button>
            `).join("")}
          </div>
        `;
        toolbar.addEventListener("click", (event) => {
          const button = event.target.closest("button[data-input-id]");
          if (!button) {
            return;
          }
          document.getElementById(button.dataset.inputId)?.click();
          requestAnimationFrame(() => {
            syncHomepageDisplayToolbar();
            scheduleHomepageGeometry();
          });
        });
        dataContainer.prepend(toolbar);
        syncHomepageDisplayToolbar();
        return true;
      }

      syncHomepageDisplayToolbar();
      return false;
    }

    function updateHomepageGeometry(section) {
      if (!enabled || !section) {
        return;
      }

      const { dataContainer, appRow } = findHomepageAppLayout(section);
      const mapHost = findHomepageRadarMapHost(section);
      const fitTarget = appRow ?? mapHost;
      if (fitTarget) {
        const rect = fitTarget.getBoundingClientRect();
        const top = Math.max(0, rect.top);
        const available = Math.floor(window.innerHeight - top - 8);
        const fitHeight = Math.max(320, available);
        document.documentElement.style.setProperty("--chmi-home-radar-fit-height", `${fitHeight}px`);
      }

      if (dataContainer) {
        const nativeControls = dataContainer.querySelector(
          ".leaflet-top.leaflet-left, .maplibregl-ctrl-top-left"
        );
        let toolbarLeft = 56;
        if (nativeControls) {
          const dataRect = dataContainer.getBoundingClientRect();
          const controlsRect = nativeControls.getBoundingClientRect();
          if (controlsRect.width > 0) {
            toolbarLeft = Math.max(56, Math.ceil(controlsRect.right - dataRect.left + 8));
          }
        }
        dataContainer.style.setProperty("--chmi-home-radar-toolbar-left", `${toolbarLeft}px`);
      }

      const observeTarget = appRow ?? mapHost ?? section;
      if (globalThis.ResizeObserver && homepageObservedElement !== observeTarget) {
        homepageResizeObserver?.disconnect();
        homepageResizeObserver = new ResizeObserver(() => scheduleHomepageGeometry());
        homepageResizeObserver.observe(observeTarget);
        homepageObservedElement = observeTarget;
      }
    }

    function scheduleHomepageGeometry() {
      if (!enabled || geometryScheduled) {
        return;
      }
      geometryScheduled = true;
      requestAnimationFrame(() => {
        geometryScheduled = false;
        const section = findHomepageRadarSection();
        updateHomepageGeometry(section);
        window.dispatchEvent(new Event("resize"));
      });
    }

    function markHomepageRadarSection() {
      const section = findHomepageRadarSection();
      if (!section) {
        return { section: null, changed: false };
      }

      let changed = false;
      if (!section.classList.contains(sectionClass)) {
        section.classList.add(sectionClass);
        changed = true;
      }

      const heading = findRadarHeading();
      if (heading && section.contains(heading) && !heading.classList.contains(nativeTitleClass)) {
        heading.classList.add(nativeTitleClass);
        changed = true;
      }

      const subtitle = heading?.nextElementSibling;
      if (
        subtitle &&
        section.contains(subtitle) &&
        /^aktuální odhad srážek z meteorologického radaru/i.test(normalizeText(subtitle.textContent)) &&
        !subtitle.classList.contains(nativeSubtitleClass)
      ) {
        subtitle.classList.add(nativeSubtitleClass);
        changed = true;
      }

      const { appRow, appSection } = findHomepageAppLayout(section);
      if (appRow && !appRow.classList.contains(appRowClass)) {
        appRow.classList.add(appRowClass);
        changed = true;
      }
      if (appSection && !appSection.classList.contains(appSectionClass)) {
        appSection.classList.add(appSectionClass);
        changed = true;
      }

      const mapHost = findHomepageRadarMapHost(section);
      if (mapHost && !mapHost.classList.contains(mapHostClass)) {
        mapHost.classList.add(mapHostClass);
        changed = true;
      }

      return { section, changed };
    }

    function ensureHomepageBrand(section) {
      if (!section) {
        return false;
      }
      if (document.getElementById(brandId)) {
        return false;
      }

      const brand = document.createElement("div");
      brand.id = brandId;
      brand.innerHTML = `
        <strong>ČHMÚ Radar</strong>
        <span>úvodní stránka · klasické rozhraní</span>
        <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
      `;
      brand.querySelector("button").addEventListener("click", () => saveHomepagePreference(false));
      section.insertBefore(brand, section.firstChild);

      const anchor = document.createElement("span");
      anchor.id = anchorId;
      anchor.className = "chmi-home-radar-classic-anchor";
      brand.insertAdjacentElement("beforebegin", anchor);
      return true;
    }

    function notifyHomepageLayoutChanged() {
      requestAnimationFrame(() => {
        updateHomepageGeometry(findHomepageRadarSection());
        window.dispatchEvent(new Event("resize"));
      });
    }

    function scrollToHomepageRadarIfRequested(section) {
      if (anchorScrolled || !section || location.hash !== `#${anchorId}`) {
        return;
      }
      anchorScrolled = true;
      requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
    }

    function applyHomepageClassicMode() {
      const { section, changed: sectionChanged } = markHomepageRadarSection();
      if (!section) {
        return;
      }

      const hadRootClass = document.documentElement.classList.contains(rootClass);
      document.documentElement.classList.add(rootClass);
      const brandChanged = ensureHomepageBrand(section);
      const toolbarChanged = ensureHomepageDisplayToolbar(section);
      scrollToHomepageRadarIfRequested(section);
      updateHomepageGeometry(section);

      if (!hadRootClass || sectionChanged || brandChanged || toolbarChanged) {
        notifyHomepageLayoutChanged();
      }
    }

    function removeHomepageClassicMode() {
      document.getElementById(brandId)?.remove();
      document.getElementById(anchorId)?.remove();
      document.getElementById(toolbarId)?.remove();
      document.querySelectorAll(`.${sectionClass}`).forEach((element) => {
        element.classList.remove(sectionClass);
      });
      document.querySelectorAll(`.${mapHostClass}`).forEach((element) => {
        element.classList.remove(mapHostClass);
      });
      document.querySelectorAll(`.${nativeTitleClass}`).forEach((element) => {
        element.classList.remove(nativeTitleClass);
      });
      document.querySelectorAll(`.${nativeSubtitleClass}`).forEach((element) => {
        element.classList.remove(nativeSubtitleClass);
      });
      document.querySelectorAll(`.${appRowClass}, .${appSectionClass}`).forEach((element) => {
        element.classList.remove(appRowClass, appSectionClass);
      });
      homepageResizeObserver?.disconnect();
      homepageResizeObserver = null;
      homepageObservedElement = null;
      document.documentElement.style.removeProperty("--chmi-home-radar-fit-height");
      document.querySelector("#div_container_data")?.style.removeProperty("--chmi-home-radar-toolbar-left");
      document.documentElement.classList.remove(rootClass);
      notifyHomepageLayoutChanged();
    }

    function setHomepageClassicMode(value) {
      enabled = Boolean(value);
      if (enabled) {
        applyHomepageClassicMode();
      } else {
        removeHomepageClassicMode();
      }
    }

    function scheduleHomepageRefresh() {
      if (!enabled || refreshScheduled) {
        return;
      }
      refreshScheduled = true;
      requestAnimationFrame(() => {
        refreshScheduled = false;
        applyHomepageClassicMode();
      });
    }

    document.addEventListener("change", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.name === "radio_display") {
        syncHomepageDisplayToolbar();
        scheduleHomepageGeometry();
      }
    });
    window.addEventListener("resize", () => {
      if (enabled) {
        requestAnimationFrame(() => updateHomepageGeometry(findHomepageRadarSection()));
      }
    });
    window.addEventListener("scroll", scheduleHomepageGeometry, { passive: true });

    const homepageObserver = new MutationObserver(scheduleHomepageRefresh);
    homepageObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (portalStorage) {
      portalStorage.get({ [storageKey]: true }, (result) => {
        setHomepageClassicMode(result[storageKey]);
      });
      globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName === "sync" && changes[storageKey]) {
          setHomepageClassicMode(changes[storageKey].newValue);
        }
      });
    } else {
      setHomepageClassicMode(true);
    }
  }

  function initMushroomClassic() {
    if (window.__chmiMushroomClassicLoaded) {
      return;
    }
    window.__chmiMushroomClassicLoaded = true;

    const storageKey = "chmiRadarClassicEnabled";
    const rootClass = "chmi-hub-classic";
    const brandId = "chmi-hub-classic-brand";
    const mapHostClass = "chmi-hub-classic-map-host";
    const mapSectionClass = "chmi-hub-classic-map-section";
    const portalStorage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
    let enabled = true;
    let refreshScheduled = false;
    let geometryScheduled = false;
    let mushroomResizeObserver = null;
    let mushroomObservedElement = null;

    function saveMushroomPreference(value) {
      if (portalStorage) {
        portalStorage.set({ [storageKey]: value });
      }
      setMushroomClassicMode(value);
    }

    function ensureMushroomBrand() {
      if (document.getElementById(brandId)) {
        return false;
      }

      const main = document.querySelector("main");
      if (!main) {
        return false;
      }

      const brand = document.createElement("div");
      brand.id = brandId;
      brand.innerHTML = `
        <strong>ČHMÚ – pravděpodobnost růstu hub</strong>
        <span>klasické rozhraní</span>
        <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
      `;
      brand.querySelector("button").addEventListener("click", () => saveMushroomPreference(false));
      main.insertBefore(brand, main.firstChild);
      return true;
    }

    function findMushroomMap() {
      const main = document.querySelector("main");
      if (!main) {
        return null;
      }

      return main.querySelector([
        "#chmu-map-container",
        "[id$='map-container']",
        "[class*='map-container']",
        ".leaflet-container",
        ".maplibregl-map",
        ".ol-viewport",
        "iframe[src*='bio']",
        "iframe[src*='map']",
        "chmu-map",
        "chmi-map"
      ].join(","));
    }

    function markMushroomMap() {
      const map = findMushroomMap();
      if (!map) {
        return false;
      }

      let changed = false;
      const preferredHost = map.closest(
        "#chmu-map-container, [id$='map-container'], [class*='map-container']"
      );
      const host = preferredHost ?? map;
      if (!host.classList.contains(mapHostClass)) {
        host.classList.add(mapHostClass);
        changed = true;
      }

      const mapSection = host.closest('[class*="lfr-layout-structure-item-chmimapcomponent"]');
      if (mapSection && !mapSection.classList.contains(mapSectionClass)) {
        mapSection.classList.add(mapSectionClass);
        changed = true;
      }

      return changed;
    }

    function updateMushroomGeometry() {
      if (!enabled) {
        return;
      }
      const map = findMushroomMap();
      if (!map) {
        return;
      }
      const host = map.closest(
        "#chmu-map-container, [id$='map-container'], [class*='map-container']"
      ) ?? map;
      const rect = host.getBoundingClientRect();
      const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 8);
      document.documentElement.style.setProperty(
        "--chmi-hub-fit-height",
        `${Math.max(320, available)}px`
      );

      if (globalThis.ResizeObserver && mushroomObservedElement !== host) {
        mushroomResizeObserver?.disconnect();
        mushroomResizeObserver = new ResizeObserver(() => scheduleMushroomGeometry());
        mushroomResizeObserver.observe(host);
        mushroomObservedElement = host;
      }
    }

    function scheduleMushroomGeometry() {
      if (!enabled || geometryScheduled) {
        return;
      }
      geometryScheduled = true;
      requestAnimationFrame(() => {
        geometryScheduled = false;
        updateMushroomGeometry();
        window.dispatchEvent(new Event("resize"));
      });
    }

    function notifyMushroomLayoutChanged() {
      requestAnimationFrame(() => {
        updateMushroomGeometry();
        window.dispatchEvent(new Event("resize"));
      });
    }

    function applyMushroomClassicMode() {
      const hadRootClass = document.documentElement.classList.contains(rootClass);
      document.documentElement.classList.add(rootClass);
      const brandChanged = ensureMushroomBrand();
      const mapChanged = markMushroomMap();
      updateMushroomGeometry();

      if (!hadRootClass || brandChanged || mapChanged) {
        notifyMushroomLayoutChanged();
      }
    }

    function removeMushroomClassicMode() {
      document.getElementById(brandId)?.remove();
      document.querySelectorAll(`.${mapHostClass}`).forEach((element) => {
        element.classList.remove(mapHostClass);
      });
      document.querySelectorAll(`.${mapSectionClass}`).forEach((element) => {
        element.classList.remove(mapSectionClass);
      });
      mushroomResizeObserver?.disconnect();
      mushroomResizeObserver = null;
      mushroomObservedElement = null;
      document.documentElement.style.removeProperty("--chmi-hub-fit-height");
      document.documentElement.classList.remove(rootClass);
      notifyMushroomLayoutChanged();
    }

    function setMushroomClassicMode(value) {
      enabled = Boolean(value);
      if (enabled) {
        applyMushroomClassicMode();
      } else {
        removeMushroomClassicMode();
      }
    }

    function scheduleMushroomRefresh() {
      if (!enabled || refreshScheduled) {
        return;
      }
      refreshScheduled = true;
      requestAnimationFrame(() => {
        refreshScheduled = false;
        applyMushroomClassicMode();
      });
    }

    window.addEventListener("resize", () => {
      if (enabled) {
        requestAnimationFrame(updateMushroomGeometry);
      }
    });
    window.addEventListener("scroll", scheduleMushroomGeometry, { passive: true });

    const mushroomObserver = new MutationObserver(scheduleMushroomRefresh);
    mushroomObserver.observe(document.documentElement, { childList: true, subtree: true });

    if (portalStorage) {
      portalStorage.get({ [storageKey]: true }, (result) => {
        setMushroomClassicMode(result[storageKey]);
      });
      globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
        if (areaName === "sync" && changes[storageKey]) {
          setMushroomClassicMode(changes[storageKey].newValue);
        }
      });
    } else {
      setMushroomClassicMode(true);
    }
  }
})();
