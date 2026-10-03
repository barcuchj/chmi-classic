# Snímky beta rozhraní

## Aktuální instalovaná beta 24

Pořízeno 3. 10. 2026 ve skutečně instalovaném Chrome rozšíření, bez aktivního
Tampermonkey, v odděleném testovacím profilu při 1280 × 800 px. Pouze viewport,
bez osobních karet/adresního řádku; bez grafických úprav a kompozitů.

- `beta24-radar.png`: `https://www.chmi.cz/#classic=radar`, živá aplikace
  `https://produkty.chmi.cz/radar/`; ČHMÚ a © OpenStreetMap contributors.
- `beta24-webkamera.png`: živý detail
  `https://www.chmi.cz/namerena-data/webkamera/brno-brno` v portálu;
  snímky a měření ČHMÚ, kamera nese identifikaci výrobce v obrazu.
- `beta24-mesicni-pdf.png`: živé oficiální PDF
  `https://www.chmi.cz/documents/d/chmi.cz/mesicni-2` z měsíčního výhledu,
  ČHMÚ, období 28. 9. až 25. 10. 2026. Zachycená data nejsou aktuální
  předpovědí pro každého dalšího čtenáře.

Rozsah testu a omezení: [QA beta 24](../qa-beta24.md). Snímky lze použít jako
uživatelské ukázky; samy neprokazují obnovu všech aplikací ani schválení Store.
MIT licence kódu se nevztahuje automaticky na data, značky a mapové podklady.

## Starší vývojové snímky

Pořízeno 20. 9. 2026 ve vestavěném prohlížeči, při kontrole okna 1440 × 900.
Snímky nebyly graficky upravované a neobsahují osobní karty ani adresní řádek.

- `portal-radar.png`: portál na https://www.chmi.cz/ s živou aplikací
  https://produkty.chmi.cz/radar/ v centrálním rámci. Podkladová mapa:
  © OpenStreetMap contributors; údaje a radarové produkty: ČHMÚ.
- `meteosat-expanded.png`: živý prohlížeč https://produkty.chmi.cz/druzice/
  ve zvětšeném panelu; MTG, zdroj EUMETSAT, zpracování ČHMÚ. Zdroj a čas
  zachované přímo ve snímku.

Obrázky dokumentují funkci neoficiální uživatelské úpravy. Licence MIT vlastního
kódu projektu se nevztahuje automaticky na meteorologické podklady, mapy,
značky a ostatní obsah třetích stran zachycený na obrazovce.

## Co bylo ověřeno

Vygenerovaný userscript `0.7.0-beta.1` byl při vývojové kontrole dočasně vložen
do skutečných stránek a jejich rámců. Nebyla tím provedena instalace
Tampermonkey ani rozšíření do uživatelova prohlížeče.

- Radar uvnitř rámce 1416 × 629: výška i šířka dokumentu se shodovaly s rámcem;
  stupnice končila 22 px nad dolním okrajem mapy, nebyla oříznutá.
- Meteosat: nativní aplikace odstranila doplňkové query parametry; rozpoznání
  vložené aplikace přesto fungovalo přes jméno rámce.
- Zvětšení a návrat zachovaly tentýž rámec bez nového načítání aplikace.
- U velkého panelu zůstaly mapa a základní ovládání v okně. V menším panelu
  či po rozbalení podrobností může být nutné posouvání pouze pravého panelu.

Dosud zbývá ověřit skutečně instalovaný userscript, automatické spouštění ve
všech rámcích, další aplikace a všechny cílové prohlížeče. Samotné screenshoty
nejsou důkazem dokončení celého portálu ani ověření správnosti předpovědí.
