(() => {
  "use strict";

  const LIST_PATH = "/hppsoldv/hpps_snh_list.php";
  const DETAIL_PATH = "/hppsoldv/hpps_snh_detail.php";
  const ROOT_CLASS = "chmi-snow-classic";
  const WORKSPACE_ID = "chmi-snow-workspace";
  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const MODERN_INFO_URL = "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/vodni-hodnota-snehu";

  const normalizeText = value => String(value ?? "").replace(/\s+/g, " ").trim();
  const isDateLabel = value => /^(?:0?[1-9]|[12]\d|3[01])\.(?:0?[1-9]|1[0-2])\.$/.test(normalizeText(value));

  function matchesSnowLocation(href) {
    let url;
    try { url = new URL(href); } catch { return false; }
    return url.protocol === "https:" && url.hostname === "hydro.chmi.cz" &&
      [LIST_PATH, DETAIL_PATH].includes(url.pathname.replace(/\/+$/, ""));
  }

  function parseSnowValue(value) {
    const text = normalizeText(value).replace(",", ".");
    if (!text) return { kind: "missing", value: null };
    if (!/^\d+(?:\.\d+)?$/.test(text)) return { kind: "invalid", value: null };
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0) return { kind: "invalid", value: null };
    return { kind: number === 0 ? "zero" : "positive", value: number };
  }

  function recordCountFromText(value) {
    const match = /Počet\s+vyhledaných\s+záznamů\s*:\s*(\d+)/i.exec(normalizeText(value));
    return match ? Number(match[1]) : null;
  }

  function summarizeLatest(latestDate, values) {
    const result = {
      latestDate: isDateLabel(latestDate) ? normalizeText(latestDate) : null,
      total: values.length,
      numeric: 0,
      zero: 0,
      positive: 0,
      missing: 0,
      invalid: 0,
      state: "invalid"
    };
    for (const value of values) {
      const parsed = parseSnowValue(value);
      if (parsed.kind === "missing") result.missing += 1;
      else if (parsed.kind === "invalid") result.invalid += 1;
      else {
        result.numeric += 1;
        result[parsed.kind] += 1;
      }
    }
    if (!result.latestDate || !result.total) return result;
    if (!result.numeric) result.state = "missing";
    else if (result.positive) result.state = "snow";
    else result.state = "empty";
    return result;
  }

  function statusText(summary) {
    if (summary?.state === "no-results") {
      return "Filtr nevrátil žádné stanice; tabulka byla načtena a nejde o chybu zdroje.";
    }
    if (!summary?.latestDate) return "Čekám na platný nejnovější den měření.";
    const missing = summary.missing + summary.invalid;
    const suffix = missing ? ` · bez údaje: ${missing}` : "";
    if (summary.state === "snow") {
      return `${summary.latestDate}: sníh hlásí ${summary.positive} zobrazených stanic · 0 cm: ${summary.zero}${suffix}`;
    }
    if (summary.state === "empty") {
      return `${summary.latestDate}: na této stránce jsou všechna dostupná měření 0 cm (${summary.zero})${suffix}`;
    }
    if (summary.state === "missing") {
      return `${summary.latestDate}: tabulka je načtená, ale zobrazené stanice nemají pro nejnovější den číselný údaj`;
    }
    return "Tabulka je načtená, ale nejnovější měření nelze bezpečně určit.";
  }

  function latestDateColumn(table) {
    let latest = null;
    for (const row of table?.rows ?? []) {
      const dates = [...row.cells].map(cell => normalizeText(cell.textContent)).filter(isDateLabel);
      if (dates.length >= 2) latest = { date: dates.at(-1), dateCount: dates.length };
    }
    return latest;
  }

  function isStationRow(row) {
    const code = normalizeText(row?.cells?.[0]?.textContent);
    return row?.cells?.length >= 5 && /^[A-Z0-9]{6,12}$/i.test(code) && !/^\d+$/.test(code);
  }

  function inspectSnowTable(table) {
    const latest = latestDateColumn(table);
    const rows = [...(table?.rows ?? [])].filter(isStationRow);
    if (!latest || !rows.length) return { summary: summarizeLatest(null, []), rows: [], latestColumn: null };
    const expectedCells = Math.max(...rows.map(row => row.cells.length));
    const latestCell = row => row.cells.length === expectedCells ? row.cells[expectedCells - 1] : null;
    const values = rows.map(row => normalizeText(latestCell(row)?.textContent));
    const summary = summarizeLatest(latest.date, values);
    table.classList.add("chmi-snow-data-table");
    for (const row of rows) {
      const cell = latestCell(row);
      if (!cell) continue;
      cell.dataset.chmiSnowLatest = "true";
      const parsed = parseSnowValue(cell.textContent);
      cell.classList.add(`chmi-snow-${parsed.kind}`);
    }
    return { summary, rows, latestColumn: expectedCells - 1 };
  }

  function findSnowTable(root = document) {
    return [...root.querySelectorAll("table")].find(table => {
      const text = normalizeText(table.textContent).toLowerCase();
      return text.includes("výška sněhové pokrývky") && text.includes("název stanice") && text.includes("dbč");
    }) ?? null;
  }

  function findDetailBlock(root = document) {
    const matches = [...root.querySelectorAll("table, div, section")].filter(node => {
      const text = normalizeText(node.textContent).toLowerCase();
      return text.includes("název objektu") && text.includes("databankové číslo") && text.includes("nadmořská výška");
    });
    return matches.sort((a, b) => normalizeText(a.textContent).length - normalizeText(b.textContent).length)[0] ?? null;
  }

  function findNativeFilterForm(root = document) {
    const controls = ["fkraj", "foblast", "frbot"].map(name =>
      root.querySelector?.(`#${name}, [name="${name}"]`) ?? null
    );
    if (controls.some(control => !control)) return null;
    const form = controls[0].form ?? controls[0].closest?.("form") ?? null;
    return form && controls.every(control => form.contains(control)) ? form : null;
  }

  function revealNativeCategoryFilter(form) {
    const control = form?.querySelector?.('#frbot, [name="frbot"]') ?? null;
    if (!control) return false;
    const valueCell = control.closest?.("td, th") ?? null;
    const labelCell = [...(form.querySelectorAll?.("td, th") ?? [])].find(node =>
      normalizeText(node.textContent).toLowerCase() === "kategorie"
    ) ?? null;
    if (!valueCell || !labelCell) return false;

    for (const node of [labelCell, valueCell]) {
      node.style?.removeProperty?.("display");
      node.classList?.add?.("chmi-snow-category-cell");
    }
    control.style?.removeProperty?.("display");
    control.removeAttribute?.("hidden");
    control.classList?.add?.("chmi-snow-category-control");
    return true;
  }

  function findNativeResultsNode(table, root = document) {
    const body = root.body ?? document.body;
    for (let node = table.parentElement; node && node !== body; node = node.parentElement) {
      const text = normalizeText(node.textContent).toLowerCase();
      const ownsResults = text.includes("objekty s aktuálním měřením") &&
        text.includes("počet vyhledaných záznamů");
      const siteChrome = text.includes("dokumenty hpps") || text.includes("okolní státy");
      if (ownsResults && !siteChrome) return node;
    }
    return table;
  }

  function collectNativeListNodes(table, root = document) {
    // HPPS keeps the Kraj / Oblast / Kategorie filter form outside the results
    // container. Move both original DOM subtrees into the compact workspace;
    // do not clone them, so native submit/change handlers and form ownership stay intact.
    const nodes = [findNativeFilterForm(root), findNativeResultsNode(table, root)].filter(Boolean);
    return nodes.filter((node, index) => !nodes.some((other, otherIndex) =>
      otherIndex !== index && other.contains(node)));
  }

  function makeHeader(kind, summary, storage) {
    const header = document.createElement("header");
    header.id = "chmi-snow-classic-brand";

    const title = document.createElement("strong");
    title.textContent = kind === "detail" ? "Sněhové zpravodajství · detail stanice" : "Sněhové zpravodajství";
    const source = document.createElement("span");
    source.textContent = "oficiální živá data ČHMÚ / HPPS";
    const info = document.createElement("a");
    info.href = MODERN_INFO_URL;
    info.target = "_blank";
    info.rel = "noopener noreferrer";
    info.textContent = "Mapa a metodika ↗";

    const restore = document.createElement("button");
    restore.type = "button";
    restore.textContent = "Nový vzhled";
    restore.title = "Vypnout uživatelskou úpravu ČHMÚ Classic";
    restore.addEventListener("click", () => {
      let reloaded = false;
      const reloadOnce = () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      };
      const write = storage?.set?.({ [STORAGE_KEY]: false }, reloadOnce);
      if (typeof write?.then === "function") write.then(reloadOnce, () => {});
      if (storage === globalThis.__chmiClassicStorage) reloadOnce();
    });

    header.append(title, source, info, restore);
    if (kind === "list" && summary) {
      const status = document.createElement("div");
      status.id = "chmi-snow-status";
      status.dataset.state = summary.state;
      status.setAttribute("role", "status");
      status.textContent = statusText(summary);
      header.append(status);
    }
    return header;
  }

  function createWorkspace(kind, summary, nativeNodes, storage) {
    const workspace = document.createElement("section");
    workspace.id = WORKSPACE_ID;
    workspace.dataset.chmiSnowNative = "verified";
    workspace.dataset.kind = kind;
    workspace.setAttribute("aria-label", kind === "detail" ? "Detail sněhoměrné stanice ČHMÚ" : "Sněhové zpravodajství ČHMÚ");

    const native = document.createElement("div");
    native.className = "chmi-snow-native";
    for (const node of nativeNodes) native.append(node);
    workspace.append(makeHeader(kind, summary, storage), native);
    document.body.append(workspace);
    document.documentElement.classList.add(ROOT_CLASS);
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    return workspace;
  }

  function adaptList(storage) {
    const table = findSnowTable();
    const filterForm = findNativeFilterForm();
    if (!table || !filterForm || !revealNativeCategoryFilter(filterForm)) return false;
    const inspected = inspectSnowTable(table);
    const nativeNodes = collectNativeListNodes(table);
    const recordCount = recordCountFromText(document.body.textContent);
    if (!inspected.rows.length && recordCount === 0) {
      table.classList.add("chmi-snow-data-table");
      const summary = { ...inspected.summary, state: "no-results" };
      createWorkspace("list", summary, nativeNodes, storage);
      return true;
    }
    if (!inspected.summary.latestDate || !inspected.rows.length || inspected.summary.state === "invalid") return false;
    createWorkspace("list", inspected.summary, nativeNodes, storage);
    return true;
  }

  function adaptDetail(storage) {
    const heading = [...document.querySelectorAll("h1, h2, h3, b, strong")]
      .find(node => /detail objektu sněhoměrné stanice/i.test(normalizeText(node.textContent)));
    const detail = findDetailBlock();
    if (!heading || !detail) return false;
    detail.classList.add("chmi-snow-detail-native");
    const nodes = heading.contains(detail) || detail.contains(heading) ? [detail] : [heading, detail];
    createWorkspace("detail", null, nodes, storage);
    return true;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = {
      matchesSnowLocation,
      parseSnowValue,
      recordCountFromText,
      summarizeLatest,
      statusText,
      latestDateColumn,
      isStationRow,
      findNativeFilterForm,
      revealNativeCategoryFilter,
      collectNativeListNodes
    };
    return;
  }

  if (window.__chmiClassicSnowLoaded || !matchesSnowLocation(location.href)) return;
  window.__chmiClassicSnowLoaded = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const path = location.pathname.replace(/\/+$/, "");

  const start = result => {
    if (result[STORAGE_KEY] === false) return;
    let observer;
    let deadline;
    const stopWaiting = () => {
      observer?.disconnect();
      clearTimeout(deadline);
    };
    const adapt = () => {
      if (document.getElementById(WORKSPACE_ID)) return true;
      const ready = path === LIST_PATH ? adaptList(storage) : adaptDetail(storage);
      if (ready) stopWaiting();
      return ready;
    };
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };

  if (storage) storage.get({ [STORAGE_KEY]: true }, start);
  else start({ [STORAGE_KEY]: true });
})();
