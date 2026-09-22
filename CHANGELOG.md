# Přehled změn

## 0.7.0-beta.3 – 2026-09-22 (userscript a Chrome/Edge beta)

- Aktivován odkaz Webové kamery v původním rozcestníku; přehled mapy, filtr,
  seznam, detail snímku a časová osa používají živé komponenty ČHMÚ.
- Přidáno kompaktní responzivní uspořádání mapy a seznamu a detailu se snímkem;
  nativní hlavička a patička ve vloženém panelu nezabírají místo.
- Chrome/Edge balíček nyní obsahuje portál a stejné adaptéry jako userscript.
  Spuštění v iframe je omezené na podporované adresy; ostatní stránky ČHMÚ
  nedostávají oprávnění pro vložené rámce.
- Syntaxe, registr tras, manifest a 19 automatických testů prošly; obsah ZIPu
  prošel kontrolou. Živé vykreslení nové bety a instalace Chrome/Edge zůstávají
  k ověření, nejde o stabilní vydání.

## 0.7.0-beta.2 – 2026-09-21 (userscript)

- ALADIN využívá plnou šířku okna a automaticky volí čtyři mapy vedle sebe
  nebo dvě nad dvěma podle prostoru; snímky zachovávají poměr stran.
- Chybějící snímek má vysvětlení namísto prázdné buňky. Živě potvrzeno,
  že první termín běhu ČHMÚ nemá srážkový snímek, následující jej má.
- Odstraněna prázdná horní plocha na úzkém displeji; popisky času
  nepřekrývají názvy map. Nativní přepínání běhu a legendy zůstávají zachované.
- Vývojově ověřeno při 1440 × 900 a 390 × 844 bez scrollu dokumentu;
  test skutečně instalovaného Tampermonkey zůstává nedokončený.

## 0.7.0-beta.1 – 2026-09-21 (userscript)

- Kompaktní portál na úvodní stránce ČHMÚ s centrálním panelem živých aplikací.
- Úzká společná navigace, zvětšení panelu bez opětovného načítání a možnost
  otevřít podporovanou aplikaci samostatně v klasickém vzhledu.
- Radarová stupnice ukotvená uvnitř mapy, kompaktnější nastavení Meteosatu
  a výraznější nápověda k posouvání času u ALADINu.
- Opraveno rozpoznání vloženého Meteosatu po přepsání jeho adresy nativní aplikací.
- Dva skutečné screenshoty a srozumitelný návod k instalaci a aktualizaci bety.
- Jde o nedokončenou rekonstrukci; Voda/Ovzduší, úvodní mapa předpovědi,
  další aplikace a úplné instalační/responzivní ověření zůstávají v TODO.
- Nové balíčky rozšíření ani samostatný GitHub Release se touto změnou nevydávají.

## Unreleased – archivní HTML ALADINu a meteogramů

- Ověřeny konkrétní Wayback snapshoty HTML pro ALADIN animaci (`20260210160917`),
  parametrizovaný preset Praha-Libuš (`20260512092211`), ALADIN mapy (`20260512090206`)
  a meteogramy (`20260614103003`).
- Katalog nyní nabízí přímý snapshot i odkaz na všechny snapshoty; doplněn je
  parametrizovaný starý ALADIN preset a odkaz na meteogram pro Prostějov.
- `ARCHIVE_RESEARCH.md` popisuje skutečné datové cesty starých aplikací:
  `mdirs.txt`, `nameid`, mapové PNG a meteogramové PNG podle ID místa.
- Historický kód a data se do balíku nekopírují; použity jsou pouze ověřené
  URL, zdokumentované chování a vlastní old-look adaptace.
- Položky bez bezpečně obnovené aplikace jsou v katalogu bez odkazu, červeně
  přeškrtnuté a s vysvětlením v informační bublině; případná náhradní URL se
  u těchto položek nezobrazuje jako funkční odkaz.

## 0.6.0 – 2026-09-11

- Proveden systematický průzkum historických aplikací ČHMÚ podle staré homepage, sitemapu, indexovaných původních endpointů a dostupných snapshotů Wayback Machine; evidence je v `ARCHIVE_RESEARCH.md`.
- Přidány `legacy.js` a `legacy.css`: vlastní licenčně bezpečná old-look adaptace pro staré `intranet.chmi.cz` / `portal.chmi.cz` a statické aplikace `/files/portal/docs/meteo/`; původní DOM, ovládání a backend se zachovávají.
- Historické stránky dostávají společnou navigaci na Radar, ALADIN, meteogramy, kamery, družice, blesky, stanice, synoptiku, letectví, houby a katalog; u známých viewerů také `Aktuální náhrada` a `Web Archive`.
- Katalog rozšířen o doložené staré aplikace: ALADIN animace/mapy/meteogramy, webkamery, CELDN blesky, statické radarové/bleskové výstupy, VIS-IR JPG adresář, staniční data/mapy/grafy, radar+srážkoměry, aktuální mapy, ozon/UV, sondáže, sníh, výškové analýzy, Klementinum, fronty a letecké ALADIN/WMO výstupy.
- Konkrétní Wayback snapshoty jsou nadále použity jen tam, kde byl timestamp ověřen: INCA `20260816180503`, MSG `20260210150546`, AVHRR `20260614095513`; ostatní archivní položky používají pravdivě označený Wayback index nebo `Nedostupné`.
- Stav položek katalogu nyní rozlišuje `Živě`, `Legacy`, `Přímý`, `Archiv` a `Nedostupné`; chybějící historický backend se nesimuluje.
- Manifest a Tampermonkey byly rozšířeny o staré domény `intranet.chmi.cz` / `portal.chmi.cz`; Safari Resources a release skripty synchronizují nové legacy zdroje z `chrome-edge/`.
- Safari Xcode target nyní skutečně přibaluje `catalog.js`, `catalog.css`, `legacy.js` a `legacy.css` do výsledného `.appex`, nejen do zdrojového ZIPu.
- Opravena ochrana proti rekurzivní resize smyčce v legacy fit-to-window vrstvě.
- Původní specializované fit-to-window soubory radaru, homepage radaru, Meteosatu, Polární/Geo a Hub nebyly měněny.
- Distribuční verze zvýšena na 0.6.0.

## 0.5.0 – 2026-09-11

- Přidán jednotný katalog `Produkty` pro staré i současné meteorologické výstupy: ALADIN, meteogramy, webkamery, naměřená data, synoptiku, letectví, historická data, Open Data a archivní prohlížeče.
- Katalog jednoznačně rozlišuje `Živě` a `Archiv`; archivní položky neimitují živé ovládání a odkazují pouze na existující historické kopie.
- Přidán lehký old-look rám pro allowlistované živé stránky `www.chmi.cz`, ALADIN na `produkty.chmi.cz` a srážkoměry HPPS na `hydro.chmi.cz`; původní mapy, tabulky, formuláře, exporty a event handlery zůstávají zdrojové.
- ALADIN dostal volitelné tlačítko `4 mapy`, které používá původní ovládací prvky ČHMÚ pro teplotu ve 2 m, oblačnost, srážky za 3 h a vítr v 10 m a při dostupnosti volí rozložení do čtyř sloupců.
- Letecký katalog obsahuje přímo METAR/SPECI, SIGMET, TAF, SWL, nízkou oblačnost, výškový vítr, radiosondáže, aerologii/pseudosondáže, VIS-IR, radar/blesky a další související živé zdroje.
- Přidány živé historické produkty: přechody front, Klementinum, mapy teploty a srážek, územní teplota/srážky a oficiální zprávy/datové přehledy.
- Přidány archivní odkazy na starý radar INCA, MSG, AVHRR a archivní index starého ALADINu.
- Společná navigace se na menších šířkách zalamuje místo vodorovného scrollování.
- Popup rozšíření obsahuje vstup do katalogu a odkazy na nejčastější nové skupiny produktů.
- `chrome-edge/` zůstává jediným zdrojem pravdy; `catalog.js` a `catalog.css` jsou zahrnuty do Safari synchronizace, Tampermonkey generátoru i release balení.
- Oprávnění verze 0.5.0 byla rozšířena na ALADIN, allowlistované cesty na `www.chmi.cz` a HPPS; mimo interní allowlist katalogový skript stránku nestyluje.
- Distribuční verze zvýšena na 0.5.0.

## 0.4.1 – 2026-09-11

- Opraveno dynamické rozložení všech podporovaných old-look aplikací podle skutečné šířky a výšky viewportu; desktopové zobrazení již nepoužívá zbytečné pevné maximální šířky a výšky.
- Produktový radar zachovává přepínač `Dle okna / Zoom 4x / Zoom 8x / Web Maps`, ale jeho poloha se nyní odvozuje od nativních levých mapových ovladačů, takže nepřekrývá zoom `+/-`.
- Radar na úvodní stránce ČHMÚ používá stejný pracovní old-look rám a dynamickou geometrii; pokud jsou v homepage komponentě dostupné původní režimy `radio_display1` až `radio_display4`, zobrazí se i stejné zrcadlené klasické ovládání.
- Meteosat používá flex/grid přes zbývající prostor okna; mapa, klasický přehrávač a nastavení zůstávají dostupné bez prázdné pravé spodní plochy a panel nastavení nemá zbytečný vodorovný posuvník.
- Polární a geostacionární mapy používají plnou dostupnou šířku a výšku odvozenou od pozice mapy ve viewportu; mapové ovladače jsou mírně odsazené od hran.
- Pravděpodobnost růstu hub používá plnou šířku okna a dynamickou výšku mapy, takže odpadá nevyužitá plocha kolem aplikace a ovladače zůstávají uvnitř mapového prostoru.
- Přidány `ResizeObserver`/resize notifikace, aby původní živé komponenty ČHMÚ po změně rozměrů přepočítaly interní mapu místo pouhého vizuálního ořezu.
- Distribuční verze zvýšena na 0.4.1.
- Zjednodušen instalační návod pro běžné uživatele včetně přímých odkazů na Tampermonkey, Chrome/Edge balíček a Safari balíček.

## 0.4.0 – 2026-09-11

- Přidána společná kompaktní navigace v old-look headeru mezi produktovým radarem, radarem na úvodní stránce ČHMÚ, Meteosatem, polárními družicemi, geostacionárními družicemi a pravděpodobností růstu hub.
- Aktivní navigační položka zachovává aktuální URL aplikace, aby zůstaly zachovány query parametry nebo zvolený dataset/produkt, pokud jej stránka vyjadřuje URL.
- Přidán izolovaný old-look rám pro radarovou sekci `Srážky podle radaru` přímo na `https://www.chmi.cz/`; zbytek homepage se nestyluje.
- Homepage radar ponechává původní embed/mapu, časovou osu, vrstvy, datový backend a event handlery ČHMÚ.
- Přidány společné zdroje `navigation.js` a `navigation.css`; Safari synchronizace a release balení je kopírují stejně jako ostatní zdroje z `chrome-edge/`.
- Přidán klasický rám pro živou stránku `www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub`.
- Zachována je originální živá mapová komponenta ČHMÚ včetně vrstev, legendy, ovladačů, navigace, dat a responzivního chování.
- Doplněn kompaktní horní pruh, pracovní rám a mapové rozložení ve stejném vizuálním stylu jako stávající klasické stránky.
- Rozšířena oprávnění a `match` pravidla Chrome/Edge, Safari a generovaného Tampermonkey userscriptu.
- Popup rozšíření obsahuje přímý odkaz na stránku pravděpodobnosti růstu hub.
- Release balení před vytvořením artefaktů nově vždy regeneruje Tampermonkey userscript ze společných zdrojů.
- Dokumentace a distribuční verze zvýšeny na 0.4.0.

## 0.3.0 – 2026-09-04

- Radar nově využívá celé dostupné okno a panel zůstává samostatně posuvný.
- Výchozí radarový režim je `Web Maps`.
- Po otevření se animace zastaví na nejnovějším dostupném snímku.
- Zachována je responzivní mobilní varianta.
- Opravena výška vnitřní mapy `Web Maps` na úzkém okně.
- Opravena viditelnost mapy a kompaktní horní lišta na polárních a geostacionárních stránkách.
- Součástí vydání jsou Chrome/Edge ZIP, Safari zdrojový balíček a samostatný
  Tampermonkey userscript.

## 0.2.0 – 2026-09-04

- Přidán klasický prohlížeč družicových snímků MSG/MTG.
- Přidán klasický rám a přepínání produktů polárních a geostacionárních družic.
- Přidána Safari varianta a společný build.
- Přidána Tampermonkey varianta generovaná ze stejného JavaScriptu a CSS.

## 0.1.0

- První klasická varianta radarové stránky s přepínačem
  `Dle okna / Zoom 4x / Zoom 8x / Web Maps`.
