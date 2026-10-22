# QA 0.7.27 — 22. 10. 2026

Vydání izolované z main 8ca0ffe: obsahuje pouze PM10, výchozí záložky,
jejich testy a dokumentaci. Starší místní WIP ozonu, sněhu, Bio, týdne,
přehledu počasí a automatických stanic nebyl automaticky publikován.

## Automatické ověření

- `node script/build_userscript.mjs`: PASS.
- `node script/check.mjs`: syntax, manifest, generovaná shoda a **181/181 PASS**.
- Testy ověřují odmítnutí cizího originu, nepovolené cesty/referreru
  i nesprávné konfigurace mapy. Žádné rozšíření host oprávnění.
- `git diff --check`: PASS.

## Živý Chrome

Playwright CLI, skutečné rozšíření z čisté vydávací pracovní kopie,
Chrome for Testing 153, vlastní persistentní profil, bez Tampermonkey.
Uživatelský profil nebyl měněn. Cookie banner odmítnut běžným tlačítkem.

Ověřeno: OVZDUŠÍ → nativní PM10 odkaz → nový dokument s kompaktním
iframe režimem a čerstvým ready reportem; legenda, zoom, časová osa,
zvětšení/Escape. Opakované OVZDUŠÍ vrátí přehled, POČASÍ po ALADINu
vrátí předpověď, opakovaná VODA vytvoří novou výchozí relaci.
PM10 také samostatně s vypnutím Classicu bez odstranění nativní mapy.

| Okno | PM10 iframe viewport = scroll | Mapová oblast |
| --- | --- | --- |
| 1280 × 800 | 1256 × 713 | 1244 × 564 |
| 800 × 600 | 776 × 485 | 764 × 372 |
| 390 × 844 | 368 × 644 | 356 × 564 |

Legenda celá v panelu; žádný stránkový přesah. Snímky z
`output/playwright/pm10-*.png` zůstávají lokální. Malá šířka je test
malého okna, ne potvrzení instalace na mobilním OS.
V dlouho otevřené relaci se objevily dva HTTP 500 z nativního
`/c/portal/extend_session`; mapové průchody přesto prošly. Nejde
o prohlášení bezchybnosti celé cizí stránky.

## Hranice

Další znečišťující látky, denní agregace, alternativní hydrologické
cesty ani tabulkové přehledy nejsou tímto obnovené. Samostatná instalace
Tampermonkey, Edge a Safari nebyla testována. GitHub vydání a ZIP
neznamenají zveřejnění či schválení aktualizace v Chrome Web Store.
