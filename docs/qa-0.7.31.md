# Ověření 0.7.31 – předpovědi, letectví, sníh a hory

26. října 2026, izolovaný profil Chromium s načteným místním rozšířením,
bez souběhu s Tampermonkey. Změněné zdroje jsou společné pro Chrome a
generovaný userscript.

## Zdroje a ověřené průchody

- **Synoptická předpověď:** současná [časová osa ČHMÚ](https://www.chmi.cz/predpoved-pocasi/synopticka-situace)
  obsahuje aktuální situaci i předpovědní snímky. Samostatná archivní adresa
  původního produktu nebyla dostupná; nejde o její doslovnou rekonstrukci.
  V centrálním panelu se podle značky ČHMÚ „Předpověď“ vybral první
  předpovědní termín a následné kliknutí na časové ose změnilo mapu
  z 27. na 28. října. Žádné archivní snímky se nepoužívají.
- **Počasí pro létání:** [současný oficiální rozcestník](https://www.chmi.cz/letectvi)
  se otevřel v centrálním panelu s 15 odkazy; nativní odkaz TAF přešel na
  jeho informační stránku ve stejném panelu. Jde o kompaktní obal oficiálního
  rozcestníku, nikoli o kopii původní letecké aplikace. Ostatní produkty
  nebyly jednotlivě instalačně ověřeny.
- **Sněhové zpravodajství:** [živý seznam HPPS](https://hydro.chmi.cz/hppsoldv/hpps_snh_list.php)
  se načetl v panelu, zobrazil dnešní měření a původní tři filtry. Výběr
  Vysočiny aktualizoval tabulku a po otevření detailu stanice zůstal panel
  viditelný a připravený. Kategorie zachovává původní pole; jeho hodnoty
  ani funkce backendu nebyly nově ověřeny.
- **Předpovědi pro hory:** [Šumava a Novohradské hory](https://www.chmi.cz/predpoved-pocasi/lyzarska-strediska-a-hory/sumava-a-novohradske-hory)
  zobrazila živou tabulku a přechod na Beskydy zachoval klasický panel,
  relaci i tabulku. Samostatný adaptér byl ověřen také v úzkém okně;
  široká nativní tabulka může mít vlastní vodorovný posun.

## Hranice ověření

- Proběhlo skutečné ověření rozbaleného rozšíření; instalace výsledného ZIPu
  ze Store ani instalace userscriptu do Tampermonkey, Safari a Edge v tomto
  kroku ověřena nebyla.
- Některé odpovědi ČHMÚ byly pomalé a prohlížeč hlásil chyby síťových
  požadavků ČHMÚ. Připravenost se potvrzuje podle zobrazeného obsahu, nikoli
  pouze podle otevření stránky.
- Archivní synoptický viewer 36/60/84 h a dosud nepřezkoušené letecké
  produkty se neprohlašují za obnovené kopie. Uživateli se zobrazují
  současné oficiální náhrady.
