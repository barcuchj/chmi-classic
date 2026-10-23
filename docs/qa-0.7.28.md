# QA 0.7.28 – načítání centrálního panelu (23. 10. 2026)

## Rozsah

Společné zdroje `portal.js`, `portal.css`, `embedded.js` a regenerovaný
userscript. Vydání vychází z main 0.7.27; nezahrnuje starší místní WIP
ozonu, sněhu, Bio, přehledu počasí ani automatických stanic.
Žádná změna oprávnění, žádná náhrada živých dat.

## Provedené kontroly

- Regresní test nejprve selhal na chybějící ochraně. Následně prošlo
  zakrytí aplikací, kontrola původu/relace, timeout, opakované zprávy,
  pozdní readiness, retry a zprávy z nahrazeného iframe.
- Životní cyklus embedded: pagehide pošle loading a zastaví polling;
  dva návraty z BFCache obnoví vždy právě jeden časovač. Jde o test
  skutečného zdrojového kódu v DOM modelu, nikoli důkaz BFCache v Safari.
- Instalovaný unpacked Chrome v odděleném profilu bez Tampermonkey:
  skutečná živá předpověď ČHMÚ při 1280 × 800 a 390 × 844.
  Navigační odpověď test zpozdil o 1,7 s, data nenahrazoval.
  První průchod: 1 475 snímků requestAnimationFrame, z toho 1 391
  během loading, bez odhalení rámce. Mapa se poté vykreslila se 13
  předpovědními kartami v obou rozměrech; skutečné screenshoty zkontrolovány.
  Opakování přímo s čistým rozšířením 0.7.28 (verze ověřena v runtime):
  1 183 snímků, 1 111 loading, žádné porušení; stejné rozměry a 13 karet.
- Řízené selhání načtení VODY v testovacím profilu: po 25 s se zobrazilo
  vysvětlení a retry. Rámec zůstal neprůhledností 0, inert a aria-hidden,
  nikoli prázdná přístupná aplikace. Po odstranění testovacího selhání
  a kliknutí na retry se načetla ověřená živá mapa s canvasem.
- Čistá 0.7.28: nativní nabídka OVZDUŠÍ → PM10 hodinový průměr.
  Zaznamenán přechod loading → ready a ověřený živý canvas podstránky.
  Průběžná kontrola neprůhlednosti/inert nenašla porušení. Tento nativní
  ovladač používá vlastní navigaci z odkazu `#`, nikoli námi přepsaný href.
- `node script/build_userscript.mjs` a `node script/check.mjs`:
  kontrola syntaxe, manifestu, shody generovaného userscriptu a 186/186 testů.
- `./script/package_release.sh --chrome-only`: ZIP 0.7.28, všech 51 souborů
  porovnáno bajt po bajtu s ověřovaným zdrojem. SHA-256 ZIPu:
  `aac2a0241a8535034f6510f8a3d8c25d07e8d0dc5a13935df7907b1b8abcdfa1`.
  SHA-256 userscriptu:
  `174b021859ca593753050d158d66f3903bcd8f4e2338c6bf1abffc8c4caff2ce`.

## Omezení

Ochrana platí pro centrální iframe, ne pro úplně první vykreslení
samostatné stránky či domovské stránky před spuštěním doplňku/userscriptu.
Živé QA není úplný průchod všech aplikací. Instalace Tampermonkey,
Safari/Edge a publikace do Chrome Web Store nebyly provedeny.
Skrytí používá opacity (nikoli display/visibility), aby nativní knihovny
dostaly skutečné rozměry. Readiness zůstává původní ověřená zpráva adaptéru,
nikoli load event ani pevné zpoždění.
