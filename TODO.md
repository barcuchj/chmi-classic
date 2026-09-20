# ToDo

## Portál 0.7 – rozpracováno (20. 9. 2026)

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
- [ ] Obnovit výchozí mapu ČR s živou předpovědí, nikoli archivními teplotami.
- [ ] Rekonstruovat Vodu/Ovzduší a postupně všechny položky původního rozcestníku
  podle archivních HTML/JS a ověřených živých zdrojů; pouhý moderní odkaz není hotovo.
- [ ] Prozkoumat uložené referenční HTML/JS/CSS v .build/archive-reference-20260920;
  nepřebírat neověřenou licenci ani staré závislosti do distribuovaného kódu.
- [ ] Po ověření userscriptu teprve synchronizovat a testovat rozšíření.
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
- [ ] U webkamer a CELDN doplnit konkrétní Wayback timestamp pouze tehdy, když jej
  lze spolehlivě ověřit v Internet Archive; do té doby ponechat index `web/*/` a
  stav jasně označený jako archivní.
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

## Dokončeno

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
- [x] Verze 0.5.0: meteogramy, webkamery, naměřená data, synoptika, letectví,
  historické výstupy, Open Data a archivy v jedné navigaci.
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
