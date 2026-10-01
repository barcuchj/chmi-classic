(() => {
  "use strict";

  // The archive confirms a plain weekly-text destination, but not its dynamic
  // forecast body. Retain today's official Chart.js canvas and forecast DOM.
  function weekDataReady(graph, forecast) {
    const canvas = graph?.querySelector("#ChmiGraph_INSTANCE_mlse_LAYOUT_64-chart");
    return Boolean(canvas && canvas.width >= 500 && canvas.height >= 200 &&
      forecast?.querySelectorAll("h3").length >= 5 &&
      forecast.querySelectorAll("p").length >= 5);
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { weekDataReady };
    return;
  }

  if (window.__chmiClassicWeekLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/tyden\/?$/.test(location.pathname)) return;
  window.__chmiClassicWeekLoaded = true;

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = result => {
    if (result.chmiRadarClassicEnabled === false) return;
    let observer;
    let deadline;
    function stopWaiting() {
      observer?.disconnect();
      clearTimeout(deadline);
    }
    function adapt() {
      const graphBoundary = document.getElementById("p_p_id_ChmiGraph_INSTANCE_mlse_");
      const forecastBoundary = document.getElementById("p_p_id_ChmiForecastComponent_INSTANCE_oswr_");
      if (!weekDataReady(graphBoundary, forecastBoundary)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-week-workspace";
      workspace.setAttribute("aria-label", "Týdenní předpověď – živý text a graf ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-week-classic-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Týdenní předpověď";
      const note = document.createElement("span");
      note.textContent = "Aktuální předpověď ČHMÚ";
      header.append(heading, note);

      const viewButtons = ["Text", "Graf"].map((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.setAttribute("aria-pressed", String(index === 0));
        header.append(button);
        return button;
      });
      if (typeof storage?.set === "function") {
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
          const write = storage.set({ chmiRadarClassicEnabled: false }, reloadOnce);
          if (typeof write?.then === "function") write.then(reloadOnce, () => {});
          if (storage === globalThis.__chmiClassicStorage) reloadOnce();
        });
        header.append(restore);
      }

      const dayNav = document.createElement("nav");
      dayNav.id = "chmi-week-day-nav";
      dayNav.setAttribute("aria-label", "Přejít na den předpovědi");
      const content = document.createElement("div");
      content.id = "chmi-week-content";
      const forecastPanel = document.createElement("section");
      forecastPanel.id = "chmi-week-forecast";
      const graphPanel = document.createElement("section");
      graphPanel.id = "chmi-week-graph";
      graphPanel.hidden = true;
      forecastPanel.append(forecastBoundary);
      graphPanel.append(graphBoundary);
      content.append(forecastPanel, graphPanel);
      for (const day of forecastBoundary.querySelectorAll(".chmu-forecast-content h3")) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = day.textContent.trim().replace(/^Předpověď na /, "");
        button.addEventListener("click", () => {
          graphPanel.hidden = true;
          forecastPanel.hidden = false;
          viewButtons.forEach((node, index) => node.setAttribute("aria-pressed", String(index === 0)));
          day.scrollIntoView({ block: "start", behavior: "smooth" });
        });
        dayNav.append(button);
      }
      viewButtons.forEach((button, index) => button.addEventListener("click", () => {
        forecastPanel.hidden = index === 1;
        graphPanel.hidden = index === 0;
        viewButtons.forEach((node, day) => node.setAttribute("aria-pressed", String(day === index)));
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      }));
      workspace.append(header, dayNav, content);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-week-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    deadline = setTimeout(stopWaiting, 30000);
    window.addEventListener("pagehide", stopWaiting, { once: true });
  };
  if (storage) storage.get({ chmiRadarClassicEnabled: true }, start);
  else start({ chmiRadarClassicEnabled: true });
})();
