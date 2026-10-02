# Archivní průzkum starých meteorologických výstupů ČHMÚ

Průzkum zahájený pro ČHMÚ Classic 0.6.0 dne 11. 9. 2026; podklady průběžně
doplňované pro rekonstrukci portálu 0.7, naposledy 26. 9. 2026.

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

Distribuovaný userscript **nepřebírá archivní CSS/JS, mapové podklady ani
meteorologické obrázky**. Lokálně stažené reference jsou oddělené v ignorovaném
`.build/archive-reference-*`, s původem a hashi; nejde o součást MIT balíčku.
`legacy.css` a `legacy.js` jsou vlastní doložená adaptace: zachovávají
DOM, datový backend a ovládání původní stránky, pokud ještě existují, a přidávají
jen společnou navigaci a responzivní geometrii. Tím se zároveň vyhýbáme
kopírování assetů s nejasnou nebo restriktivní licencí.

## Krajské předpovědi (ověřeno 1. 10. 2026)

[Archivní Karlovarský kraj z 25. 8. 2026](https://web.archive.org/web/20260825190505/https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/ceska-republika/kraje/karlovarsky)
ve vestavěném prohlížeči ukazuje modrou levou nabídku 14 krajů, červený
nadpis kraje a šedý obsahový panel. Dynamické tělo předpovědi v tomto
zachycení chybí; nelze je z archivu přebírat jako fungující obsah.
[Živá krajská předpověď ČHMÚ](https://www.chmi.cz/predpoved-pocasi/karlovarsky-kraj/dnes)
poskytuje skutečný text a odkazy pro všech 14 krajů a dny dnes, zítra,
pozítří a další dny. Praha byla zvlášť ověřena pro zítřek. Beta 22 proto
rekonstruuje uspořádání a navigaci, ale ponechává současný oficiální text.
Archivní CSS, skripty ani obrazové podklady se do veřejného balíčku nekopírují.

## Mapa historických cest

### Další skutečně stažené HTML (26. 9. 2026)

V `.build/archive-reference-20260926/information/` jsou tři ověřená HTTP 200
replay HTML: Sucho (`20260414052018`, 18358 B), synoptická předpověď
(`20260505091557`, 11306 B) a ranní stavy vody (`20260809150458`, 17273 B).
První je přehled pěti témat s archivy, druhý panel map 36/60/84 h, třetí
hydrologická tabulka, nikoli obecná meteorologická předpověď. Mapy se
v browseru načetly, nebyly staženy do projektu. Žádný vlastní externí JS
v těchto třech HTML; hydrologický CSS požadavek vrátil 404. Přesná kódování,
hashe, URL a omezení jsou v `information/MANIFEST.md`.

Přesná query varianta výstrahového `layers.json` vrátila pouze HTTP 200
HTML obal Waybacku. Pokus otevřít jeho doložený JSON playback rámec browser
zablokoval; konfigurace nebyla získána. Ostatních pět konfigurací tím není
ověřeno jako nedostupných. Blokátor nebyl obcházen jiným kanálem.

### Úplný aktuálně zobrazený URL index (26. 9. 2026)

V lokální složce `.build/archive-reference-20260926/indexes/` jsou dva
ověřené JSON exporty viditelných tabulek Wayback: 290 unikátních URL prefixu
`meteo/*` na šesti stranách a 22 URL `meteo/ov/*` na jedné straně. OV je
podmnožina meteo, celkem tedy 290, nikoli 312. Index klasifikuje 59 HTML,
18 JS a 17 CSS; tyto počty zahrnují varianty a knihovny a nejsou počty
stažených či funkčních aplikací. Jde o odvozený DOM export, nikoli CDX
odpověď. Kompletní je zobrazená tabulka daného HTTPS prefixu, ne celý archiv.
Původ, přesné velikosti, hashe a omezení jsou v `indexes/MANIFEST.md`.

Stejná dávka obsahuje dvě HTTP 200 HTML reference: informační stránku SIVS
(`20260220075858`, 25353 B) a promo fragment na URL agropočasí
(`20260825190444`, 17399 B). Druhý má titul „Den otevřených dveří“ a odkazy
na agropocasi.cz/HAMR; není to získaná aplikace agropočasí. Žádný vlastní
externí JS/CSS těchto dvou dokumentů nebyl nalezen. Kód ani obrázky nebyly
začleněny do userscriptu.

Nový index dokládá **přesné query varianty šesti konfigurací výstrah**
`layers/texts/download-cap/download-audio/global/popup.json`. Dřívější 404
jiných požadavků nevylučují tato zachycení; jejich těla se mají teprve ověřit.
URL index sám není důkaz úspěšného stažení. Oba levní subagenti v této dávce
neměli dostupný IAB; rodič proto provedl uvedená stažení přímo.

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
- **Srovnání se živým ALADINem (23.–30. 9. 2026):** [oficiální aplikace](https://produkty.chmi.cz/aladin/) v nabídce „Veličiny“ skutečně nabízí mj. relativní vlhkost (`H`) a ventilační index (`V`), vedle teploty, srážek, větru, oblačnosti a dalších produktů. „Nárazy větru“ v zobrazené aktuální nabídce nebyly. Klasický adaptér `chrome-edge/aladin.js` zrcadlí všech 11 doložených nativních checkboxů `T/R3/W/C/Cl/Cm/Ch/H/V/Txn/R24`; mapový režim má výchozí čtyři `T/C/R3/W`, animační jednu `T`. Rozložení se odvozuje od počtu vybraných map. Beta13 přidává přehrávání nativních tříhodinových termínů na samostatné adrese s parametrem `chmi_classic_animation=1`, který se ve živém ALADINu zachoval; nejde o původní backend ani kompletní starý animační viewer. Archivní snapshot při otevření neměl načtené meteorologické snímky (`XX.XX.XXXX`, prázdný seznam), takže jeho datovou funkci nelze považovat za ověřenou. Živá vývojová kontrola současného userscriptu a instalační test jsou rozlišené v `TODO.md`.
- **ALADIN mapy** mají checkboxy pro veličiny a volbu `Vše`; mapová tabulka se skládá z běhu modelu a řad `00` až `72` po 3 hodinách. Zdrojová cesta je `.../results/public/mapy/data/<run>/<produkt>_public_<termín>.png` a seznam běhů je `.../results/public/mapy/mdirs.txt`.
- **Meteogramy** mají starý filtr `Vše / Obce / Letiště / ČHMÚ místa / Lyžařská střediska / Vodní plochy`. Výchozí textová lokalita je `Praha (okr. Praha)`; URL hash se používá pro textový název lokality a po načtení `nameid` se převede na ID PNG. Ověřený tvar odkazu je například [Prostějov (okr. Prostějov)](https://www.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)).
- Archivní HTML proto používáme jako zdroj chování a navigace. `legacy.js`/`legacy.css` nepřebírají historický JavaScript, jQuery, CSS, mapové podklady ani meteorologické snímky; zachovávají současný backend a přidávají jen vlastní rozhraní.

Parametrizovaný [archivní preset Praha-Libuš](https://web.archive.org/web/20260512092211/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html?display=var&gmap_zoom=7&prod=prec&opa1=0.81&opa2=1&nselect=73&nselect_fct=undefined&di=1&rep=3&add=4&update=5&lat=50.008&lon=14.447&lang=CZ) je v katalogu jako samostatná archivní položka. Je to reprodukovatelný odkaz na staré nastavení, nikoli tvrzení, že Wayback obsahuje celý živý datový backend.

### Meteogramy: ověřený rozdíl mezi archivem a současnou úpravou (26. 9. 2026)

Lokální `raw/m.html` v `.build/archive-reference-20260920` obsahuje výběr
lokality a kategorií, výběr běhu modelu s nejnovějším jako první položkou,
vyhledávání s mazáním a rozšířenými volbami a čtyři poslední navštívené
lokality uložené v cookies. Konkrétní reference: `Cook`/`lastvisit` na řádcích
109–230, sestavení obrázku na 233–238, naplnění míst a běhů na 290–402 a
formulář na 503–533. Zobrazení používalo PNG daného běhu a místa, nikoli
současný interaktivní graf.

`chrome-edge/meteogram.js` uspořádává současné nativní vyhledávání, graf a
hodinové tabulky. Beta 9 přidává čtyři poslední navštívená místa do místního
úložiště prohlížeče, jen jako ověřené odkazy na živé meteogramy ČHMÚ; nejde
o kopii historických cookies. Dne 28. 9. 2026 byl ve vestavěném prohlížeči
ověřen živý výběr Prostějov → Brno a vykreslení grafu na nové adrese.
Kategoriální filtr a starý výběr běhu nejsou doplněné. Z podkladů nelze
prokázat dostupnost historických kategorií a starších běhů v současném
backendu; tyto funkce nesmí být označené jako hotové ani nahrazené
nefunkčními ovladači.

## Stažené zdroje webkamer (26. 9. 2026)

Ve vestavěném prohlížeči byl znovu načten [přehled kamer z 14. 6. 2026](https://web.archive.org/web/20260614102253/https://intranet.chmi.cz/files/portal/docs/meteo/kam/).
HTML i načtené `js/index.js` a `styles/style_new.css` měly HTTP 200;
skript a stylopis pocházejí ze zachycení 19. 1. 2026, nikoli z data HTML.
Těla odpovědí byla přes viditelné download odkazy stažena do lokálních souborů
a ověřena velikostí a SHA-256. Spolu s vykresleným HTML detailu Lysé hory
jsou uložená v `.build/archive-reference-20260926/webcams/`; [manifest](.build/archive-reference-20260926/webcams/MANIFEST.md)
obsahuje přesné URL, původ, rozdíl HTTP replay/DOM exportu, hashe a omezení.

Přehled dokládá filtry kraj/pobočka, osm způsobů řazení, animované/statické
náhledy, obnovu 1/5/10/15/30 minut nebo vypnuto a odkaz na aktuální nastavení.
`index.js` je komprimovaný skript s `eval(...)` a Wayback wrapperem; nebyl
lokálně vykonán ani začleněn. `webcams.json` při načtení vracel HTTP 404,
takže stažené zdroje nedokazují funkční seznam kamer ani fotografie.

Detail odkazuje na `prohlizec_v2.js` a `prohlizec_v2.css`, které zatím nebyly
získány (CSS 404, v detailu chybějící funkce vieweru). Copyright přehledu
ČHMÚ 2021 a detailu 2022 výslovně uvádí „ALL RIGHTS RESERVED“; reference
nejsou určeny k veřejnému přebalení pod MIT. Dostupné ovladače mají sloužit
vlastní rekonstrukci napojené na ověřená současná data.

**Rozdíl oproti současnému adaptéru:** `chrome-edge/webcams.js` upravuje
rozložení nativní mapy, seznamu a přehrávače. Nemá vlastní staré ovladače pro
kraj/pobočku, uvedené osmisměrné řazení, animovaný/statický přehled, interval
obnovy ani uložené nastavení v odkazu. Neznamená to, že současná aplikace
žádné filtry nemá; jejich skutečnou podobu a data je potřeba zkontrolovat živě
a zrcadlit doložené možnosti. Historické CSS rozlišuje `.obrazek_anim` a
`.obrazek_static` (řádky 20–35); původní přehled tedy nebyl pouze dnešní
mapou v jiném barevném rámu.

**Živý průchod současnými kamerami (26. 9. 2026):** [přehled](https://www.chmi.cz/namerena-data/webkamery)
ve vestavěném prohlížeči načetl 98 kamer a 14 krajů. Nativní volba
Jihomoravského kraje zúžila seznam na pět položek; kliknutí na Brno otevřelo
funkční detail se skutečným snímkem 1600 × 1200 px a 433 dostupnými časy po
pěti minutách. Posun osy načetl jiný snímek z oficiálního zdroje (HTTP 200),
spuštění i zastavení animace skutečně změnilo stav a index. Počet snímků a
časové rozpětí jsou okamžitý stav při kontrole. [Lokální živá reference](.build/archive-reference-20260926/webcams/LIVE_REFERENCE.md)
obsahuje přesné pozorované endpointy, schéma bez obrazových dat, průchod a
omezení; nejsou to odhadnuté API cesty.

Nativní filtr kraje lze zachovat/zrcadlit; současná ID se liší od starých
písmen. V pozorovaných ovladačích nebyla pobočka, staré řazení, přepínač
animovaného přehledu nebo interval obnovy a navigační odpověď neobsahuje
nadmořskou výšku ani pobočku. Případná další metadata bodu mapy se ještě musí
ověřit. Detail Brna neobsahoval odkaz na graf měření. Nativní přehrávač je
označený `aria-hidden/aria-disabled`; klávesový test neprošel, přímé ovládání
viditelného slideru ano. Tato kontrola **není instalační ani layoutový test
userscriptu** a nedokazuje dokončenou rekonstrukci starých ovladačů.

## Stažený viewer blesků (26. 9. 2026)

Živý podklad ověřen 29. 9. 2026: oficiální stránka
`https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky` má
interaktivní vrstvu **Radar a Blesky**; její zapnutí změnilo v adrese parametr
`l` přidáním `blesky`. Pokročilý
`https://produkty.chmi.cz/radar/` nabízí produkt **radar MAX Z(mask) + blesky**
a samostatné průhlednosti radarové a bleskové vrstvy. Jde o živé překrytí
radaru a blesků, ne o důkaz samostatného historického CELDN prohlížeče.
Ovladač pro uložení nastavení jako záložku nebyl použit; trvalá sdílitelná
adresa samotných blesků zatím není ověřená.

Vývojové ověření 30. 9. 2026: v živém pokročilém radaru má `#select_prod`
hodnotu `maxz_mask-li`; `#input_opa_slider_data1` a
`#input_opa_slider_data2` opravdu mění zvlášť průhlednost radarového a
bleskového snímku. Při nastavení 0/1 zůstává načtená oficiální vrstva
`/radar/input_data/blesk/` a radarový obraz se skryje. Nativní seznam
vybraných měření je řazen od nejnovějšího, časový posuvník od nejstaršího;
poslední předpovědní pozice nemají bleskový obraz. Proto adaptace volí poslední
měřenou pozici, u které seznam obsahuje bleskový soubor. To je doložený
uživatelský preset nad současnou aplikací, ne přenesený historický CELDN
backend ani oficiální deep link. Zobrazení hotového userscriptu/rozšíření ještě
není instalačně ověřeno.

Ve stejné živé aplikaci má nativní `#select_prod` čtyři odhady srážek:
`sum_merge_1h`, `sum_merge_3h`, `sum_merge_6h` a `sum_merge_24h`.
Přepnutí na 1 hodinu v běžící aplikaci skutečně změnilo popis na „1h suma
srážek z kombinace radarového odhadu a pozemních srážkoměrů“. Hodnoty byly
odečteny z viditelně používané nabídky, nikoli odhadnuty z názvu URL.
Samostatný hluboký odkaz s tímto produktem v pokročilém radaru není potřeba:
archivní [homepage z 25. 8. 2026](https://web.archive.org/web/20260825190437/https://intranet.chmi.cz/)
vede pod názvem „Radarové odhady srážek“ na jinou aplikaci,
`http://hydro.chmi.cz/hppsoldv/main_rain.php`. Její
[archivní snapshot z 12. 5. 2026](https://web.archive.org/web/20260512184400/https://hydro.chmi.cz/hppsoldv/main_rain.php)
a [živá HTTPS verze](https://hydro.chmi.cz/hppsoldv/main_rain.php) byly
29. 9. 2026 otevřeny ve vestavěném prohlížeči. Původní rozhraní HPPS stále
nabízí intervaly 1/3/6/24 hodin, dvě datové varianty, časový seznam a PNG
mapu ČR. Nejde tedy o obecný `produkty.chmi.cz/radar/`.

Na živé stránce fungoval nativní výběr `#imenu_1` a zobrazil obraz 728 × 528;
nejnovější `#mapa_0` byl v daném okamžiku nedostupný. Uživatelský adaptér smí
použít pouze nativní ovladač k výběru prvního skutečně načteného snímku a
rozložit původní obsah podle okna. ČHMÚ/Hydrosoft uvádí na stránce licenci
CC BY-NC-ND 3.0 CZ; archivní JS, CSS ani PNG se proto nekopírují do MIT
repozitáře. Stav jednotlivých časových snímků se může měnit.

Luna dohledala konkrétní [snapshot `data_jsceldnview.html` z 10. 2. 2026](https://web.archive.org/web/20260210150817/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html).
Po výpadku jejího připojení k builtin browseru bylo uložení dokončeno v hlavní
relaci, bez opakování vyhledávání. HTML mělo HTTP 200 a obsahuje původní
inline JavaScript ovládání, projekce a načítání snímků. Přes viditelný download
ve vestavěném prohlížeči bylo uloženo 83 789 bajtů do ignorovaného
`.build/archive-reference-20260926/lightning/chmi-lightning-20260210-replay.html`;
[manifest](.build/archive-reference-20260926/lightning/MANIFEST.md) uvádí hash,
původ a omezení. Soubor zahrnuje Wayback replay úpravy, nikoli jen originální kód.

Staticky jsou doložené ruční nahrání vybraných snímků, automatická obnova
1/2/5/10/15 minut, začátek/předchozí/pauza/animace/další/konec, rychlost a
prodleva posledního snímku, roztažení podle okna, výběr předdefinovaných
lokalit včetně letišť, souřadnice a navigační kříž, uložení do cookies.
Starý datový tok parsuje PNG odkazy adresáře `data/` ve skrytém iframe;
není to dnešní datové API. CSS `jsradview.css` i datový rámec měly HTTP 404
a historické meteorologické snímky se nezobrazily. Nelze tedy tvrdit, že
archiv obsahuje funkční datovou aplikaci nebo úplný vizuál.

Autor je v HTML uveden jako Petr Novak, copyright ČHMÚ 2007–2011, licence
CC BY-NC-ND 3.0 Česko. Kód nebyl lokálně vykonán ani začleněn do MIT
userscriptu; je podkladem pro vlastní obnovu doložených ovladačů s živými
oficiálními daty.

## Stažený sondážní viewer Praha-Libuš (26. 9. 2026)

Luna dohledala [snapshot `oa/ptu_grafy.html` z 14. 6. 2026](https://web.archive.org/web/20260614101709/https://intranet.chmi.cz/files/portal/docs/meteo/oa/ptu_grafy.html).
HTML HTTP 200 bylo přes vestavěný prohlížeč skutečně uloženo do
`.build/archive-reference-20260926/sonde/chmi-sonde-20260614-replay.html`
(23 712 bajtů). [Manifest](.build/archive-reference-20260926/sonde/MANIFEST.md)
uvádí hash, původ, omezení a úplný datový tok. Uložení dokončil rodič,
ne subagent; timeout browserové download události nepřevážil důkaz souboru na disku.

Původní vlastní inline JS zrcadlí pět typů grafů: emagram 100/500 hPa,
Skew-T, profil větru a hodograf. Má výběr termínů v UTC a tlačítko tabulky
vybraných hladin. Grafy nevypočítává: čte adresář termínů ve skrytém iframe
a přepíná předrenderovaná PNG. CSS `por.css`, adresář dat i výchozí
`dsd100.png` v daném replay vracejí 404. Graf se nevykreslil; nejde o
funkční archivní nebo současnou datovou aplikaci. Samostatný vlastní JS
soubor tato stránka nevyžaduje. Autor je uveden jako Pavla Skrivankova,
© ČHMÚ 2018, CC BY-NC-ND 3.0 Česko; zdroj nebyl přibalen do MIT userscriptu.

Živá návaznost ověřená 1. 10. 2026 ve vestavěném prohlížeči:
[aerologická měření](https://www.chmi.cz/letectvi/aerologicka-mereni)
vedou přes lokalitu Praha-Libuš k oddělené **předpovědní pseudosondáži**
`/letectvi/sportovni/11520-praha-libus-pseudosondaz-emagram-100hpa` a odtud
záložka „Aerologická měření“ na skutečně **měřený**
[emagram Praha-Libuš](https://www.chmi.cz/letectvi/aerologicka-data/11520-praha-libus-emagram-100hpa).
Tento detail měl dva nativní přehrávače `#chmi-playabledata` (vzestup/sestup),
každý s `#imageSlider` 1–12 a načteným obrazem 600 × 500 px. Nativní nabídka
obsahovala Emagram 100/500 hPa, Skew-T, Profil větru, Hodograf a ASCII tabulku.
Obrázky byly aktuální datové URI generované současným ČHMÚ; jejich obsah se
nekopíruje ani nepovažuje za archivní soubor. Dostupnost všech šesti voleb a
ovládání v instalovaném adaptéru je nutno otestovat zvlášť.

## Stažené družicové viewery a závislosti (26. 9. 2026)

Ve vestavěném prohlížeči byla skutečně stažena obě uživatelem zadaná HTML:
[MSG z 10. 2. 2026](https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html)
a [AVHRR z 14. 6. 2026](https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html).
Obě HTTP 200 odpovědi obsahují vlastní inline JS. Získáno je také sdílené
`jsradview.css` a tooltipová knihovna overLIB 4.14: při načtení replay
se přesměrovaly na srpnový snapshot `20260825190506`, nejde o identické datum
se zachycením HTML. Čtyři soubory, HTTP statusy, velikosti a SHA-256 jsou v
[manifestu](.build/archive-reference-20260926/satellite/MANIFEST.md).

MSG dokládá produkty pro EU/CE/CZ, rychlost/prodlevu animace, tři překryvné
vrstvy, polohu a kříž, cookies i záložku s nastavením. AVHRR dokládá odlišný
seznam přeletů a JPG odkazů podle EU/CE/CZ/CZ2; není stejným animačním
viewerem jako MSG. Jeho seznam vzniká až z datových adresářů a v replay
se kvůli 404 nenaplnil. MSG načetl hlavní adresář, ale následný adresář
produktu i některé vrstvy byly 404. Funkční meteorologické snímky tím
potvrzené nejsou. Knihovna overLIB není datovým kódem ČHMÚ.

Zdroje zůstávají lokálními referencemi se samostatnými licenčními omezeními,
nejsou součástí MIT userscriptu. [Inventura získaných a zbývajících podkladů](.build/archive-reference-20260926/INVENTORY.md)
odděluje skutečné soubory, chybové odpovědi a pouhé záznamy CDX. Dva uložené
CDX seznamy nejsou úplným indexem všech historických aplikací.

## Stažené ozonové viewery (26. 9. 2026)

Ve vestavěném browseru získán [satelitní MSAF ozonový viewer](https://web.archive.org/web/20260825190505/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jso3msafview.html)
(41 326 B), jeho vlastní CSS (2 286 B) a odkazovaný
[prohlížeč časového vývoje ozonu](https://web.archive.org/web/20200129130039/http://portal.chmi.cz/files/portal/docs/meteo/sat/data_jso3msafview_evolution.html)
(24 011 B). Obě HTML mají vlastní inline JS; [manifest](.build/archive-reference-20260926/ozone/MANIFEST.md)
eviduje konkrétní odpovědi, velikosti, hashe, datové cesty a práva.
Původní chování bylo syntakticky parsováno bez lokálního spuštění.

MSAF má výběr každého 3./6. snímku, přehrávání, aktualizaci a tři překryvné
vrstvy. Grafový viewer nabízí devět lokalit a roční/měsíční grafy, uchování
nastavení a parametrizovanou URL. Změna na Hradec Králové / měsíční skutečně
změnila vybranou stanici, typ a PNG cestu. Obrazový backend obou viewerů je
ale neúplný (adresáře/snímky 404); získané ovladače nejsou funkční živou
rekonstrukcí. Metadata © ČHMÚ & EUMETSAT 2016–2017 rozlišují podmínky
EUMETSAT pro produkty a CC BY-NC-ND 3.0 CZ pro ostatní dílo. Lokální reference
se nepřebalují do MIT userscriptu; meteorologické obrázky nebyly ukládány.

**Rozpor index/replay:** `ozon/o3uvb.html` má v indexu jedinou capture
20260614103934, přesto přesný replay i kliknutí na indexový odkaz vrací 404.
HTML ČHMÚ proto nebylo získáno. **Portálový meteogram:** cesta
`meteogram_page_portal/m.html` vrací přechodovou HTML stránku HTTP 200, poté
otevírá již získaný `mhtml/m.html` (20260614103003). Přechodové tělo se
podařilo uložit až v dávce52; není to další samostatný prohlížeč.

## Stažený radar, INCA a ALADIN animace (26. 9. 2026)

Přes vestavěný prohlížeč byly získány [starší radarové HTML](https://web.archive.org/web/20200920022701/https://intranet.chmi.cz/files/portal/docs/meteo/rad/data_jsradview.html)
a [INCA `short.html`](https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html).
U INCA byly v této dávce staženy vlastní `main-short2.js` a tři knihovní
CSS závislosti; vlastní hlavní CSS je doložené až v dávce49. Starší podobný
název patřil knihovnímu motivu, nikoli vlastnímu stylu.
[Manifest šesti souborů](.build/archive-reference-20260926/radar/MANIFEST.md)
uvádí HTTP 200, velikosti, SHA-256 a přesné časové snapshoty. Skript a styly
se přesměrovaly na červenec 2026, HTML je ze srpna. Vlastní skript staršího
radaru `radar_pacz23_compress.js` a jeho CSS vracely 404.

INCA poskytuje zdroj původního přehrávání, ovládání polohy, produktů,
průhlednosti, rozměrů a starého AJAX adresářového backendu. Při browserovém
načtení se část historických snímků z 31. 5. 2026 i mapa skutečně vykreslily;
nejsou to aktuální data a nebyly lokálně staženy. Některé předpovědní
adresáře a oznamovací fragment chybějí. Zdroj není přibalen do MIT userscriptu.

Luna samostatně skutečně stáhla [ALADIN animační HTML z 10. 2. 2026](https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html)
(75 694 bajtů); [manifest](.build/archive-reference-20260926/alanim/MANIFEST.md)
uvádí hash a závislosti. Je to šablona původních ovladačů: vlastní chování
je v externím `js/main.js?version3`, který v daném snapshotu vrací 404,
stejně jako tři CSS. Nelze tvrdit, že tento HTML soubor sám obsahuje plnou
implementaci ALADIN animace. Nejde o již dříve uložené ALADIN mapy `ala.html`.

## Stažené výstrahové viewery (26. 9. 2026)

Skutečně staženy [obal `aktual.html`](https://web.archive.org/web/20260825190443/https://intranet.chmi.cz/files/portal/docs/meteo/om/vystrahy/aktual.html),
kompaktní varianty observed/all a úplný viewer, plus hlavní JS a CSS dvou
verzí (`6183d846` / `ffc81f02`). Osm HTTP 200 souborů, přesné capture,
velikosti, SHA-256 a omezení uvádí [manifest](.build/archive-reference-20260926/warnings/MANIFEST.md).
Jde o jednu aplikaci s variantami, nikoli čtyři nezávislé aplikace.

Obě kompaktní varianty spouštějí `iblsoft.alerts.AlertsViewer`, volí
`compact-observed` / `compact-all` a obnovu po 60 s. Balík obsahuje model,
renderer, kategorie, legendu, tabulku, jazyk a CAP/audio export. Šest
konfiguračních JSONů však při skutečném načítání vracelo 404 a mapa zůstala
prázdná; kompletní datový backend ani funkční aplikace tím nejsou získány.
Obě JS prošla pouze syntaktickým `node --check`, lokálně nebyla spuštěna.

Obal se zachoval jako původní binární tělo s Windows-1250 metadata; převod
do UTF-8 by změnil bajty a nezachoval poškozenou kombinaci kódování replay.
Zbývající textová těla jsou uložena jako UTF-8 reprezentace CDP odpovědi.
Namespace `iblsoft` a obalové „copyright čhmú“ nedokládají otevřenou licenci;
zdroje zůstávají ignorovanými lokálními referencemi mimo MIT userscript.

## Stažená teplotní mapa a detail stanice (26. 9. 2026)

Luna přes vestavěný browser získala [teplotní mapu ČR](https://web.archive.org/web/20260628160910/https://intranet.chmi.cz/files/portal/docs/meteo/opss/pocasicko_nove/mapa_teplota_0_cz.html)
(52 896 B) a [detail Ústí nad Labem](https://web.archive.org/web/20260226160016/https://intranet.chmi.cz/files/portal/docs/meteo/opss/pocasicko_nove/st_11502_cz.html)
(48 771 B). [Manifest](.build/archive-reference-20260926/observations/MANIFEST.md)
dokládá původní binární bajty, čerstvé stažení a SHA-256. První tělo je
z již načtené browser resource cache: původní HTTP status není doložen,
ačkoli obsah i mapa jsou skutečně získané. Druhé HTML má doložené HTTP 200.

Mapa dokládá přepínání předchozích hodin, stanic/výšek a veličin (teplota,
rosný bod, vlhkost, průměry/extrema). Detail obsahuje hodnoty a deset
grafových PNG, které se při běžném replay načetly HTTP 200; tři doplňkové
ikony byly 404. Jde o historické hodnoty z června/února 2026, nikoli aktuální
data. Obě HTML používají staré české kódování; bajty zůstaly bez konverze.
Vlastní externí JS/CSS v těchto dokumentech nejsou; archivní/analytics
skripty nejsou aplikací ČHMÚ. PNG ani vendor nebyly ukládány, otevřená
licence nebyla doložena. Reference se nepřidávají do veřejného userscriptu.

## Rekonstrukce staré homepage: POČASÍ / VODA / OVZDUŠÍ

Referenčním bodem je [snapshot starého intranetu z 25. 8. 2026](https://web.archive.org/web/20260825190437/https://intranet.chmi.cz/). Homepage sama neobsahuje všechny tři aplikace jako jeden statický dokument. Po volbě záložky zavolá společný loader `loadstatic()` a vloží do příslušného panelu samostatné HTML:

- **POČASÍ:** `files/portal/docs/meteo/map_meteo_portal/CR.html`, pravý třídenní předpovědní panel `PredIco.html` a rozcestník `weather-links.html`;
- **VODA / HYDROLOGIE:** `files/portal/docs/hydro/hydro_map.html`; legenda a odkazy jsou součástí panelu;
- **OVZDUŠÍ:** `files/portal/docs/uoco/map_uoco_portal/air.html`, legenda `legend.html` a rozcestník `airqual-links.html`.

Záložky používají stav `?tab=0`, `?tab=1` a `?tab=2` a při přepnutí volají `tab_switch(tab_def, index)`. To potvrzuje, že rekonstrukce rozcestníku může zachovat staré chování bez kopírování celého historického backendu: společná hlavička a tři záložky jsou vlastní rozhraní, zatímco jednotlivé panely se odkazují na doložené živé nebo archivní zdroje.

Pro panel POČASÍ existují ve Waybacku konkrétní zachycení [mapy ČR a jejích assetů](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/*). U [hydrologické větve](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/hydro/*) se podařilo najít historické hydro výstupy, ale ne samostatný snapshot `hydro_map.html`. U [větve ovzduší](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/*) jsou dostupné především zprávy, grafy a PDF; samostatný archivní `map_uoco_portal/*` nebyl ověřen.

**Přímá kontrola mapy POČASÍ (23. 9. 2026):** [archivní `CR.html` z 25. 8. 2026](https://web.archive.org/web/20260825190443/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/CR.html) se ve vestavěném prohlížeči načetl. Obsahuje obrázek `Img/CR.png` (550 × 320 px), 13 klikacích oblastí krajů (`weather_B.html` až `weather_Z.html`) a 13 překryvů stanic s teplotou a případně ikonou počasí. Samostatný fragment nemá načtené původní CSS portálu: stanice se bez něj zobrazují pod mapou, nikoli na správných souřadnicích. Pro rozvržení proto slouží celá archivní homepage, nikoli screenshot samotného `CR.html`. Zobrazené teploty a ikony jsou **historická data k 25. 8. 2026**, nikoli aktuální počasí. Podkladový obrázek a ikony byly staženy vestavěným prohlížečem pouze jako lokální reference; HTML uvádí „© swing, a.s.“ a bez ověření licence je nelze přibalit do veřejného userscriptu. [Současná oficiální mapa aktuální teploty](https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota) je živá, ale používá jinou mapu a časovou osu, takže sama o sobě nenahrazuje původní předpovědní/pozorovací panel.

Celý mapový fragment byl následně stažen vestavěným prohlížečem do ignorovaného adresáře `.build/archive-reference-20260923/map_meteo_portal/CR-20260825-browser-extracted.html`; [manifest podkladů](.build/archive-reference-20260923/map_meteo_portal/MANIFEST.md) uvádí původ, SHA-256 a licenční omezení. Při extrakci byly odstraněny skripty a lišta Wayback, proto soubor není bitovou kopií původní HTTP odpovědi. Starší `.build/archive-reference-20260920/raw/CR.html` je pouze odpověď 503 a nemá se používat jako předloha.

Ve stejné archivní sérii byly 23. 9. 2026 ověřeny a lokálně staženy také [pravý panel `PredIco.html`](https://web.archive.org/web/20260825190444/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/PredIco.html) a [dolní rozcestník `weather-links.html`](https://web.archive.org/web/20260825190443/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/weather-links.html). Navzdory názvu `PredIco.html` nejde pouze o legendu: obsahuje třídenní předpověď pro ČR, ranní a odpolední ikonu/teplotu, šest odkazů `Predpo1`–`Predpo6/weather.html` a „Vysvětlivky“. Rozcestník obsahuje 37 odkazů v původním pořadí; některé spouštějí funkce nadřazené homepage (`openWindowAladAnim`, `openWindowAnim`, `openWindowMSG`, `openWindowNOAA`, `openWindowCeldn`), takže samotný fragment bez ní není funkční navigace. Odkazové cíle jsou historické a nelze je automaticky použít jako současné živé URL.

Přesné odkazy na `hydro/hydro_map.html` a `uoco/map_uoco_portal/air.html` jsou doložené původním loaderem homepage, ale jejich kalendář Wayback při kontrole 23. 9. 2026 hlásil, že danou URL nezachytil. To omezuje věrnost rekonstrukce VODA/OVZDUŠÍ; současné panely je třeba navrhovat z jiných doložených starých podkladů a ověřených živých aplikací, nikoli předstírat kopii chybějících fragmentů.

Implementace proto v této etapě přidává do katalogu přesné vstupní cesty pro všechny tři panely, jejich archivní indexy a současné oficiální náhrady. Nevydává nedoložený hydro/air viewer za funkční rekonstrukci; takové položky lze zobrazit jako `Nedostupné` do doby, než bude ověřen zdrojový panel a jeho datový tok.

## Další doložené historické aplikace a výstupy

**Klementinum (ověřeno 29. 9. 2026):** archivovaný seznam
`weather-links-20260825-browser-extracted.html` dokládá položku „Měření z
Klementina“ a její historický cíl. Obsah cílové stránky ani její ovladače
zatím nejsou doložené replay HTML: [portálový snapshot
`20260512095825`](https://web.archive.org/web/20260512095825/https://intranet.chmi.cz/historicka-data/pocasi/praha-klementinum)
zobrazuje hlavičku a navigaci, ale hlavní obsah hlásí chybu načítání.
[Wayback index statického prefixu](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ok/klementinum/*)
při kontrole neobsahoval žádnou zachycenou URL. To nevylučuje jinou archivní
kopii, ale samotný odkaz není rekonstrukce.
[Současná stránka stanice Praha–Klementinum](https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum)
nabízí počasí, teplotu, srážky, vítr, SYNOP a historická data. Dne 1. 10.
2026 byl ve vestavěném prohlížeči znovu ověřen její naplněný desetiminutový
stůl a nativní záložky. Na těchto skutečných komponentách stojí kompaktní
adaptér beta 16; instalovaný vzhled a interakce v panelu se teprve ověří.
Stránka upozorňuje,
že operativní měření mají zpoždění a mohou se po verifikaci změnit.
[Historická stanice Klementinum](https://www.chmi.cz/namerena-data/historicka-data/klementinum)
odděleně popisuje dlouhou měřicí řadu a odkazuje na Open Data pod indikativy
`0-203-0-11514` a `0-203-0-11515`. Případný adaptér musí držet živá
operativní měření a historické řady odděleně; bez dalšího archivního podkladu
by jeho starý vzhled byl vlastní adaptací, nikoli věrnou kopií.
Živá stránka měla při kontrole tabulku 20 desetiminutových řádků a vlastní
záložky Počasí/Teplota/Srážky/Vítr/Synop/Historická data. Rozpracovaný
adaptér ponechává tyto nativní prvky a skrývá pouze nesouvisející seznam
stanic pod nimi. Vývojová kontrola na 1280×720 a 390×844 potvrdila průchod
Teplota a Historická data bez scrollu dokumentu; grafy a tabulky mají vlastní
nutný posuv. Nejde o test instalovaného userscriptu/Chrome rozšíření.

**Meteorologické stanice (ověřeno 1. 10. 2026):** [archivní mapa
`ShowStations_CZ.html`](https://web.archive.org/web/20260825190505/https://intranet.chmi.cz/files/portal/docs/poboc/OS/stanice/ShowStations_CZ.html)
obsahuje mapu a levý panel s filtry typů stanic (AMS, AKS, ASS, MSS,
ASNS, MKS a jejich podtypy), měřených veličin, poboček, krajů a ORP.
Archivní Leaflet mapa při kontrole zobrazovala část značek bez ikon;
její JavaScript, CSS ani obrázky se proto nepřebírají do veřejného balíčku
bez ověření licence a funkčnosti. [Současná oficiální mapa meteorologických
stanic](https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke)
má živé body a nativní menu Vše, Teplota, Srážky, Sníh, Vítr a Synop.
Kliknutí na bod při kontrole otevřelo detail stanice Tokáň. Beta 17 jen
přeskládává tuto živou mapu do kompaktního klasického rámu; historické
podtypy stanic současný filtr nepokrývá. Instalační a vizuální ověření
userscriptu a Chrome/Edge adaptéru ještě zbývá.

**Aktivita klíšťat (ověřeno 1. 10. 2026):** původní odkaz z rozcestníku
ukazuje na `https://info.chmi.cz/bio/mapy.php?type=kliste`. Zachycení
[11. 12. 2023](https://web.archive.org/web/20231211030523/https://info.chmi.cz/bio/mapy.php?type=kliste)
ve vestavěném prohlížeči skutečně vykreslilo tři denní náhledy a velkou
mapu pod nimi; dále dlouhý vysvětlující článek. Zachycení z 10. 8. 2026
již vrací přesměrování na [současnou oficiální mapu](https://www.chmi.cz/predpoved-pocasi/rizika/aktivita-klistat).
Ta při kontrole nabízela nativní mapu, časovou osu o třech denních krocích,
přehrávání, legendu a výběr vrstvy „Předpověď aktivity klíšťat“. Beta 18
přeskupuje živou komponentu do kompaktního modrého rámu; archivní snímky
nepřebírá. Samostatný a vložený adaptér je nutné instalačně vizuálně ověřit.

`Wayback timestamp` je `neověřen`, pokud dostupné rozhraní neposkytlo bezpečně
otevřitelný konkrétní snapshot. To neznamená, že ve Wayback Machine není; projekt
v takovém případě nabízí pouze Wayback index původní URL.

| Produkt | Původní URL | Wayback timestamp | Stav / důkaz | Současná náhrada | Způsob použití |
| --- | --- | --- | --- | --- | --- |
| ALADIN animace (`alanim`) | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html` | `20260210160917` | ověřený HTML snapshot; historická data a některé JS assety mohou chybět | `https://produkty.chmi.cz/aladin/` | legacy shell + přímý snapshot + archivní index |
| ALADIN mapy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html` | `20260512090206` | ověřený HTML snapshot; mapy se skládají z dynamických PNG podle běhu a termínu | `https://produkty.chmi.cz/aladin/` | legacy shell + přímý snapshot + archivní index |
| ALADIN meteogramy | `https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html` | `20260614103003` | ověřený HTML snapshot; výběr místa vyžaduje dynamické `mdirs.txt`/`nameid`/PNG | současné meteogramy na `www.chmi.cz` | legacy shell + přímý snapshot + archivní index |
| Webkamery – přehled | `https://intranet.chmi.cz/files/portal/docs/meteo/kam/` | `20260614102253` | [snapshot](https://web.archive.org/web/20260614102253/https://intranet.chmi.cz/files/portal/docs/meteo/kam/) ukazuje filtr kraje/pobočky, řazení dle souřadnic/lokality/výšky, animované/statické zobrazení a obnovu 1–30 min nebo vypnuto; obrazová data nebyla ověřena | `https://www.chmi.cz/namerena-data/webkamery` | referenční UI; fotografie se nekopírují |
| Webkamera – detail | `https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html?cam=lysa_hora1` | `20260210145538` | [snapshot Lysé hory](https://web.archive.org/web/20260210145538/https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html?cam=lysa_hora1) ukazuje výběr snímků, animaci 250 ms–10 s, pauzu posledního snímku, plné rozlišení, meteo informace, „Zobrazit graf“ a První/Předchozí/Spustit/Další/Poslední; snímek i seznam zůstaly ve stavu načítání | současné webkamery | referenční ovládání; historický `cam=` parametr platí pouze pro doložený snapshot, data ani fotografie se nekopírují |
| Blesky JSCeldnView | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html` | `20260210150817` | HTTP 200 HTML s původním inline JS uloženo lokálně; CSS a datový iframe 404, snímky neověřené | současný radar/blesky | referenční ovladače + konkrétní snapshot, nikoli funkční živá aplikace |
| Blesky – statická stránka | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html` | neověřen | původní statický výstup | současný radar/blesky | legacy shell |
| Blesky – PNG adresář | `https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data/` | neověřen | indexovaný oficiální adresář obsahoval `aktual.png` i timestampované PNG | současný radar/blesky / Open Data | pouze přímý odkaz; nic se nehardcoduje jako „nejnovější“ |
| Radar – statická stránka | `https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html` | neověřen | původní sloučený radarový obrázek + odkaz na viewer | `https://produkty.chmi.cz/radar/` | legacy shell |
| Meteosat VIS-IR JPG | `https://intranet.chmi.cz/files/portal/docs/meteo/sat/msg_hrit/img-msgeu-1160x800-vis-ir/` | neověřen | veřejný index obsahoval timestampované JPG po 15 min | současný Meteosat | pouze přímý adresář; obrázky se nebalí |
| Aktuální mapy | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy` | `20260825190505` | [Ověřený snapshot](https://web.archive.org/web/20260825190505/https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy) má v hlavním panelu jen nadpis a odkaz HOME; radar+srážkoměry, ozon/UV a sníh jsou **oddělené položky levé navigace**, nikoli obsah této stránky. Není zde samostatná mapová aplikace ani iframe. | současné mapy je třeba přiřazovat jednotlivým doloženým položkám | původní kategoriální stránka; nevymýšlet mapový viewer |
| Srážky radar+srážkoměry | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery` | neověřen | konkrétní historická stránka | současný radar/nowcast | legacy portálový rám |
| Ozonové a UV zpravodajství | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi` | neověřen | konkrétní historická stránka s UV indexem | současný web ČHMÚ | legacy portálový rám |
| Družicové měření ozonu | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Vertikální profil ozonu | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu` | neověřen | konkrétní historický sondážní výstup | současná aerologie | legacy portálový rám |
| Staniční data | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data` | neověřen | rozcestník map, tabulek a přehledů profesionálních stanic | současná data stanic | legacy portálový rám |
| Stanice – teplota/vlhkost | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota` | neověřen | konkrétní historická mapa | současná teplota | legacy portálový rám |
| Stanice – tlak | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu` | neověřen | konkrétní historická mapa | současná naměřená data | legacy portálový rám |
| Sněhové zpravodajství – hory | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Automatické sněhoměrné stanice | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice` | neověřen | konkrétní historická stránka | současný web ČHMÚ | legacy portálový rám |
| Grafy automatických stanic | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic` | `20260628160924` | [Ověřený snapshot](https://web.archive.org/web/20260628160924/https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic) obsahuje mapu poboček a sedm odkazů Brno, České Budějovice, Hradec Králové, Ostrava, Plzeň, Praha, Ústí nad Labem (`pobocka.BR/CB/HK/OS/PL/PR/UL.1.html`); text uvádí 10min data, obnovu po 30 min, čas SEČ, neověřená data a chybějící archiv grafů. Samotné živé grafy a dostupnost jednotlivých historických cílů tím nejsou prokázány. | současná naměřená data je nutno spárovat s konkrétními stanicemi/grafy | referenční pobočková navigace, nehotový adaptér |
| Synoptický detail Praha-Libuš | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus` | neověřen | synoptické veličiny v čase měření a -1/-2/-3 h | současná síť stanic | legacy portálový rám |
| Stanice – srážky/sníh | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky` | neověřen | historická mapa profesionální staniční sítě | současné srážkové mapy | legacy portálový rám |
| Stanice – vítr | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr` | neověřen | historická mapa větru | současná tabulka/mapy stanic | legacy portálový rám |
| Stanice – oblačnost/sluneční svit | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit` | neověřen | historická mapa | současná naměřená data | legacy portálový rám |
| Vertikální profily větru | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru` | neověřen | historický výstup explicitně potvrzen | současná aerologie | legacy portálový rám |
| Sondáž Praha-Libuš | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus` | neověřen | historická stránka observatoře | současná radiosondážní měření | legacy portálový rám |
| Výškové analýzy Evropa | `https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy` | neověřen | konkrétní stará stránka dohledána | současná synoptika / letecké výškové produkty | legacy portálový rám; bez náhradní falešné mapy |
| Přechody front přes Prahu | `https://intranet.chmi.cz/historicka-data/pocasi/prechody-front-pres-prahu` | neověřen | konkrétní historická stránka | současná stránka stejného tématu | legacy portálový rám |
| Klementinum | `https://intranet.chmi.cz/historicka-data/pocasi/praha-klementinum` | neověřen | archivní rozcestník dokládá odkaz, nikoli obsah nebo ovladače cílové stránky | [současná stanice](https://www.chmi.cz/namerena-data/merici-stanice/meteorologicke/p1pkle01-praha-klementinum) + [historie](https://www.chmi.cz/namerena-data/historicka-data/klementinum) | beta 16: kompaktní adaptér nad živými daty, nikoli věrná kopie; instalační QA čeká |
| Klementinum – statická data | `https://intranet.chmi.cz/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html` | neověřen | odkaz na tabulku nalezen, replay obsahu nepotvrzen | současné Klementinum | pouze referenční odkaz |
| Historické mapy stanic | `https://intranet.chmi.cz/historicka-data/pocasi/mapy-stanic` | neověřen | konkrétní historická stránka | současná historická data | legacy portálový rám |
| Měsíční přehledy pozorování | `https://intranet.chmi.cz/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani` | neověřen | tabulkové měsíční teploty, srážky a další charakteristiky | současná historická data/Open Data | legacy portálový rám |
| Letecký ALADIN – oblačnost/srážky/RH | `https://intranet.chmi.cz/files/portal/docs/meteo/olm/p_oblbln.html` | neověřen | WMO bulletin ALADIN pro letiště | současné letecké produkty | legacy shell |
| Sportovní létání – text | `https://intranet.chmi.cz/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html` | neověřen | textová předpověď s konvekcí, základnou oblačnosti a výškovým větrem | současné letectví | legacy shell |
| Letecké námrazy | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100` | neověřen | konkrétní stará stránka | současné letectví | legacy portálový rám |
| Letecký SIGMET | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/sigmet` | neověřen | konkrétní stará stránka | současný SIGMET | legacy portálový rám |
| Letištní přízemní vítr/teplota/tlak | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen` | neověřen | starý ALADIN letištní bulletin | současné letectví | legacy portálový rám |
| Letištní oblačnost/srážky/RH | `https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost/` | neověřen | konkrétní stará stránka | současná nízká oblačnost/letectví | legacy portálový rám |

## Historická navigace – další doložené výstupy

### Synoptická situace versus synoptická předpověď (30. 9. 2026)

Archivní rozcestník dokládá dvě různé adresy:
`/aktualni-situace/aktualni-stav-pocasi/evropa/synopticka-situace`
(aktuální situace) a `/predpovedi/predpovedi-pocasi/evropa/synopticka-situace`
(předpověď). Pro první je doložen odkaz, nikoli uložené tělo cílové stránky.
Pro druhou je samostatně uložené HTML výstupu
`/files/portal/docs/meteo/om/evropa/preba/preba_portal.html` ze snapshotu
`20260505091557`: tři statické mapy pro 36/60/84 hodin; jejich GIF a vlastní
JS/CSS nejsou místně uložené (viz `.build/archive-reference-20260926/information/MANIFEST.md`).

Dnešní `https://www.chmi.cz/predpoved-pocasi/synopticka-situace` obsahuje
živou komponentu `#chmi-playabledata`: dnešní mapu a dva předpovědní kroky,
nativní posuvník `#imageSlider` s rozsahem 1–3 a nativní tlačítko přehrávání.
Ve vestavěném prohlížeči se 30. 9. načetl obraz 1240 × 802 a posuvník
přepnul na druhý snímek. Adaptér obnovuje rozložení pro **Synoptickou situaci**,
ale tento kratší živý tok není vydáván za původní samostatnou synoptickou
předpověď 36/60/84 hodin. Staré mapy ani skripty nejsou kopírovány do balíčku.

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

## Opakovatelná kontrola podkladů (26. 9. 2026)

Dávka 32 doplnila tři skutečné replay HTML (HTTP 200):
[měsíční výhled](https://web.archive.org/web/20260420084351/https://intranet.chmi.cz/files/portal/docs/meteo/om/mesic/mesicni_vyhled.html),
[contrails](https://web.archive.org/web/20260603080941/https://intranet.chmi.cz/files/portal/docs/meteo/kondenzacni_stopy/contrails.html)
a [teploty SIVS](https://web.archive.org/web/20260411055237/https://intranet.chmi.cz/files/portal/docs/meteo/om/sivs/teploty.html).
Původní rozložení výhledu má tabulky a pravděpodobnostní grafy, ale obsah
platí pro 22. 12. 2025–18. 1. 2026, ne pro datum archivace. Dva ostatní soubory
jsou články, ne interaktivní aplikace. Podrobnosti/hash/metoda/licenční
omezení: `.build/archive-reference-20260926/information-batch32/MANIFEST.md`.
Současný oficiální [měsíční výhled](https://www.chmi.cz/predpoved-pocasi/mesic)
publikuje živý slovní text a odkaz na
[grafické PDF](https://www.chmi.cz/documents/d/chmi.cz/mesicni-2), jehož
stránky obsahují také statistické tabulky a pravděpodobnostní grafy. Adaptér
beta 23 čte tyto živé zdroje na oficiální stránce; historické hodnoty ani
archivní obrázky do rozšíření nekopíruje. Ověřeno 2. 10. 2026.
Ozon o3uvb v konkrétním capture nyní vrací 404; filterlist_min.js vrací
HTML obal a jeho iframe je blokován. Ani jedno není získaný zdroj.
Aktuální reporty jsou `tooling/verification-batch32.json` a
`tooling/queue-batch32.json`; starší reporty zůstaly zachovány.

Nové `script/archive_verify.mjs` a `script/archive_queue.mjs` oddělují
odkaz od skutečných ověřených bajtů a DOM export od replay odpovědi.
Receipts/reporty: `.build/archive-reference-20260926/tooling/`;
postup: `ARCHIVE_WORKFLOW.md`. Řádek ALADIN animace obsahuje spolu s URL
text poznámky; zůstává k ručnímu ověření, ne automaticky opravený/stažený.

CSS ALADINu bylo získáno jako přirozená závislost
[archivní stránky map](https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html):
[CSS replay](https://web.archive.org/web/20241123035809cs_/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.css),
HTTP 200 `text/css`, 3802 B, SHA-256
`d6392e8875db01c1fd49503e84b22f0193fc0e8bba7779ef30897afca104fb01`.
Soubor/manifest jsou v `.build/archive-reference-20260926/styles/`.
CDP textové tělo bylo exportováno do UTF-8 viditelným downloadem builtin
browseru; nejde o původní wire bytes. Staré chybové `assets/ala.css` se
nepřepisovalo. V této dávce CSS úvodu `weatherCR/weatherRcol/weatherXY.css` ještě chybělo;
bylo následně získáno v dávce 34 (viz níže).
Získání CSS není dokončená rekonstrukce ani svolení k distribuci.

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


## Dávka 33: skutečné závislosti meteogramů a homepage zdroje

26. 9. 2026 přibylo pět skutečně stažených replay odpovědí: CSS a
vyhledávací JS meteogramů, `CR.html`, `PredIco.html`, `weather-links.html`.
Meteogramy své dvě závislosti přirozeně načetly s HTTP 200; přímý JS
odkaz dříve vracel pouze HTML obal s blokovaným iframe. Blokace nebyla
obcházena. Staré DOM exporty úvodu zůstaly zachované, protože nejsou
totožné se zdrojem HTTP odpovědi.

Do společného manifestu byl doplněn také již existující, nezávisle
ověřený stylopis webkamer (capture 20260119222624cs_, ne timestamp
odkazu z HTML). Nejde o nový download. Evidenci, hashe, metody a omezení
uvádí `.build/archive-reference-20260926/source-batch33/MANIFEST.md`.
Aktuální reporty: `tooling/verification-batch33.json` a `tooling/queue-batch33.json`.

Meteogramový JS dokládá filtrování a vyhledávání míst, nikoli získaný
živý graf. CSS uvádí původní 845 px kontejner; při vlastní rekonstrukci
se má změnit na dynamické využití okna bez ořezu, ne rozbít staré ovládání.
Úvodní fragmenty neobsahují nadřazené portálové CSS; v dávce 33 ještě
chybělo, získáno bylo až v dávce 34 (viz níže).
Archivní hodnoty, fotografie a ikony se nepřebírají jako současná data.
Změny nezasahují userscript, GH ani Xcode a nejsou hotovými aplikacemi.


## Dávka 34: původní CSS úvodní mapy a rámu portálu

26. 9. 2026 přirozené načtení archivní homepage v builtin browseru poskytlo
HTTP 200 odpovědi `weatherXY.css`, `weatherRcol.css`, `weatherCR.css`,
`main.css`, `user.css`, `chmu.css`, `chmu.js`, `common.js` a
`aim_isko_mapa.js`. Všech devět skutečných těl bylo exportováno UTF-8
viditelným downloadem a nezávisle ověřeno velikostí/hash i typem obsahu.
Jde o replay se zachovanými Wayback přepisy, nikoli původní wire bytes.
Síťový přehled byl zkrácený; netvrdíme úplnost závislostí homepage.

`weatherCR.css` dokládá mapu o šířce 560 px a 145 px sloupce odkazů;
`weatherRcol.css` pravý panel 120 px, ikony 39 × 39 px a drobné texty.
Při rekonstrukci zachovat vizuál a ovládání, ale pevné rozměry přizpůsobit
celému dostupnému oknu bez ořezu či zbytečného scrollování. Historické
hodnoty nesmí být současnou předpovědí. Obrázky a licence nejsou tímto
sběrem vyřešené, JS není úplná obnovená aplikace VODA/OVZDUŠÍ.

Do společného manifestu bylo doplněno také už existující celé HTML
homepage z archivu 20260920: obsah, hash a dekomprese původního lokálního
gzip těla byly znovu ověřeny proti individuálnímu manifestu a uloženým
HTTP 200 hlavičkám. Nejde o desátý nový download.
Původ, přesné capture URL a všechna omezení:
`.build/archive-reference-20260926/homepage-batch34/MANIFEST.md`.
Reporty: `tooling/verification-batch34.json`, `tooling/queue-batch34.json`.
Sběr nemění userscript, GitHub ani Xcode a nedokončuje rekonstrukci UI.


## Dávka 35: skutečné zdroje mapy kamer a detailu

26. 9. 2026 byly builtin browserem uloženy HTTP 200 replay HTML mapy
kamer, detailu Lysé hory a mapy teplot. Mapa kamer obsahuje vlastní
inline JS/CSS: náhledové markery, směrové šipky, popup a detail, celé
okno bez scrollu. Blok JS byl pouze syntakticky kompilován, ne spouštěn
lokálně. Jeho webcams.json ale vrací 404, takže fotografie a markery
nejsou ověřenou funkcionalitou.

Detailní prohlizec_v2.js/css mají HTTP 404; přesné kalendáře ukazují
nearchivovanou URL. Totéž načtení má lytebox.js/css 404. Nové HTML je
replay odpověď, předchozí DOM export zůstal zachovaný. Mapa teplot byla
tentokrát získána ze skutečně pozorovaného HTTP 200, binární CDP tělo
bylo zachováno bez konverze starého kódování; dřívější cache varianta
není s novým exportem byte-identická a nepřepisuje se.

Odkaz Srážky a sníh vede na starý portálový wrapper, který přes loadstatic
načítá konkrétní mapa_srazky1h_0_cz.html. V tomto capture zdroj vrací XHR
404; wrapper ani odkaz se nepovažují za získanou srážkovou aplikaci.
Přesné URL, bajty, hashe, akviziční metody a omezení:
`.build/archive-reference-20260926/camera-observations-batch35/MANIFEST.md`
a `observations.json`. Reporty: `tooling/verification-batch35.json`,
`tooling/queue-batch35.json`. Archivní hodnoty nejsou současná data;
zdroje nejsou licenční souhlas ani hotová rekonstrukce. GH/Xcode/userscript
se touto dávkou nemění.


## Dávka 36: radarová nápověda a licenční provenance

26. 9. 2026 byly přes builtin browser skutečně staženy tři HTTP 200 HTML:
info_czrad (síť/tabulka a kategorie produktů), info_mobile (XHTML/MMS
nápověda) a info_radar (výukový článek Jana Kráčmara, boční průměty,
stupnice a tabulka dBZ). Nejsou to další tři aplikace ani aktuální
technické údaje. Stránky uvádějí CC BY-NC-ND 3.0 CZ; cizí obsah není
převzat do MIT distribuce, zůstává ignorovanou lokální referencí.

Odkazovaný mobilní viewer vrací 404. Root rad/ s HTTP 200 neměl vlastní
zobrazený obsah, odkazy ani rámy, proto není evidován jako získaný
radarový zdroj. Luna při odděleném sběru verze výstrah 21d1eec6 hlásí
HTML obal a blokovaný iframe (ERR_BLOCKED_BY_CLIENT); JS/CSS nejsou
uložené a blokace se neobcházela. Jde o subagent-report, ne rodičem
přímo pozorovanou síťovou odpověď. Původní dvě verze výstrah zachovány.
Původ, skutečné capture URL, hashe, metoda a negativní pozorování:
`.build/archive-reference-20260926/radar-information-batch36/MANIFEST.md`
a `observations.json`. Reporty: `tooling/verification-batch36.json`,
`tooling/queue-batch36.json`. Změny nezasahují userscript/GH/Xcode.


## Dávka 37: MSG poloha/vrstvy a kamera query varianty

26. 9. 2026: získané tři přesné MSG query HTML (24M ×2, VIS-IR),
CSS sat/jsradview.css (skutečný capture 20260825190506cs_) a Luna
stáhla camera lysa_hora2/3 a maruska HTML. Parent ověřil všechny
velikosti/SHA. Po inicializaci MSG odpovídají lat/lon a vrstvy URL,
seznam poloh má 640 položek včetně oddělovačů. Vlastní inline JS
je kompilovatelný, neproveden offline. MSG zůstává (0/0); kamery dle
sidecar reportu NAHRÁVÁ SE a vlastní JS/CSS 404. Není sedm dalších
rekonstruovaných aplikací. Licence CSS/kamer nezjištěna, cizí kód
pouze v ignorovaných referencích. Manifest a observations:
`.build/archive-reference-20260926/satellite-camera-presets-batch37/`.
Reporty `tooling/verification-batch37.json`, `tooling/queue-batch37.json`.
Userscript/GH/Xcode beze změny.


## Dávka 38: query reference a negativní kontroly

26. 9. 2026: 9 skutečných HTML exportů získaných builtin UI
downloadem, parent ověřil bytes/SHA. Javorový a IR108 capture vybrány
z viditelných kalendářů, Sucho rovněž. IR108 (0/0) potvrzuje polohu/vrstvy;
Javorový chybějící JS/CSS404, Sucho historický layout/texty.
info_banner prázdný vlastní obsah při200, Prutoky.html archivní404:
nezapsány jako získané aplikační zdroje. Worker síťová metadata zůstávají
označena Luna-report. Cizí zdroje jen v ignorovaném .build, nejsou MIT.
Manifest a observations: `.build/archive-reference-20260926/query-presets-batch38/`; reporty
`tooling/verification-batch38.json`, `tooling/queue-batch38.json`.
Userscript/GH/Xcode beze změny.


## Dávka 39: radarové datové adresáře

27.9.2026: 5 ověřených replay HTML downloadů v nové dávce.
Rodič získal dva datované výpisy předpovědních PNG (+10..+60min),
celdn a masked radar. Nejsou to nové aplikace; žádný odkazovaný snímek
tím není ověřený ani stažený. Luna-report a negativní pozorování jsou
oddělené v `.build/archive-reference-20260926/directories-batch39/observations.json`.
Licence pro redistribuci nezjištěna; pouze ignorované reference.
Kanonická inventura a reporty `tooling/verification-batch39.json`
a `tooling/queue-batch39.json`. Userscript/GH/Xcode beze změny.

## Dávky 40–41: závislosti a oprava kanonické inventury

27.9.2026: offline audit 59 uložených HTML našel 51 vlastních JS/CSS
závislostí. Dva chybějící receipts CSS výstrah byly doplněny z existujících
souborů a původního manifestu po nezávislé kontrole velikosti/SHA a typu.
Kanonická inventura má 81 záznamů; nejde o dva nové downloady nebo aplikace.
Capture odkazu v HTML nemusí být totožný s capture skutečně uloženého CSS.
Zbývajících 31 závislostí nemá kanonický receipt; není tím prokázána jejich
nedostupnost. Inventura není úplný JS parser ani síťové ověření backendu.

Pokus z viditelného kalendáře o radarové main-short2.css skončil na
HTML obalu200 a blokovaném playback; žádný CSS receipt. Načtení archivního
ALADINu zastavila bezpečnostní kontrola kvůli historickému JS; uživatel byl
požádán o směr. Bez obcházení, archivní kód se offline nespouštěl.
Podklady: ignorované `dependency-audit-batch40/` a `reconciliation-batch41/`
v archivu 20260926. Reporty `verification-batch41.json` a
`queue-assets-batch41.json` v tooling. Userscript/GH/Xcode beze změny.

## Dávka 42: komentované alternativy nejsou aktivní závislosti

27.9.2026: původní offline audit zahrnul také src/href uvnitř komentářů.
Po kontrole původních HTML a aktuálních receipts má 51 URL: 20 lokální replay,
9 pouze zakomentovanou alternativu, 2 podmíněný starý IE odkaz, 20 odkaz mimo
komentář bez receipt. Poslední skupina není důkaz vykonaného requestu ani
nedostupnosti všech capture. Původní inventura zachována, opravená klasifikace
v ignorovaném `dependency-classification-batch42/classification.json` a
`MANIFEST.md`. ALADIN/INCA alternativní main-short2.min.* a overlay.js tedy
nejsou prioritní chybějící zdroje aktivního vieweru. Všechny reference zůstávají
zachované. Žádný nový download; další browser sběr čeká na směr uživatele
kvůli bezpečnostnímu zastavení historického JS. Userscript/GH/Xcode beze změny.

## Dávka 43: portálové zdroje a doplnění CSS INCA

27.9.2026: po výslovném souhlasu uživatele s běžným prohlížením archivních
stránek bylo přes builtin UI download získáno devět skutečných CSS/JS
odpovědí homepage. Dva stabilní lokální size/SHA snapshoty souhlasí s browser
bajty. Event buffer truncated — nejde o kompletní inventuru requestů.
Luna dohledala tři již uložené radarové CSS; parent ověřil bajty a metadata
a doplnil receipts. Dvě jsou vendor reference, ne vlastní aplikace ČHMÚ.
Přímý blokovaný playback main-short2.css z dávky40 neprokazoval absenci
dříve uloženého CSS. Blokace nebyla obcházena, použit existující soubor.

Kanonická inventura93. Z původních 51 dependency URL nyní 30 má lokální replay,
10 odkazů mimo komentář chybí, 9 jsou komentované alternativy a 2 IE styly.
Podklady, receipts a omezení v ignorovaném `portal-completion-batch43/`;
reporty `tooling/verification-batch43.json` a `tooling/queue-assets-batch43.json`.
Žádný archivní JS vykonán offline. Cizí kód není přebalen do MIT userscriptu.
Userscript/GH/Xcode beze změny; získání zdrojů není dokončená rekonstrukce.

## Dávka 44: konkrétní chybějící CSS a blokované přehrání konfigurace

27.9.2026: parent při běžném reloadu radarové nápovědy ověřil skutečné
HTTP404 pro `rad/info_radar/www_rad.css`. Nejde o důkaz absence všech capture.
Luna otevřela dvě přesné indexed konfigurace výstrah download-audio/texts;
prázdný Wayback obal bez síťových metadat není získaný JSON. Parent u první
doplnil síťový důkaz: outer200 text/html, automatický iframe playback
ERR_BLOCKED_BY_CLIENT (inspector). Request ID spárován s request URL.
JSON pomocných služeb archivu nesmí být zaměněn za konfiguraci ČHMÚ.
Texts zůstává jen worker UI pozorování; nebylo síťově potvrzeno404 ani blokování.
Bez obcházení nebo alternativních query, vlastní karty zavřeny.

Žádný nový download/receipt; kanonická inventura93. Důkazy a omezení v
ignorovaném `negative-checks-batch44/`, verifier `tooling/verification-batch44.json`.
Archivní JS nebyl vykonán offline. Userscript/GH/Xcode beze změny.

## Použití reference PredIco v userscriptu beta 6

27. 9. 2026: již získaný `PredIco.html` (capture 20260825190444, viz výše)
slouží jako předloha funkčního rozložení: tři dny, ráno/odpoledne, ikona,
rozsah teplot a odkaz na příslušné období. Nový adaptér `forecast.js/css`
nepřebírá archivní hodnoty ani GIFy. Používá aktuální oficiální endpoint
`https://data-provider.chmi.cz/api/imageMap/timeRangeSwitch/999/{dnes|zitra|pozitri}`,
ověřený v živé nativní komponentě, a její současné SVG ikony.
Průběžná nabídka dneška může vynechat uplynulé ráno a zahrnout zítřejší ráno;
období se proto slučují podle tokenu, nikoli pořadí. Chybějící údaj nemá URL.

Vývojové browser QA celého generovaného userscriptu se simulovanými GM
funkcemi: přepnutí období mění živou mapu, přechod na Pozítří zachová token;
1280 × 720 i emulované 390 × 844 bez scrollu dokumentu, ikony načtené.
Nejde o test instalovaného Tampermonkey ani centrálního rámce. Historický
reliéfní podklad a licence archivních assetů zůstávají nevyřešeny.
Žádný nový archivní receipt; kanonická inventura zůstává 93. GH/Xcode beze změny.

## Dávka 48: závislosti ovládání meteogramů

27. 9. 2026: vestavěný prohlížeč přirozeně načetl původní stránku meteogramů
z capture 20260614103003. Skutečné HTTP200 odpovědi subresources dodaly tři
nové podklady: `jquery-ui-1.9.2.custom/css/mm.css` (35023 B), jQuery1.8.3
(94856 B) a custom jQuery UI1.9.2 (38412 B). Jejich skutečné capture jsou
20220818122123cs_, 20220818122122js_ a 20220818122101js_. Nejde o původní
neupravené serverové soubory: JS má zachovaný přepis Wayback. JS nebyl
spouštěn offline. UI obsahuje autocomplete/menu widgets; nejsou to tři nové
aplikace ani rekonstrukce samotného grafu. Licenční hlavičky a hashe jsou v
ignorovaném `meteogram-dependencies-batch48/MANIFEST.md`; cizí kód není
přibalen do userscriptu.

Negativní kontroly: výsledkový ALADIN jQuery1.7.1 má outer200 HTML, samotný
iframe playback blokuje inspector; nepovažuje se za získaný JS. Z odkazu
PredIco byly otevřeny `Predpo1/weather.html` a `vysvetlivky.html`: oba vrací
archivní404 a explicitní hlášení o nearchivované URL. Nabídnutý index Predpo1
je prázdný. Čerstvý index map_meteo_portal má14 řádků (3 HTML/3 CSS již máme,
8 obrazových URL); nedává další dosud neuložený HTML/JS. Z toho nelze
vyvozovat nepřítomnost neověřených Predpo2–6 nebo jiných doménových variant.

Verifier potvrdil96/96 kanonických receipts; testy sběrových utilit40/40.
Fronta nyní výslovně zahrnuje i vendor assets:290 indexových řádků,107 vybraných
URL,75 ověřených zdrojů a32 dosud bez receipt (včetně JSON a knihoven).
Queue CLI správně hlásí exit1 kvůli jednomu dříve doloženému znečištěnému
ALADIN indexovému řádku; nejde o chybný hash nového podkladu. Reporty:
`tooling/verification-batch48.json`, `tooling/queue-all-assets-batch48.json`.
Sběr není kompletní. Userscript beta6, GH, Xcode a balíčky beze změny.

## Dávka 49: vlastní styl INCA a knihovny radaru, kamer a výstrah

27. 9. 2026: přes vestavěný prohlížeč získáno devět nových skutečných
HTTP200 subresource odpovědí při přirozeném načtení již doložených stránek.
INCA dodal vlastní `css/main-short2.css` (7905 B), jQuery1.11.0, custom
jQuery UI1.10.4 a Leaflet1.3.1+Detached. Přehled kamer dodal jQuery3.1.1.
Obě doložené generace výstrah (6183d846 a ffc81f02) dodaly svůj vendor JS/CSS.
Nejde o devět dalších aplikací; osm souborů jsou knihovní závislosti.

Nově získaný vlastní INCA styl dokládá `#img_data1/2`, `#div_gmaps`,
`#div_scl`, `#div_display_control`, animaci/seznam snímků, průhlednost,
navigaci a nastavení. Je odlišen od dříve uloženého knihovního motivu se
zavádějícím názvem chmi-inca-main-short2; původní soubor ani opravený receipt
nejsou přepsány. Předešlá blokace přímého CSS replay zůstává platným tehdejším
pozorováním. Nyní jde o samostatně přijatou odpověď nativně načtené závislosti,
ne alternativní fetch nebo vypnutí ochrany. Cizí CSS/JS se nepřebaluje do
MIT userscriptu; zachovaný Wayback přepis znamená, že nejsou pristine origin
bajty. Žádný archivní JS nevykonán offline.

U novějšího widgetu výstrah zároveň pozorováno šest HTTP404 pro runtime
config JSON. Tyto cache-buster URL nejsou přesně stejné jako v indexu;
nedokládají nedostupnost všech indexed capture. Starší výstrahová stránka
rovněž není získáním knihoven prokázanou funkční mapou. Důkazy, hashe a
licenční omezení v ignorovaných `inca-dependencies-batch49/` a
`warnings-dependencies-batch49/`.

Celkem105/105 kanonických receipts ověřeno. Ze107 vybraných URL meteo indexu
je83 ověřených zdrojů a24 bez receipt (včetně14 JSON); vlastní INCA CSS
je navíc doloženo načtenou závislostí mimo tento index. Queue CLI hlásí exit1
kvůli stále jednomu znečištěnému ALADIN řádku, nikoli chybným receipts.
Reporty `tooling/verification-batch49-complete.json` a
`tooling/queue-all-assets-batch49.json`. Sběr není kompletní;
userscript beta6, GH, Xcode a distribuční balíčky beze změny.

## Dávka 50: kořenové výstrahy a uzavření tří negativních pokusů

27. 9. 2026: kalendář kořenové URL výstrah uváděl sedm zachycení.
Kliknutí na doložený capture20260112110055 poskytlo skutečné HTML
s vlastním `ibl-alerts` kontejnerem a závislostmi6183d846 (12358 B),
nikoli pouze replay obal. Uloženo do ignorovaného
`collection-audit-batch50/`, přesný původ a SHA256 v manifestu.
Accessibility aplikace byla prázdná; šest runtime konfigurací má404.
Nejde o další hotovou aplikaci ani aktuální výstrahy.

Rodič přímo ověřil přesné indexované `vendor.21d1eec6.min.js/css`
a `global.json?_=1787684686022`: všechny mají HTML obal200 a nativní
playback blokovaný `ERR_BLOCKED_BY_CLIENT` / inspector. Žádné receipts
pro tyto tři zdroje nebyly vytvořeny; žádné změny ochrany nebo jiné
replay URL režimy. Závěr platí pro konkrétní URL/capture, ne všechny JSON.
Chybové runtime query lednového capture se rovněž liší od14 srpnových
URL v indexu a nesmějí být zaměněny za jejich síťové ověření.

Kanonická kontrola106/106. Z107 vybraných URL indexu je84 ověřených
zdrojů a23 bez receipt (4HTML, 3JS, 2CSS a14JSON). Queue exit1 má stále
jediný důvod: znečištěný řádek query ALADINu; invalid receipts0.
Reporty: `tooling/verification-batch50.json`,
`tooling/queue-all-assets-batch50.json`. Archivní utility testy40/40.
Sběr není prohlášen za úplný; chybějící URL zůstávají viditelné ve frontě.
Byl opraven také zastaralý text TODO, který mylně popisoval vlastní
INCA CSS jako dříve získané; vlastní styl je skutečně doložen až dávkou49.
Vlastní karta79 zavřená. Userscript beta6, GH a Xcode beze změny.

## Dávka 51: přesný indexový řádek ALADINu

27. 9. 2026: znovu přečteno22 řádků živého OV indexu. Sporný query
řádek skutečně obsahuje větu o prioritě nastavení jako část URL.
V raw td.textContent jsou dvě mezery za lang=CZ; dřívější export je
sloučil na jednu. Přesný href s %20%20 poskytl HTTP200 vlastní HTML
ALADINu (79126 B), nyní skutečně uložené. Nebyl odstraněn připojený text,
nebyl změněn parametr ani odhadnut capture. Po načtení jsou viditelné
staré ovladače a690 voleb lokalit, datum však zůstává XX.XX.XXXX.
Nejde o funkční aktuální předpověď ani další rekonstruovanou aplikaci.

Důkazy, přesné URL, SHA256, nezměněný live OV export a omezení:
`aladin-index-reconciliation-batch51/`. Licence stránky CC BY-NC-ND3.0CZ;
jen ignorovaná lokální reference, ne distribuovaný MIT kód.
Nový `indexes/chmi-wayback-meteo-url-index-290-reconciled-batch51.json`
mění z původního meteo exportu jedinou URL buňku na kanonický tvar
doložený live OV řádkem; všech290 řádků, MIME a href zachováno.
Původní index ani předchozí reporty nejsou přepsané.

Mezistránka meteogram_page_portal/m.html má pozorované200/text/html,
ale po nativní navigaci se její tělo nepodařilo exportovat. Končí na
již uloženém mhtml/m.html/capture20260614103003. Žádný nový receipt
pro přechodový dokument ani opětovné započtení cílové aplikace.

Verifier107/107, utility testy40/40. Nová fronta má85 ověřených zdrojů
ze108 vybraných URL,23 bez receipt a0 neplatných vstupů/receipts; CLI exit0.
Reporty `tooling/verification-batch51.json` a `tooling/queue-all-assets-batch51.json`.
Původní fronta má nadále historický neplatný řádek a není autoritou pro
nově doloženou URL. Celý sběr ještě není prohlášen za úplný.
Karta80 zavřená; userscript beta6, GH a Xcode beze změny.

## Dávka 52: uložené mezistránky a audit zbývajících HTML/JS

27.9.2026: skutečně uloženy úplné HTTP200/text/html odpovědi kořenového
radaru (10233 B), informačního banneru (10588 B) a přechodového meteogramu
(11316 B). První dva mají prázdné aplikační tělo; přechodový dokument
pouze provádí meta refresh na již uložené mhtml/m.html. Nejsou to další
fungující aplikace. Získání přechodového těla opravuje chybějící receipt
z dávky51, nikoli historickou evidenci tehdejšího neúspěchu.

Původ, SHA256 a přesný obsah jsou v ignorovaném
`collection-boundaries-batch52/MANIFEST.md`, `receipts.json`,
`observations.json` a `transition-observations.json`. Licence pro distribuci
není doložena; tyto dokumenty nejsou součástí MIT userscriptu.

Rodič přímo potvrdil blokaci vlastního warnings main.21d1eec6.min.js:
vnější HTML200 není JavaScript; nativní playback má
ERR_BLOCKED_BY_CLIENT/inspector. Ozonová o3uvb.html má archivní404
a UI hlásí nearchivovanou URL. Ochrany nebyly vypnuté ani obejité.
Nezávislý read-only audit potvrdil, že všech22 přesně kanonizovaných
OV URL je již ve full meteo indexu; nepřinesl žádné nové URL.

Kanonická evidence110/110 ověřených souborů; meteo index290 řádků,
108 vybraných URL,88 ověřených zdrojů,20 bez receipt. Z HTML/JS je
získáno73/77 (58HTML a15JS). Chybějí jQuery1.7.1, vlastní a vendor
warnings21d1eec6 JS (blokované playbacky) a ozonová HTML404.
Další nevyřízené typy jsou2CSS a14JSON; ne všechny jejich přesné capture
byly přímo prověřené, proto je nelze hromadně označit za nedostupné.
Reporty `tooling/verification-batch52.json`,
`tooling/queue-all-assets-batch52.json`. Úplnost sběru není potvrzena.
Karty81/82 zavřené, žádné GH/Xcode změny; získané podklady lze již
využívat k rekonstrukci userscriptu bez čekání na zablokované knihovny.

## Audit 55: sběr HTML/JS blokován, nikoli dokončen

27.9.2026: nezávislý read-only audit a rodičovská kontrola znovu porovnaly
290 indexových řádků, aktuální receipts a zbývající frontu. Mezi182 MIME
řádky vynechanými z fronty není žádná URL s příponou .js/.html/.htm.
Jeden skutečný HTML kandidát ale měl typ warc/revisit:
`rad/inca-cz/rad_oznam.utf8.inc`. Uložený INCA JS jej používá přes .html(ajax1),
tedy není správné tento řádek bez kontroly pokládat za pouhý obrázek.
Přesný indexovaný capture20260531161615 byl nyní běžně otevřen a obnoven
ve vestavěném browseru: HTTP404/text/html, UI404 Not Found/nginx.
Request3FD7F661163801358D9068C4628D582F. Žádný source receipt ani uložení
chybové stránky; karta84 po práci zavřena.

Sběr zůstává neúplný:73/77 indexovaných HTML/JS má ověřený replay;
tři JS blokuje browser a ozonové HTML má archivní404. Opakované blokace
jsou doložené předchozími dávkami36,48,50 a52 a přetrvaly i při následném
auditu fronty. Běžné dostupné zdroje byly získány a bezpečný přehlédnutý
HTML kandidát výše prověřen. Další pokusy o stejný blokovaný playback
nebo jeho obejití nejsou pokračováním sběru. Archivní cíl je proto
**blokován**, nikoli prohlášen za kompletní.

Pro navázání potřebujeme nově dostupný doložený capture nebo již získané
zdrojové soubory s původem. Převzaté soubory nejprve projdou kontrolou
MIME, velikosti, SHA256 a příslušnosti k přesnému origin/capture URL;
HTML obal není náhradou za JS. Nejde o výzvu k obcházení ochranné blokace.
Seznam přesných chybějících odkazů, negativních důkazů a omezení:
`.build/archive-reference-20260926/final-source-audit-batch55/observations.json`.

Kanonický manifest má nadále110 ověřených souborů; žádný nový download
se tímto auditem nepřipočítává. Zvlášť zůstávají2CSS a14JSON bez receipt,
ne všechny přímo prověřené. Katalogové URL, původní HTML, prázdné tělo
a skutečně fungující aktuální aplikace nejsou zaměnitelné.
Vývoj userscriptu tento archivní blokátor nezastavuje: potřebné podklady
se mohou používat lokálně, s dosavadními licenčními omezeními. Tehdejší
userscript beta7, GH, Xcode a instalační balíčky tímto auditem nezměněny.

**Doplňující kontrola 28. 9. 2026:** dosud neověřený přesný capture
`om/vystrahy/config/layers.json?_=1787684686018` (20260825190446)
v běžném vestavěném prohlížeči vrátil pouze vnější `200 text/html`.
Archívem automaticky vložený iframe požádal o `.../20260825190446if_/.../layers.json`
(request `02ACD913B3E91ED525B49C70EB23CD5D`), ale načtení skončilo
`ERR_BLOCKED_BY_CLIENT`, `blockedReason: inspector`. Žádný JSON ani nový
receipt nebyl získán. Tento výsledek platí jen pro uvedený capture; zbývající
JSON konfigurace ani dvě CSS nebyly touto kontrolou hromadně ověřeny.

## Kandidáti pro další rekonstrukci VODA a OVZDUŠÍ (2. 10. 2026)

Kurýrní rešerše vytipovala k přímému ověření archivní vstupy
[`?tab=1`](https://web.archive.org/web/*/https://intranet.chmi.cz/?tab=1)
a [`?tab=2`](https://web.archive.org/web/*/https://intranet.chmi.cz/?tab=2).
Pro ovzduší také možné původní výstupy
[`actual_hour_data_CZ.html`](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/web_generator/actual_hour_data_CZ.html)
a [`actual_3hour_map_CZ.html`](https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/web_generator/actual_3hour_map_CZ.html).
Současnými oficiálními kandidáty jsou
[aktuální vodní stavy](https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa),
[tabulka kvality ovzduší](https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-kvality-ovzdusi)
a [AIMgrafy](https://ovzdusi.chmi.cz/AIMgrafy/). Rešeršní prostředí ale
neotevřelo funkční Wayback snapshot `?tab=2`; úplný seznam a přesné historické
`href` položek OVZDUŠÍ zůstávají **neověřené**. Tito kandidáti proto sami
o sobě neaktivují žádný odkaz v rozcestníku.
