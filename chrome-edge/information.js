(() => {
  "use strict";
  const registry = globalThis.__chmiClassicApps;
  if (!registry || window.top === window || window.__chmiClassicInformation) return;
  const context = registry.embeddedContext(new URL(location.href), window.name);
  if (!context || registry.get(context.id)?.family !== "information") return;
  let parentURL;
  try { parentURL = new URL(document.referrer); } catch { return; }
  if (!registry.isHomeLink(parentURL) && !registry.matches(context.id, parentURL)) return;
  window.__chmiClassicInformation = true;
  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;
  const start = settings => {
    if (settings.chmiRadarClassicEnabled === false) return;
    document.documentElement.classList.add("chmi-information-classic");
    if (context.id === "aviation") document.documentElement.classList.add("chmi-information-aviation");
    const send = (target, url = null) => window.parent.postMessage({type:"chmi-classic-navigate",app:context.id,session:context.session,target,...(url ? {url} : {})}, parentURL.origin);
    const refresh = () => {
      const main = document.querySelector("main");
      if (!main) return;
      if (!document.getElementById("chmi-information-navigation")) {
        const nav = document.createElement("nav");
        nav.id = "chmi-information-navigation";
        nav.setAttribute("aria-label", "Návrat v portálu");
        const home = document.createElement("a");
        home.href = "https://www.chmi.cz/";
        home.textContent = "← Úvod portálu";
        const section = document.createElement("a");
        section.href = registry.get(context.id).url;
        section.textContent = `Rozcestník: ${registry.get(context.id).title}`;
        nav.append(home, section);
        main.insertBefore(nav, main.firstChild);
      }
      const heading = main.querySelector("h1");
      // The native content, not our navigation, establishes document readiness.
      const content = [...main.children].find(n => n !== heading && n.contains(heading)) ?? heading?.parentElement;
      if (heading?.textContent.trim() && content && content !== main && (content.innerText ?? "").trim().length >= 50 &&
          content.dataset.chmiInformationNative !== "verified") content.dataset.chmiInformationNative = "verified";
    };
    document.addEventListener("click", event => {
      if (!registry.shouldOpenInPanel(event) || !(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link || link.hasAttribute("download")) return;
      let url;
      try { url = new URL(link.href, location.href); } catch { return; }
      if (registry.isHomeLink(url)) {
        event.preventDefault(); event.stopImmediatePropagation(); send("home"); return;
      }
      const app = registry.nativeAppFor(url);
      if (app) {
        event.preventDefault(); event.stopImmediatePropagation();
        send(app, registry.matches(app, url) ? url.href : registry.get(app).url);
        return;
      }
      // Native sections stay inside the same frame, including links authored
      // with target=_blank. Explicit Ctrl/Meta/middle clicks remain native.
      if (registry.matches(context.id, url)) {
        if (/\.(pdf|xlsx?|csv|zip)$/i.test(url.pathname) || url.searchParams.get("download") === "true") return;
        if (link.target && link.target !== "_self") {
          event.preventDefault(); location.assign(url.href);
        }
      }
    }, true);
    refresh();
    let scheduled = false;
    new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; refresh(); });
    }).observe(document.documentElement, {childList:true,subtree:true,characterData:true});
  };
  if (storage) storage.get({chmiRadarClassicEnabled:true}, start);
  else start({chmiRadarClassicEnabled:true});
})();
