(() => {
  "use strict";

  const DAYS = ["dnes", "zitra", "pozitri"];
  function normalizePeriods(payload) {
    if (!Array.isArray(payload?.data)) return [];
    return payload.data.slice(0, 20).flatMap(item => {
      const token = typeof item?.mapDataRequestToken === "string" && /^(dnes|zitra|pozitri)-(rano|odpoledne)$/.exec(item.mapDataRequestToken);
      const title = typeof item?.title === "string" && item.title.length <= 160 && /^(.+?)\s+(ráno|odpoledne)\s+(.+?)\s*°C$/iu.exec(item.title.trim());
      const icon = String(item?.weatherIcon ?? "");
      if (!token || !title || !/^\d{1,4}$/.test(icon) ||
          (title[2].toLowerCase() === "ráno" ? "rano" : "odpoledne") !== token[2]) return [];
      return [{ token: token[0], day: token[1], part: token[2], weekday: title[1],
        temperature: title[3].trim(), icon, title: item.title.trim(),
        weather: typeof item.weatherAlt === "string" ? item.weatherAlt.slice(0, 160) : "Předpověď" }];
    });
  }

  function mergePeriods(responses) {
    const periods = new Map();
    for (const response of responses) {
      if (!DAYS.includes(response.day) || !Array.isArray(response.periods)) continue;
      for (const period of response.periods) {
        if (!DAYS.includes(period.day) || !/^(dnes|zitra|pozitri)-(rano|odpoledne)$/.test(period.token)) continue;
        const priority = period.day === response.day ? 2 : 1;
        if ((periods.get(period.token)?.priority ?? 0) < priority) periods.set(period.token, { priority, period });
      }
    }
    return [...periods.values()].map(item => item.period);
  }

  function periodURL(base, token) {
    const match = /^(dnes|zitra|pozitri)-(rano|odpoledne)$/.exec(token);
    if (!match) return null;
    try {
      const url = new URL(base);
      if (url.protocol !== "https:" || !["www.chmi.cz", "chmi.cz"].includes(url.hostname)) return null;
      url.pathname = `/predpoved-pocasi/${match[1]}`;
      url.search = "";
      url.hash = "";
      url.searchParams.set("obdobi", token);
      return url.href;
    } catch { return null; }
  }

  function usePortraitCityList(width, height) {
    return Number.isFinite(width) && Number.isFinite(height) && width > 0 &&
      width <= 700 && height >= Math.max(600, width * 1.4);
  }

  function mapAspectRatio(viewBox) {
    if (typeof viewBox !== "string" || !viewBox.trim()) return null;
    const values = viewBox.trim().split(/[\s,]+/).map(Number);
    if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) return null;
    const ratio = values[2] / values[3];
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { normalizePeriods, mergePeriods, periodURL, usePortraitCityList, mapAspectRatio };
    return;
  }

  if (window.__chmiClassicForecastLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.test(location.pathname)) return;
  window.__chmiClassicForecastLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;

    let map;
    let workspace;
    let cityObserver;
    let layoutObserver;
    let updateLayout;
    let scheduled = false;
    let awaitingData = false;
    let initialRefresh;
    let summaryPeriods = [];
    let summaryLoading = true;
    const summaryRows = new Map();
    const requests = new Set();

    const chooseNativePeriod = input => {
      awaitingData = true;
      scheduleRender();
      if (input.checked) input.closest("label").dispatchEvent(new Event("input", { bubbles: true }));
      else input.click();
    };

    const renderSummary = () => {
      const selected = map.querySelector('#weather-switcher input:checked')?.value;
      for (const [day, row] of summaryRows) {
        const entries = summaryPeriods.filter(period => period.day === day);
        if (entries.length) row.querySelector("h3").textContent = entries[0].weekday;
        const cells = row.querySelector(".chmi-forecast-day-cells");
        const signature = JSON.stringify([summaryLoading, entries]);
        if (row.dataset.signature === signature) {
          for (const cell of cells.querySelectorAll("a[data-period]")) {
            if (cell.dataset.period === selected) cell.setAttribute("aria-current", "true");
            else cell.removeAttribute("aria-current");
          }
          continue; // Preserve keyboard focus during native data updates.
        }
        row.dataset.signature = signature;
        cells.replaceChildren(...["rano", "odpoledne"].map(part => {
          const period = entries.find(entry => entry.part === part);
          const label = part === "rano" ? "Ráno" : "Odpoledne";
          const cell = document.createElement(period ? "a" : "span");
          cell.className = "chmi-forecast-day-cell";
          const caption = document.createElement("span");
          caption.textContent = label;
          cell.append(caption);
          if (!period) {
            const status = document.createElement("small");
            status.textContent = summaryLoading ? "Načítání…" : "Není údaj";
            cell.title = summaryLoading ? "Načítání z oficiálního zdroje ČHMÚ" : "ČHMÚ toto období v aktuální nabídce neposkytuje. Hodnota není doplněna odhadem.";
            cell.append(status);
            return cell;
          }
          cell.href = periodURL(location.href, period.token);
          cell.dataset.sennaOff = "true";
          cell.dataset.period = period.token;
          cell.setAttribute("aria-label", `${period.weekday} ${label}: ${period.temperature} °C, ${period.weather}`);
          if (period.token === selected) cell.setAttribute("aria-current", "true");
          const icon = document.createElement("img");
          icon.src = new URL(`/o/chmu-theme/images/icon/${period.icon}.svg`, location.origin).href;
          icon.alt = period.weather;
          const temperature = document.createElement("strong");
          temperature.textContent = period.temperature;
          cell.append(icon, temperature);
          cell.addEventListener("click", event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
            const input = [...map.querySelectorAll('#weather-switcher input')].find(item => item.value === period.token);
            if (!input || !location.pathname.replace(/\/$/, "").endsWith(`/${period.day}`)) return;
            event.preventDefault();
            if (!awaitingData) chooseNativePeriod(input);
          });
          return cell;
        }));
      }
    };

    const loadSummary = async () => {
      // Same official endpoint used by the native image-map component. Only
      // days with verified native navigation links are requested; no archive data.
      const responses = await Promise.all([...summaryRows.keys()].map(async day => {
        const controller = new AbortController();
        requests.add(controller);
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const response = await fetch(`https://data-provider.chmi.cz/api/imageMap/timeRangeSwitch/999/${day}`, { signal: controller.signal });
          if (!response.ok) throw new Error("Forecast unavailable");
          return { day, periods: normalizePeriods(await response.json()) };
        } catch { return { day, periods: [] }; }
        finally { clearTimeout(timeout); requests.delete(controller); }
      }));
      if (!workspace.isConnected) return;
      summaryPeriods = mergePeriods(responses);
      summaryLoading = false;
      renderSummary();
    };

    const cityData = candidate => [...candidate.querySelectorAll("#weather-map-details a.weather-info")]
      .map(link => {
        const href = new URL(link.getAttribute("href") || "", location.href);
        const name = link.querySelector(".weather-info__county")?.textContent.trim();
        const value = link.querySelector(".weather-info__displayValue")?.textContent.trim();
        const weather = link.querySelector(".weather-info__icon img")?.getAttribute("alt")?.trim();
        return href.origin === location.origin && /^\/predpoved-pocasi\/[a-z0-9-]+\/(dnes|zitra|pozitri)\/?$/.test(href.pathname) &&
          name && value ? { href: href.href, name, value, weather } : null;
      }).filter(Boolean);

    const render = () => {
      scheduled = false;
      if (!map?.isConnected) return;
      const companion = document.getElementById("chmi-forecast-accessible");
      if (!companion) return;
      const periods = [...workspace.querySelectorAll("#weather-switcher label.weather-switcher__select")]
        .map(label => ({ label: label.querySelector("span")?.textContent.trim(), input: label.querySelector('input[type="radio"][name="tod"]') }))
        .filter(item => item.label && item.input);
      const cities = cityData(map);
      if (!periods.length) return;

      for (const controls of workspace.querySelectorAll(".chmi-forecast-periods")) {
        if (controls.children.length !== periods.length ||
            periods.some((item, index) => controls.children[index]?.textContent !== item.label)) {
          controls.replaceChildren(...periods.map(({ label, input }) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => {
              chooseNativePeriod(input);
            });
            return button;
          }));
        }
        periods.forEach((item, index) => {
          controls.children[index].setAttribute("aria-pressed", String(item.input.checked));
          controls.children[index].disabled = awaitingData;
        });
      }
      workspace.dataset.state = awaitingData ? "loading" : cities.length ? "ready" : "error";
      renderSummary();
      workspace.querySelector(".chmi-forecast-current").textContent = awaitingData ? "Načítání předpovědi…" :
        !cities.length ? "ČHMÚ pro toto období nevrátil údaje. Kliknutím na období zkuste načtení znovu." :
        periods.find(item => item.input.checked)?.label ?? "Předpověď pro ČR";
      if (awaitingData || !cities.length) return;
      companion.querySelector(".chmi-forecast-selected-period").textContent =
        periods.find(item => item.input.checked)?.label ?? "";

      const list = companion.querySelector(".chmi-forecast-cities");
      list.removeAttribute("aria-busy");
      list.replaceChildren(...cities.map(({ href, name, value, weather }) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = `${name}: ${value}${weather ? `, ${weather}` : ""}`;
        item.append(link);
        return item;
      }));
    };

    const scheduleRender = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(render);
    };

    const adapt = () => {
      const candidate = document.querySelector('.lfr-layout-structure-item-chmiimagemapcomponent .image-map[id^="chmi-image-map-"]');
      if (!candidate?.querySelector("#weather-map[viewBox], #weather-map[viewbox]")) return false;
      if (!candidate.querySelector("#weather-switcher input:checked") ||
          !candidate.querySelector("#weather-map-details a.weather-info")) return false;
      if (!cityData(candidate).length) return false;

      map = candidate;
      // Keep native geometry, positioning, listeners and live data nodes.
      workspace = document.createElement("section");
      workspace.id = "chmi-forecast-workspace";
      workspace.dataset.state = "loading";
      workspace.setAttribute("aria-label", "Počasí v České republice – živá předpověď ČHMÚ");
      const header = document.createElement("header");
      header.className = "chmi-forecast-header";
      const heading = document.createElement("strong");
      heading.textContent = "Počasí v České republice";
      const restore = document.createElement("button");
      restore.type = "button";
      restore.textContent = "Nový vzhled";
      restore.addEventListener("click", () => {
        storage?.set({ chmiRadarClassicEnabled: false });
        location.reload();
      });
      header.append(heading, restore);
      const body = document.createElement("div");
      body.className = "chmi-forecast-body";
      const aside = document.createElement("aside");
      aside.className = "chmi-forecast-sidebar";
      const title = document.createElement("strong");
      title.textContent = "Předpověď pro ČR";
      const days = document.createElement("nav");
      days.className = "chmi-forecast-day-grid";
      days.setAttribute("aria-label", "Třídenní předpověď – ráno a odpoledne");
      const seen = new Map();
      for (const link of document.querySelectorAll('a[href]')) {
        let href;
        try { href = new URL(link.getAttribute("href"), location.href); } catch { continue; }
        const day = /^\/predpoved-pocasi\/(dnes|zitra|pozitri)\/?$/.exec(href.pathname)?.[1];
        const text = link.textContent.trim().replace(/\s+/g, " ");
        if (href.origin !== location.origin || href.hash || !day || !/^(Dnes|Zítra|Pozítří)/.test(text)) continue;
        // Prefer the official day cards (date + range) to duplicate menu links.
        const score = text.includes("°C") ? 2 : 1;
        const previous = seen.get(day);
        if (previous?.score >= score) continue;
        const copy = document.createElement("a");
        copy.href = href.href;
        copy.dataset.sennaOff = "true";
        copy.textContent = text;
        if (href.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) copy.setAttribute("aria-current", "page");
        seen.set(day, { score, link: copy });
      }
      for (const day of DAYS) {
        const native = seen.get(day)?.link;
        if (!native) continue;
        const row = document.createElement("section");
        row.className = "chmi-forecast-day";
        const heading = document.createElement("h3");
        heading.textContent = native.textContent.replace(/\s+-?\d.*$/, "");
        const cells = document.createElement("div");
        cells.className = "chmi-forecast-day-cells";
        row.append(heading, cells);
        days.append(row);
        summaryRows.set(day, row);
      }
      const current = document.createElement("p");
      current.className = "chmi-forecast-current";
      current.setAttribute("aria-live", "polite");
      aside.append(title, days, current);
      // Preserve the portlet ancestry as well: native async initialization
      // queries that container. Moving only the SVG or switcher breaks it.
      body.append(candidate.closest('.lfr-layout-structure-item-chmiimagemapcomponent'), aside);
      workspace.append(header, body);
      document.body.append(workspace);
      const companion = document.createElement("details");
      companion.id = "chmi-forecast-accessible";
      companion.className = "chmi-forecast-accessible";
      companion.innerHTML = '<summary>Předpověď pro města – přístupný seznam</summary>' +
        '<div class="chmi-forecast-periods" role="group" aria-label="Období předpovědi"></div>' +
        '<p class="chmi-forecast-selected-period" aria-live="polite"></p>' +
        '<ul class="chmi-forecast-cities"></ul>';
      workspace.append(companion);
      document.documentElement.classList.add("chmi-forecast-classic");
      candidate.dataset.chmiForecastNative = "verified";
      // In a tall narrow viewport the SVG already fills the available width.
      // Use its native aspect ratio instead of adding blank vertical bands,
      // and give the spare room to the existing live, accessible city list.
      const ratio = mapAspectRatio(candidate.querySelector("#weather-map")?.getAttribute("viewBox"));
      let userChoseListState = false;
      companion.querySelector("summary").addEventListener("click", () => { userChoseListState = true; });
      if (ratio) workspace.style.setProperty("--chmi-forecast-map-ratio", String(ratio));
      updateLayout = () => {
        const bounds = workspace.getBoundingClientRect();
        const portrait = Boolean(ratio && usePortraitCityList(bounds.width, bounds.height));
        if (workspace.dataset.portrait === String(portrait)) return;
        workspace.dataset.portrait = String(portrait);
        if (!userChoseListState) companion.open = portrait;
      };
      updateLayout();
      if (typeof ResizeObserver === "function") {
        layoutObserver = new ResizeObserver(updateLayout);
        layoutObserver.observe(workspace);
      } else window.addEventListener("resize", updateLayout);
      workspace.addEventListener("change", event => {
        if (!event.target.matches('#weather-switcher input[type="radio"][name="tod"]')) return;
        awaitingData = true;
        workspace.dataset.state = "loading";
        current.textContent = "Načítání předpovědi…";
        companion.querySelector(".chmi-forecast-selected-period").textContent = "Načítání předpovědi…";
        const list = companion.querySelector(".chmi-forecast-cities");
        list.setAttribute("aria-busy", "true");
        list.replaceChildren();
        scheduleRender();
      });
      cityObserver = new MutationObserver(() => {
        awaitingData = false;
        scheduleRender();
      });
      cityObserver.observe(candidate.querySelector("#weather-map-details"), { childList: true, subtree: true, characterData: true });
      // Native initialization starts both the query-selected request and a
      // first-period fallback concurrently. Refresh the selected period once
      // after the initial DOM settles, using its existing native input handler.
      const refreshInitialPeriod = () => {
        clearTimeout(initialRefresh);
        initialRefresh = setTimeout(() => {
          const selected = map.querySelector('#weather-switcher input:checked');
          if (!selected || !workspace.isConnected) return;
          awaitingData = true;
          scheduleRender();
          selected.closest("label").dispatchEvent(new Event("input", { bubbles: true }));
        }, 200);
      };
      if (document.readyState === "complete") refreshInitialPeriod();
      else window.addEventListener("load", refreshInitialPeriod, { once: true });
      renderSummary();
      loadSummary();
      scheduleRender();
      return true;
    };

    // Native code updates checked after its asynchronous data render. Batch
    // DOM notifications to the next frame so we do not miss that property-only
    // change (which itself does not produce a MutationObserver notification).
    let adaptScheduled = false;
    const observer = new MutationObserver(() => {
      if (adaptScheduled) return;
      adaptScheduled = true;
      requestAnimationFrame(() => {
        adaptScheduled = false;
        if (adapt()) observer.disconnect();
      });
    });
    if (!adapt()) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 30000);
    }
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      cityObserver?.disconnect();
      layoutObserver?.disconnect();
      if (updateLayout) window.removeEventListener("resize", updateLayout);
      clearTimeout(initialRefresh);
      for (const controller of requests) controller.abort();
    }, { once: true });
  };

  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
