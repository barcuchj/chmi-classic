# Tampermonkey varianta

**Aktuálně 0.7.0-beta.2:** userscript navíc obsahuje portál s centrálním panelem,
zvětšením aplikace a rozcestníkem. Jde o testovací, dosud neúplnou rekonstrukci.
Tato nová část ještě není zabalená v rozšířeních. Pro instalaci a aktualizaci
použijte [návod pro běžné uživatele](../INSTALL.md); zbývající práce je v [TODO](../TODO.md).

Soubor `chmi-classic.user.js` je generovaná samostatná varianta ČHMÚ Classic.
Používá stejné zdroje z `chrome-edge/` jako Chrome/Edge a Safari.

Od verze 0.6.0 podporuje:

- specializovaný old-look radar, homepage radar, Meteosat, Polární, Geo a Houby,
- ALADIN s volitelným presetem `4 mapy`,
- jednotný katalog meteogramů, webkamer, naměřených dat, synoptiky, letectví,
  historických výstupů, Open Data a archivních prohlížečů,
- lehký old-look rám pro allowlistované živé stránky `www.chmi.cz`,
  `produkty.chmi.cz/aladin/` a HPPS na `hydro.chmi.cz`,
- vlastní responzivní legacy adaptaci doložených starých aplikací na
  `intranet.chmi.cz` / `portal.chmi.cz` včetně navigace na současnou náhradu
  a Web Archive; historický kód ani obrazová data se do userscriptu nekopírují.
- položky katalogu bez rekonstruované aplikace jako červený přeškrtnutý text
  bez odkazu s vysvětlením v informační bublině.

Userscript má široký `@match` pro `www.chmi.cz/*`, ale `catalog.js` mimo
explicitní allowlist podporovaných cest nic nestyluje.

Generovaný `.user.js` neupravujte ručně. Po změně zdrojů spusťte:

```sh
node script/build_userscript.mjs
```

Uživatel může klasické rozhraní vypnout tlačítkem **Nový vzhled**. Zpět jej
zapne plovoucím tlačítkem **Klasický vzhled** nebo příkazem v nabídce
Tampermonkey.
