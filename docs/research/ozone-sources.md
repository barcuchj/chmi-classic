# Ozon: historické ovládání a dnešní zdroje

Ověřeno **2026-10-03 08:46:07 CEST (06:46:07 UTC)** výzkumným agentem Luna.
Archivní HTML četl staticky; jeho skripty nespouštěl. Živé stránky kontroloval
v oddělené skryté kartě vestavěného prohlížeče. Archivní snímky dokládají
tehdejší rozhraní, ne dnešní hodnoty. Lokální reference pod `.build/` jsou
ignorované podklady, nejsou přílohami veřejného repozitáře.

## Ozonové a UV zpravodajství

- Archivní navigační URL je [`ozonove-a-uv-zpravodajstvi`](https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi); v [ARCHIVE_RESEARCH.md](../../ARCHIVE_RESEARCH.md) je vedena jako neověřená. Samostatný kandidátní soubor `https://intranet.chmi.cz/files/portal/docs/meteo/ozon/o3uvb.html` má v URL indexu capture `20260614103934`, ale přesný [Wayback replay](https://web.archive.org/web/20260614103934/https://intranet.chmi.cz/files/portal/docs/meteo/ozon/o3uvb.html) vrací 404. Uložené HTML ani ovládání této historické stránky proto nejsou doloženy; chybová stránka není zdroj ČHMÚ.
- Dnešní živá stránka ČHMÚ je [Aktuální ozón a UV index](https://www.chmi.cz/predpoved-pocasi/rizika/aktualni-ozon-uv-index), dostupná také z [rozcestníku naměřených dat](https://www.chmi.cz/namerena-data). Vykreslila graf denních průměrů celkového ozonu a další tři části: předpověď UV indexu, on-line měření UV a aktuální UV-Index. Legenda vykreslených grafů uvádí denní průměr/předpověď, předběžnou hodnotu a kvantily Q25/Q50/Q75. ČHMÚ uvádí měření celkového ozonu na Solární a ozonové observatoři v Hradci Králové a převzetí předpovědi z TEMIS; předpověď UV je pro jasný den také z TEMIS.
- Aktuální UV tabulka se v prohlížeči vykreslila pro Kuchařovice, Luční boudu, Hradec Králové a Košetice: všechna čtyři zobrazená čísla byla **0,3**, čas vydání **3. 10. 2026 08:30**. Jde o dnešní živá data, ne archivní hodnoty. Obsah poskytují grafové komponenty ČHMÚ a dynamická tabulka; jejich interní datové URL jsem nezjišťoval.
- Tato stránka je doložený dnešní zdroj pro ozon/UV informace. Přesnou návaznost na starou stránku `o3uvb.html` ani její původní ovládání z dostupného archivu určit nelze.

## Družicové měření ozonu

- Historická navigační URL [`druzicove-mereni-ozonu`](https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu) je v [ARCHIVE_RESEARCH.md](../../ARCHIVE_RESEARCH.md) rovněž označena jako neověřená. Samostatný související viewer je však zachycen: [AC SAF / O3M SAF HTML, capture 2026-08-25](https://web.archive.org/web/20260825190505/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jso3msafview.html), uložen lokálně v `.build/archive-reference-20260926/ozone/chmi-ozone-msaf-20260825-replay.html` (lokální podklad). HTML jej označuje `portal_O3MSAF` a popisuje produkt GOME-2 na družicích Metop.
- Doložené ovládání: výběr každého 3. nebo 6. snímku z vícenásobného seznamu a „Nahraj výběr“; první/předchozí/zastavit/přehrát/následující/poslední; rychlost animace 250 ms až 5 s na snímek, prodleva posledního snímku a automatická aktualizace po 5/15/60 minutách nebo ručně. Tři volby vrstev nastavují hranice, stanice či zeměpisnou síť. Nastavení šlo uložit do cookies nebo záložky. Měřítko celkového ozonu bylo součástí HTML.
- Viewer odkazoval na samostatné [grafy časového vývoje](https://web.archive.org/web/20200129130039/http://portal.chmi.cz/files/portal/docs/meteo/sat/data_jso3msafview_evolution.html), lokálně uložené jako `.build/archive-reference-20260926/ozone/chmi-ozone-evolution-20200129-replay.html` (lokální podklad). Nabízely 9 lokalit a volbu ročního/měsíčního grafu. Kontrola změny stanice a typu změnila cílovou PNG cestu, ale roční i měsíční graf Hradce Králové vracely 404.
- Archiv tedy dokládá HTML obal a ovladače, nikoli vykreslená historická družicová data: adresář `o3msaf/total_ozone_ce/` i překryvné vrstvy vracely 404. Velikosti, hashe a podrobnosti jsou v `.build/archive-reference-20260926/ozone/MANIFEST.md` (lokální podklad).
- Dnešní oficiální [stránka snímků z geostacionárních družic](https://www.chmi.cz/namerena-data/geostacionarni-druzice/sandwich-ir-bt) vede do [prohlížečky Meteosat](https://produkty.chmi.cz/druzice/). Její nabídka obsahuje MTG/MSG, projekce, meteorologické produkty (např. Sandwich IR BT, IR, VIS-IR, Airmass), časové rozsahy, animaci, mapové vrstvy, automatickou obnovu a export. Po počátečním načítání se vykreslil snímek „MTG - Sandwich IR BT - ČR“ z **3. 10. 2026 08:20 SELČ**; aplikace uváděla **Zdroj: MTG (EUMETSAT)** a poslední obnovení **08:40:23**. Živý Meteosatový snímek je ověřen. Katalog ale neobsahuje O3M SAF ani mapu celkového ozonu; tato aplikace proto není nástupcem družicového ozonového vieweru. Stránka ozon/UV výše zobrazuje měření observatoře v Hradci Králové, nikoli družicovou mapu.

## Co chybí k dokončení důkazů

- Zachycené HTML nebo jiný doložený obsah staré stránky `ozon/o3uvb.html`; dnes známe jen indexový záznam a neúspěšný replay.
- Dostupné historické PNG/backend O3M SAF a grafová data; jejich obsah nelze rekonstruovat z ovládacího HTML.
- Dnešní oficiální ČHMÚ zdroj s živým družicovým produktem celkového ozonu. Meteosatová prohlížečka načetla živá data, její katalog však O3M SAF neuvádí. Žádný endpoint jsem neodhadoval.
