# Archivní průzkum starých meteorologických výstupů ČHMÚ

Průzkum pro ČHMÚ Classic 0.6.0, provedený 11. 9. 2026 a doplněný 13. 9. 2026.

## Metoda a omezení

Cílem bylo systematicky zmapovat staré veřejné meteorologické aplikace a výstupy
ČHMÚ, zejména pod historickými cestami:

- `intranet.chmi.cz/files/portal/docs/meteo/`
- `portal.chmi.cz/files/portal/docs/meteo/`
- starými portálovými cestami `intranet.chmi.cz/aktualni-situace/`,
  `intranet.chmi.cz/predpovedi/` a `intranet.chmi.cz/historicka-data/`.

Použity byly konkrétní snapshoty Wayback Machine, indexované původní stránky
ČHMÚ, stará homepage a sitemap, a současné oficiální náhrady. Z tohoto runtime
nebylo možné spolehlivě získat CDX seznam všech zachycení ani stáhnout úplný
strom historických CSS/JS/obrázků pro každou aplikaci. Proto jsou přesné Wayback
timestampy uvedeny jen tam, kde byly skutečně ověřeny. U ostatních položek je
výslovně uvedeno `timestamp neověřen` a odkaz vede buď na původní endpoint, nebo
na Wayback index dané ověřené historické URL.

Projekt **nekopíruje archivní CSS/JS, mapové podklady ani meteorologické
obrázky**. `legacy.css` a `legacy.js` jsou vlastní doložená adaptace: zachovávají
DOM, datový backend a ovládání původní stránky, pokud ještě existují, a přidávají
jen společnou navigaci a responzivní geometrii. Tím se zároveň vyhýbáme
kopírování assetů s nejasnou nebo restriktivní licencí.

## Mapa historických cest

| Oblast | Doložené historické cesty / aplikace | Stav v 0.6.0 |
| --- | --- | --- |
| Radar | `meteo/rad/inca-cz/short.html`, `meteo/rad/data.html`, starší `data_jsradview.html` | konkrétní Wayback snapshot INCA + legacy/static odkazy |
| Družice MSG | `meteo/sat/data_jsmsgview.html`, `meteo/sat/msg_hrit/...` | konkrétní Wayback snapshot + přímý VIS-IR JPG adresář |
| Polární družice | `meteo/sat/data_jsavhrrview.html`, NOAA/METOP AVHRR adresáře | konkrétní Wayback snapshot; data se nevkládají do projektu |
| ALADIN | `meteo/ov/aladin/alanim/alanim.html`, `meteo/ov/aladin/results/ala.html` | legacy endpoint + Wayback index + současná náhrada |
| Meteogramy | `meteo/ov/aladin/results/public/meteogramy/mhtml/m.html` | legacy endpoint + Wayback index + současná náhrada |
| Webkamery | `meteo/kam/`, `meteo/kam/prohlizec.html` | legacy endpoint + Wayback index, bez kopie fotografií |
| Blesky | `meteo/blesk/data_jsceldnview.html`, `meteo/blesk/data.html`, `meteo/blesk/data/` | legacy viewer/static stránka + přímý PNG adresář |
| Letecké ALADIN/WMO | `meteo/olm/` a portálové cesty `/predpovedi/.../letecke/` | konkrétní legacy textové výstupy + současné letecké náhrady |
| Klementinum | `meteo/ok/klementinum/klemzaklinfo_cs.html`, portál `/historicka-data/pocasi/praha-klementinum` | legacy tabulka + starý portál + současná náhrada |
| Stanice | portál `/aktualni-situace/.../stanice/...` | staré mapy, tabulky/grafy a staniční detail v katalogu |
| Aerologie | portál `/.../vertikalni-profily-vetru`, `/.../sondazni-mereni/...` | legacy odkazy + současná aerologie |
| Synoptika | portál `/.../evropa/vyskove-analyzy`, stará synoptická navigace | legacy výškové analýzy + současná synoptika |
| Historie | `/historicka-data/pocasi/...` | fronty, Klementinum, mapy stanic, měsíční přehledy |

## Konkrétní Wayback snapshoty

| Produkt | Původní URL | Wayback timestamp | Co bylo ověřeno | Licence / původ | Použití v projektu |
| --- | --- | --- | --- | --- | --- |
| Radar INCA / nowcasting | `https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html` | `20260816180503` | `Dle okna`, `Zoom 4x`, `GoogleMaps`, animace, navigace, nastavení, poslední snímek; Wayback uvádí 19 captures 2020-10-27 až 2026-08-16 | Autor RNDr. Petr Novák Ph.D., ČHMÚ; stránka uvádí CC BY-NC-ND 3.0 CZ | pouze referenční struktura a konkrétní archivní odkaz; žádný kód/asset nekopírován |
| Meteosat MSG | `https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html` | `20260210150546` | IR, IR BT, VIS-IR, WV, Airmass, 24h-M, Night-M, animace, překreslení 1/2/3, navigační kříž | © ČHMÚ & EUMETSAT; snímky dle podmínek EUMETSAT; hranice ArcČR/ARCDATA PRAHA/ZÚ/ČSÚ | referenční struktura + konkrétní archivní odkaz; žádné satelitní snímky v balíku |
| Polární AVHRR | `https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html` | `20260614095513` | b1–b4, b4BT, rgb124, NM a regionální varianty | © ČHMÚ; METOP dle EUMETSAT; ostatní obsah stránky uvádí CC BY-NC-ND 3.0 CZ | referenční struktura + konkrétní archivní odkaz; žádné snímky v balíku |
| ALADIN animace | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html` | `20260210160917` | HTML obsahuje volby produktu, průhlednosti, rychlosti, posledního snímku, navigačního kříže a velikosti `1x / var / 4x / gmaps` | původní stránka ČHMÚ; historické CSS/JS se nekopírují | ověřený HTML snapshot + vlastní old-look adaptace |
| ALADIN animace – parametrizované nastavení | stejná URL s parametry `display=var`, `prod=prec`, `lat=50.008`, `lon=14.447` | `20260512092211` | archiv zachycuje uložené nastavení Praha-Libuš; stránka uvádí přednost parametrů URL před cookies | původní stránka ČHMÚ | parametrizovaný archivní odkaz v katalogu; žádná data se nebalí |
| ALADIN mapy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html` | `20260512090206` | inline JavaScript načítá běhy z `public/mapy/mdirs.txt` a skládá mapy z produktů a termínů | původní stránka ČHMÚ; mapové PNG nejsou součástí projektu | ověřený HTML snapshot + vlastní adaptace |
| ALADIN meteogramy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html` | `20260614103003` | HTML/JS načítá `data/mdirs.txt`, potom `<run>/nameid` a nakonec `<run>/<place-id>.png`; hash obsahuje název lokality | původní stránka ČHMÚ; snímky a historické knihovny se nekopírují | ověřený HTML snapshot, příklad hashe Prostějov a vlastní navigace |

## Doplněná analýza HTML a zdrojových cest ALADINu

Wayback index pro [historickou větev `meteo/ov/*`](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/*) aktuálně uvádí 22 zachycených URL. Kromě HTML jsou v něm doloženy také `ala.css`, logo, jQuery, `meteogram.css`, jQuery UI a `filterlist_min.js`; historické datové seznamy a PNG jsou zachyceny jen částečně.

Z ověřeného HTML vyplývá:

- **ALADIN animace** používá staré volby `Teplota ve 2 m`, `Srážky celkové za 3 h`, `Vítr v 10 m`, `Nárazy větru`, `Oblačnost`, `Relativní vlhkost`, `Ventilační index`, dále průhlednost, velikost `proměnná dle okna`, `4x` a `GoogleMaps`, rychlost animace, poslední snímek, navigační kříž, kruhy a geolokaci.
- **ALADIN mapy** mají checkboxy pro veličiny a volbu `Vše`; mapová tabulka se skládá z běhu modelu a řad `00` až `72` po 3 hodinách. Zdrojová cesta je `.../results/public/mapy/data/<run>/<produkt>_public_<termín>.png` a seznam běhů je `.../results/public/mapy/mdirs.txt`.
- **Meteogramy** mají starý filtr `Vše / Obce / Letiště / ČHMÚ místa / Lyžařská střediska / Vodní plochy`. Výchozí textová lokalita je `Praha (okr. Praha)`; URL hash se používá pro textový název lokality a po načtení `nameid` se převede na ID PNG. Ověřený tvar odkazu je například [Prostějov (okr. Prostějov)](https://www.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)).
- Archivní HTML proto používáme jako zdroj chování a navigace. `legacy.js`/`legacy.css` nepřebírají historický JavaScript, jQuery, CSS, mapové podklady ani meteorologické snímky; zachovávají současný backend a přidávají jen vlastní rozhraní.

Parametrizovaný [archivní preset Praha-Libuš](https://web.archive.org/web/20260512092211/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html?display=var&gmap_zoom=7&prod=prec&opa1=0.81&opa2=1&nselect=73&nselect_fct=undefined&di=1&rep=3&add=4&update=5&lat=50.008&lon=14.447&lang=CZ) je v katalogu jako samostatná archivní položka. Je to reprodukovatelný odkaz na staré nastavení, nikoli tvrzení, že Wayback obsahuje celý živý datový backend.

## Rekonstrukce staré homepage: POČASÍ / VODA / OVZDUŠÍ

Referenčním bodem je [snapshot starého intranetu z 25. 8. 2026](https://web.archive.org/web/20260825190437/https://intranet.chmi.cz/). Homepage sama neobsahuje všechny tři aplikace jako jeden statický dokument. Po volbě záložky zavolá společný loader `loadstatic()` a vloží do příslušného panelu samostatné HTML:

- **POČASÍ:** `files/portal/docs/meteo/map_meteo_portal/CR.html`, legenda `PredIco.html` a rozcestník `weather-links.html`;
- **VODA / HYDROLOGIE:** `files/portal/docs/hydro/hydro_map.html`; legenda a odkazy jsou součástí panelu;
- **OVZDUŠÍ:** `files/portal/docs/uoco/map_uoco_portal/air.html`, legenda `legend.html` a rozcestník `airqual-links.html`.

Záložky používají stav `?tab=0`, `?tab=1` a `?tab=2` a při přepnutí volají `tab_switch(tab_def, index)`. To potvrzuje, že rekonstrukce rozcestníku může zachovat staré chování bez kopírování celého historického backendu: společná hlavička a tři záložky jsou vlastní rozhraní, zatímco jednotlivé panely se odkazují na doložené živé nebo archivní zdroje.

Pro panel POČASÍ existují ve Waybacku konkrétní zachycení [mapy ČR a jejích assetů](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/*). U [hydrologické větve](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/hydro/*) se podařilo najít historické hydro výstupy, ale ne samostatný snapshot `hydro_map.html`. U [větve ovzduší](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/*) jsou dostupné především zprávy, grafy a PDF; samostatný archivní `map_uoco_portal/*` nebyl ověřen.

Implementace proto v této etapě přidává do katalogu přesné vstupní cesty pro všechny tři panely, jejich archivní indexy a současné oficiální náhrady. Nevydává nedoložený hydro/air viewer za funkční rekonstrukci; takové položky lze zobrazit jako `Nedostupné` do doby, než bude ověřen zdrojový panel a jeho datový tok.

## Další doložené historické aplikace a výstupy

`Wayback timestamp` je `neověřen`, pokud dostupné rozhraní neposkytlo bezpečně
otevřitelný konkrétní snapshot. To neznamená, že ve Wayback Machine není; projekt
v takovém případě nabízí pouze Wayback index původní URL.

| Produkt | Původní URL | Wayback timestamp | Stav / důkaz | Současná náhrada | Způsob použití |
| --- | --- | --- | --- | --- | --- |
| ALADIN animace (`alanim`) | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html` | `20260210160917` | ověřený HTML snapshot; historická data a některé JS assety mohou chybět | `https://produkty.chmi.cz/aladin/` | legacy shell + přímý snapshot + archivní index |
| ALADIN mapy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html` | `20260512090206` | ověřený HTML snapshot; mapy se skládají z dynamických PNG podle běhu a termínu | `https://produkty.chmi.cz/aladin/` | legacy shell + přímý snapshot + archivní index |
| ALADIN meteogramy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html` | `20260614103003` | ověřený HTML snapshot; výběr místa vyžaduje dynamické `mdirs.txt`/`nameid`/PNG | současné meteogramy na `www.chmi.cz` | legacy shell + přímý snapshot + archivní index |
| Webkamery – přehled | `https://intranet.chmi.cz/files/portal/docs/meteo/kam/` | neověřen | starý celorepublikový přehled s filtry | `https://www.chmi.cz/namerena-data/webkamery` | legacy shell; fotografie se nekopírují |
| Webkamera – detail | `https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html` | neověřen | historický viewer s animací, posledním snímkem a meteo informacemi | současné webkamery | legacy shell; bez smyšleného `cam=` parametru |
| Blesky JSCeldnView | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html` | neověřen | historický interaktivní prohlížeč doložen | současný radar/blesky | legacy shell + Wayback index |
| Blesky – statická stránka | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html` | neověřen | původní statický výstup | současný radar/blesky | legacy shell |
| Blesky – PNG adresář | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data/` | neověřen | indexovaný oficiální adresář obsahoval `aktual.png` i timestampované PNG | současný radar/blesky / Open Data | pouze přímý odkaz; nic se nehardcoduje jako „nejnovější“ |
| Radar – statická stránka | `https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html` | neověřen | původní sloučený radarový obrázek + odkaz na viewer | `https://produkty.chmi.cz/radar/` | legacy shell |
| Meteosat VIS-IR JPG | `https://intranet.chmi.cz/files/portal/docs/meteo/sat/msg_hrit/img-msgeu-1160x800-vis-ir/` | neověřen | veřejný index obsahoval timestampované JPG po 15 min | současný Meteosat | pouze přímý adresář; obrázky se nebalí |
| Aktuální mapy | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy` | neověřen | starý rozcestník aktuálních map, radar+srážkoměry, ozon/UV a sníh | současná naměřená data | legacy portálový rám |
| Srážky radar+srážkoměry | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery` | neověřen | konkrétní historická stránka | současný radar/nowcast | legacy portálový rám |
| Ozonové a UV zpravodajství | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi` | neověřen | konkrétní historická stránka s UV indexem | současný web ČHMÚ | legacy portálový rám |
| Družicové měření ozonu | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Vertikální profil ozonu | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu` | neověřen | konkrétní historický sondážní výstup | současná aerologie | legacy portálový rám |
| Staniční data | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data` | neověřen | rozcestník map, tabulek a přehledů profesionálních stanic | současná data stanic | legacy portálový rám |
| Stanice – teplota/vlhkost | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota` | neověřen | konkrétní historická mapa | současná teplota | legacy portálový rám |
| Stanice – tlak | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu` | neověřen | konkrétní historická mapa | současná naměřená data | legacy portálový rám |
| Sněhové zpravodajství – hory | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Automatické sněhoměrné stanice | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Grafy automatických stanic | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic` | neověřen | stará stránka uvádí 10min data, aktualizaci po 30 min a neexistenci archivu grafů | současná naměřená data | legacy portálový rám |
| Synoptický detail Praha-Libuš | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus` | neověřen | synoptické veličiny v čase měření a -1/-2/-3 h | současná síť stanic | legacy portálový rám |
| Stanice – srážky/sníh | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky` | neověřen | historická mapa profesionální staniční sítě | současné srážkové mapy | legacy portálový rám |
| Stanice – vítr | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr` | neověřen | historická mapa větru | současná tabulka/mapy stanic | legacy portálový rám |
| Stanice – oblačnost/sluneční svit | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit` | neověřen | historická mapa | současná naměřená data | legacy portálový rám |
| Vertikální profily větru | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru` | neověřen | historický výstup explicitně potvrzen | současná aerologie | legacy portálový rám |
| Sondáž Praha-Libuš | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus` | neověřen | historická stránka observatoře | současná radiosondážní měření | legacy portálový rám |
| Výškové analýzy Evropa | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy` | neověřen | konkrétní stará stránka dohledána | současná synoptika / letecké výškové produkty | legacy portálový rám; bez náhradní falešné mapy |
| Přechody front přes Prahu | `https://intranet.chmi.cz/historicka-data/pocasi/prechody-front-pres-prahu` | neověřen | konkrétní historická stránka | současná stránka stejného tématu | legacy portálový rám |
| Klementinum | `https://intranet.chmi.cz/historicka-data/pocasi/praha-klementinum` | neověřen | starý portál uvádí základní data, stahování a rekordy | současné Klementinum + Open Data | legacy portálový rám |
| Klementinum – statická data | `https://intranet.chmi.cz/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html` | neověřen | statická tabulka základních dat/průměrů/rekordů | současné Klementinum | legacy shell |
| Historické mapy stanic | `https://intranet.chmi.cz/historicka-data/pocasi/mapy-stanic` | neověřen | konkrétní historická stránka | současná historická data | legacy portálový rám |
| Měsíční přehledy pozorování | `https://intranet.chmi.cz/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani` | neověřen | tabulkové měsíční teploty, srážky a další charakteristiky | současná historická data/Open Data | legacy portálový rám |
| Letecký ALADIN – oblačnost/srážky/RH | `https://intranet.chmi.cz/files/portal/docs/meteo/olm/p_oblbln.html` | neověřen | WMO bulletin ALADIN pro letiště | současné letecké produkty | legacy shell |
| Sportovní létání – text | `https://intranet.chmi.cz/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html` | neověřen | textová předpověď s konvekcí, základnou oblačnosti a výškovým větrem | současné letectví | legacy shell |
| Letecké námrazy | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100` | neověřen | konkrétní stará stránka | současné letectví | legacy portálový rám |
| Letecký SIGMET | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/sigmet` | neověřen | konkrétní stará stránka | současný SIGMET | legacy portálový rám |
| Letištní přízemní vítr/teplota/tlak | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen` | neověřen | starý ALADIN letištní bulletin | současné letectví | legacy portálový rám |
| Letištní oblačnost/srážky/RH | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost/` | neověřen | konkrétní stará stránka | současná nízká oblačnost/letectví | legacy portálový rám |

## Historická navigace – další doložené výstupy

Stará homepage a sitemap potvrzují, že uživatelé měli z jednoho rozcestníku
přístup také k následujícím kategoriím. Ne u všech se podařilo v této etapě
bezpečně získat samostatný archivní viewer se všemi assety:

- synoptická situace a synoptická předpověď;
- aktuální mapy a radarové odhady srážek;
- sněhová mapa, sněhový bulletin, automatické sněhoměrné stanice a zásoba vody;
- družicové měření ozonu a ozonové/UV zpravodajství;
- NOAA/polární družice;
- profesionální stanice – mapy, přehledy a tabulky;
- mapy CLIMAT, typizace povětrnostních situací a význačné počasí;
- meteorologické zprávy, tiskové zprávy a PDF dokumenty.

Tyto položky jsou v současném katalogu buď pokryty ověřenou živou náhradou,
konkrétním legacy endpointem, nebo označeny jako historické/nedostupné. ČHMÚ Classic nevytváří ovladač tam,
kde nebyl ověřen původní backend nebo archivní assety.

## Licence a provenance

1. **Radar INCA:** archivní stránka uvádí autora RNDr. Petra Nováka Ph.D.,
   Český hydrometeorologický ústav, a licenci CC BY-NC-ND 3.0 CZ. Projekt
   nekopíruje zdrojový kód ani obrazová data; používá stránku jako referenci.
2. **MSG:** archivní stránka uvádí © ČHMÚ & EUMETSAT a licenční podmínky
   EUMETSAT; hranice jsou připisovány ArcČR/ARCDATA PRAHA/ZÚ/ČSÚ. Projekt
   neobsahuje tyto snímky ani mapové podklady.
3. **AVHRR:** archivní stránka uvádí © ČHMÚ; METOP podléhá podmínkám EUMETSAT,
   ostatní uvedený obsah stránky odkazuje na CC BY-NC-ND 3.0 CZ. Snímky se
   nekopírují.
4. **Webkamery:** starý detail byl publikován s copyrightem ČHMÚ / All Rights
   Reserved. Projekt proto používá pouze odkazy a lokální adaptaci rozložení;
   archivní fotografie ani kód nejsou přebírány.
5. **Ostatní staré stránky:** pokud konkrétní licence nebyla na získaném výstupu
   spolehlivě doložena, považujeme obsah za cizí autorské dílo a nic z něj do
   projektu nekopírujeme. Použit je pouze faktický údaj o existenci/URL a vlastní
   CSS/JS adaptace.

## Stav starého serveru

ČHMÚ v únoru 2026 oznámil postupné utlumování starého systému a plánované úplné
ukončení `intranet.chmi.cz` na konci II. kvartálu 2026. Současně upozornil, že
již nelze garantovat aktuálnost ani úplnou funkčnost starých stránek. Proto je
v ČHMÚ Classic stav `Legacy` odlišen od `Živě` a každá podstatná legacy položka
má, pokud je známa, odkaz na současnou náhradu.

## Implementační důsledek

- `chrome-edge/legacy.js` rozpoznává konkrétní staré viewers pod
  `/files/portal/docs/meteo/` a všechny stránky původního portálu
  `intranet.chmi.cz` / `portal.chmi.cz`.
- `chrome-edge/legacy.css` uvolňuje pevné šířky, omezuje horizontální overflow,
  drží obrázky/canvas/iframe v dostupné šířce a u viewerů i výšce.
- Přidaný header obsahuje rychlou navigaci mezi současnými hlavními aplikacemi,
  katalogem, a u známých historických viewerů také `Aktuální náhrada` a
  `Web Archive`.
- Původní formuláře, výběry, časové osy, mapy, event handlery a backend se
  nemažou ani nenahrazují.
- Pokud původní server, DNS, archivovaný JS nebo datový backend nefunguje, projekt
  zobrazí pouze pravdivě označený odkaz; nevytváří simulovaná meteorologická data.
