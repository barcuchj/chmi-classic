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

## Další tři položky rozcestníku — 28. 10. 2026

Autor/instituce: Český hydrometeorologický ústav. Živé zdroje ověřeny
28. 10. 2026 ve skutečném prohlížeči; datum kontroly není datum vydání dat.

- [Vývoj kůrovce](https://www.chmi.cz/predpoved-pocasi/rizika/vyvoj-kurovce):
  nativní mapa `rizika.kurovce-vyvoj`, vrstva 504, datum 27. 10. 2026.
  Nepřejmenovávat na předpověď rojení ani nepřidávat vymyšlenou časovou osu.
- [Cheb – Vývoj profilu větru](https://www.chmi.cz/letectvi/aerologicka-data/11406-cheb-vyvoj-profilu-vetru)
  a [Doksany – Vývoj profilu větru](https://www.chmi.cz/letectvi/aerologicka-data/11509-doksany-vyvoj-profilu-vetru):
  oficiální konfigurace `letectvi.WindProfileDev/11406` a `/11509`,
  dekódované grafy 1000 × 400 a původní 12kroková osa. Měřený produkt je
  odlišný od modelové pseudosondáže. Doksanský cíl byl odečten ze živého
  nativního menu, nikoli odvozen změnou čísla stanice.
- [Windprofilery](https://www.chmi.cz/letectvi/aerologicka-mereni/windprofilery?zalozka=windprofilery):
  oficiální přehled pro další stanice, bez tvrzení o jejich obnově.
- [Nalezli jste radiosondu?](https://www.chmi.cz/letectvi/aerologicka-mereni/nalezli-jste-radiosondu):
  živý původní článek, pět ilustrací, kontaktní odkazy a původní lightbox.

Způsob použití: pouze URL, názvy a vlastní lokální úprava DOM/CSS.
Meteorologická data, obrázky, text článku a cizí JS/CSS se do distribuovaného
balíčku nekopírují. Nevytváří se náhradní formulář ani sběr osobních údajů.
Licence cizího obsahu se z veřejné dostupnosti neodvozuje; původní označení
zdrojového webu a jeho licenční informace nejsou změněny.

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

- Ikona doplňku: původní neutrální ikona projektu vytvořená v Classic chatu,
  dodaná v `chmi-classic-chrome-web-store-assets.zip` dne 22. 9. 2026.
  Identický zdroj 128 × 128 px a zmenšené varianty jsou v `chrome-edge/icons/`.
  Nejde o převzetí oficiálního loga ČHMÚ; původ popisuje přiložené README.

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
