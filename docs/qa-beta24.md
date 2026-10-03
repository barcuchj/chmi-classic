# Instalační kontrola beta 24 — 2.–3. 10. 2026

Skutečně instalované rozbalené rozšíření v odděleném Chrome for Testing,
bez Tampermonkey. Browser plugin nebyl dostupný; použit existující Playwright
CLI a testovací profil. Žádné ruční vkládání adaptéru do DOM.

Snímky byly nově pořízeny 3. 10. z neměněného instalačního ZIPu.
Přechod do Brna a čas 433 → 432 znovu ověřeny; kamera měla časovou osu
52 px a dokument 1256 × 541 bez přetečení. Načtení živého snímku vyžadovalo
vyčkat na nativní ovladač; existující placeholder není důkazem živých dat.

## Rozsah a důkazy

| Průchod | Výsledek |
| --- | --- |
| Úvod `www.chmi.cz/` s query → rozcestník | Automaticky klasický portál |
| Radar v panelu 1256 × 541 | Dokument bez X/Y scrollu, pravé menu 259/259 × 521/521 (client/scroll) |
| Popis vrstvy | Rozbalení/sbalení, původní text zachován |
| Čas radaru | Klávesa doprava změnila nativní slider 0 → 1 i zobrazený termín |
| Kamery → filtr Brno → detail | Jeden výsledek, živý dekódovaný snímek, zachované nativní uzly |
| Informace ke kamerám | Rozbalení/sbalení funguje |
| Čas kamery | Klávesa doleva změnila slider 433 → 432; časová osa vysoká 52 px |
| Měsíční text/PDF/text | Přepnutí a stav panelů fungují |
| PDF celá stránka/šířka | Skutečné vykreslení na šířku čitelné; nutná výměna iframe, ne pouze hash |
| Úzký portál 390 × 844 | Root bez X/Y overflow; dlouhý rozcestník má vlastní posuv |
| Úzké kamery a měsíční text | Adaptovaný dokument bez X/Y overflow, seznam/text mají vlastní posuv |
| Screenshoty | Tři reálné snímky instalované beta 24, 1280 × 800 |

Kontrola `node script/check.mjs`: 143/143 testů, syntaxe a generovaný userscript
odpovídají zdrojům. Nejde o 143 prohlížečových testů. Balíček vznikl pouze
`./script/package_release.sh --chrome-only`; všech 47 ZIP souborů byte-for-byte
odpovídá zdrojům i skutečně instalované testovací kopii.
GitHub CI nyní spouští stejnou úplnou kontrolu místo dřívějšího omezeného
výběru testů portálu a ALADINu.

ZIP SHA-256: `358c9c2f7d17016cd1ccac046bba9c8abd0a055f0b3a796b203eba3feeb8be44`.

## Omezení

- Konzole není bezchybná: zdrojový `chmu-theme/js/main.js` hlásil čtení
  `querySelector` z undefined, radarový `radar-main.js:458` během počátečního
  načítání čtení `src` z undefined. Pozdější ovládání časové osy fungovalo.
  Stack ukazuje nativní soubory; původ v upstreamu bez rozšíření nebyl
  samostatným srovnáním prokázán. Další diagnostika zůstává otevřená.
- Mobilní mapový web hlásil varování při změně viewportu; žádný frameworkový
  error overlay nebyl vidět. Mapy a komponenty potřebují čas na síťové načtení.
- Volitelné cookies byly odmítnuty běžným ovladačem jen testovacího profilu;
  cookie dialog nebyl obcházen ani odstraněn kódem.
- Posuv uvnitř čitelného PDF, dlouhého textu, seznamu kamer či rozcestníku
  je záměrný; nesmí odsunout mapu ani celý portál.
- Skutečná instalace Tampermonkey, Safari/Edge a všechny další položky
  rozcestníku tímto dílčím průchodem nejsou ověřeny.
- Archivní HTML/CSS slouží jako referenční podklady; historické hodnoty
  se nevydávají za aktuální. Stále neobnovené položky zůstávají neaktivní.
