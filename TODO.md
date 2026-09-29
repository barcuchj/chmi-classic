# ToDo

## Aktuální cíl a kritérium shody

- [ ] Chrome/Edge doplněk a Tampermonkey userscript mají ze společných zdrojů
  zobrazovat stejný klasický vzhled, navigaci a ovládání každé skutečně
  podporované aplikace ČHMÚ, v samostatné záložce i centrálním panelu.
  Test manifestu musí hlídat pokrytí všech aktivních aplikací a jejich adaptérů;
  za hotovo se počítá až instalační a vizuální ověření obou variant na živých
  stránkách. Neobnovené položky zůstávají neaktivní a označené vysvětlením.
- [ ] Pro GitHub a Chrome Web Store připravit 2–3 skutečné snímky aktuální
  nainstalované verze; nepoužívat staré ani kompozitní obrázky jako důkaz bety.

## Lokální nástroje pro úspornější práci

- [ ] **Blokováno — dokončit sběr archivních HTML/JS:** audit55 potvrdil
  73/77 indexovaných zdrojů. Tři JS mají opakovaně doloženou browser blokaci,
  ozonový HTML capture404. Přehlédnutý HTML include rad_oznam.utf8.inc
  (warc/revisit) nyní přímo ověřen jako404; žádný chybový download započítán.
  Pokračovat při nově dostupném doloženém capture nebo dodaném zdroji,
  bez obcházení ochran. Přesné odkazy a limity v `ARCHIVE_RESEARCH.md`
  a ignorovaném `final-source-audit-batch55/observations.json`.
  Tento stav neblokuje rekonstrukci userscriptu z již získaných podkladů.

- [x] Dávka 44: síťově ověřeno chybějící `rad/info_radar/www_rad.css`
  (HTTP404 konkrétního capture). Konfigurace výstrah download-audio má
  HTML obal200 a blokovaný iframe playback, nikoli získaný JSON. Texts
  pouze prázdný obal dle worker UI, síťový stav neověřen. Žádný nový
  receipt; inventura zůstává93. Důkazy v `negative-checks-batch44/`.

- [x] Dávka 43: devět nových skutečných portálových CSS/JS downloadů
  a tři doplněné receipts již uložených radarových CSS (dva vendor styly).
  Kanonická inventura 93 souborů. Aktuální dependency-status: 30 z 51 URL
  má replay; 10 chybí mimo komentář, 9 jsou komentované alternativy a 2 IE.
  Původ/omezení v ignorovaném `portal-completion-batch43/`.

- [x] Dávka 42: opraven offline audit závislostí z dávky40. Z 31 URL
  bez replay receipt je 9 jen v komentářích a 2 v podmíněných IE stylech;
  20 má odkaz mimo komentář. Nejsou to ověřené síťové requesty ani hotové
  aplikace. Původní inventura zachována; nový report a omezení v ignorovaném
  `dependency-classification-batch42/`. Žádný nový download.

- [x] Dávky 40–41: offline inventura 51 vlastních JS/CSS závislostí a
  doplnění dvou již uložených CSS výstrah do kanonického manifestu.
  81 ověřených souborů, žádný nový download. Podklady v ignorovaných
  `dependency-audit-batch40/` a `reconciliation-batch41/`.
- [x] Uživatel 27.9. výslovně souhlasil s běžným prohlížením archivovaných
  stránek ČHMÚ včetně skriptů. Bez obcházení bezpečnostních blokací.
  `inca-cz/css/main-short2.css` mělo blokovaný přímý playback v dávce40;
  dříve podobně pojmenovaný soubor byl knihovní motiv, ne tento vlastní styl.
  Vlastní CSS se skutečně načetlo přirozeně až v dávce49 (7905 B).
  HTML obal200 nadále není získaným CSS. Další chybějící zdroje viz
  aktuální `portal-completion-batch43/dependency-status.json`.

- [x] Dávka 39: 5 skutečných replay HTML referencí; radarové
  adresáře dokládají názvy dat a předpovědní +10 až +60min, nikoli
  rekonstruované aplikace nebo dostupná PNG. Verifier 79 souborů.
  Původ/omezení: `.build/archive-reference-20260926/directories-batch39/MANIFEST.md`.

- [x] Dávka 38: 9 skutečných query HTML referencí (kamera
  Javorový, MSG IR108, Sucho a dostupná radarová nastavení Luny).
  Kanonický verifier 74 souborů. Nejsou to nové hotové aplikace.
  info_banner prázdný HTML200; Prutoky.html a závislosti kamery404.
  Viz   `.build/archive-reference-20260926/query-presets-batch38/MANIFEST.md`.

- [x] Dávka 37: skutečná HTML tří MSG presetů a tří detailů kamer +
  CSS družic; kanonická inventura 65 ověřených souborů. MSG potvrzuje
  query polohu/vrstvy a staré ovládání; snímky (0/0). Kamery dle Luny
  čekají na data a JS/CSS mají 404. Nejde o dokončené aplikace. Viz
  `.build/archive-reference-20260926/satellite-camera-presets-batch37/MANIFEST.md`.

- [x] Dávka 36: uloženo HTML tří radarových informačních stránek
  (síť, mobilní nápověda, výukový článek). Dokládají pojmy, legendu
  a starý informační layout, nikoli další rekonstruované aplikace.
  Licence CC BY-NC-ND 3.0 CZ, jen ignorované lokální reference. Viz
  `.build/archive-reference-20260926/radar-information-batch36/MANIFEST.md`.
- [ ] Výstrahy 21d1eec6: rodič přímo ověřil vendor JS/CSS v dávce50
  a vlastní main JS v dávce52: HTML obal a blokovaný playback
  ERR_BLOCKED_BY_CLIENT/inspector; JS/CSS nestaženy. Neobcházet blokaci, nezaměnit
  obal HTTP 200 za aplikační zdroj. Jiné získané verze zůstávají zachované.
- [ ] Starý mobilní radar: doložený odkaz z info_mobile má archivní 404.
  Případná další reference musí být doložená indexem/navigací; nejde
  o získaný XHTML viewer. Root rad/ byl HTTP 200 bez vlastního obsahu.

- [x] Dávka 35: získáno HTML mapy kamer s vlastním inline JS/CSS,
  skutečný replay zdroj detailu Lysé hory a HTTP 200 zdroj mapy teplot
  s původními bajty (starší cache/DOM varianty zachovány). Viz
  `.build/archive-reference-20260926/camera-observations-batch35/MANIFEST.md`.
- [ ] Kamery: vlastní detailní JS/CSS mají HTTP 404 a přesné kalendáře
  ukazují nearchivovanou URL; mapa nemá webcams.json (404). Při obnově
  doplnit doložené ovladače nad současným backendem, ne převzít prázdnou mapu.
- [ ] Staré staniční srážky: potvrzena loadstatic URL mapa_srazky1h_0_cz.html
  v portálové navigaci, konkrétní capture 20260614 vrací XHR 404. Odkaz
  není získaný zdroj a wrapper HTTP 200 není funkční srážková mapa.

- [x] Verifier podporuje explicitně označené replay HTML fragmenty
  (pozorovaný HTTP 200), odděleně od vykresleného DOM. Pět nových regresních
  testů ověřuje metadatovou bránu, tvar, chyby i zákaz vykonávání JS.

- [x] Dávka 32: skutečně získáno HTML měsíčního výhledu, článku contrails
  a vysvětlení teplot SIVS. Hash/metoda a omezení v ignorovaném
  `.build/archive-reference-20260926/information-batch32/MANIFEST.md`.
  Nejde o tři rekonstruované aplikace ani aktuální meteorologická data.
- [ ] Měsíční výhled: podle uloženého rozložení dohledat dnešní oficiální
  zdroje textu, statistických tabulek a grafů; teprve potom vytvořit živý
  adaptér. Archivní hodnoty z přelomu 2025/2026 nesmí být výchozí předpověď.
- [x] Dávka 33: `filterlist_min.js` a `meteogram.css` získány jako skutečné
  HTTP 200 odpovědi přirozeně načtených závislostí stránky meteogramů. Přímý
  JS odkaz dříve vracel blokovaný HTML obal; ten se nepočítá jako zdroj.
- [x] Dávka 33: uloženy replay odpovědi úvodního `CR.html`, `PredIco.html`
  a `weather-links.html`; původní DOM exporty zachovány. Doplněn chybějící
  receipt již existujícího CSS webkamer (nejde o nový download).
  Podrobnosti: `.build/archive-reference-20260926/source-batch33/MANIFEST.md`.
- [x] Dávka 48: tři skutečně načtené závislosti meteogramů — jQuery1.8.3,
  custom jQuery UI1.9.2 a mm.css. Uloženy jako ignorované lokální reference;
  96/96 receipts ověřeno. Nejde o nové aplikace ani změnu userscriptu.
  Podrobnosti: `ARCHIVE_RESEARCH.md` a `meteogram-dependencies-batch48/`.
- [x] Dávka 49: vlastní původní INCA main-short2.css (7905 B), čtyři
  knihovny radaru/kamer a čtyři vendor soubory dvou generací výstrah.
  105/105 receipts ověřeno; vlastní CSS není dříve zaměněný knihovní motiv.
  Reference a omezení v `ARCHIVE_RESEARCH.md`, ignorovaných
  `inca-dependencies-batch49/` a `warnings-dependencies-batch49/`.
- [x] Dávka 50: skutečné kořenové HTML výstrah získané z kalendáře;
  106 receipts. Dva přesné vendor zdroje21d1eec6 a jeden indexovaný JSON
  mají HTML obal a blokovaný playback; nebyly přijaty jako zdroje.
  Šest odlišných runtime config URL má404. Evidence v
  `collection-audit-batch50/`; není to hotová výstražná aplikace.
- [x] Dávka 51: skutečné query HTML ALADINu ze sporného řádku;
  živý OV index má dvě mezery, starší export je sloučil. Přesný href
  i připojený text zachovány, nová doložená kopie meteo indexu má290 řádků
  a žádný neplatný vstup. Kanonický verifier107/107, utility testy40/40.
  Mezistránka meteogramů přejde na již získaný mhtml/m.html; její vlastní
  tělo nebylo uloženo, receipt nevytvořen. Viz `aladin-index-reconciliation-batch51/`.
- [x] Dávka 52: uložena tři úplná HTML — prázdný radarový root,
  prázdný banner a přechodový meteogram. Nejsou to tři nové aplikace;
  přechodové tělo se tentokrát podařilo získat před nativním redirectem.
  Kanonická evidence110/110; v meteo indexu73/77 HTML/JS získáno.
  Zbývají tři blokované JS a ozonová404. Dva CSS a14 JSON jsou doplňkové
  nevyřízené zdroje; ne všechny mají přímou kontrolu přesného capture.
  Viz `collection-boundaries-batch52/` a `ARCHIVE_RESEARCH.md`.
- [ ] Archivní předpověď: Predpo1/weather.html a vysvetlivky.html vrací404
  s hlášením nearchivované URL; index Predpo1 bez capture. Případné jiné
  zdroje hledat z doložené navigace. Predpo2–6 zatím neověřeny, neoznačovat
  automaticky za nedostupné. Není to důvod skrýt současnou živou předpověď.
- [x] Dávka 34: získány skutečné HTTP 200 odpovědi `weatherXY.css`,
  `weatherRcol.css`, `weatherCR.css` i šest dalších vlastních portálových
  CSS/JS. Styly dokládají `.cCR`, `.cOther-days` a `#iWeather-links`.
  Již uložené celé HTML homepage doplněno do společného manifestu po
  ověření gzip/hash; nejde o nový download. Podrobnosti:
  `.build/archive-reference-20260926/homepage-batch34/MANIFEST.md`.
- [ ] Homepage: převést doložené pevné rozměry a rozložení do vlastního
  dynamického adaptéru nad současnými oficiálními daty. Obrázky/ikony
  a VODA/OVZDUŠÍ nejsou získáním portálových CSS automaticky dokončené.
- [ ] Ozon `ozon/o3uvb.html`: konkrétní capture 20260614 nyní 404;
  případnou jinou doloženou variantu hledat v navigaci/indexu, ne odhadem.

- [x] Přidány a ihned použity `script/archive_verify.mjs`,
  `script/archive_queue.mjs` a `script/check.mjs` s regresními testy.
  Postup: `ARCHIVE_WORKFLOW.md`. Kontrola sestavuje userscript dočasně,
  bez přepsání rozpracovaného souboru a bez GH/Xcode.
- [x] Ručně vyřešit řádek ALADIN animace: dávka51 zachovala skutečné
  td.textContent a href živého OV indexu, potvrdila dvě mezery a HTTP200
  vlastního HTML. Nový `indexes/chmi-wayback-meteo-url-index-290-reconciled-batch51.json`
  mění jedinou URL buňku na doložený kanonický tvar; starý export zachován.
  Text o prioritě parametrů nebyl odstraněn a adresa nebyla odhadnuta.
- [x] Archivní CSS ALADINu získáno a lokálně ověřeno:
  `styles/chmi-ala-20241123-replay-31.css` v archivu 20260926. Původní
  `raw/assets/ala.css` z archivu 20260920 zůstává chybovým HTML, nikoli CSS.

## Skutečný stav rekonstrukce

**Odkaz v katalogu není obnovená aplikace.** Starší záznamy o verzích 0.5/0.6
popisují především katalog odkazů a obecné úpravy rámu stránky, nikoli hotový
návrat původního ovládání. Za dokončenou rekonstrukci se považuje až živá
aplikace ve starém rozhraní s ověřeným ovládáním a rozložením.

| Část | Stav |
| --- | --- |
| Radar, MSG/Meteosat, polární a geostacionární družice, houby, ALADIN | Zapojené do centrálního panelu; implementace existuje, úplné ověření a dílčí opravy ještě probíhají. |
| Webové kamery | Beta 3: odkaz aktivní; adaptér používá nativní mapu, filtry, seznam, živý snímek a časovou osu. Nové rozložení a instalaci ještě nutno vizuálně ověřit. Grafy měření nejsou u ověřeného detailu Brno dostupné. |
| Meteogramy | Beta 10: živý graf, vyhledávání a tabulky jsou v kompaktním adaptéru; odkaz v původním rozcestníku je aktivní. Instalaci a vzhled v panelu i samostatně zbývá ověřit. |
| Další měření a stanice, synoptika, letectví, historické výstupy | Dohledané katalogové odkazy nejsou dokončenými aplikacemi intranetu; rekonstrukce zbývá. |
| Open Data a archivy | Referenční zdroje, nikoli rekonstruované aplikace. |
| Úvodní předpovědní mapa | Beta 5: živá mapa a přepínače Dnes/Zítra/Pozítří zapojeny do userscriptu i výchozího panelu. Dnešek/zítřek vývojově ověřeny samostatně při 1280 × 720; instalace, rámec, úzké okno a plná historická věrnost zbývají. |

- [x] Archivní podklady úvodu POČASÍ: ve vestavěném prohlížeči staženy
  `CR.html` (mapa a 13 stanic), `PredIco.html` (pravý třídenní panel) a
  `weather-links.html` (37 odkazů); soubory a původ jsou v ignorovaném
  `.build/archive-reference-20260923/map_meteo_portal/` a v
  `ARCHIVE_RESEARCH.md`. Jsou to historické reference, nikoli živá aplikace.
- [ ] Obnovit úvodní mapu a třídenní předpověď v původním rozložení s aktuálními
  oficiálními daty. Nepoužívat archivní teploty jako současné ani nepřibalit
  historické obrázky/ikony bez ověřené licence. Ověřit funkci i v menším okně.
- [x] Beta 5: začlenit `forecast.js/css` do generátoru userscriptu, aktivovat
  Předpověď pro ČR a použít ji jako výchozí aplikaci. Kompaktní pracovní plocha
  ponechává nativní SVG, teploty, ikony a původní backend. Ovladače dnů a
  ráno/odpoledne nepoužívají archivní hodnoty. Přidán regresní test odložené
  inicializace: nativní `checked` se mění po asynchronním vykreslení, bez DOM
  mutace. Prvotní souběžné požadavky ČHMÚ řeší jednorázová obnova vybraného období.
- [x] 27. 9. 2026 vývojové ověření celého userscriptu ve vestavěném browseru
  se simulovanými GM funkcemi: dnešek a zítřek, 13 živých měst, přechod
  ráno → odpoledne (Praha 8 → 22 °C), dokument 1280 × 720 bez scrollu.
  Toto není test instalace do Tampermonkey.
- [x] Beta 6: obnovit třídenní panel podle struktury archivního `PredIco.html`
  s aktuálními ikonami a teplotami z oficiálního API. Chybějící období je
  neklikatelné „Není údaj“, nikoli odhad. Ověřeno přepnutí mapy a navigace
  na Pozítří; viewporty 1280 × 720 a skutečně emulované 390 × 844 bez scrollu
  dokumentu, všechny dostupné ikony načtené, konzole bez error/warn.
  Přidány regresní testy validace období, slučování průběžné nabídky a URL.
- [x] Beta 7: ve vysokém úzkém viewportu využít volný prostor pod mapou
  pro živý seznam měst; poměr stran odvozen z nativního SVG, žádná deformace.
  Vývojově ověřeno390×844,1280×720 a390×500 bez scrollu dokumentu,
  přepnutí období (Praha22→7°C),13 měst a zachování ručního sbalení při resize.
  Konzole bez error/warn. Toto není ověření instalace v Tampermonkey.
- [ ] Předpověď: ověřit instalovaný userscript a centrální panel
  včetně zvětšení a navigace dnů. Vývojové `eval` v rámci blokuje CSP ČHMÚ;
  ochrana nebyla vypnuta ani obejita. Původní neúčinný viewport override
  z bety 5 byl v betě 6 nahrazen ověřenou CDP emulací; to není test telefonu.
  27.9. přístup k otevřené stránce Tampermonkey blokuje browser URL politika;
  aktualizaci instalovaného skriptu je nutné provést ručně, bez obcházení.
- [ ] Předpověď: historicky věrný mapový podklad s doloženou licencí.
  Současná beta má barevné krajské SVG, nikoli historickou reliéfní mapu.
  Nadbytečnou výšku v portrétu využívá beta7 pro živý seznam měst.
  Věrný reliéfní podklad a ověření dalších poměrů stran zůstávají otevřené.
- [ ] VODA a OVZDUŠÍ: původní `hydro_map.html` a `air.html` nejsou v přesných
  kalendářích Wayback zachyceny. Doložit vzhled jinými archivními zdroji a
  ověřit nově vytvořené živé adaptéry v instalovaném userscriptu. Beta 8
  používá doložené aktuální mapy a skrývá okolní dlouhé články; živý DOM
  obou map byl ověřen 28. 9., ale vizuální QA této bety čeká na instalaci.
- [ ] Měření z Klementina: původní rozcestník dokládá položku, ale ne obsah
  její cílové stránky. Současná oficiální stránka stanice a historická data
  umožňují živou adaptaci; před aktivací odkazu navrhnout a ověřit starý
  vzhled, oddělit operativní měření od historických řad a zkontrolovat licenci.
- [ ] Ověřit webkamery v nainstalovaném userscriptu a Chrome/Edge rozšíření:
  přehled ČR, filtr, výběr, detail se snímkem a časovou osou, rozložení v panelu
  i samostatně a šířky desktop/mobil. Teprve potom označit rekonstrukci hotovou.
- [x] Archiv webkamer: 26. 9. 2026 přes vestavěný prohlížeč staženo HTML
  přehledu, jeho `index.js` a CSS (HTTP 200) a uloženo HTML detailu Lysé hory.
  Původ, hashe a omezení jsou v ignorovaném
  `.build/archive-reference-20260926/webcams/MANIFEST.md` a v
  `ARCHIVE_RESEARCH.md`. `webcams.json` je v archivu 404; zdroje nejsou
  důkazem funkčních fotografií a detailní `prohlizec_v2.js/css` zatím chybí.
- [ ] Webkamery: ověřit možnosti současného backendu pro původní filtry
  kraj/pobočka, řazení, statické/animované náhledy, obnovu a odkaz na nastavení;
  rekonstruovat doložené ovladače. Současný adaptér jen mění rozložení a
  tyto historické funkce zatím sám nedoplňuje.
- [x] Živý podklad kamer 26. 9. 2026: v nativním přehledu ověřeno 98 kamer,
  filtr Jihomoravského kraje (5 výsledků), detail Brna se skutečným snímkem,
  posun časové osy a spuštění/zastavení animace. Schéma a přesné pozorované
  zdroje jsou v `.build/archive-reference-20260926/webcams/LIVE_REFERENCE.md`.
  Nejde o ověření instalovaného userscriptu nebo obnovených starých ovladačů.
- [x] Archiv blesků: Luna našla snapshot `data_jsceldnview.html`; 26. 9. 2026
  uložen přes builtin browser jako HTTP 200 HTML s vlastním inline JS.
  Hash, datový tok a ovladače doloženy v ignorovaném
  `.build/archive-reference-20260926/lightning/MANIFEST.md`. CSS a datový
  iframe jsou 404; meteorologické snímky nejsou součástí reference.
- [ ] Blesky: podle uloženého vieweru ověřit a obnovit staré ovladače nad
  současnými oficiálními daty; adresářový PNG backend archivu nepředpokládat
  u dnešní aplikace. Živě ověřená stránka ČHMÚ 29. 9. nabízí vrstvu
  Radar a Blesky; pokročilý radar má výchozí MAX Z(mask) + blesky a dvě
  průhlednosti. Samostatný CELDN produkt a sdílitelný preset ale ověřeny
  nejsou, takže položka v rozcestníku zůstává neaktivní. Zvlášť ověřit
  polohu/kříž, snímky a rozložení bez scrollu.
- [ ] Radarové odhady srážek: původní odkaz na homepage vede na dodnes živý
  HPPS viewer `https://hydro.chmi.cz/hppsoldv/main_rain.php` s nativními
  intervaly 1/3/6/24 h, variantami i časovou řadou. Adaptér, přesné Chrome
  iframe pravidlo a regresní testy jsou připravené; vývojově ověřeno při
  1280 × 720 bez celostránkového scrollu a s fungujícím nativním výběrem
  času. Živá stránka se také načetla v testovacím iframe na chmi.cz.
  Zbývá instalační/iframe test hotového userscriptu a Chrome rozšíření,
  zejména v úzkém okně; teprve pak označit hotovo.
- [ ] Meteogram beta 10: vizuálně a instalačně ověřit skutečný graf, vyhledání
  jiné lokality, poslední místa a rozložení v panelu i samostatné záložce.
  Další skupiny aplikací uvedené výše rekonstruovat samostatně; samotná URL
  nebo obecný rám stránky není důkaz dokončení.
- [x] Archiv sondáží: 26. 9. 2026 uložen HTTP 200 viewer `oa/ptu_grafy.html`
  s vlastním inline JS, pěti typy grafů a termíny. Hash a datový tok v
  `.build/archive-reference-20260926/sonde/MANIFEST.md`; CSS a obrazový
  backend jsou v daném replay 404. Nejde o hotovou aplikaci userscriptu.
- [ ] Sondáže: ověřit současné oficiální grafy a tabulku hladin a obnovit
  doložené typy/termíny ve starém uspořádání. Nepředpokládat, že moderní
  web používá stejný adresář PNG; ověřit i dynamické rozložení bez ořezu.
- [x] Archiv družic: 26. 9. 2026 skutečně uloženy oba uživatelem zadané
  MSG/AVHRR viewery s inline JS, dostupné CSS a overLIB. Čtyři hashově
  ověřené soubory v `.build/archive-reference-20260926/satellite/MANIFEST.md`.
  CSS/overLIB mají jiný snapshot než HTML; datové aplikace nejsou kompletní.
- [x] Lokální inventura uložených HTML/JS a kandidátů ze dvou CDX indexů
  v `.build/archive-reference-20260926/INVENTORY.md`; neprokazuje úplnost archivu.
- [x] Zachyceny všechny stránky aktuálně zobrazených Wayback URL indexů:
  `meteo/*` 290 URL, `ov/*` 22 jako podmnožina. JSON, hashe a rozlišení
  index/stažený zdroj v `.build/archive-reference-20260926/indexes/MANIFEST.md`.
- [x] Staženo HTTP 200 HTML SIVS a fragment agropočasí. SIVS je informační
  stránka, druhý promo fragment, nikoli další funkční meteorologické aplikace.
- [ ] Prověřit přesné indexované query capture šesti výstrahových konfigurací;
  starší 404 odlišných požadavků není důkaz jejich nedostupnosti. Viz manifest
  `indexes/`; historická data výstrah nepoužívat jako současná.
  Pokus o přesnou variantu `layers.json` získal jen HTML obal; JSON playback
  browser zablokoval. Ostatní konfigurace neověřeny. Důkaz v `information/MANIFEST.md`.
- [x] Archiv Sucho, synoptická předpověď a ranní stavy vody: tři HTTP 200
  HTML, hashe a skutečná klasifikace v `information/MANIFEST.md`. Statické
  reference nejsou dokončené živé aplikace; obrazová data nebyla přibalena.
- [ ] Získat zbývající viewer HTML/JS z inventury:
  další předpovědní mapy, agropočasí, sucho, SIVS a zachycené skupiny. Dostupné
  soubory a dependencies ověřovat obsahově, nejen podle CDX/statusu.
- [x] Luna stáhla teplotní mapu a detail stanice Ústí nad Labem: dvě
  hashově ověřené binární HTML reference v
  `.build/archive-reference-20260926/observations/MANIFEST.md`.
  U mapy původní HTTP status nedoložen (resource cache), stanice HTTP 200;
  deset historických grafů se v browseru načetlo, PNG se lokálně neukládají.
- [ ] Měření: podle zachycených HTML obnovit ovladače hodin, veličin a detailu
  stanice nad ověřenými současnými daty. Historické hodnoty nepoužívat jako
  živé, licenci obrázků/obsahu nelze dovodit z veřejné dostupnosti.
- [x] Archiv výstrah: čtyři HTML varianty/obal a hlavní JS/CSS dvou verzí
  skutečně staženy (osm souborů, jedna aplikace); hashe a dvě syntaktické
  JS kontroly prošly. Podrobnosti v
  `.build/archive-reference-20260926/warnings/MANIFEST.md`.
- [ ] Výstrahy: dohledat konfigurace a mapové/datové zdroje; šest JSONů
  při načítání vracelo 404, mapa zůstala prázdná. Licence balíku `iblsoft`
  není doložena; archivní zdroj nesmí být automaticky součástí MIT balíčku.
- [x] Archiv radar/INCA: 26. 9. 2026 získány obě HTML, vlastní INCA JS
  a tři knihovní CSS (šest ověřených souborů). Vlastní hlavní CSS získáno
  až v dávce49; starší podobný název patřil knihovnímu motivu. Podrobnosti v
  `.build/archive-reference-20260926/radar/MANIFEST.md`. Skript staršího
  radaru je 404; část INCA historických snímků se vykreslila, ne aktuální data.
- [x] Luna stáhla ALADIN animační HTML; vlastní externí JS a CSS mají 404.
  Hash a povaha šablony v `.build/archive-reference-20260926/alanim/MANIFEST.md`.
- [ ] Získat chybějící vlastní JS radaru/ALADIN animace z dalších doložených
  zachycení; uložené HTML nezaměňovat za kompletní datové implementace.
- [x] Archiv ozonu: 26. 9. 2026 staženy MSAF viewer, grafový viewer
  časového vývoje (devět lokalit, roční/měsíční) a vlastní CSS. Hashové
  kontroly všech tří souborů a syntaktické parsování vlastního inline JS
  prošly; podrobnosti v `.build/archive-reference-20260926/ozone/MANIFEST.md`.
  Ovladače Hradce Králové mění volbu/PNG cestu, ale grafová data vracejí 404.
- [ ] Ozon/UVB: capture `o3uvb.html` je v indexu, replay vrací 404 i po
  kliknutí na indexový odkaz. Dohledat další doloženou referenci; chybovou
  stránku nepovažovat za zdroj ČHMÚ.
- [x] Portálový meteogram `meteogram_page_portal/m.html` prověřen: otevírá
  již uložený `mhtml/m.html`; nejde o další nezávislou aplikaci. Tělo
  přechodové stránky nebylo zachyceno a nedokazuje nové historické ovladače.
- [x] Lokálně porovnány archivní meteogramy se současným adaptérem: doloženy
  staré kategorie, čtyři poslední lokality, rozšířené volby a výběr běhu.
  Beta 9 vrací čtyři poslední místa přes ověřené živé URL; nativní vyhledávání
  Prostějov → Brno a živý graf byly ověřeny 28. 9. ve vestavěném prohlížeči.
  Staré volby kategorií/běhu nejsou obnoveny; přístup k nim v dnešním backendu
  není ověřen. Rozdíl je zapsán v `ARCHIVE_RESEARCH.md`.
- [ ] Meteogram: ověřit rozpracovaný samostatný adaptér při funkčním grafu ve
  1280×720 a menším okně, vyhledání jiné lokality, přepínání grafových veličin,
  návrat přes lištu posledních míst, interní scroll hodinové tabulky a žádný
  scroll celé stránky. Poté doplnit
  bezpečné otevření v centrálním panelu; historickou volbu běhu modelu
  nepředstírat, pokud ji živé ČHMÚ neposkytuje. Syntetický náhled při 390×844
  nemá scroll celé stránky, ale původní široký graf je v portrétu drobný;
  skutečná čitelnost a chování nativního grafu čekají na instalační test.

## Portál 0.7 – rozpracováno (22. 9. 2026)

- [x] Userscript sestavuje portál s centrálním rámcem a explicitním registrem
  současných aplikací; původní DOM zůstává dostupný přepnutím na nový vzhled.
- [x] Odstraněny vysoké hlavičky/bannery; Počasí/Voda/Ovzduší jsou v úzké
  společné liště. Zvětšení panelu ponechává živý rámec načtený.
- [x] Adresy v rozcestníku jsou skutečné současné URL; pouze běžné kliknutí
  zachytává portál. Přidán odkaz Otevřít samostatně.
- [x] Regresní test pro přepis URL v Meteosatu: označení rámce a relace
  zůstává ve frame.name, příjem zpráv ověřuje zdroj, origin a relaci.
- [ ] Dokončit živé kontroly kompaktního MSG, ALADINu a hintu kolečka,
  polárních/geo družic a hub v panelu i samostatně, na menších oknech.
- [ ] Ověřit automatické spuštění ve všech rámcích ze skutečně instalovaného
  Tampermonkey. Dosavadní IAB kontroly jsou dočasná vývojová injekce kódu.
- [x] Doplněny dva skutečné screenshoty do uživatelského README (radar v portálu,
  zvětšený Meteosat); původní anotované podklady ve screens/ se nezveřejňují.
- [x] Aktualizován běžný instalační návod pro betu 0.7.0-beta.1; starší vydané
  balíčky 0.4.1 jsou výslovně oddělené od nového portálu.
- [x] Vývojově ověřen radar a zvětšený Meteosat při 1440 × 900 bez scrollu
  celého dokumentu; stupnice radaru zůstala uvnitř mapy. Nejde o instalační test.
- [x] ALADIN: první R3 snímek chybí už v oficiálním DOM; beta 2 zobrazuje
  vysvětlení. Další termín načte všechny čtyři původní snímky včetně jejich
  podkladů. Dynamické rozložení ověřeno při 1440 × 900 a 390 × 844 bez scrollu.
- [ ] Ověřit nové adaptivní rozložení ALADINu také v centrálním panelu
  a při změně běhu modelu ze skutečně instalovaného userscriptu.
- [x] ALADIN: k výchozím čtyřem mapám doplněn kompaktní výběr všech 11
  veličin ověřených v živém nativním panelu ČHMÚ. Volby používají jeho
  checkboxy a mapová mřížka se přepočítává podle skutečného počtu buněk;
  regresní testy pokrývají 1, 5 a 11 map. Nárazy větru ve výběru nejsou.
- [x] ALADIN: 26. 9. 2026 vývojově ověřen celý sestavený userscript se
  simulovanými GM funkcemi: 11 map při 390 × 844, čtyři mapy při 1440 × 900,
  bez scrollu dokumentu a bez ořezu buněk. Ověřen přepínač běhu modelu,
  tříhodinový posun kolečkem, nabídka uvnitř okna a návrat do nového vzhledu.
  Jde o samostatnou živou stránku, nikoli instalaci Tampermonkey či iframe.
- [ ] ALADIN: vizuálně ověřit novou nabídku a rozložení v nainstalovaném
  userscriptu, v centrálním panelu i samostatně a na úzkém okně. Archivní
  animace měla také volbu polohy, rychlosti a uložení nastavení; tyto funkce
  nejsou tímto výběrem obnovené.
- [x] Zapojit výchozí mapu ČR s živou předpovědí, nikoli archivními teplotami;
  zbývající vizuální a instalační kontrola je v části Úvodní předpovědní mapa výše.
- [x] Voda/Ovzduší: zapojit současné oficiální živé mapy do centrálního panelu a přidat old-portal obal bez nahrazení `#chmu-map-container` nebo nativního ovládání.
- [ ] Voda/Ovzduší: po instalaci ověřit živý DOM, vrstvy/ovladače, změnu velikosti a chování v menším okně; poté teprve označit rekonstrukci za vizuálně ověřenou.
- [ ] Postupně rekonstruovat další položky původního rozcestníku podle archivních HTML/JS a ověřených živých zdrojů; pouhý moderní odkaz není hotovo.
- [ ] Prozkoumat uložené referenční HTML/JS/CSS v .build/archive-reference-20260920;
  nepřebírat neověřenou licenci ani staré závislosti do distribuovaného kódu.
- [x] Chrome/Edge zdroje a manifest synchronizovány pro podporované aplikace;
  beta ZIP vytvořen bez Safari balíčku a zkontrolován.
- [ ] Vizuálně a instalačně ověřit nové Chrome/Edge rozšíření; Safari zůstává
  nesynchronizované pro portál 0.7 a potřebuje samostatný build/test.
- [ ] Před vydáním ověřit výchozí zastavení radaru na nejnovějším měření,
  nikoli na posledním extrapolovaném předpovědním snímku.

## Rozpracováno / vyžaduje ruční živý browser test

- [ ] Ověřit verzi 0.6.0 v Chrome/Edge proti živému DOM ALADINu a potvrdit, že
  tlačítko `4 mapy` skutečně aktivuje přesně teplotu ve 2 m, oblačnost, srážky
  za 3 h a vítr v 10 m a že při současné struktuře stránky funguje volba čtyř
  sloupců.
- [ ] Projít reprezentativní stránky každé nové katalogové skupiny v desktopovém
  i menším okně: meteogram, webkamery, naměřená data, synoptika, letectví,
  historická data a HPPS. Potvrdit, že old-look rám nezakrývá nativní ovládání.
- [ ] Znovu ručně potvrdit původních šest aplikací verze 0.4.1: Radar, homepage
  radar, Meteosat, Polární, Geo a Houby; zvlášť režimy `Dle okna / Zoom 4x /
  Zoom 8x / Web Maps`, mapové vrstvy a časové osy.
- [ ] Ověřit Safari build na macOS přes `./script/build_and_run.sh --verify` a
  přístup k novým doménám/cestám v oprávněních Safari Web Extension.
- [ ] Ověřit katalog a archivní odkazy v Tampermonkey v Safari/Firefox/Chromium.

## Neověřené nebo záměrně nehardcodované body

- [ ] Dohledat stabilní oficiální přímé PNG/JPG endpointy pouze tam, kde je ČHMÚ
  veřejně dokumentuje nebo dlouhodobě odkazuje. Do té doby používat živé
  produktové stránky a Open Data, nikoli odhadnuté URL.
- [ ] U CELDN doplnit konkrétní Wayback timestamp pouze tehdy, když jej lze
  spolehlivě ověřit v Internet Archive; do té doby ponechat index `web/*/` a
  stav jasně označený jako archivní. U webkamer jsou konkrétní snapshoty
  přehledu a detailu Lysé hory již ověřené v `ARCHIVE_RESEARCH.md`; jejich
  archivní snímky ani živý datový tok tím potvrzeny nejsou.
- [ ] Dohledat samostatné původní endpointy pouze pro zbývající položky označené
  `Nedostupné` (např. mapa sněhu – hodnoty, zásoby vody, mapa zatížení sněhem,
  samostatná synoptická předpověď); bez ověření nevytvářet falešný viewer.
- [ ] U webkamer ověřovat grafy teploty/dalších veličin pouze u konkrétních kamer,
  kde je zdrojová stránka skutečně nabízí; katalog nic nesimuluje.

## Plánováno

- [ ] Připravit publikační balíčky a metadata pro katalogy prohlížečů až po
  ručním převzetí této verze.
- [ ] Doplňovat nové položky katalogu pouze po ověření současné oficiální URL
  nebo jednoznačného archivního snímku.

## Historické implementační kroky (ne seznam hotových aplikací)

- [x] Doplněny ověřené HTML snapshoty ALADIN animace, ALADIN map a meteogramů;
  zdokumentovány datové cesty `mdirs.txt`, `nameid`, mapové PNG a hash lokality.
- [x] Katalog dostal přímé archivní odkazy, odkaz na všechny snapshoty, parametrizovaný
  preset Praha-Libuš a příklad meteogramu pro Prostějov.
- [x] Katalog vizuálně odlišuje položky bez rekonstruované aplikace: červený
  přeškrtnutý text bez URL a informační bublina s důvodem nedostupnosti.
- [x] Verze 0.6.0: systematický archivní průzkum staré homepage/sitemapu, původních endpointů a dostupných Wayback snapshotů; provenance v `ARCHIVE_RESEARCH.md`.
- [x] Verze 0.6.0: responzivní legacy shell pro `intranet.chmi.cz` / `portal.chmi.cz` a historické statické aplikace bez kopírování nedoložených CSS/JS/obrazových assetů.
- [x] Verze 0.6.0: rozšířený katalog s rozlišením `Legacy` / `Přímý` / `Archiv` / `Nedostupné` a odkazy na současné náhrady.
- [x] Verze 0.5.0: jednotný katalog živých a archivních meteorologických výstupů.
- [x] Verze 0.5.0: ALADIN old-look rám a volitelný preset čtyř klasických map.
- [x] Verze 0.5.0: přidány katalogové položky/URL pro meteogramy, webkamery,
  naměřená data, synoptiku, letectví, historické výstupy, Open Data a archivy.
  **Pouze katalog odkazů — rekonstrukce těchto aplikací není dokončená.**
- [x] Verze 0.5.0: zalamování společné navigace bez povinného horizontálního scrollu.
- [x] Verze 0.5.0: synchronizace nových společných zdrojů do Safari,
  Tampermonkey a release skriptů.
- [x] Verze 0.4.1: společné dynamické fit-to-window rozložení pro radar, homepage
  radar, Meteosat, polární a geostacionární družice a pravděpodobnost růstu hub.
- [x] Verze 0.4.1: odstranění překryvu radarového přepínače s nativními mapovými
  ovladači pomocí dynamického odsazení.
- [x] Klasický režim radaru včetně přepínače `Dle okna / Zoom 4x / Zoom 8x / Web Maps`.
- [x] Společný zdroj rozšíření pro Chrome/Edge a Safari.
- [x] Klasický režim animovaného prohlížeče Meteosat s produktovou maticí,
  přehráváním, aktualizací a zachovanými živými daty.
- [x] Klasický rám a výběr produktů pro současné stránky polárních a
  geostacionárních družic.
- [x] Samostatný Tampermonkey userscript generovaný ze stejného JS/CSS.
- [x] Verze 0.4.0: společná kompaktní navigace mezi původními old-look stránkami.
- [x] Verze 0.4.0: izolovaný old-look rám pro radarovou sekci na úvodní stránce.
