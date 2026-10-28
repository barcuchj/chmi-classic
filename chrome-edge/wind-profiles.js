(() => {
  "use strict";
  const stations = [
    { id: "11406", slug: "11406-cheb", name: "Cheb" },
    { id: "11509", slug: "11509-doksany", name: "Doksany" }
  ];
  const pathFor = station => `/letectvi/aerologicka-data/${station.slug}-vyvoj-profilu-vetru`;
  const stationForPath = path => stations.find(station => path.replace(/\/$/, "") === pathFor(station)) ?? null;
  function replayReady(slider, image) {
    return slider?.type === "range" && !slider.disabled && Number.isFinite(Number(slider.min)) &&
      Number.isFinite(Number(slider.max)) && Number(slider.max) > Number(slider.min) &&
      image?.complete === true && image.naturalWidth >= 500 && image.naturalHeight >= 300;
  }
  if (typeof module === "object" && module.exports) {
    module.exports = { replayReady, stationForPath };
    return;
  }
  const station = stationForPath(location.pathname);
  if (!station || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) || window.__chmiClassicWindProfiles) return;
  window.__chmiClassicWindProfiles = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  function start(settings) {
    if (settings.chmiRadarClassicEnabled === false) return;
    let observer, deadline;
    const stop = () => { observer?.disconnect(); clearTimeout(deadline); document.removeEventListener("load", onLoad, true); };
    const onLoad = event => { if (event.target.matches?.("img.chmi-playableimage-img")) adapt(); };
    function adapt() {
      const player = document.querySelector('main [id^="portlet_ChmiImagesReplay_"]');
      const slider = player?.querySelector('input#imageSlider[type="range"]');
      const image = player?.querySelector('img.chmi-playableimage-img');
      const config = `https://data-provider.chmi.cz/api/map/init/letectvi.WindProfileDev/${station.id}`;
      const measured = document.querySelector(`main .chmu-map-component[data-config-url="${config}"], main .chmu-map-component[data-config-url="${config}?client=mobile"]`);
      const title = document.querySelector("main h1")?.textContent.trim();
      if (!measured || !player || !title?.includes("Vývoj profilu větru") || !replayReady(slider, image)) return false;
      stop();
      // Native replay keeps stale ARIA wrapper flags after its real controls
      // are enabled. Expose it only after decoded media and slider readiness.
      const replay = player.querySelector("#chmi-playabledata");
      replay.setAttribute("aria-hidden", "false");
      replay.setAttribute("aria-disabled", "false");
      replay.setAttribute("aria-label", "Měřený profil větru – časová osa a graf");
      const workspace = document.createElement("section");
      workspace.id = "chmi-wind-workspace";
      workspace.setAttribute("aria-label", "Měřené vertikální profily větru ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-wind-brand";
      const heading = document.createElement("strong");
      heading.textContent = title;
      const note = document.createElement("span");
      note.textContent = "Měřená data ČHMÚ · časy grafu UTC";
      header.append(heading, note);
      const nav = document.createElement("nav");
      nav.id = "chmi-wind-stations";
      nav.setAttribute("aria-label", "Měřicí stanice profilu větru");
      for (const item of stations) {
        const a = document.createElement("a");
        a.href = pathFor(item);
        a.textContent = item.name;
        if (item === station) a.setAttribute("aria-current", "page");
        nav.append(a);
      }
      if (typeof storage?.set === "function") {
        const restore = document.createElement("button");
        restore.type = "button";
        restore.textContent = "Nový vzhled";
        restore.addEventListener("click", () => {
          let done = false;
          const reload = () => { if (!done) { done = true; location.reload(); } };
          const result = storage.set({chmiRadarClassicEnabled:false}, reload);
          if (result?.then) result.then(reload, () => {});
          if (storage === globalThis.__chmiClassicStorage) reload();
        });
        header.append(restore);
      }
      const home = document.createElement("a");
      home.href = "https://www.chmi.cz/";
      home.textContent = "← Úvod portálu";
      nav.prepend(home);
      const directory = document.createElement("a");
      directory.href = "https://www.chmi.cz/letectvi/aerologicka-mereni/windprofilery?zalozka=windprofilery";
      directory.textContent = "Další stanice ČHMÚ ↗";
      directory.target = "_blank";
      directory.rel = "noopener";
      nav.append(directory);
      workspace.addEventListener("click", event => {
        if (!window.__chmiClassicEmbedded || !globalThis.__chmiClassicApps.shouldOpenInPanel(event)) return;
        const link = event.target.closest?.("a[href]");
        if (!link || link.target || link.hasAttribute("download")) return;
        const next = new URL(link.href), current = new URL(location.href);
        if (next.origin !== location.origin || !stationForPath(next.pathname)) return;
        for (const key of ["chmi_classic_embed", "chmi_classic_session"]) if (current.searchParams.has(key)) next.searchParams.set(key, current.searchParams.get(key));
        event.preventDefault();
        location.assign(next.href);
      });
      workspace.append(header, nav, player);
      workspace.dataset.chmiWindNative = "verified";
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-wind-classic");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:["src","max","disabled","data-config-url"]});
    document.addEventListener("load", onLoad, true);
    deadline = setTimeout(stop, 60000);
    window.addEventListener("pagehide", stop, {once:true});
  }
  if (storage) storage.get({chmiRadarClassicEnabled:true}, start);
  else start({chmiRadarClassicEnabled:true});
})();
