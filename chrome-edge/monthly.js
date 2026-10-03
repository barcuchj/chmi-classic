(() => {
  "use strict";

  // The historical viewer had probability charts and statistical tables. The
  // present official page publishes those as a live PDF, alongside live text.
  function monthlyDataReady(period, paragraphs, pdfHref) {
    if (!/^Na období od\s+\d/.test(period ?? "") || paragraphs?.length < 2 ||
        paragraphs.some(text => text.trim().length < 100)) return false;
    try {
      const url = new URL(pdfHref);
      return url.origin === "https://www.chmi.cz" && url.pathname.startsWith("/documents/d/chmi.cz/");
    } catch {
      return false;
    }
  }

  function monthlyPdfHref(pdfHref, fit = "width") {
    const url = new URL(pdfHref);
    url.hash = fit === "page"
      ? "toolbar=0&navpanes=0&view=Fit&zoom=page-fit"
      : "toolbar=0&navpanes=0&view=FitH&zoom=page-width";
    return url.href;
  }

  function replaceMonthlyPdfFrame(frame, pdfHref, fit) {
    const replacement = frame.cloneNode(false);
    replacement.src = monthlyPdfHref(pdfHref, fit);
    frame.replaceWith(replacement);
    return replacement;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { monthlyDataReady, monthlyPdfHref, replaceMonthlyPdfFrame };
    return;
  }

  if (window.__chmiClassicMonthlyLoaded || !["www.chmi.cz", "chmi.cz"].includes(location.hostname) ||
      !/^\/predpoved-pocasi\/mesic\/?$/.test(location.pathname)) return;
  window.__chmiClassicMonthlyLoaded = true;

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
      const title = [...document.querySelectorAll("h1")].find(node => node.textContent.trim() === "Měsíční výhled počasí");
      const headerBoundary = title?.closest(".lfr-layout-structure-item-header");
      const period = headerBoundary?.querySelector("h2")?.textContent.trim() ?? "";
      const contentRoot = headerBoundary?.parentElement;
      const narrative = [...(contentRoot?.children ?? [])]
        .find(node => node.classList.contains("lfr-layout-structure-item-text") && node.textContent.length > 500)
        ?.querySelector(".chmi-text-editable");
      const paragraphs = narrative?.innerText.split(/\n+/).map(text => text.trim()).filter(text => text.length > 1) ?? [];
      const pdfLink = [...(contentRoot?.querySelectorAll("a[href*='/documents/d/']") ?? [])]
        .find(node => node.textContent.includes("Měsíční výhled počasí"));
      const pdfUrl = pdfLink?.href;
      if (!monthlyDataReady(period, paragraphs, pdfUrl)) return false;
      stopWaiting();

      const workspace = document.createElement("section");
      workspace.id = "chmi-monthly-workspace";
      workspace.setAttribute("aria-label", "Měsíční výhled – živý text a grafy ČHMÚ");
      const header = document.createElement("header");
      header.id = "chmi-monthly-brand";
      const heading = document.createElement("h1");
      heading.textContent = "Měsíční výhled počasí";
      const periodLabel = document.createElement("span");
      periodLabel.textContent = period;
      header.append(heading, periodLabel);

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

      const nav = document.createElement("nav");
      nav.id = "chmi-monthly-nav";
      nav.setAttribute("aria-label", "Zobrazení měsíčního výhledu");
      const summaryButton = document.createElement("button");
      summaryButton.type = "button";
      summaryButton.textContent = "Slovní výhled";
      summaryButton.setAttribute("aria-pressed", "true");
      const pdfButton = document.createElement("button");
      pdfButton.type = "button";
      pdfButton.textContent = "Grafy a statistika";
      pdfButton.setAttribute("aria-pressed", "false");
      const pdfOpen = document.createElement("a");
      pdfOpen.href = pdfUrl;
      pdfOpen.target = "_blank";
      pdfOpen.rel = "noopener noreferrer";
      pdfOpen.textContent = "Otevřít PDF ↗";
      const pdfFitLabel = document.createElement("label");
      pdfFitLabel.id = "chmi-monthly-pdf-fit";
      pdfFitLabel.hidden = true;
      pdfFitLabel.textContent = "Velikost PDF: ";
      const pdfFit = document.createElement("select");
      pdfFit.setAttribute("aria-label", "Velikost PDF");
      [["width", "Na šířku – čitelně"], ["page", "Celá stránka"]].forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        pdfFit.append(option);
      });
      pdfFitLabel.append(pdfFit);
      nav.append(summaryButton, pdfButton, pdfOpen, pdfFitLabel);

      const main = document.createElement("main");
      main.id = "chmi-monthly-main";
      const summaryPanel = document.createElement("section");
      summaryPanel.id = "chmi-monthly-summary";
      summaryPanel.hidden = false;
      paragraphs.slice(0, 2).forEach((text, index) => {
        const article = document.createElement("article");
        const subheading = document.createElement("h2");
        subheading.textContent = index === 0 ? "Teploty" : "Srážky";
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        article.append(subheading, paragraph);
        summaryPanel.append(article);
      });
      const pdfPanel = document.createElement("section");
      pdfPanel.id = "chmi-monthly-pdf";
      pdfPanel.hidden = true;
      let pdfFrame = document.createElement("iframe");
      pdfFrame.id = "chmi-monthly-pdf-frame";
      pdfFrame.title = "Grafy a statistika měsíčního výhledu ČHMÚ";
      pdfFrame.setAttribute("loading", "lazy");
      pdfPanel.append(pdfFrame);
      main.append(summaryPanel, pdfPanel);

      function showPdf(show) {
        summaryPanel.hidden = show;
        pdfPanel.hidden = !show;
        pdfFitLabel.hidden = !show;
        summaryButton.setAttribute("aria-pressed", String(!show));
        pdfButton.setAttribute("aria-pressed", String(show));
        if (show && !pdfFrame.src) pdfFrame.src = monthlyPdfHref(pdfUrl, pdfFit.value);
      }
      pdfFit.addEventListener("change", () => {
        // Chromium's native PDF viewer does not reliably reapply fit parameters
        // for a fragment-only navigation. A new frame starts it with the chosen
        // view while keeping the official document and its browser controls.
        pdfFrame = replaceMonthlyPdfFrame(pdfFrame, pdfUrl, pdfFit.value);
      });
      summaryButton.addEventListener("click", () => showPdf(false));
      pdfButton.addEventListener("click", () => showPdf(true));
      workspace.append(header, nav, main);
      document.body.append(workspace);
      document.documentElement.classList.add("chmi-monthly-classic");
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
