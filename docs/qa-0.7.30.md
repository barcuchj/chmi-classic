# QA 0.7.30 – hlavní menu a návraty

Ověřeno 24. 10. 2026 v odděleném Chrome profilu s instalovaným unpacked
rozšířením. Zdroj: `chrome-edge/`; userscript je generovaný.

## Změna uživatelského průchodu

Všech šest položek hlavního menu má běžné kliknutí do centrálního panelu.
Předchozí 0.7.29 opravovala rozměry katalogové hlavičky, ale ponechávala
nové karty; toto vydání opravuje navigaci i návraty.

`information.js/css` upravují původní informační stránky v rámci portálu.
Odstraňují duplicitní navigační obal a ponechávají obsah, formuláře i data
ČHMÚ. Není to prohlášení o dokončení všech datových aplikací těchto sekcí.
Readiness vyžaduje skutečný viditelný text nativního obsahu; naše nová
navigace ani skryté skripty ji nemohou samy potvrdit.

Chrome pravidlo pro rámce je omezené na informační sekce předpovědí,
naměřených dat, O ČHMÚ, vody a letectví. Specifické aplikace jsou z něj
vyloučené a používají své vlastní adaptéry. Host oprávnění se nemění.
Přesné cíle při předávání aplikací se ověřují proti registru, původu rámce
a relaci. Přihlašovací údaje v URL nejsou povolené; iframe dostává novou relaci.

## Ověření

- `node script/build_userscript.mjs` a `node script/check.mjs`: syntaxe,
  manifest, generovaná shoda a 206/206 testů.
- Regresní test všech šesti kliknutí nejprve selhal na původním otevírání
  do nových karet. Následně ověřil centrální routování a návrat přes POČASÍ.
- Živá horní nabídka v Chrome: PŘEDPOVĚDI, AKTUÁLNÍ SITUACE, HISTORICKÁ
  DATA, INFORMACE A SLUŽBY, O NÁS, KONTAKTY. Počet karet zůstal 1.
  V informačních sekcích je nativní velký header skrytý, obsah a návratová
  navigace viditelné. PŘEDPOVĚDI se nativně přesměrují na dnešní předpověď
  a předají správnému klasickému mapovému panelu.
- Historická data → Mapy teploty vzduchu → rozcestník → Úvod portálu:
  skutečný klik, nativní podstránka, původní mapa a návrat na forecast.
  Prošlo v 1280 × 800 a 390 × 844, bez vodorovného přesahu dokumentu.
- Informace a služby → Nabídka pro média → POČASÍ: obě šířky, bez nové karty.
- Aktuální situace → Webové kamery: předání do klasického kamerového
  adaptéru, ověřená nativní mapa/seznam a readiness, stále v jediné kartě.
- Historický rozcestník má na desktopu čtyři sloupce; všech osm hlavních
  karet je vidět současně. Vizuálně zkontrolované skutečné screenshoty.
- Test přesného předání města/parametrů a odstranění staré relace;
  odmítnutí cizí URL, jiného typu aplikace, vloženého hesla a staré zprávy.
- Jednotkové testy nativních produktů družic odpovídají existujícímu
  seznamu podporovaných produktů. Živý klik Aktuální situace → Družicová data
  zachoval produkt `sandwich-ir-bt` v geostacionárním klasickém panelu a
  počet karet 1; nevrátil jej na výchozí `true-color`. Nejde o úplný živý
  audit každého produktu.
- `./script/package_release.sh --chrome-only`: všech 55 souborů v ZIPu
  porovnáno bajt po bajtu se zdrojem; permissions i host_permissions
  porovnány s předchozí verzí a zůstávají stejné.
  SHA-256 ZIPu: `6c7df857b9359b30451825932fdfeacdc1170ae5a970304e1a37494b09dd5a87`.
  SHA-256 userscriptu: `d7b57059a793f6d6c215449fb05ba4e8dc6fc37e0ce36268f25a11d56507de6c`.

## Zbývající hranice

Instalace Tampermonkey a Safari/Edge nebyly znovu ověřeny. Úplná funkčnost
všech formulářů, dokumentů a aplikací na všech navazujících stránkách není
tímto průchodem ověřená. Starší místní moduly ozonu, Bio, sněhu, týdenního
výhledu a automatických stanic nejsou tímto vydáním označené za dokončené.
Chrome Web Store se aktualizuje samostatným nahráním výsledného ZIPu.
