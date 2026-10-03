# Pokyny pro vývoj

- Vyvíjej pouze v tomto adresáři: `/Volumes/Archive/CODEX/chmi-radar-classic`.
- `chrome-edge/` je zdroj pravdy pro Chromium, Safari i Tampermonkey; kopie v Safari Resources ani generovaný userscript neupravuj ručně.
- `tampermonkey/chmi-classic.user.js` generuj příkazem `node script/build_userscript.mjs`.
- Zachovej živá data a události ČHMÚ. Rozšíření smí měnit vzhled a přidávat zrcadlené ovladače, ne kopírovat nebo nahrazovat datový backend.
- Před předáním ověř syntaxi JavaScriptu, manifest, živé vykreslení a relevantní interakci. Pro Safari spusť `./script/build_and_run.sh --verify`.
- Necommituj `.build`, uživatelská data Xcode ani dočasné snímky z QA.
- Změny veřejného chování, podporovaných URL nebo instalace zapiš do `README.md`; trvalé navazující kroky udržuj v `TODO.md`.
- Repozitář je `github-first`: po ověření pracuj v cílené větvi, používej Conventional Commits, pushni větev a otevři PR proti `main`; do `main` po úvodním zveřejnění neposílej změny přímo.
- Veřejný repozitář je `https://github.com/barcuchj/chmi-classic`. Balíčky pro Release vytvářej pouze přes `./script/package_release.sh` a před nahráním ověř jejich obsah.

## Kurýr v2 — projektová výjimka schválená uživatelem 3. 10. 2026

- Kurýr nesmí nyní ani v budoucích bězích čekat pouze na ověření přesného názvu
  modelu v Classicu. Preferuj dostupný Sol/High, ale pokud UI název modelu
  nezpřístupní, zaznamenej `model: unverified` a pokračuj v předání.
- Tato výslovná uživatelská volba má přednost před přesnou modelovou bránou
  skillu. Nadále ověř správný přiřazený chat, režim Chat a effort High;
  zachovej ochranu podkladů, idempotenci a ověření převzatých souborů.
- Netvrď, že neověřený model je potvrzený Sol, a neobcházej přihlášení
  ani bezpečnostní blokace. Konfigurace `.kuryr-v2/` zůstává jen místní.
