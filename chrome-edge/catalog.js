(() => {
  "use strict";

  if (window.top !== window || window.__chmiClassicPortalCandidate || window.__chmiAladinClassicLoaded || window.__chmiClassicCatalogLoaded) {
    return;
  }
  window.__chmiClassicCatalogLoaded = true;

  const STORAGE_KEY = "chmiRadarClassicEnabled";
  const ROOT_CLASS = "chmi-catalog-shell";
  const BRAND_ID = "chmi-catalog-classic-brand";
  const DIALOG_ID = "chmi-classic-catalog-dialog";
  const OVERLAY_ID = "chmi-classic-catalog-overlay";
  const BUTTON_CLASS = "chmi-classic-catalog-button";
  const ALADIN_PRESET_ID = "chmi-aladin-four-map-preset";
  const CATALOG_HASH = "#chmi-classic-products";
  let hashBeforeCatalog = "";

  const storage = globalThis.chrome?.storage?.sync ?? globalThis.__chmiClassicStorage;

  const corePaths = [
    ["https://produkty.chmi.cz/radar/", "Radar"],
    ["https://www.chmi.cz/#chmi-classic-home-radar", "Radar ČHMÚ"],
    ["https://produkty.chmi.cz/druzice/?time_range=24", "Meteosat"],
    ["https://www.chmi.cz/namerena-data/polarni-druzice/true-color", "Polární"],
    ["https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color", "Geo"],
    ["https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub", "Houby"]
  ];

  const groups = [
    {
      title: "ALADIN a meteogramy",
      items: [
        {
          label: "ALADIN – předpovědní mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Živý model ČHMÚ. Klasický rám přidává rychlou volbu 4 map: teplota, oblačnost, srážky za 3 h a vítr."
        },
        {
          label: "Meteogramy – obce",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "live",
          note: "Meteogramy ALADIN pro obce a konkrétní místa."
        },
        {
          label: "Meteogramy – letiště",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "Oficiální meteogramy ČHMÚ pro letiště."
        },
        {
          label: "Meteogramy – hory a lyžařská střediska",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/hory-a-lyzarska-strediska",
          status: "live",
          note: "Oficiální výběr horských lokalit."
        },
        {
          label: "Meteogramy – vodní plochy",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/vodni-plochy",
          status: "live",
          note: "Oficiální výběr vodních ploch."
        },
        {
          label: "Meteogram pro bod na mapě",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/meteogram-pro-bod-na-mape",
          status: "live",
          note: "Výběr bodu přímo z mapy."
        }
      ]
    },
    {
      title: "Webkamery a aktuální měření",
      items: [
        {
          label: "Webkamery ČR",
          href: "https://www.chmi.cz/namerena-data/webkamery",
          status: "live",
          note: "Rychlý přehled oficiálních kamer. Detail a doprovodná data zůstávají podle možností zdrojové stránky."
        },
        {
          label: "Aktuální teplota",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          status: "live",
          note: "Mapa a tabulka aktuálních měření stanic."
        },
        {
          label: "Denní teplotní mapy",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/maximalni-teplota",
          status: "live",
          note: "Oficiální staniční a interpolované mapy denních teplotních charakteristik; nativní stránka nabízí maximální, minimální a průměrné denní hodnoty."
        },
        {
          label: "Denní a aktuální srážky",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek",
          status: "live",
          note: "Srážkové mapy a tabulky ČHMÚ."
        },
        {
          label: "Aktuální srážkoměry HPPS",
          href: "https://hydro.chmi.cz/hpps/srz?lng=CZE",
          status: "live",
          note: "Hydrologická mapa a tabulka srážkoměrů."
        },
        {
          label: "Meteorologické stanice",
          href: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke",
          status: "live",
          note: "Přehled a rozmístění měřicích stanic."
        },
        {
          label: "Tlak vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tlak-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Vlhkost vzduchu",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/vlhkost-vzduchu",
          status: "live",
          note: "Aktuální staniční měření."
        },
        {
          label: "Tabulka větru",
          href: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru",
          status: "live",
          note: "Aktuální staniční údaje o větru."
        },
        {
          label: "Radar – srážky a blesky",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Aktuální radarová a blesková data; pokročilý prohlížeč zůstává na oficiálním backendu."
        },
        {
          label: "Otevřená data a exporty",
          href: "https://www.chmi.cz/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni",
          status: "live",
          note: "Oficiální rozcestník pro data, stažení a další zpracování."
        }
      ]
    },
    {
      title: "Synoptika",
      items: [
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy a textový popis situace."
        },
        {
          label: "Synoptické situace v minulosti",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticke-situace-v-minulosti",
          status: "live",
          note: "Historický přehled a klasifikace synoptických situací."
        },
        {
          label: "Počasí v Evropě – synoptické stanice",
          href: "https://www.chmi.cz/predpoved-pocasi/pocasi-evropa",
          status: "live",
          note: "Mapa staničních/synoptických hlášení pro Evropu."
        },
        {
          label: "Synoptické stanice / aktuální hlášení ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinově aktualizovaný přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "Výšková mapa větru FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Ověřená současná výšková mapa ČHMÚ; samostatná klasická výšková synoptická mapa nebyla při implementaci spolehlivě doložena."
        }
      ]
    },
    {
      title: "Letecká meteorologie",
      items: [
        {
          label: "Letecké počasí – rozcestník",
          href: "https://www.chmi.cz/letectvi",
          status: "live",
          note: "Oficiální vstup k METAR/SPECI, TAF, SIGMET, SWL a dalším produktům."
        },
        {
          label: "Základny / nízká oblačnost",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          status: "live",
          note: "Oficiální předpověď nízké oblačnosti."
        },
        {
          label: "Meteogramy letišť",
          href: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/letiste",
          status: "live",
          note: "ALADIN meteogramy pro letiště."
        },
        {
          label: "Aktuální počasí pro létání v ČR",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/aktualni-pocasi-pro-letani-v-cr",
          status: "live",
          note: "Hodinový přehled profesionální staniční sítě ČHMÚ."
        },
        {
          label: "METAR / SPECI",
          href: "https://www.chmi.cz/letectvi/aktualni-pocasi-pro-letani/zpravy-metar-speci",
          status: "live",
          note: "Aktuální letecká staniční hlášení v mapě a textu podle dostupnosti zdroje."
        },
        {
          label: "SIGMET a výstrahy pro letiště",
          href: "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste",
          status: "live",
          note: "Aktuální výstražné informace pro FIR Praha a letiště z oficiálního zdroje ČHMÚ."
        },
        {
          label: "TAF",
          href: "https://www.chmi.cz/letectvi/textove-predpovedi-pro-letani/predpovedi-taf",
          status: "live",
          note: "Aktuální letištní předpovědi ČHMÚ."
        },
        {
          label: "SWL mapa",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/swl-mapa",
          status: "live",
          note: "Mapa význačného počasí od země do FL100 včetně front, tlakových útvarů a nulové izotermy."
        },
        {
          label: "Výškový vítr 2000 ft",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-vysku-2000ft",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru."
        },
        {
          label: "Výškový vítr FL050",
          href: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-vetru-pro-fl050",
          status: "live",
          note: "Oficiální předpovědní výšková mapa větru. Další hladiny zůstávají dostupné v nativní navigaci ČHMÚ."
        },
        {
          label: "Radiosondážní měření",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni",
          status: "live",
          note: "Vertikální měření atmosféry; další aerologické produkty jsou dostupné v nativní navigaci."
        },
        {
          label: "Aerologie a pseudosondáže",
          href: "https://www.chmi.cz/letectvi/aerologicka-mereni",
          status: "live",
          note: "Rozcestník radiosond, windprofilerů, radarových profilů větru a pseudosondáží modelu ALADIN."
        },
        {
          label: "Družice VIS-IR",
          href: "https://www.chmi.cz/namerena-data/geostacionarni-druzice/vis-ir",
          status: "live",
          note: "Aktuální geostacionární produkt VIS-IR."
        },
        {
          label: "Blesky a radar",
          href: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "live",
          note: "Radarový a bleskový přehled z oficiálního zdroje."
        },
        {
          label: "Synoptická situace",
          href: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          status: "live",
          note: "Aktuální synoptické mapy jako doplněk pro letecké použití."
        },
        {
          label: "ALADIN mapy",
          href: "https://produkty.chmi.cz/aladin/",
          status: "live",
          note: "Současná živá náhrada starého ALADIN mapového prohlížeče."
        }
      ]
    },
    {
      title: "Historická data, rekordy a zprávy",
      items: [
        {
          label: "Přechody front přes Prahu",
          href: "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu",
          status: "live",
          note: "Historická řada a související data ČHMÚ."
        },
        {
          label: "Klementinum – rekordy a data",
          href: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          status: "live",
          note: "Klementinská měření, rekordy a odkazy na otevřená data."
        },
        {
          label: "Historické mapy teploty vzduchu",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-teploty-vzduchu",
          status: "live",
          note: "Historické klimatologické mapy teplotních charakteristik; aktuální denní mapy jsou samostatně v části Naměřená data."
        },
        {
          label: "Historické mapy srážkových úhrnů",
          href: "https://www.chmi.cz/namerena-data/historicka-data/mapy-srazkovych-uhrnu",
          status: "live",
          note: "Historické klimatologické mapy srážkových úhrnů; aktuální denní mapa je samostatně v části Naměřená data."
        },
        {
          label: "Územní teplota a srážky",
          href: "https://www.chmi.cz/namerena-data/historicka-data/uzemni-teplota-a-srazky",
          status: "live",
          note: "Územní časové řady a souhrny."
        },
        {
          label: "Zprávy a datové přehledy – počasí, voda a ovzduší",
          href: "https://www.chmi.cz/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy/pocasi-voda-a-ovzdusi-v-cr",
          status: "live",
          note: "Oficiální zprávy a PDF, pokud je ČHMÚ u konkrétního výstupu publikuje."
        },
        {
          label: "Otevřená data ČHMÚ",
          href: "https://opendata.chmi.cz/",
          status: "live",
          note: "Oficiální datový server pro stažení a další zpracování."
        }
      ]
    },
    {
      title: "Historické aplikace – původní endpointy",
      items: [
        {
          label: "ALADIN animace (alanim)",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveHref: "https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "legacy",
          note: "Doložená stará aplikace s animací, krokováním a volbami proměnné velikosti, 4× a GoogleMaps. Historický endpoint může být po odstavení intranet.chmi.cz nedostupný; ČHMÚ Classic na něj aplikuje pouze responzivní rám a zachová nativní ovládání."
        },
        {
          label: "ALADIN – původní mapy",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveHref: "https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "legacy",
          note: "Historický mapový výstup ALADIN. HTML potvrzuje výběr veličin a předpovědních termínů; obrázky se načítaly z adresářů běhů modelu, takže snapshot bez datového backendu nemusí vykreslit mapy."
        },
        {
          label: "ALADIN – původní meteogramy",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveHref: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "legacy",
          note: "Doložený starý vyhledávač meteogramů podle místa a běhu modelu. Stránka načítá seznam běhů, seznam ID míst a následně PNG; pokud historický backend nefunguje, použijte současné meteogramy ČHMÚ."
        },
        {
          label: "Meteogramy – příklad lokality Prostějov",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)",
          archiveHref: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html#Prost%C4%9Bjov%20(okr.%20Prost%C4%9Bjov)",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "legacy",
          note: "Ověřený formát starého odkazu s lokalitou v hashi URL. Výběr názvu se po načtení porovnává se souborem nameid; samotný hash proto nenahrazuje chybějící historická data."
        },
        {
          label: "Starý panel POČASÍ – mapa ČR",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/CR.html",
          archiveHref: "https://web.archive.org/web/20260825190443/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/CR.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/map_meteo_portal/*",
          replacementHref: "https://www.chmi.cz/",
          status: "legacy",
          note: "Samostatný panel, který stará homepage načítala do záložky POČASÍ; obsahoval mapu ČR, legendu a rozcestník produktů."
        },
        {
          label: "Starý panel VODA – hydrologická mapa",
          href: "https://intranet.chmi.cz/files/portal/docs/hydro/hydro_map.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/hydro/*",
          replacementHref: "https://www.chmi.cz/voda/aktualni-stav-rek-povodnova-mapa",
          status: "legacy",
          note: "Homepage jej načítala po kliknutí na HYDROLOGIE. Wayback nyní nemá samostatný snapshot hydro_map.html; zachován je původní endpoint a index celé hydro větve."
        },
        {
          label: "Starý panel OVZDUŠÍ – mapa kvality ovzduší",
          href: "https://intranet.chmi.cz/files/portal/docs/uoco/map_uoco_portal/air.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/uoco/*",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-mapy-kvality-ovzdusi-cr",
          status: "legacy",
          note: "Homepage jej načítala po kliknutí na OVZDUŠÍ; panel měl vlastní legendu a rozcestník airqual-links.html. Samostatný snapshot map_uoco_portal/* se ve Waybacku nepodařilo ověřit."
        },
        {
          label: "Webkamery – původní celorepublikový přehled",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "legacy",
          note: "Historický přehled s filtrováním kamer. Archivní fotografie se nekopírují; původní stránka uváděla copyright ČHMÚ / All Rights Reserved."
        },
        {
          label: "Webkamera – původní detail a animace",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/prohlizec.html",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "legacy",
          note: "Původní viewer podporoval animaci a odkaz na meteorologické informace. Bez parametru kamery nejde o konkrétní živý snímek; katalog nevytváří smyšlený parametr."
        },
        {
          label: "Blesky – JSCeldnView",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "legacy",
          note: "Doložený historický interaktivní prohlížeč blesků ČHMÚ. ČHMÚ Classic nekopíruje jeho zdrojový kód, pouze podporuje původní DOM a přidává fit-to-window."
        },
        {
          label: "Radar – původní statický PNG výstup",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/rad/data.html",
          replacementHref: "https://produkty.chmi.cz/radar/",
          status: "legacy",
          note: "Historická stránka s aktuálním sloučeným radarovým obrázkem a odkazem na interaktivní viewer. Dostupnost starého datového toku již není garantována."
        },
        {
          label: "Blesky – původní statický PNG výstup",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
          archiveHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "legacy",
          note: "Historická statická stránka bleskových dat s odkazem na interaktivní viewer."
        },
        {
          label: "Blesky – adresář původních PNG",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data/",
          status: "direct",
          note: "Doložený oficiální adresář historických/timestampovaných PNG. Odkazuje přímo na server ČHMÚ a nic nestahuje ani neobchází; po odstavení legacy hostu může přestat fungovat."
        },
        {
          label: "Meteosat VIS-IR – adresář JPG",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/sat/msg_hrit/img-msgeu-1160x800-vis-ir/",
          status: "direct",
          note: "Doložený oficiální adresář timestampovaných JPG VIS-IR. Data/obrazové produkty mohou podléhat podmínkám ČHMÚ a EUMETSAT; projekt je nevkládá do balíku."
        }
      ]
    },
    {
      title: "Starý portál – stanice, synoptika, historie a letectví",
      items: [
        {
          label: "Starý portál ČHMÚ – původní rozcestník",
          href: "https://intranet.chmi.cz/",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Historická homepage přímo odkazovala na ALADIN animaci/mapy/meteogramy, radar, kamery, MSG/NOAA, blesky, Klementinum, synoptiku, vertikální profily, sondáže, stanice, sníh a další výstupy."
        },
        {
          label: "Mapa starého portálu",
          href: "https://intranet.chmi.cz/sitemap",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická taxonomie produktů – vhodná jako referenční rozcestník pro výstupy, u nichž se samostatný viewer nepodařilo bezpečně rekonstruovat."
        },
        {
          label: "Souhrnný přehled aktuálního počasí",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/souhrnny-prehled",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Původní portálový rozcestník naměřených dat, stanic, radarů, družic, blesků, kamer, sondáží a sněhu."
        },
        {
          label: "Aktuální mapy – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/aktualni-mapy",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložený starý rozcestník aktuálních map, srážek radar+srážkoměry, ozonu/UV a sněhového zpravodajství."
        },
        {
          label: "Srážky – radar + srážkoměry (starý portál)",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/srazky-radar-srazkomery",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          note: "Konkrétní historická vstupní stránka kombinovaného radarového a srážkoměrného výstupu."
        },
        {
          label: "Ozonové a UV zpravodajství – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/ozonove-a-uv-zpravodajstvi",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická stránka s aktuálním UV indexem a ozonovým/UV zpravodajstvím."
        },
        {
          label: "Družicové měření ozonu – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/druzicove-mereni-ozonu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Konkrétní historická stránka družicového měření ozonu; pokud původní vložený obsah již nefunguje, rozšíření jej nesimuluje."
        },
        {
          label: "Vertikální profil ozonu – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/vertikalni-profil-ozonu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložený historický sondážní výstup vertikálního profilu ozonu."
        },
        {
          label: "Staniční data – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanicni-data",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic",
          note: "Starý rozcestník profesionálních stanic: mapy, přehled stanic a tabulky meteorologických veličin."
        },
        {
          label: "Stanice – mapa teploty a vlhkosti",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/teplota",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          note: "Doložená původní mapa teploty a vlhkosti profesionální staniční sítě."
        },
        {
          label: "Stanice – mapa tlaku vzduchu",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/tlak-vzduchu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložená původní mapa tlaku vzduchu profesionální staniční sítě."
        },
        {
          label: "Sněhové zpravodajství – Sníh ČR / hory",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/snih-CR-hory",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Doložená historická stránka sněhového zpravodajství; další podprodukty staré navigace jsou evidovány samostatně podle míry ověření."
        },
        {
          label: "Automatické sněhoměrné stanice – starý portál",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/snehove_zpravodajstvi/automaticke-snehomerne-stanice",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/",
          note: "Konkrétní historická stránka automatických sněhoměrných stanic."
        },
        {
          label: "Stanice – grafy automatických stanic",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/grafy-automatickych-stanic",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/aktualni-teplota",
          note: "Doložená historická aplikace s 10minutovými měřeními a grafy podle poboček; stará stránka výslovně uváděla, že data nejsou verifikována a grafy nemají archiv."
        },
        {
          label: "Stanice – synoptický detail Praha-Libuš",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/prehled-stanic/praha-libus",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/umisteni-mericich-stanic/meteorologicke",
          note: "Původní hodinový přehled synoptických veličin včetně historie -1/-2/-3 h. Slouží jako doložený vzor starého staničního detailu."
        },
        {
          label: "Stanice – mapa srážek a sněhu",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/srazky",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/denni-uhrn-srazek",
          note: "Doložená původní mapa profesionálních stanic."
        },
        {
          label: "Stanice – mapa větru",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/vitr",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/data-z-mericich-stanic/tabulka-vetru",
          note: "Doložená původní mapa větru profesionální staniční sítě."
        },
        {
          label: "Stanice – oblačnost a sluneční svit",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/stanice/profesionalni-stanice/mapy/oblacnost-a-slunecni-svit",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data",
          note: "Doložená původní staniční mapa oblačnosti a slunečního svitu."
        },
        {
          label: "Vertikální profily směru a rychlosti větru",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/vertikalni-profily-vetru",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/aerologicka-mereni",
          note: "Původní portálová aplikace pro vertikální profily větru; current replacement je aerologický rozcestník."
        },
        {
          label: "Sondážní měření Praha-Libuš",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/ceska-republika/sondazni-mereni/sondazni-mereni-praha-libus",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/aerologicka-mereni/radiosondazni-mereni",
          note: "Doložená stará stránka sondážního měření observatoře Praha-Libuš."
        },
        {
          label: "Evropa – výškové analýzy",
          href: "https://intranet.chmi.cz/aktualni-situace/aktualni-stav-pocasi/evropa/vyskove-analyzy",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          note: "Konkrétní historická stránka výškových analýz starého portálu. Pokud původní obrazový zdroj již není dostupný, rozšíření nevytváří náhradní mapu."
        },
        {
          label: "Přechody front přes Prahu – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/prechody-front-pres-prahu",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/prechody-front-pres-prahu",
          note: "Doložená historická stránka, zachována jako rychlý odkaz vedle současné náhrady."
        },
        {
          label: "Praha-Klementinum – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/praha-klementinum",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          note: "Starý portál obsahoval klementinské rekordy a odkazy na základní/stahovatelná data."
        },
        {
          label: "Praha-Klementinum – původní tabulka základních dat",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/ok/klementinum/klemzaklinfo_cs.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data/klementinum",
          note: "Doložený statický historický výstup se základními údaji, dlouhodobými průměry a rekordními hodnotami."
        },
        {
          label: "Historické mapy stanic – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/mapy-stanic",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Doložená položka historického portálu."
        },
        {
          label: "Měsíční přehledy pozorování – starý portál",
          href: "https://intranet.chmi.cz/historicka-data/pocasi/mesicni-data/mesicni-prehledy-pozorovani",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Původní tabulkový výstup měsíčních teplot, srážek a dalších staničních charakteristik."
        },
        {
          label: "Letecký ALADIN – oblačnost, srážky a vlhkost (WMO bulletin)",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/olm/p_oblbln.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          note: "Doložený starý textový výstup ALADIN pro letiště: nízká/střední/vysoká oblačnost, hodinové srážky a relativní vlhkost."
        },
        {
          label: "Sportovní létání – původní textová předpověď",
          href: "https://intranet.chmi.cz/files/portal/docs/meteo/olm/predpovedi/p_FRCZ40_.html",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložená stará textová předpověď s konvekcí, nízkou oblačností, přízemním/výškovým větrem a dalšími parametry."
        },
        {
          label: "Letecké námrazy FL075/FL100 – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/namrazy-pro-fl075-a-fl100",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložená historická letecká stránka."
        },
        {
          label: "Letecký SIGMET – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/sigmet",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/sigmet-vystrahy-pro-letiste",
          note: "Historická vstupní stránka SIGMET; živá náhrada zůstává oficiální současný produkt ČHMÚ."
        },
        {
          label: "Letecký přízemní vítr/teplota/tlak – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/prizemni-vitr-teplota-tlak/liberec-karlovy-vary-plzen",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi",
          note: "Doložený ALADIN letištní bulletin starého portálu."
        },
        {
          label: "Letecká oblačnost/srážky/vlhkost – starý portál",
          href: "https://intranet.chmi.cz/predpovedi/predpovedi-pocasi/letecke/oblacnost-srazky-vlhkost/",
          status: "legacy",
          replacementHref: "https://www.chmi.cz/letectvi/predpovedi-pro-letani/predpoved-nizke-oblacnosti",
          note: "Doložená stará stránka letištních předpovědí oblačnosti, srážek a relativní vlhkosti."
        }
      ]
    },
    {
      title: "Web Archive – konkrétní zachycené prohlížeče",
      items: [
        {
          label: "Starý intranet – homepage POČASÍ / VODA / OVZDUŠÍ – snapshot 2026-08-25 19:04:37",
          href: "https://web.archive.org/web/20260825190437/https://intranet.chmi.cz/",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/*",
          replacementHref: "https://www.chmi.cz/",
          status: "archive",
          note: "Referenční snapshot společného portálu se záložkami POČASÍ, HYDROLOGIE a OVZDUŠÍ. Homepage načítá jednotlivé panely dynamicky; nejde o statickou kopii živých dat."
        },
        {
          label: "Starý radar INCA – snapshot 2026-08-16 18:05:03",
          href: "https://web.archive.org/web/20260816180503/https://intranet.chmi.cz/files/portal/docs/meteo/rad/inca-cz/short.html",
          replacementHref: "https://produkty.chmi.cz/radar/",
          status: "archive",
          note: "Konkrétní snapshot původního nowcasting vieweru. Archiv zachycuje Dle okna / Zoom / Web Maps, animaci a další původní ovládání; nejde o živá data."
        },
        {
          label: "Starý Meteosat MSG – snapshot 2026-02-10 15:05:46",
          href: "https://web.archive.org/web/20260210150546/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsmsgview.html",
          replacementHref: "https://produkty.chmi.cz/druzice/?time_range=24",
          status: "archive",
          note: "Konkrétní snapshot původního MSG vieweru s IR, IR BT, VIS-IR, WV, Airmass, 24h-M a Night-M. Některé archivované assety mohou v Internet Archive chybět."
        },
        {
          label: "Starý polární AVHRR – snapshot 2026-06-14 09:55:13",
          href: "https://web.archive.org/web/20260614095513/https://intranet.chmi.cz/files/portal/docs/meteo/sat/data_jsavhrrview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/polarni-druzice/true-color",
          status: "archive",
          note: "Konkrétní snapshot původního AVHRR vieweru. Archivní obsah není vydáván za živý."
        },
        {
          label: "ALADIN animace – snapshot 2026-02-10 16:09:17",
          href: "https://web.archive.org/web/20260210160917/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Ověřený HTML snapshot původní animace s volbami produktu, průhlednosti, velikosti, rychlosti animace, posledního snímku a navigačního kříže."
        },
        {
          label: "ALADIN animace – snapshot s presetem Praha-Libuš",
          href: "https://web.archive.org/web/20260512092211/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html?display=var&gmap_zoom=7&prod=prec&opa1=0.81&opa2=1&nselect=73&nselect_fct=undefined&di=1&rep=3&add=4&update=5&lat=50.008&lon=14.447&lang=CZ",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/alanim/alanim.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Archivní URL zachovává nastavení `display=var`, produkt srážek a polohu Praha-Libuš; stará stránka výslovně uvádí, že parametry URL mají přednost před cookies."
        },
        {
          label: "ALADIN mapy – snapshot 2026-05-12 09:02:06",
          href: "https://web.archive.org/web/20260512090206/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/ala.html",
          replacementHref: "https://produkty.chmi.cz/aladin/",
          status: "archive",
          note: "Ověřený HTML snapshot původních map; inline JavaScript skládá mapovou tabulku z běhu modelu, veličiny a termínu platnosti."
        },
        {
          label: "ALADIN meteogramy – snapshot 2026-06-14 10:30:03",
          href: "https://web.archive.org/web/20260614103003/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          archiveIndexHref: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/ov/aladin/results/public/meteogramy/mhtml/m.html",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce",
          status: "archive",
          note: "Ověřený HTML snapshot starého výběru meteogramů. Archiv obsahuje i CSS a podpůrné knihovny, ale běhy modelu, nameid a PNG nemusí být zachyceny."
        },
        {
          label: "Webkamery – index Web Archive",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/kam/",
          replacementHref: "https://www.chmi.cz/namerena-data/webkamery",
          status: "archive",
          note: "Archivní index přehledu kamer; fotografie ani nedoložené assety nejsou součástí ČHMÚ Classic."
        },
        {
          label: "Blesky JSCeldnView – index Web Archive",
          href: "https://web.archive.org/web/*/https://intranet.chmi.cz/files/portal/docs/meteo/blesk/data_jsceldnview.html",
          replacementHref: "https://www.chmi.cz/namerena-data/radar-nowcast/srazky-a-blesky",
          status: "archive",
          note: "Archivní index historického prohlížeče; konkrétní timestamp se nepodařilo z dostupného rozhraní ověřit."
        }
      ]
    },
    {
      title: "Historicky doložené výstupy bez bezpečně obnoveného vieweru",
      items: [
        {
          label: "Mapa sněhu – hodnoty",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Název je doložen ve staré navigaci ČHMÚ, ale samostatný bezpečně ověřený endpoint mapového vieweru se v této etapě nepodařilo určit."
        },
        {
          label: "Sníh – zásoby vody",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Historická navigace položku potvrzuje, ale přesná vstupní URL/viewer nebyly bezpečně ověřeny; proto není vytvořeno falešné ovládání."
        },
        {
          label: "Mapa zatížení sněhem",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/",
          note: "Stará homepage tento výstup přímo uváděla. Konkrétní samostatný historický endpoint nebyl při průzkumu spolehlivě získán."
        },
        {
          label: "Synoptická předpověď – původní samostatný výstup",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/predpoved-pocasi/synopticka-situace",
          note: "Historická homepage uváděla Synoptickou předpověď odděleně od Synoptické situace, ale bezpečně ověřená samostatná původní URL se nepodařila získat."
        },
        {
          label: "CLIMAT / typizace povětrnostních situací / význačné počasí",
          status: "unavailable",
          replacementHref: "https://www.chmi.cz/namerena-data/historicka-data",
          note: "Kategorie jsou doloženy historickou navigací, avšak bez jednoho ověřeného kompletního vieweru a assetového stromu; katalog je proto eviduje pouze jako historické."
        }
      ]
    }
  ];

  const shellRoutes = [
    ["produkty.chmi.cz", "/aladin", "ALADIN – předpovědní mapy"],
    ["www.chmi.cz", "/predpoved-pocasi/meteogramy-aladin", "Meteogramy ALADIN"],
    ["www.chmi.cz", "/meteogram/", "Meteogram ALADIN"],
    ["www.chmi.cz", "/namerena-data/webkamery", "Webkamery ČHMÚ"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticka-situace", "Synoptická situace"],
    ["www.chmi.cz", "/predpoved-pocasi/synopticke-situace-v-minulosti", "Synoptické situace v minulosti"],
    ["www.chmi.cz", "/predpoved-pocasi/pocasi-evropa", "Počasí v Evropě"],
    ["www.chmi.cz", "/predpoved-pocasi/prechody-front-pres-prahu", "Přechody front přes Prahu"],
    ["www.chmi.cz", "/namerena-data/data-z-mericich-stanic", "Naměřená data stanic"],
    ["www.chmi.cz", "/namerena-data/umisteni-mericich-stanic/meteorologicke", "Meteorologické stanice"],
    ["www.chmi.cz", "/namerena-data/radar-nowcast/srazky-a-blesky", "Srážky a blesky"],
    ["www.chmi.cz", "/namerena-data/historicka-data", "Historická data"],
    ["www.chmi.cz", "/o-chmu/produkty-a-sluzby/data-a-vyhodnoceni", "Data a vyhodnocení"],
    ["www.chmi.cz", "/o-chmu/publikace-a-vzdelavani/zpravy-a-datove-prehledy", "Zprávy a datové přehledy"],
    ["www.chmi.cz", "/letectvi", "Letecká meteorologie"],
    ["hydro.chmi.cz", "/hpps/srz", "Aktuální srážkoměry"]
  ];

  function normalizePath(pathname = location.pathname) {
    return pathname.replace(/\/+$/, "") || "/";
  }

  function isCorePage() {
    const path = normalizePath();
    if (location.hostname === "produkty.chmi.cz") {
      return path.startsWith("/radar") || path.startsWith("/druzice");
    }
    if (location.hostname !== "www.chmi.cz") {
      return false;
    }
    return (
      path === "/" ||
      path === "/namerena-data/pravdepodobnost-rustu-hub" ||
      path.includes("/polarni-druzice/") ||
      path.includes("/geostacionarni-druzice/")
    );
  }

  function shellRoute() {
    const path = normalizePath();
    return shellRoutes.find(([host, prefix]) => location.hostname === host && path.startsWith(prefix)) ?? null;
  }

  function pageIsSupported() {
    return isCorePage() || Boolean(shellRoute());
  }

  function getPreference(callback) {
    if (!storage) {
      callback(true);
      return;
    }
    storage.get({ [STORAGE_KEY]: true }, (result) => callback(result?.[STORAGE_KEY] !== false));
  }

  function setPreference(enabled) {
    storage?.set({ [STORAGE_KEY]: enabled });
  }

  function currentPageMatches(href) {
    try {
      const target = new URL(href);
      return target.hostname === location.hostname && normalizePath(target.pathname) === normalizePath();
    } catch {
      return false;
    }
  }

  function createCoreNavigation() {
    const nav = document.createElement("nav");
    nav.className = "chmi-classic-navigation chmi-catalog-core-navigation";
    nav.setAttribute("aria-label", "ČHMÚ Classic – hlavní aplikace");
    for (const [href, label] of corePaths) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (currentPageMatches(href)) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
      nav.append(link);
    }
    return nav;
  }

  function addCatalogButton(host) {
    if (!host || host.querySelector(`.${BUTTON_CLASS}`)) {
      return false;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.textContent = "Produkty";
    button.title = "Všechny živé a archivní meteorologické výstupy ČHMÚ Classic";
    button.addEventListener("click", () => openCatalog());
    const newLookButton = [...host.querySelectorAll(":scope > button")].find((candidate) =>
      /nový vzhled|současn.*vzhled/i.test(`${candidate.textContent} ${candidate.title}`)
    );
    host.insertBefore(button, newLookButton ?? null);
    return true;
  }

  function ensureCatalogOnCoreHeader() {
    const header = document.querySelector(
      "#chmi-radar-classic-brand, #chmi-home-radar-classic-brand, #chmi-satellite-classic-brand, #chmi-hub-classic-brand"
    );
    return addCatalogButton(header);
  }

  function createShellBrand(title) {
    if (document.getElementById(BRAND_ID)) {
      return document.getElementById(BRAND_ID);
    }
    const host = document.querySelector("main") ?? document.body;
    if (!host) {
      return null;
    }
    const brand = document.createElement("div");
    brand.id = BRAND_ID;

    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    brand.append(titleNode);

    const subtitle = document.createElement("span");
    subtitle.textContent = "klasické rozhraní";
    brand.append(subtitle);

    brand.append(createCoreNavigation());

    const catalogButton = document.createElement("button");
    catalogButton.type = "button";
    catalogButton.className = BUTTON_CLASS;
    catalogButton.textContent = "Produkty";
    catalogButton.addEventListener("click", () => openCatalog());
    brand.append(catalogButton);

    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      const presetButton = document.createElement("button");
      presetButton.type = "button";
      presetButton.id = ALADIN_PRESET_ID;
      presetButton.textContent = "4 mapy";
      presetButton.title = "Vybrat teplotu, oblačnost, srážky za 3 h a vítr";
      presetButton.addEventListener("click", applyAladinFourMapPreset);
      brand.append(presetButton);
    }

    const newLookButton = document.createElement("button");
    newLookButton.type = "button";
    newLookButton.className = "chmi-catalog-new-look";
    newLookButton.textContent = "Nový vzhled";
    newLookButton.title = "Vypnout klasické rozhraní na podporovaných stránkách";
    newLookButton.addEventListener("click", () => {
      setPreference(false);
      location.reload();
    });
    brand.append(newLookButton);

    host.insertBefore(brand, host.firstChild);
    return brand;
  }

  function statusText(status) {
    if (status === "archive") {
      return "Archiv";
    }
    if (status === "legacy") {
      return "Legacy";
    }
    if (status === "direct") {
      return "Přímá data";
    }
    if (status === "unavailable") {
      return "Nedostupné";
    }
    if (status === "external") {
      return "Externí";
    }
    return "Živě";
  }

  function buildCatalog() {
    if (document.getElementById(DIALOG_ID)) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeCatalog();
      }
    });

    const dialog = document.createElement("section");
    dialog.id = DIALOG_ID;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "chmi-classic-catalog-title");

    const header = document.createElement("header");
    const heading = document.createElement("h2");
    heading.id = "chmi-classic-catalog-title";
    heading.textContent = "ČHMÚ Classic – meteorologické výstupy";
    header.append(heading);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "chmi-catalog-close";
    closeButton.setAttribute("aria-label", "Zavřít katalog");
    closeButton.textContent = "Zavřít";
    closeButton.addEventListener("click", closeCatalog);
    header.append(closeButton);
    dialog.append(header);

    const intro = document.createElement("p");
    intro.className = "chmi-catalog-intro";
    intro.innerHTML = "<strong>Živě</strong> = současný oficiální zdroj. <strong>Legacy</strong> = původní endpoint ČHMÚ, jehož dostupnost/aktuálnost už není garantována. <strong>Archiv</strong> = historická kopie bez živých dat. <strong>Přímá data</strong> = doložený oficiální adresář/soubor. <strong>Nedostupné</strong> = historicky doložený výstup bez bezpečně obnoveného vieweru.";
    dialog.append(intro);

    const quick = document.createElement("div");
    quick.className = "chmi-catalog-quick";
    quick.append(createCoreNavigation());
    dialog.append(quick);

    const body = document.createElement("div");
    body.className = "chmi-catalog-groups";

    for (const group of groups) {
      const section = document.createElement("section");
      section.className = "chmi-catalog-group";
      const h3 = document.createElement("h3");
      h3.textContent = group.title;
      section.append(h3);

      const list = document.createElement("div");
      list.className = "chmi-catalog-list";
      for (const item of group.items) {
        const isUnavailable = item.status === "unavailable";
        const article = document.createElement("article");
        article.className = `chmi-catalog-item is-${item.status}`;
        if (isUnavailable) {
          article.setAttribute("aria-disabled", "true");
        }

        const top = document.createElement("div");
        top.className = "chmi-catalog-item-top";
        const link = item.href && !isUnavailable ? document.createElement("a") : document.createElement("span");
        if (item.href && !isUnavailable) {
          link.href = item.href;
          if (item.status === "archive") {
            link.target = "_blank";
            link.rel = "noreferrer";
          }
          if (currentPageMatches(item.href)) {
            link.setAttribute("aria-current", "page");
          }
        } else {
          link.className = "chmi-catalog-item-label";
          if (isUnavailable) {
            const explanation = item.note || "Rekonstruovaná aplikace není dostupná.";
            link.classList.add("is-unavailable");
            link.title = `Nedostupné: ${explanation}`;
            link.setAttribute("aria-label", `${item.label}. ${explanation}`);
            link.tabIndex = 0;
          }
        }
        link.textContent = item.label;
        top.append(link);

        const badge = document.createElement("span");
        badge.className = `chmi-catalog-status is-${item.status}`;
        badge.textContent = statusText(item.status);
        top.append(badge);
        article.append(top);

        const note = document.createElement("p");
        note.textContent = item.note;
        article.append(note);

        if (!isUnavailable && (item.archiveHref || item.replacementHref)) {
          const actions = document.createElement("div");
          actions.className = "chmi-catalog-item-actions";
          if (item.archiveHref) {
            const archiveLink = document.createElement("a");
            archiveLink.href = item.archiveHref;
            archiveLink.target = "_blank";
            archiveLink.rel = "noreferrer";
            archiveLink.textContent = "Web Archive";
            actions.append(archiveLink);
          }
          if (item.archiveIndexHref) {
            const archiveIndexLink = document.createElement("a");
            archiveIndexLink.href = item.archiveIndexHref;
            archiveIndexLink.target = "_blank";
            archiveIndexLink.rel = "noreferrer";
            archiveIndexLink.textContent = "Všechny snapshoty";
            actions.append(archiveIndexLink);
          }
          if (item.replacementHref) {
            const replacementLink = document.createElement("a");
            replacementLink.href = item.replacementHref;
            replacementLink.textContent = "Aktuální náhrada";
            actions.append(replacementLink);
          }
          article.append(actions);
        }
        list.append(article);
      }
      section.append(list);
      body.append(section);
    }
    dialog.append(body);
    overlay.append(dialog);
    document.body.append(overlay);
  }

  function openCatalog() {
    buildCatalog();
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = false;
    document.documentElement.classList.add("chmi-catalog-open");
    const closeButton = overlay.querySelector(".chmi-catalog-close");
    closeButton?.focus();
    if (location.hash !== CATALOG_HASH) {
      hashBeforeCatalog = location.hash;
      history.replaceState(null, "", `${location.pathname}${location.search}${CATALOG_HASH}`);
    }
  }

  function closeCatalog() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      return;
    }
    overlay.hidden = true;
    document.documentElement.classList.remove("chmi-catalog-open");
    if (location.hash === CATALOG_HASH) {
      history.replaceState(null, "", `${location.pathname}${location.search}${hashBeforeCatalog}`);
      hashBeforeCatalog = "";
    }
  }

  function associatedText(input) {
    const id = input.id;
    const forLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const closestLabel = input.closest("label");
    const text = forLabel?.textContent || closestLabel?.textContent || input.parentElement?.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function dispatchControlChange(input, checked) {
    if (input.checked === checked) {
      return false;
    }
    input.checked = checked;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function applyAladinFourMapPreset() {
    const controls = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')];
    const known = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i,
      /(?:nízká.*oblačnost|oblačnost.*nízká)/i,
      /(?:střední.*oblačnost|oblačnost.*střední)/i,
      /(?:vysoká.*oblačnost|oblačnost.*vysoká)/i,
      /relativní\s+vlhkost/i,
      /ventilační\s+index/i,
      /minimální\s+teplota/i,
      /maximální\s+teplota/i,
      /srážky\s+za\s+24\s*h/i
    ];
    const wanted = [
      /teplota\s+ve\s+2\s*m/i,
      /srážky\s+za\s+3\s*h/i,
      /vítr\s+v\s+10\s*m/i,
      /^\s*oblačnost\s*$/i
    ];

    let matched = 0;
    for (const control of controls) {
      const text = associatedText(control);
      if (!known.some((pattern) => pattern.test(text))) {
        continue;
      }
      const shouldBeChecked = wanted.some((pattern) => pattern.test(text));
      dispatchControlChange(control, shouldBeChecked);
      if (shouldBeChecked) {
        matched += 1;
      }
    }

    const selectCandidates = [...document.querySelectorAll("select")];
    for (const select of selectCandidates) {
      const context = `${select.previousElementSibling?.textContent || ""} ${select.parentElement?.textContent || ""}`;
      if (!/rozložení|sloup/i.test(context)) {
        continue;
      }
      const option = [...select.options].find((candidate) =>
        /(^|\D)4(\D|$)|4\s*sloup|čtyř/i.test(`${candidate.textContent} ${candidate.value}`)
      );
      if (option && select.value !== option.value) {
        select.value = option.value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      break;
    }

    const button = document.getElementById(ALADIN_PRESET_ID);
    if (button) {
      button.dataset.chmiPresetMatched = String(matched);
      button.title = matched >= 4
        ? "Vybrány 4 klasické mapy z původních ovládacích prvků ČHMÚ."
        : `Nalezeno ${matched}/4 požadovaných ovládacích prvků; stránka ČHMÚ mohla změnit strukturu.`;
    }
  }

  let resizeScheduled = false;
  function updateShellGeometry() {
    if (!document.documentElement.classList.contains(ROOT_CLASS)) {
      return;
    }
    const main = document.querySelector("main");
    if (!main) {
      return;
    }
    const top = Math.max(0, main.getBoundingClientRect().top);
    document.documentElement.style.setProperty(
      "--chmi-catalog-available-height",
      `${Math.max(360, Math.floor(window.innerHeight - top - 10))}px`
    );
  }

  function scheduleGeometry() {
    if (resizeScheduled) {
      return;
    }
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      updateShellGeometry();
      window.dispatchEvent(new Event("chmi-classic-layout"));
    });
  }

  function enableShell(route) {
    document.documentElement.classList.add(ROOT_CLASS);
    if (location.hostname === "produkty.chmi.cz" && normalizePath().startsWith("/aladin")) {
      document.documentElement.classList.add("chmi-catalog-aladin");
    }
    createShellBrand(route[2]);
    updateShellGeometry();
    window.addEventListener("resize", scheduleGeometry, { passive: true });
    if (globalThis.ResizeObserver) {
      const main = document.querySelector("main");
      if (main) {
        const observer = new ResizeObserver(scheduleGeometry);
        observer.observe(main);
      }
    }
  }

  function initialize(enabled) {
    if (!enabled || !pageIsSupported()) {
      return;
    }

    const route = shellRoute();
    if (route && !isCorePage()) {
      enableShell(route);
    }

    let scheduled = false;
    const refresh = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        ensureCatalogOnCoreHeader();
        if (route && !isCorePage()) {
          createShellBrand(route[2]);
        }
      });
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    refresh();

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !document.getElementById(OVERLAY_ID)?.hidden) {
        closeCatalog();
      }
    });

    if (location.hash === CATALOG_HASH) {
      openCatalog();
    }
  }

  getPreference(initialize);
})();
