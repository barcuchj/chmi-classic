(() => {
  "use strict";
  if (!["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/letectvi\/aerologicka-mereni\/nalezli-jste-radiosondu\/?$/.test(location.pathname) || window.__chmiClassicFoundSonde) return;
  window.__chmiClassicFoundSonde = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  function start(settings) {
    if (settings.chmiRadarClassicEnabled === false) return;
    let observer, deadline;
    function adapt() {
      const main = document.querySelector("main");
      const title = main?.querySelector("h1");
      const article = [...(main?.children ?? [])].find(node => node.contains(title));
      // Preserve the complete native article with its images and contact links.
      if (!article || title?.textContent.trim() !== "Nalezli jste radiosondu?" ||
          article.querySelectorAll("img").length < 5 || !article.querySelector('a[href^="mailto:"]')) return false;
      observer?.disconnect(); clearTimeout(deadline);
      const workspace = document.createElement("section");
      workspace.id = "chmi-found-sonde-workspace";
      workspace.setAttribute("aria-label", "Pokyny ČHMÚ pro nálezce radiosondy");
      workspace.dataset.chmiFoundSondeNative = "verified";
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", "Návrat na portál");
      const home = document.createElement("a");
      home.href = "https://www.chmi.cz/";
      home.textContent = "← Úvod portálu";
      nav.append(home);
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
        nav.append(restore);
      }
      workspace.append(nav, article);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-found-sonde-classic");
      return true;
    }
    if (adapt()) return;
    observer = new MutationObserver(adapt);
    observer.observe(document.documentElement, {childList:true,subtree:true});
    deadline = setTimeout(() => observer.disconnect(), 30000);
    window.addEventListener("pagehide", () => { observer.disconnect(); clearTimeout(deadline); }, {once:true});
  }
  if (storage) storage.get({chmiRadarClassicEnabled:true}, start);
  else start({chmiRadarClassicEnabled:true});
})();
