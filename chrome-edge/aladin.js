(() => {
  "use strict";

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-aladin-classic";
  const EMBEDDED_CLASS = "chmi-aladin-classic-embedded";
  const BRAND_ID = "chmi-aladin-classic-brand";
  const CONTROLS_ID = "chmi-aladin-classic-controls";
  const TIME_SELECT_ID = "chmi-aladin-classic-time";
  const RUN_SELECT_ID = "chmi-aladin-classic-run";
  const PRODUCT_CHIPS_ID = "chmi-aladin-classic-product-chips";
  const PRODUCT_OPTIONS_ID = "chmi-aladin-classic-product-options";
  const PRODUCT_IDS = ["T", "C", "R3", "W"];
  const NATIVE_PRODUCT_IDS = ["T", "R3", "W", "C", "Cl", "Cm", "Ch", "H", "V", "Txn", "R24"];
  const PRODUCT_LABELS = {
    T: "Teplota",
    C: "Oblačnost",
    R3: "Srážky 3 h",
    W: "Vítr",
    Cl: "Nízká oblačnost",
    Cm: "Střední oblačnost",
    Ch: "Vysoká oblačnost",
    H: "Vlhkost",
    V: "Ventilační index",
    Txn: "Teplota min/max",
    R24: "Srážky 24 h"
  };

  function clampIndex(index, count) {
    if (count <= 0) {
      return 0;
    }
    return Math.min(Math.max(0, index), count - 1);
  }

  function steppedIndex(index, count, direction) {
    return clampIndex(index + Math.sign(direction), count);
  }

  function wheelDirection(deltaY, deltaX) {
    const delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
    if (Math.abs(delta) < 8) {
      return 0;
    }
    return Math.sign(delta);
  }

  function productOrder(parameter) {
    const index = PRODUCT_IDS.indexOf(parameter);
    return index < 0 ? PRODUCT_IDS.length + 1 : index + 1;
  }

  function selectedProductIds(controls) {
    return controls.filter(control =>
      NATIVE_PRODUCT_IDS.includes(control?.id) &&
      control.classList?.contains("item-check") &&
      control.checked
    ).map(control => control.id).sort((a, b) => productOrder(a) - productOrder(b));
  }

  function pickerLayout(anchorLeft, anchorBottom, viewportWidth, viewportHeight) {
    const width = Math.min(440, Math.max(0, viewportWidth - 16));
    const top = Math.max(8, Math.min(anchorBottom + 3, viewportHeight - 88));
    return {
      width,
      left: Math.max(8, Math.min(anchorLeft, viewportWidth - width - 8)),
      top,
      maxHeight: Math.max(0, Math.min(340, viewportHeight - top - 8))
    };
  }

  function updateNativeProduct(controls, id, checked) {
    if (!NATIVE_PRODUCT_IDS.includes(id)) {
      return null;
    }
    const control = controls.find(item => item?.id === id && item.classList?.contains("item-check"));
    if (!control || control.checked === checked) {
      return null;
    }
    control.checked = checked;
    return control;
  }

  // Keep every complete native image at its original aspect ratio. The
  // four-map preset keeps its familiar two/four-column layouts; optional
  // variables use the arrangement with the largest complete maps.
  function mapLayout(width, height, ratio = 442 / 700, count = 4) {
    const maps = Math.max(1, Math.trunc(count) || 1);
    const columnsToTry = maps === 4 ? [4, 2] : Array.from(
      { length: Math.min(maps, 6) }, (_, index) => index + 1
    );
    return columnsToTry.map(columns => {
      const rows = Math.ceil(maps / columns);
      return { columns, width: Math.max(1, Math.min(
        (width - (columns - 1) * 2) / columns,
        (height - rows * 22 - (rows - 1) * 2) / rows / ratio
      )) };
    }).sort((a, b) => b.width - a.width || a.columns - b.columns)[0];
  }

  function shouldRun({ hostname, pathname, framed, embedded }) {
    return (
      hostname === "produkty.chmi.cz" &&
      pathname.startsWith("/aladin/") &&
      (!framed || embedded === true)
    );
  }

  if (globalThis.__chmiAladinClassicTestHooks) {
    Object.assign(globalThis.__chmiAladinClassicTestHooks, {
      PRODUCT_IDS: [...PRODUCT_IDS],
      clampIndex,
      productOrder,
      mapLayout,
      pickerLayout,
      selectedProductIds,
      shouldRun,
      steppedIndex,
      updateNativeProduct,
      wheelDirection
    });
  }

  const framed = window.top !== window;
  if (
    !shouldRun({
      hostname: location.hostname,
      pathname: location.pathname,
      framed,
      embedded: window.__chmiClassicEmbedded
    }) ||
    window.__chmiAladinClassicLoaded
  ) {
    return;
  }

  window.__chmiAladinClassicLoaded = true;

  const storage = globalThis.__chmiClassicStorage ?? globalThis.chrome?.storage?.sync;
  let classicEnabled = false;
  let presetApplied = false;
  let activeTimeIndex = 0;
  let refreshScheduled = false;
  let resizeScheduled = false;
  let wheelLocked = false;
  let observedGrid = null;
  let gridObserver = null;
  let layoutResizeObserver = null;

  function dispatchNativeChange(element) {
    if (!element) {
      return;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function readPreference(callback) {
    if (!storage?.get) {
      callback(true);
      return;
    }

    let completed = false;
    const finish = (result) => {
      if (completed) {
        return;
      }
      completed = true;
      callback(result?.[STORAGE_KEY] !== false);
    };

    try {
      const pending = storage.get({ [STORAGE_KEY]: true }, finish);
      if (pending?.then) {
        pending.then(finish, () => finish({ [STORAGE_KEY]: true }));
      }
    } catch {
      finish({ [STORAGE_KEY]: true });
    }
  }

  function savePreference(enabled) {
    try {
      storage?.set?.({ [STORAGE_KEY]: Boolean(enabled) });
    } catch {
      // A read-only portal storage adapter must not break the native viewer.
    }
    setClassicMode(enabled);
  }

  function nativeElements() {
    return {
      main: document.querySelector(".mainWrapper"),
      grid: document.getElementById("modelGrid"),
      modelWrapper: document.getElementById("modelGrid")?.closest(".model-wrapper"),
      run: document.getElementById("dateToLoadSelector"),
      display: document.getElementById("displaySelector"),
      checkAll: document.getElementById("check-all"),
      products: PRODUCT_IDS.map((id) => document.getElementById(id))
    };
  }

  function hasVerifiedNativeControls(elements) {
    return (
      elements.main &&
      elements.grid &&
      elements.modelWrapper &&
      elements.run &&
      elements.display &&
      elements.products.every((control) => control?.classList.contains("item-check"))
    );
  }

  function applyFourMapPreset(elements) {
    if (presetApplied || !hasVerifiedNativeControls(elements)) {
      return false;
    }

    const nativeProducts = [...document.querySelectorAll("input.item-check")];
    if (!PRODUCT_IDS.every((id) => nativeProducts.some((control) => control.id === id))) {
      return false;
    }

    let changedProduct = null;
    for (const control of nativeProducts) {
      const checked = PRODUCT_IDS.includes(control.id);
      if (control.checked !== checked) {
        control.checked = checked;
        changedProduct ||= control;
      }
    }

    if (elements.checkAll) {
      elements.checkAll.checked = false;
    }

    const changedDisplay = elements.display.value !== "vertical";
    if (changedDisplay) {
      elements.display.value = "vertical";
    }

    presetApplied = true;
    if (changedProduct) {
      dispatchNativeChange(changedProduct);
    } else if (changedDisplay) {
      dispatchNativeChange(elements.display);
    }
    return Boolean(changedProduct || changedDisplay);
  }

  function createBrand(elements) {
    let brand = document.getElementById(BRAND_ID);
    if (brand) {
      return brand;
    }

    brand = document.createElement("header");
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <div>
        <strong>ALADIN – klasické mapy</strong>
        <span>živá data ČHMÚ</span>
      </div>
      <button type="button" title="Dočasně zobrazit současné rozhraní">Nový vzhled</button>
    `;
    brand.querySelector("button").addEventListener("click", () => savePreference(false));
    elements.main.insertBefore(brand, elements.main.firstChild);
    return brand;
  }

  function createControls(elements) {
    let controls = document.getElementById(CONTROLS_ID);
    if (controls) {
      return controls;
    }

    controls = document.createElement("section");
    controls.id = CONTROLS_ID;
    controls.setAttribute("aria-label", "Klasické ovládání předpovědních map ALADIN");
    controls.innerHTML = `
      <div class="chmi-aladin-classic-products" aria-label="Zobrazené veličiny">
        <div id="${PRODUCT_CHIPS_ID}"></div>
        <details class="chmi-aladin-classic-product-picker">
          <summary>Veličiny (4)</summary>
          <div id="${PRODUCT_OPTIONS_ID}" role="group" aria-label="Veličiny ALADINu"></div>
        </details>
      </div>
      <div class="chmi-aladin-classic-run-control">
        <label for="${RUN_SELECT_ID}">Běh modelu:</label>
        <select id="${RUN_SELECT_ID}"></select>
      </div>
      <div class="chmi-aladin-classic-time-control">
        <span>Termín (krok 3 h):</span>
        <div role="group" aria-label="Posun předpovědního termínu">
          <button type="button" data-action="first" title="První termín">|&lt;</button>
          <button type="button" data-action="previous" title="Předchozí termín">&lt;</button>
          <select id="${TIME_SELECT_ID}" aria-label="Předpovědní termín"></select>
          <button type="button" data-action="next" title="Následující termín">&gt;</button>
          <button type="button" data-action="last" title="Poslední termín">&gt;|</button>
        </div>
        <small>Kolečkem nad mapami posunete čas o 3 hodiny.</small>
      </div>
      <p class="chmi-aladin-classic-status" role="status" aria-live="polite"></p>
    `;

    controls.querySelector(`#${RUN_SELECT_ID}`).addEventListener("change", (event) => {
      const nativeRun = document.getElementById("dateToLoadSelector");
      if (!nativeRun || nativeRun.value === event.target.value) {
        return;
      }
      activeTimeIndex = 0;
      nativeRun.value = event.target.value;
      dispatchNativeChange(nativeRun);
      setStatus("Načítám zvolený běh z ČHMÚ…");
    });

    controls.querySelector(`#${TIME_SELECT_ID}`).addEventListener("change", (event) => {
      setActiveTime(Number.parseInt(event.target.value, 10));
    });

    controls.querySelector(`#${PRODUCT_OPTIONS_ID}`).addEventListener("change", (event) => {
      const mirror = event.target.closest("input[data-param]");
      if (!mirror) {
        return;
      }
      const native = updateNativeProduct(
        [...document.querySelectorAll("input.item-check")], mirror.dataset.param, mirror.checked
      );
      if (native) {
        dispatchNativeChange(native);
        setStatus("Načítám zvolené veličiny z ČHMÚ…");
      }
      scheduleRefresh();
    });
    controls.querySelector("details").addEventListener("toggle", scheduleGeometry);

    controls.addEventListener("click", (event) => {
      const action = event.target.closest("button[data-action]")?.dataset.action;
      const count = timeRows().length;
      if (!action || count === 0) {
        return;
      }
      const target = {
        first: 0,
        previous: steppedIndex(activeTimeIndex, count, -1),
        next: steppedIndex(activeTimeIndex, count, 1),
        last: count - 1
      }[action];
      setActiveTime(target);
    });

    elements.modelWrapper.insertAdjacentElement("beforebegin", controls);
    return controls;
  }

  function setStatus(message) {
    const status = document.querySelector(`#${CONTROLS_ID} .chmi-aladin-classic-status`);
    if (status && status.textContent !== message) {
      status.textContent = message;
    }
  }

  function syncRunControl(elements) {
    const mirror = document.getElementById(RUN_SELECT_ID);
    if (!mirror || !elements.run) {
      return;
    }

    const signature = [...elements.run.options]
      .map((option) => `${option.value}:${option.textContent.trim()}`)
      .join("|");
    if (mirror.dataset.signature !== signature) {
      mirror.replaceChildren(...[...elements.run.options].map((option) => option.cloneNode(true)));
      mirror.dataset.signature = signature;
    }
    mirror.value = elements.run.value;
  }

  function syncProductControls() {
    const options = document.getElementById(PRODUCT_OPTIONS_ID);
    const chips = document.getElementById(PRODUCT_CHIPS_ID);
    if (!options || !chips) {
      return;
    }

    const controls = [...document.querySelectorAll("input.item-check")]
      .filter(control => NATIVE_PRODUCT_IDS.includes(control.id));
    const nativeLabels = [...document.querySelectorAll("label[for]")];
    const labelFor = id => nativeLabels.find(label => label.htmlFor === id)?.textContent.trim()
      || PRODUCT_LABELS[id] || id;
    const signature = controls.map(control => `${control.id}:${labelFor(control.id)}`).join("|");
    if (options.dataset.signature !== signature) {
      options.replaceChildren(...controls.map(control => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.param = control.id;
        const caption = document.createElement("span");
        caption.textContent = labelFor(control.id);
        label.append(input, caption);
        return label;
      }));
      options.dataset.signature = signature;
    }

    const byId = new Map(controls.map(control => [control.id, control]));
    options.querySelectorAll("input[data-param]").forEach(input => {
      const checked = Boolean(byId.get(input.dataset.param)?.checked);
      if (input.checked !== checked) {
        input.checked = checked;
      }
    });

    const selected = selectedProductIds(controls);
    const selectedSignature = selected.join("|");
    if (chips.dataset.signature !== selectedSignature) {
      const visibleChips = selected.slice(0, 4).map(id => {
        const chip = document.createElement("span");
        chip.dataset.param = id;
        chip.textContent = PRODUCT_LABELS[id] || labelFor(id);
        return chip;
      });
      if (selected.length > 4) {
        const extra = document.createElement("span");
        extra.textContent = `+${selected.length - 4}`;
        extra.title = selected.slice(4).map(id => PRODUCT_LABELS[id] || labelFor(id)).join(", ");
        visibleChips.push(extra);
      }
      chips.replaceChildren(...visibleChips);
      chips.dataset.signature = selectedSignature;
    }
    const summary = options.closest("details")?.querySelector("summary");
    const summaryText = `Veličiny (${selected.length})`;
    if (summary && summary.textContent !== summaryText) {
      summary.textContent = summaryText;
    }
  }

  function rowLabel(row, index) {
    const label = row.querySelector(".mapImgTimeLabel")?.textContent.replace(/\s+/g, " ").trim();
    if (label) {
      return label;
    }
    const title = row.querySelector("a[data-title]")?.dataset.title || "";
    const separator = title.lastIndexOf(" - ");
    return separator >= 0 ? title.slice(separator + 3).trim() : `Termín ${index + 1}`;
  }

  function timeRows() {
    const grid = document.getElementById("modelGrid");
    if (!grid) {
      return [];
    }
    return [...grid.children].filter(
      (row) => row.classList.contains("time-row") && row.querySelector(".map-cell:not(.map-header)")
    );
  }

  function markGridRows(elements) {
    const allRows = [...elements.grid.children].filter((row) => row.classList.contains("time-row"));
    const header = allRows.find((row) => row.querySelector(".map-header"));
    header?.classList.add("chmi-aladin-classic-header-row");

    const rows = timeRows();
    rows.forEach((row, index) => {
      row.classList.add("chmi-aladin-classic-time-row");
      row.dataset.chmiTimeIndex = String(index);
      row.querySelectorAll(".map-cell[data-param]").forEach((cell) => {
        cell.style.setProperty("--chmi-aladin-product-order", String(productOrder(cell.dataset.param)));
        if (!cell.querySelector(".chmi-aladin-cell-title")) {
          const title = document.createElement("div");
          title.className = "chmi-aladin-cell-title";
          title.textContent = PRODUCT_LABELS[cell.dataset.param] || cell.dataset.param;
          cell.prepend(title);
        }
        if (!cell.querySelector(".mapImg, .chmi-aladin-empty")) {
          const empty = document.createElement("div");
          empty.className = "chmi-aladin-empty";
          empty.textContent = "Snímek chybí";
          empty.title = "ČHMÚ pro tento termín neposkytuje snímek. Zvolte jiný termín.";
          empty.setAttribute("aria-label", empty.title);
          cell.append(empty);
        }
      });
    });
    return rows;
  }

  function syncTimeControl(rows) {
    const select = document.getElementById(TIME_SELECT_ID);
    if (!select) {
      return;
    }

    const labels = rows.map(rowLabel);
    const signature = labels.join("|");
    if (select.dataset.signature !== signature) {
      select.replaceChildren(
        ...labels.map((label, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = label;
          return option;
        })
      );
      select.dataset.signature = signature;
    }

    activeTimeIndex = clampIndex(activeTimeIndex, rows.length);
    select.value = String(activeTimeIndex);
    select.disabled = rows.length === 0;
  }

  function setActiveTime(index) {
    const rows = timeRows();
    activeTimeIndex = clampIndex(Number.isFinite(index) ? index : 0, rows.length);
    rows.forEach((row, rowIndex) => {
      const active = rowIndex === activeTimeIndex;
      row.classList.toggle("is-active", active);
      row.hidden = !active;
      row.setAttribute("aria-hidden", String(!active));
    });

    const select = document.getElementById(TIME_SELECT_ID);
    if (select) {
      select.value = String(activeTimeIndex);
    }

    const label = rows[activeTimeIndex] ? rowLabel(rows[activeTimeIndex], activeTimeIndex) : "—";
    setStatus(rows.length > 0 ? `${label} · ${rows.length} termínů po 3 hodinách` : "Čekám na mapy ČHMÚ…");

    document.querySelectorAll(`#${CONTROLS_ID} button[data-action]`).forEach((button) => {
      const action = button.dataset.action;
      button.disabled =
        rows.length === 0 ||
        ((action === "first" || action === "previous") && activeTimeIndex === 0) ||
        ((action === "next" || action === "last") && activeTimeIndex === rows.length - 1);
    });
    scheduleGeometry();
  }

  function onMapWheel(event) {
    if (!classicEnabled || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const direction = wheelDirection(event.deltaY, event.deltaX);
    const rows = timeRows();
    if (!direction || rows.length < 2) {
      return;
    }

    event.preventDefault();
    if (wheelLocked) {
      return;
    }
    wheelLocked = true;
    setActiveTime(steppedIndex(activeTimeIndex, rows.length, direction));
    window.setTimeout(() => {
      wheelLocked = false;
    }, 180);
  }

  function observeGrid(elements) {
    if (observedGrid === elements.grid) {
      return;
    }
    gridObserver?.disconnect();
    observedGrid?.removeEventListener("wheel", onMapWheel);

    observedGrid = elements.grid;
    observedGrid.addEventListener("wheel", onMapWheel, { passive: false });
    gridObserver = new MutationObserver(scheduleRefresh);
    gridObserver.observe(observedGrid, { childList: true });
  }

  function positionProductPicker() {
    const options = document.getElementById(PRODUCT_OPTIONS_ID);
    const picker = options?.closest("details");
    if (!picker?.open) {
      return;
    }
    const anchor = picker.querySelector("summary").getBoundingClientRect();
    const layout = pickerLayout(anchor.left, anchor.bottom, window.innerWidth, window.innerHeight);
    for (const property of ["width", "left", "top", "maxHeight"]) {
      options.style[property] = `${layout[property]}px`;
    }
  }

  function updateGeometry() {
    if (!classicEnabled) {
      return;
    }
    positionProductPicker();
    const modelWrapper = document.getElementById("modelGrid")?.closest(".model-wrapper");
    if (!modelWrapper) {
      return;
    }
    const top = Math.max(0, modelWrapper.getBoundingClientRect().top);
    const available = Math.max(180, Math.floor(window.innerHeight - top - 24));
    document.documentElement.style.setProperty("--chmi-aladin-available-height", `${available}px`);
    const grid = document.getElementById("modelGrid");
    const activeRow = timeRows()[activeTimeIndex];
    const count = activeRow?.querySelectorAll(".map-cell[data-param]").length || 0;
    const image = activeRow?.querySelector(".mapImg") || grid.querySelector(".mapImg");
    const ratio = image?.naturalWidth ? image.naturalHeight / image.naturalWidth : 442 / 700;
    const layout = mapLayout(modelWrapper.clientWidth, available - 4, ratio, count);
    grid.style.setProperty("--chmi-aladin-columns", String(layout.columns));
    grid.style.setProperty("--chmi-aladin-map-width", `${Math.floor(layout.width)}px`);
    grid.style.setProperty("--chmi-aladin-map-ratio", String(ratio));
  }

  function scheduleGeometry() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      updateGeometry();
    });
  }

  function observeLayout(elements) {
    if (!globalThis.ResizeObserver || layoutResizeObserver) {
      return;
    }
    layoutResizeObserver = new ResizeObserver(scheduleGeometry);
    layoutResizeObserver.observe(elements.main);
  }

  function refresh() {
    if (!classicEnabled) {
      return;
    }

    const elements = nativeElements();
    if (!hasVerifiedNativeControls(elements)) {
      document.documentElement.dataset.chmiAladinNative = "waiting";
      return;
    }

    document.documentElement.dataset.chmiAladinNative = "verified";
    createBrand(elements);
    createControls(elements);
    observeGrid(elements);
    observeLayout(elements);
    syncRunControl(elements);

    const requestedReload = applyFourMapPreset(elements);
    syncProductControls();
    if (!requestedReload) {
      const rows = markGridRows(elements);
      syncTimeControl(rows);
      setActiveTime(activeTimeIndex);
    }
    scheduleGeometry();
  }

  function scheduleRefresh() {
    if (!classicEnabled || refreshScheduled) {
      return;
    }
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      refresh();
    });
  }

  function removeClassicMode() {
    document.getElementById(BRAND_ID)?.remove();
    document.getElementById(CONTROLS_ID)?.remove();
    document.querySelectorAll(".chmi-aladin-cell-title, .chmi-aladin-empty").forEach(node => node.remove());
    const grid = document.getElementById("modelGrid");
    grid?.style.removeProperty("--chmi-aladin-columns");
    grid?.style.removeProperty("--chmi-aladin-map-width");
    grid?.style.removeProperty("--chmi-aladin-map-ratio");
    document.querySelectorAll(".chmi-aladin-classic-header-row").forEach((row) => {
      row.classList.remove("chmi-aladin-classic-header-row");
    });
    document.querySelectorAll(".chmi-aladin-classic-time-row").forEach((row) => {
      row.classList.remove("chmi-aladin-classic-time-row", "is-active");
      row.removeAttribute("hidden");
      row.removeAttribute("aria-hidden");
      row.removeAttribute("data-chmi-time-index");
      row.querySelectorAll(".map-cell[data-param]").forEach((cell) => {
        cell.style.removeProperty("--chmi-aladin-product-order");
      });
    });
    observedGrid?.removeEventListener("wheel", onMapWheel);
    gridObserver?.disconnect();
    layoutResizeObserver?.disconnect();
    observedGrid = null;
    gridObserver = null;
    layoutResizeObserver = null;
    document.documentElement.style.removeProperty("--chmi-aladin-available-height");
    document.documentElement.classList.remove(ROOT_CLASS, EMBEDDED_CLASS);
    delete document.documentElement.dataset.chmiAladinNative;
    window.dispatchEvent(new Event("resize"));
  }

  function setClassicMode(enabled) {
    classicEnabled = Boolean(enabled);
    if (!classicEnabled) {
      removeClassicMode();
      return;
    }

    document.documentElement.classList.add(ROOT_CLASS);
    document.documentElement.classList.toggle(EMBEDDED_CLASS, framed);
    refresh();
  }

  const rootObserver = new MutationObserver(scheduleRefresh);
  rootObserver.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleGeometry, { passive: true });
  document.addEventListener("change", (event) => {
    if (event.target?.id === "dateToLoadSelector") {
      activeTimeIndex = 0;
    }
    scheduleRefresh();
  });

  globalThis.chrome?.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      setClassicMode(changes[STORAGE_KEY].newValue);
    }
  });

  readPreference(setClassicMode);
})();
