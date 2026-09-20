(() => {
  "use strict";

  if ((window.top !== window && !window.__chmiClassicEmbedded) || window.__chmiSatelliteClassicLoaded) {
    return;
  }

  const isLiveViewer =
    location.hostname === "produkty.chmi.cz" && location.pathname.startsWith("/druzice/");
  const isPolarPortal =
    location.hostname === "www.chmi.cz" && location.pathname.includes("/polarni-druzice/");
  const isGeoPortal =
    location.hostname === "www.chmi.cz" && location.pathname.includes("/geostacionarni-druzice/");

  if (!isLiveViewer && !isPolarPortal && !isGeoPortal) {
    return;
  }

  window.__chmiSatelliteClassicLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-satellite-classic";
  const BRAND_ID = "chmi-satellite-classic-brand";
  const SELECTOR_ID = "chmi-satellite-classic-selector";
  const PLAYER_ID = "chmi-satellite-classic-player";
  const PORTAL_PRODUCTS_ID = "chmi-satellite-classic-portal-products";

  const products = {
    mtg: [
      ["ir_105", "IR"],
      ["ir_bt_sandwich_night_ir_bt", "IR BT"],
      ["vis_ir", "VIS-IR"],
      ["true_color", "True Color"],
      ["airmass", "Airmass"],
      ["24h_microphysics", "24h-M"],
      ["cloud_type_chmi", "Cloud Type"]
    ],
    msg: [
      ["ir108", "IR"],
      ["ir108BT", "IR BT"],
      ["vis-ir", "VIS-IR"],
      ["airmass", "Airmass"],
      ["24M", "24h-M"]
    ]
  };

  const projections = [
    ["eu", "EU"],
    ["ce", "CE"],
    ["cz", "CZ"]
  ];

  const portalProducts = {
    polar: [
      ["sandwich-ir-bt", "Sandwich IR BT"],
      ["true-color", "True Color"],
      ["vis-ir", "VIS-IR"],
      ["24h-m", "24h-M"],
      ["cloud-type", "Cloud Type"],
      ["night-overview", "Night Overview"]
    ],
    geo: [
      ["sandwich-ir-bt", "Sandwich IR BT"],
      ["ir", "IR"],
      ["true-color", "True Color"],
      ["vis-ir", "VIS-IR"],
      ["airmass", "Airmass"],
      ["24h-m", "24h-M"],
      ["cloud-type", "Cloud Type"]
    ]
  };

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  let classicEnabled = true;
  let updateScheduled = false;
  let resizeDispatchScheduled = false;
  let layoutResizeObserver = null;
  let observedLayoutElement = null;
  const compactSections = [];
  const movedInfo = [];

  function compactLiveControls() {
    const sidebar = document.querySelector("#settingsMenu .offcanvas-body");
    if (!sidebar) return;
    for (const section of sidebar.querySelectorAll(".settings-section")) {
      if (section.classList.contains("chmi-satellite-classic-native-choice") ||
          section.querySelector("#time-range-group, .chmi-classic-disclosure")) continue;
      const header = section.querySelector(".section-header");
      if (!header) continue;
      const details = document.createElement("details");
      details.className = "chmi-classic-disclosure";
      const summary = document.createElement("summary");
      const nodes = [...section.childNodes];
      summary.append(header);
      details.append(summary, ...nodes.filter(node => node !== header));
      section.append(details);
      compactSections.push({ section, nodes, details });
    }
    if (!document.getElementById("chmi-satellite-classic-info")) {
      const nodes = [...document.querySelectorAll(".map-wrapper > .product-legend-box, .map-wrapper > #satInfo")];
      if (!nodes.length) return;
      const details = document.createElement("details");
      details.id = "chmi-satellite-classic-info";
      details.className = "chmi-classic-disclosure";
      const summary = document.createElement("summary");
      summary.textContent = "Legenda a informace ke snímku";
      details.append(summary);
      for (const node of nodes) {
        const placeholder = document.createComment("chmi-classic-info-position");
        node.before(placeholder);
        movedInfo.push({ node, placeholder });
        details.append(node);
      }
      sidebar.append(details);
    }
  }

  function restoreLiveControls() {
    for (const { section, nodes, details } of compactSections.splice(0)) {
      section.append(...nodes);
      details.remove();
    }
    for (const { node, placeholder } of movedInfo.splice(0)) placeholder.replaceWith(node);
    document.getElementById("chmi-satellite-classic-info")?.remove();
  }

  function savePreference(enabled) {
    if (storage) {
      storage.set({ [STORAGE_KEY]: enabled });
    }
    setClassicMode(enabled);
  }

  function dispatchLayoutResize() {
    if (resizeDispatchScheduled) {
      return;
    }
    resizeDispatchScheduled = true;
    requestAnimationFrame(() => {
      resizeDispatchScheduled = false;
      window.dispatchEvent(new Event("resize"));
    });
  }

  function observeLayout(element) {
    if (!globalThis.ResizeObserver || !element || observedLayoutElement === element) {
      return;
    }
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = new ResizeObserver(() => dispatchLayoutResize());
    layoutResizeObserver.observe(element);
    observedLayoutElement = element;
  }

  function updateLiveFitGeometry() {
    const mainRow = document.getElementById("main-row");
    if (!mainRow) {
      return;
    }
    observeLayout(mainRow);
  }

  function updatePortalFitGeometry() {
    const map = document.getElementById("chmu-map-container");
    if (!map) {
      return;
    }
    const rect = map.getBoundingClientRect();
    const available = Math.floor(window.innerHeight - Math.max(0, rect.top) - 8);
    document.documentElement.style.setProperty(
      "--chmi-satellite-portal-fit-height",
      `${Math.max(320, available)}px`
    );
    observeLayout(map);
  }

  function updateFitGeometry() {
    if (!classicEnabled) {
      return;
    }
    if (isLiveViewer) {
      updateLiveFitGeometry();
    } else {
      updatePortalFitGeometry();
    }
  }

  function createBrand(title) {
    if (document.getElementById(BRAND_ID)) {
      return false;
    }

    const host = isLiveViewer
      ? document.querySelector(".mainWrapper")?.parentElement
      : document.querySelector("main");
    const before = isLiveViewer ? document.querySelector(".mainWrapper") : host?.firstChild;

    if (!host) {
      return false;
    }

    const brand = document.createElement("div");
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <strong>${title}</strong>
      <span>klasické rozhraní</span>
      <button type="button" title="Dočasně zobrazit současný vzhled stránky">Nový vzhled</button>
    `;
    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    host.insertBefore(brand, before || null);
    return true;
  }

  function triggerChange(element) {
    element?.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setViewerSelection({ satellite, projection, product }) {
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");
    const autoLoad = document.getElementById("check-auto-load");
    const shouldLoad = autoLoad?.checked !== false;

    if (autoLoad) {
      autoLoad.checked = false;
    }

    if (satellite && satelliteSelect?.value !== satellite) {
      satelliteSelect.value = satellite;
      triggerChange(satelliteSelect);
    }

    if (projection && projectionSelect?.value !== projection) {
      projectionSelect.value = projection;
      triggerChange(projectionSelect);
    }

    setTimeout(() => {
      if (product && productSelect?.querySelector(`option[value="${CSS.escape(product)}"]`)) {
        productSelect.value = product;
        triggerChange(productSelect);
      }

      if (autoLoad) {
        autoLoad.checked = shouldLoad;
      }

      if (shouldLoad) {
        document.getElementById("btn-load-data")?.click();
      }

      renderProductMatrix();
    }, 0);
  }

  function markNativeChoiceSections() {
    ["select-satellite", "select-projection", "select-product"].forEach((id) => {
      document.getElementById(id)?.closest(".settings-section")?.classList.add(
        "chmi-satellite-classic-native-choice"
      );
    });
  }

  function ensureProductSelector() {
    const settingsBody = document.querySelector("#settingsMenu .offcanvas-body");
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");

    if (!settingsBody || !satelliteSelect || !projectionSelect || !productSelect) {
      return false;
    }

    markNativeChoiceSections();

    let selector = document.getElementById(SELECTOR_ID);
    if (!selector) {
      selector = document.createElement("section");
      selector.id = SELECTOR_ID;
      selector.setAttribute("aria-label", "Klasický výběr družicového produktu");
      selector.innerHTML = `
        <div class="chmi-satellite-classic-satellite-row">
          <label for="chmi-satellite-classic-satellite">Družice:</label>
          <select id="chmi-satellite-classic-satellite"></select>
        </div>
        <strong>Vyber produkt:</strong>
        <div class="chmi-satellite-classic-product-matrix"></div>
        <div class="chmi-satellite-classic-selection" aria-live="polite"></div>
      `;

      const mirrorSatellite = selector.querySelector("select");
      mirrorSatellite.addEventListener("change", () => {
        setViewerSelection({
          satellite: mirrorSatellite.value,
          projection: projectionSelect.value
        });
      });

      selector.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-product][data-projection]");
        if (!button) {
          return;
        }
        setViewerSelection({
          satellite: satelliteSelect.value,
          projection: button.dataset.projection,
          product: button.dataset.product
        });
      });

      settingsBody.prepend(selector);
      renderProductMatrix();
      return true;
    }

    renderProductMatrix();
    return false;
  }

  function renderProductMatrix() {
    const selector = document.getElementById(SELECTOR_ID);
    const satelliteSelect = document.getElementById("select-satellite");
    const projectionSelect = document.getElementById("select-projection");
    const productSelect = document.getElementById("select-product");

    if (!selector || !satelliteSelect || !projectionSelect || !productSelect) {
      return;
    }

    const satellite = satelliteSelect.value in products ? satelliteSelect.value : "mtg";
    const mirrorSatellite = selector.querySelector("select");
    const satelliteSignature = Array.from(satelliteSelect.options)
      .map((option) => `${option.value}:${option.textContent.trim()}`)
      .join("|");

    if (mirrorSatellite.dataset.signature !== satelliteSignature) {
      mirrorSatellite.replaceChildren(
        ...Array.from(satelliteSelect.options).map((option) => {
          const clone = document.createElement("option");
          clone.value = option.value;
          clone.textContent = option.textContent.trim();
          return clone;
        })
      );
      mirrorSatellite.dataset.signature = satelliteSignature;
    }
    mirrorSatellite.value = satellite;

    const matrix = selector.querySelector(".chmi-satellite-classic-product-matrix");
    const signature = `${satellite}:${products[satellite].map(([value]) => value).join(",")}`;
    if (matrix.dataset.signature !== signature) {
      matrix.innerHTML = products[satellite]
        .map(([value, label]) => `
          <div class="chmi-satellite-classic-product-row">
            <span>${label}:</span>
            ${projections.map(([projectionValue, projectionLabel]) => `
              <button type="button" data-product="${value}" data-projection="${projectionValue}">${projectionLabel}</button>
            `).join("")}
          </div>
        `)
        .join("");
      matrix.dataset.signature = signature;
    }

    matrix.querySelectorAll("button[data-product][data-projection]").forEach((button) => {
      const selected =
        button.dataset.product === productSelect.value &&
        button.dataset.projection === projectionSelect.value;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    const selectedProduct = productSelect.selectedOptions[0]?.textContent.trim() || "—";
    const selectedProjection = projectionSelect.selectedOptions[0]?.textContent.trim() || "—";
    selector.querySelector(".chmi-satellite-classic-selection").textContent =
      `Aktuální nastavení: ${satelliteSelect.value.toUpperCase()} / ${selectedProduct} / ${selectedProjection}`;
  }

  function setSliderPosition(position) {
    const slider = document.getElementById("timeline-slider");
    if (!slider || slider.disabled) {
      return;
    }
    slider.value = position === "first" ? slider.min : slider.max;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function ensurePlayer() {
    const map = document.getElementById("map-container");
    const nativeSpeed = document.getElementById("select-speed");
    if (!map || !nativeSpeed) {
      return false;
    }

    let player = document.getElementById(PLAYER_ID);
    if (!player) {
      player = document.createElement("div");
      player.id = PLAYER_ID;
      player.setAttribute("aria-label", "Klasické ovládání animace");
      player.innerHTML = `
        <div class="chmi-satellite-classic-player-buttons" role="group" aria-label="Posun snímků">
          <button type="button" data-action="first" title="První snímek">|&lt;</button>
          <button type="button" data-action="prev" title="Předchozí snímek">&lt;</button>
          <button type="button" data-action="pause" title="Pozastavit animaci">| |</button>
          <button type="button" data-action="play" title="Spustit animaci">&gt;&gt;</button>
          <button type="button" data-action="next" title="Následující snímek">&gt;</button>
          <button type="button" data-action="last" title="Poslední snímek">&gt;|</button>
        </div>
        <label>Animace: <select data-role="speed"></select></label>
        <label>Aktualizuj každých:
          <select data-role="refresh">
            <option value="off">Neaktualizuj</option>
            <option value="1">1 min</option>
            <option value="10">10 min</option>
            <option value="20">20 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </label>
        <button type="button" data-action="refresh">Aktualizuj nyní</button>
        <span data-role="loaded">Nahráno: 0/0</span>
        <span data-role="time">--.--.---- --:--</span>
      `;

      player.addEventListener("click", (event) => {
        const action = event.target.closest("button[data-action]")?.dataset.action;
        const actionMap = {
          prev: "btn-prev",
          pause: "btn-pause",
          play: "btn-play",
          next: "btn-next",
          refresh: "btn-load-data"
        };

        if (action === "first" || action === "last") {
          setSliderPosition(action);
        } else if (actionMap[action]) {
          document.getElementById(actionMap[action])?.click();
        }
        syncPlayer();
      });

      player.querySelector('[data-role="speed"]').addEventListener("change", (event) => {
        nativeSpeed.value = event.target.value;
        triggerChange(nativeSpeed);
        syncPlayer();
      });

      player.querySelector('[data-role="refresh"]').addEventListener("change", (event) => {
        const autoRefresh = document.getElementById("check-auto-refresh");
        const refreshInterval = document.getElementById("select-refresh-interval");
        if (!autoRefresh || !refreshInterval) {
          return;
        }

        if (event.target.value === "off") {
          autoRefresh.checked = false;
          triggerChange(autoRefresh);
        } else {
          refreshInterval.value = event.target.value;
          triggerChange(refreshInterval);
          autoRefresh.checked = true;
          triggerChange(autoRefresh);
        }
        syncPlayer();
      });

      map.insertAdjacentElement("afterend", player);
      syncPlayer();
      return true;
    }

    syncPlayer();
    return false;
  }

  function syncPlayer() {
    const player = document.getElementById(PLAYER_ID);
    const slider = document.getElementById("timeline-slider");
    const nativeSpeed = document.getElementById("select-speed");
    if (!player || !slider || !nativeSpeed) {
      return;
    }

    const speed = player.querySelector('[data-role="speed"]');
    const speedSignature = Array.from(nativeSpeed.options)
      .map((option) => `${option.value}:${option.textContent.trim()}`)
      .join("|");
    if (speed.dataset.signature !== speedSignature) {
      speed.replaceChildren(...Array.from(nativeSpeed.options).map((option) => option.cloneNode(true)));
      speed.dataset.signature = speedSignature;
    }
    speed.value = nativeSpeed.value;
    speed.disabled = nativeSpeed.disabled;

    const max = Number.parseInt(slider.max, 10);
    const value = Number.parseInt(slider.value, 10);
    const count = slider.disabled || !Number.isFinite(max) ? 0 : max + 1;
    const current = count === 0 || !Number.isFinite(value) ? 0 : value + 1;
    player.querySelector('[data-role="loaded"]').textContent = `Nahráno: ${current}/${count}`;
    player.querySelector('[data-role="time"]').textContent =
      document.getElementById("current-time-display")?.textContent.trim() || "--.--.---- --:--";

    const autoRefresh = document.getElementById("check-auto-refresh");
    const refreshInterval = document.getElementById("select-refresh-interval");
    player.querySelector('[data-role="refresh"]').value =
      autoRefresh?.checked ? refreshInterval?.value || "10" : "off";

    const disabledMap = {
      first: slider.disabled,
      last: slider.disabled,
      prev: document.getElementById("btn-prev")?.disabled,
      pause: document.getElementById("btn-pause")?.disabled,
      play: document.getElementById("btn-play")?.disabled,
      next: document.getElementById("btn-next")?.disabled,
      refresh: document.getElementById("btn-load-data")?.disabled
    };
    player.querySelectorAll("button[data-action]").forEach((button) => {
      button.disabled = Boolean(disabledMap[button.dataset.action]);
    });
  }

  function ensurePortalProducts() {
    if (document.getElementById(PORTAL_PRODUCTS_ID)) {
      return false;
    }

    const map = document.getElementById("chmu-map-container");
    const mapSection = map?.closest('[class*="lfr-layout-structure-item-chmimapcomponent"]');
    if (!map || !mapSection?.parentElement) {
      return false;
    }

    const kind = isPolarPortal ? "polar" : "geo";
    const base = `/namerena-data/${kind === "polar" ? "polarni" : "geostacionarni"}-druzice/`;
    const activeSlug = location.pathname.split("/").filter(Boolean).at(-1);
    const nav = document.createElement("nav");
    nav.id = PORTAL_PRODUCTS_ID;
    nav.setAttribute("aria-label", "Výběr družicového produktu");
    nav.innerHTML = `
      <strong>Vyber produkt:</strong>
      <div>
        ${portalProducts[kind].map(([slug, label]) => `
          <a href="${base}${slug}"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>
        `).join("")}
      </div>
      ${kind === "geo" ? '<a class="chmi-satellite-classic-live-link" href="https://produkty.chmi.cz/druzice/?time_range=24">Otevřít animovaný prohlížeč</a>' : ""}
    `;
    mapSection.parentElement.insertBefore(nav, mapSection);
    return true;
  }

  function applyLiveViewer() {
    document.documentElement.classList.add(ROOT_CLASS, "chmi-satellite-classic-live");
    const brandChanged = createBrand("Aktuální data z družic MSG/MTG ČHMÚ");
    const selectorChanged = ensureProductSelector();
    const playerChanged = ensurePlayer();
    compactLiveControls();

    renderProductMatrix();
    syncPlayer();
    updateLiveFitGeometry();

    if (brandChanged || selectorChanged || playerChanged) {
      dispatchLayoutResize();
    }
  }

  function applyPortalViewer() {
    document.documentElement.classList.add(
      ROOT_CLASS,
      "chmi-satellite-classic-portal",
      isPolarPortal ? "chmi-satellite-classic-polar" : "chmi-satellite-classic-geo"
    );
    const title = isPolarPortal
      ? "Aktuální data z polárních družic ČHMÚ"
      : "Aktuální data z geostacionárních družic ČHMÚ";
    const changed = createBrand(title) || ensurePortalProducts();
    ensurePortalProducts();
    updatePortalFitGeometry();
    if (changed) {
      dispatchLayoutResize();
    }
  }

  function removeClassicMode() {
    restoreLiveControls();
    [BRAND_ID, SELECTOR_ID, PLAYER_ID, PORTAL_PRODUCTS_ID].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    document.querySelectorAll(".chmi-satellite-classic-native-choice").forEach((element) => {
      element.classList.remove("chmi-satellite-classic-native-choice");
    });
    layoutResizeObserver?.disconnect();
    layoutResizeObserver = null;
    observedLayoutElement = null;
    document.documentElement.style.removeProperty("--chmi-satellite-portal-fit-height");
    document.documentElement.classList.remove(
      ROOT_CLASS,
      "chmi-satellite-classic-live",
      "chmi-satellite-classic-portal",
      "chmi-satellite-classic-polar",
      "chmi-satellite-classic-geo"
    );
    dispatchLayoutResize();
  }

  function setClassicMode(enabled) {
    classicEnabled = Boolean(enabled);
    if (!classicEnabled) {
      removeClassicMode();
      return;
    }
    if (isLiveViewer) {
      applyLiveViewer();
    } else {
      applyPortalViewer();
    }
  }

  function scheduleRefresh() {
    if (!classicEnabled || updateScheduled) {
      return;
    }
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      if (isLiveViewer) {
        applyLiveViewer();
      } else {
        applyPortalViewer();
      }
    });
  }

  window.addEventListener("resize", () => {
    if (classicEnabled) {
      requestAnimationFrame(updateFitGeometry);
    }
  });
  if (!isLiveViewer) {
    window.addEventListener("scroll", () => {
      if (classicEnabled) {
        requestAnimationFrame(updatePortalFitGeometry);
      }
    }, { passive: true });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["checked", "disabled", "value"]
  });

  document.addEventListener("change", scheduleRefresh);
  document.addEventListener("input", (event) => {
    if (event.target?.id === "timeline-slider") {
      syncPlayer();
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
})();
