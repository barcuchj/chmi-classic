# Tampermonkey varianta

Soubor `chmi-classic.user.js` je samostatná varianta pro Tampermonkey. Vzniká ze
stejných JavaScriptových a CSS zdrojů jako rozšíření pro Chrome, Edge a Safari.

Neupravujte generovaný `.user.js` ručně. Po změně souborů v `chrome-edge/`
spusťte z kořene projektu:

```sh
node script/build_userscript.mjs
```

Uživatel může klasické rozhraní vypnout tlačítkem **Nový vzhled**. Zpět jej
zapne plovoucím tlačítkem **Klasický vzhled** nebo příkazem v nabídce
Tampermonkey.
