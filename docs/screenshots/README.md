# Snímky beta rozhraní

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
