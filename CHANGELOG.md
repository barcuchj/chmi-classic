# Přehled změn

## 0.7.0-beta.22 – 2026-10-02 (testovací sestavení)

- Položka **Předpovědi pro kraje** otevírá živou krajskou předpověď ČHMÚ.
  Modrá nabídka všech 14 krajů, volba dne a kompaktní textový panel vycházejí
  z archivního vzhledu. Fungují v centrálním panelu i samostatné záložce.
- Přechod na jiný kraj zachová zvolený den, včetně „Další dny“, i když
  samotný oficiální seznam krajů odkazuje u tohoto zobrazení na „Pozítří“.
- Archiv zachoval rozvržení a názvy krajů, nikoli dynamický text předpovědi;
  obsah je proto vždy aktuální z ČHMÚ. Samostatný adaptér byl vývojově
  vykreslen s živým obsahem ve 1200 × 938 a 390 × 844 px, včetně „Další dny“.
  Instalované ověření Tampermonkey, Chrome balíčku a centrálního iframe zbývá.

## 0.7.0-beta.21 – 2026-10-01 (testovací sestavení)

- Původní odkaz **Týdenní předpověď** vede na živý oficiální text a graf.
  Denní tlačítka, přepínání Text/Graf a kompaktní starý rám ponechávají
  předpověď ve středním panelu bez rolování celé stránky.
- Dostupný archiv zachoval název a odkaz, ne dynamické tělo předpovědi;
  nejde proto o doslovnou kopii. Vzhled po instalaci dosud není ověřený.

## 0.7.0-beta.20 – 2026-10-01 (místní testovací sestavení)

- Původní odkaz **Bio předpověď** vede na současnou živou biometeorologickou
  mapu ČHMÚ. Kompaktní klasický rám zachovává dvoudenní časovou osu a
  podrobné nativní tabulky otevírá v panelu „Oblastní přehled“.
- Archiv dokládá starou adresu `info.chmi.cz/biometeo/index.php`, nikoli
  zachovaný obsah prohlížeče; tato adaptace tedy není jeho doslovnou kopií.
  Instalované vykreslení ještě čeká na vizuální kontrolu.

## 0.7.0-beta.19 – 2026-10-01 (místní testovací sestavení)

- Opraveno spouštění Chrome adaptéru na úvodu, webkamerách a dalších živých
  stránkách ČHMÚ, které mají v adrese parametry. Dříve se tam uplatnil pouze
  obecný rám, takže se zobrazoval nový web nebo velká prázdná hlavička.
- Krajské ikony úvodní předpovědi se umisťují podle vykreslených hranic krajů
  i při změně velikosti okna; samostatné městské karty zůstávají nedotčené.
- Odkaz Úvod uvnitř aplikace v centrálním panelu vrací na klasický rozcestník,
  zatímco otevření aplikace v samostatné záložce používá běžnou navigaci.
- Regresní testy pokrývají URL s parametry, umístění krajských ikon a
  směrování návratu. Instalovanou beta 19 je nutné vizuálně ověřit zvlášť.

## 0.7.0-beta.18 – 2026-10-01 (místní testovací sestavení)

- Původní odkaz **Aktivita klíšťat** nyní vede na současnou oficiální
  třídenní mapu. Nový klasický rám zachovává nativní mapu, vrstvy a časovou
  osu, zmenšuje okolní prostor a omezuje posuv celé stránky.
- Archivní externí viewer z prosince 2023 dokládá tři denní náhledy a velkou
  mapu, ale původní adresa v srpnu 2026 přesměrovává na nový web. Staré
  obrazové soubory nejsou v balíčku. Instalované vykreslení ještě čeká na QA.

## 0.7.0-beta.17 – 2026-10-01 (místní testovací sestavení)

- Původní položka **Meteorologické stanice** je napojena na současnou
  oficiální mapu ČHMÚ. Klasický rám vyplňuje dostupnou plochu, přitom
  ponechává živou mapu, bodové detaily a nativní filtry měření.
- Archivní mapa dokládá jemnější typy stanic a veličin, které dnešní mapa
  nenabízí ve stejném členění; adaptér je proto částečná obnova, ne kopie.
  Userscript i Chrome/Edge sdílejí zdroj. Instalační a vizuální kontrola
  adaptace v samostatném okně i centrálním panelu zbývá.

## 0.7.0-beta.16 – 2026-10-01 (místní testovací sestavení)

- Položka **Měření z Klementina** otevírá současnou oficiální stránku stanice
  ve zhuštěném intranetovém obalu. Zachovává nativní záložky, živou tabulku
  a historická data; úprava se zapne až po načtení měření. Userscript a
  Chrome/Edge používají stejný adaptér i v centrálním panelu.
- Historický obsah cílové stránky Wayback neuchoval, takže jde o vlastní
  old-look adaptaci živých dat, nikoli přesnou kopii starého Klementina.
  Vizuální a instalační kontrola nové bety ještě zbývá.

## 0.7.0-beta.15 – 2026-10-01 (místní testovací sestavení)

- Původní položka **Sondážní měření** je napojena na měřená data
  Praha-Libuš, nikoli na podobně pojmenovanou předpovědní pseudosondáž.
  Kompaktní intranetové rozložení má ponechat oba živé nativní přehrávače,
  typy grafů i tabulku ČHMÚ. Stejný zdroj používá userscript a Chrome/Edge.
- Archivně prověřeny **Aktuální mapy** (prázdná kategorie) a **Grafy
  automatických stanic** (sedm poboček). Tyto položky zůstávají neaktivní,
  dokud pro ně nevznikne věrná funkční adaptace nad aktuálními daty.
- Vizuální a instalační ověření nového sondážního adaptéru v Tampermonkey,
  Chrome a centrálním panelu ještě zbývá; nejde o veřejné vydání.

## 0.7.0-beta.14 – 2026-09-30 (místní testovací sestavení)

- Původní položka **Synoptická situace** otevírá živou tříkrokovou mapu ČHMÚ
  v kompaktním intranetovém rozložení. Ponechává její nativní časový posuvník,
  přehrávání a skutečné snímky; rozložení je navržené pro dostupnou plochu
  bez scrollu celé stránky. Userscript i Chrome/Edge používají stejný adaptér.
- **Synoptická předpověď** zůstává odlišnou neobnovenou položkou: archivní
  třímapový výstup 36/60/84 hodin nelze zaměňovat za současnou dvoudenní
  časovou osu situace. Vizuální kontrola instalovaného adaptéru a iframe
  ještě zbývá.

## 0.7.0-beta.13 – 2026-09-30 (místní testovací sestavení)

- Původní položky **Aladin – animace** a **Aladin – mapy** již neotevírají
  totožný režim. Animace má vlastní adresu na stejné oficiální aplikaci ČHMÚ,
  výchozí jednu mapu a přehrávání skutečných tříhodinových termínů s volbou
  rychlosti; mapa zůstává živou součástí ČHMÚ.
- Přehrávání se zastaví při skrytí stránky, změně běhu modelu a vypnutí
  klasického vzhledu. Historické ovladače polohy a velikosti ani skutečný
  instalační test zatím nejsou dokončené.

## 0.7.0-beta.12 – 2026-09-30 (místní testovací sestavení)

- Položka **Detekce blesků** otevírá živou bleskovou vrstvu oficiálního radaru
  v samostatném klasickém režimu. Nativní průhlednosti vypnou radarový obraz,
  zesílí blesky a zastaví časovou osu na nejnovějším snímku s bleskovými daty.
- Režim funguje v centrálním panelu i na samostatné adrese a používá stejné
  zdroje pro userscript i Chrome/Edge. Není to obnova samostatného historického
  prohlížeče CELDN; jeho další ovladače a instalační QA zbývají.
- Ověřeny nativní ovladače a živý bleskový snímek ve vestavěném prohlížeči;
  samotná nová adaptace ještě čeká na instalační a vizuální kontrolu.

## 0.7.0-beta.11 – 2026-09-29 (místní testovací sestavení)

- Původní položka Radarové odhady srážek otevírá stále živou oficiální
  aplikaci HPPS. Kompaktní starý obal zachovává její původní snímky,
  časovou řadu a volbu intervalů 1/3/6/24 hodin.
- Tampermonkey a Chrome/Edge používají stejný adaptér. Chrome pravidlo pro
  centrální iframe je omezené na přesnou adresu této aplikace.
- Vývojově ověřeno samostatné zobrazení při 1280 × 720 a 390 × 844 bez
  posuvníku celé stránky; živý zdroj se načetl i do testovacího iframe.
  Instalované balíčky a vzhled v portálovém iframe čekají na QA.

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
