# Podklady a původ

ČHMÚ Classic není oficiálním produktem Českého hydrometeorologického ústavu a
není s ČHMÚ spojen. Rozšíření neobsahuje meteorologická data ČHMÚ ani kopie
obsahu Internet Archive; pracuje s odkazy a s DOM živých stránek v uživatelově
prohlížeči.

## Hlavní živé referenční zdroje

Ověřeno pro implementaci verzí 0.5.0–0.6.0 dne 11. 9. 2026:

- Radar: <https://produkty.chmi.cz/radar/>
- Meteosat: <https://produkty.chmi.cz/druzice/>
- ALADIN: <https://produkty.chmi.cz/aladin/>
- Meteogramy obcí: <https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce>
- Webkamery: <https://www.chmi.cz/namerena-data/webkamery>
- Naměřená data: <https://www.chmi.cz/namerena-data>
- Aktuální teplota: <https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota>
- Radar a blesky: <https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky>
- Synoptická situace: <https://www.chmi.cz/predpoved-pocasi/synopticka-situace>
- Historie synoptických situací: <https://www.chmi.cz/predpoved-pocasi/synopticke-situace-v-minulosti>
- Letecká meteorologie: <https://www.chmi.cz/letectvi>
- METAR/SPECI: <https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/zpravy-metar-speci>
- SIGMET a výstrahy: <https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste>
- TAF: <https://www.chmi.cz/letectvi/textove-predpovedi-pro-letani/predpovedi-taf>
- SWL: <https://www.chmi.cz/letectvi/predpovedi-pro-letani/swl-mapa>
- Nízká oblačnost: <https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti>
- Výškový vítr 2000 ft: <https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-vysku-2000ft>
- Výškový vítr FL050: <https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050>
- Radiosondáže: <https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni>
- Aerologická měření / pseudosondáže: <https://www.chmi.cz/letectvi/aerologicka-mereni>
- Klementinum: <https://www.chmi.cz/namerena-data/historicka-data/klementinum>
- Přechody front: <https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu>
- Historické mapy srážek: <https://www.chmi.cz/namerena-data/historicka-data/mapy-srazkovych-uhrnu>
- Open Data: <https://opendata.chmi.cz/>

## Archivní referenční zdroje

- Starý radar INCA:
  <https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html>
- Starý prohlížeč MSG:
  <https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html>
- Starý prohlížeč AVHRR:
  <https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html>
- Starý ALADIN animace/mapy/meteogramy, webkamery a CELDN: jsou evidovány
  konkrétní původní URL a obecné Wayback indexy; přesný snapshot se netvrdí,
  pokud nebyl z dostupného rozhraní ověřen.
- Stará homepage a sitemap `intranet.chmi.cz`: použity pro doložení historické
  taxonomie výstupů a původních vazeb mezi aplikacemi.
- Doložené staré portálové endpointy stanic, ozonu, sněhu, synoptiky, historie
  a letectví jsou odkazy/provenience; jejich HTML/CSS/JS není součástí projektu.

Archivní položky jsou v UI označeny `Archiv` a nesmějí být interpretovány jako
aktuální meteorologická data.

## Další vývojové reference

- Apple – Safari Web Extensions:
  <https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari>

## Způsob použití

ČHMÚ Classic přidává lokální CSS, navigaci a pomocné ovladače. Kde ovládá
existující aplikaci (např. radar nebo ALADIN preset), vyvolává původní
formulářové prvky/eventy stránky ČHMÚ. Neobchází autentizaci, cookies ani jiná
přístupová omezení a neobnovuje vypnutý server `intranet.chmi.cz`.

## Archivní licence a vlastní adaptace 0.6.0

- INCA snapshot uvádí autora RNDr. Petra Nováka Ph.D., ČHMÚ, a CC BY-NC-ND 3.0 CZ.
- MSG stránka uvádí © ČHMÚ & EUMETSAT a další původ mapových hranic; satelitní snímky se nekopírují.
- AVHRR stránka uvádí © ČHMÚ; METOP podléhá podmínkám EUMETSAT; obrazová data se nekopírují.
- U starých webkamer byla zjištěna restriktivní copyrightová poznámka; fotografie ani původní kód se proto nepřebírají.
- Pokud nebyla konkrétní licence historického HTML/CSS/JS bezpečně doložena, ČHMÚ Classic přebírá jen faktické URL/názvy a používá vlastní `legacy.css` / `legacy.js`.

Detailní tabulka URL, timestampů, stavu a způsobu použití je v `ARCHIVE_RESEARCH.md`.
