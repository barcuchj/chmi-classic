(() => {
  "use strict";
  if (globalThis.__chmiClassicSharing) return;
  const url = "https://chromewebstore.google.com/detail/ogciancfjbeghkcjkhijmbaabpohccpp";
  const payload = Object.freeze({ title: "ČHMÚ Classic", text: "Klasický vzhled aplikací ČHMÚ – instalace doplňku pro Chrome a Edge.", url });
  let sequence = 0;

  async function shareOrCopy(browser = globalThis.navigator, copyOnly = false) {
    if (!copyOnly && typeof browser?.share === "function") {
      try { await browser.share(payload); return "shared"; }
      catch (error) { if (error?.name === "AbortError") return "cancelled"; }
    }
    try {
      if (typeof browser?.clipboard?.writeText !== "function") return "manual";
      await browser.clipboard.writeText(url);
      return "copied";
    } catch { return "manual"; }
  }

  function createControl(doc = document) {
    const make = (tag, text) => { const node = doc.createElement(tag); if (text) node.textContent = text; return node; };
    const root = make("div");
    root.className = "chmi-share";
    const toggle = make("button", "Sdílet doplněk");
    toggle.type = "button";
    toggle.title = "Poslat nebo zkopírovat instalační odkaz na Chrome Web Store";
    const panel = make("div");
    panel.className = "chmi-share-panel";
    panel.id = `chmi-share-panel-${++sequence}`;
    panel.hidden = true;
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Instalační odkaz ČHMÚ Classic");
    toggle.setAttribute("aria-controls", panel.id);
    toggle.setAttribute("aria-expanded", "false");
    const status = make("p");
    status.setAttribute("role", "status");
    const input = make("input");
    input.type = "text";
    input.readOnly = true;
    input.value = url;
    input.setAttribute("aria-label", "Odkaz na instalaci v Chrome Web Store");
    const copy = make("button", "Kopírovat odkaz");
    copy.type = "button";
    const native = make("button", "Sdílet přes…");
    native.type = "button";
    native.hidden = typeof globalThis.navigator?.share !== "function";
    const store = make("a", "Otevřít Chrome Web Store ↗");
    store.href = url;
    store.target = "_blank";
    store.rel = "noopener noreferrer";
    const close = make("button", "Zavřít");
    close.type = "button";
    function hide() { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    async function act(copyOnly = false) {
      toggle.disabled = copy.disabled = native.disabled = true;
      const result = await shareOrCopy(globalThis.navigator, copyOnly);
      toggle.disabled = copy.disabled = native.disabled = false;
      if (result === "cancelled") return;
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      status.textContent = result === "copied" ? "Instalační odkaz zkopírován. Vložte jej do zprávy nebo na sociální síť." :
        result === "shared" ? "Instalační odkaz předán systémovému sdílení." : "Označený odkaz zkopírujte pomocí ⌘C nebo Ctrl+C.";
      if (result === "manual") { input.focus(); input.select(); }
    }
    toggle.addEventListener("click", () => {
      if (!panel.hidden) { hide(); return; }
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      status.textContent = "Pošlete instalační odkaz ve zprávě nebo na sociální síti.";
    });
    copy.addEventListener("click", () => act(true));
    native.addEventListener("click", () => act());
    close.addEventListener("click", hide);
    root.addEventListener("keydown", event => { if (event.key === "Escape" && !panel.hidden) { event.stopPropagation(); hide(); } });
    panel.append(status, input, copy, native, store, close);
    root.append(toggle, panel);
    return root;
  }
  globalThis.__chmiClassicSharing = Object.freeze({ url, shareOrCopy, createControl });
})();
