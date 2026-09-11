# Tampermonkey varianta

Soubor `chmi-classic.user.js` je generovaná samostatná varianta ČHMÚ Classic.
Používá stejné zdroje z `chrome-edge/` jako Chrome/Edge a Safari.

Od verze 0.5.0 podporuje:

- specializovaný old-look radar, homepage radar, Meteosat, Polární, Geo a Houby,
- ALADIN s volitelným presetem `4 mapy`,
- jednotný katalog meteogramů, webkamer, naměřených dat, synoptiky, letectví,
  historických výstupů, Open Data a archivních prohlížečů,
- lehký old-look rám pro allowlistované živé stránky `www.chmi.cz`,
  `produkty.chmi.cz/aladin/` a HPPS na `hydro.chmi.cz`.

Userscript má široký `@match` pro `www.chmi.cz/*`, ale `catalog.js` mimo
explicitní allowlist podporovaných cest nic nestyluje.

Generovaný `.user.js` neupravujte ručně. Po změně zdrojů spusťte:

```sh
node script/build_userscript.mjs
```

Uživatel může klasické rozhraní vypnout tlačítkem **Nový vzhled**. Zpět jej
zapne plovoucím tlačítkem **Klasický vzhled** nebo příkazem v nabídce
Tampermonkey.
