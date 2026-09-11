# Jak nainstalovat ČHMÚ Classic 0.5.0

ČHMÚ Classic vrací kompaktní old-look vybraným živým aplikacím ČHMÚ a přidává
jednotný katalog dalších meteorologických výstupů. Meteorologická data stále
pocházejí z oficiálních backendů ČHMÚ; archivní odkazy jsou v katalogu výslovně
označeny jako archiv.

## 1. Tampermonkey

1. Nainstalujte Tampermonkey pro svůj prohlížeč.
2. Otevřete:
   `https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js`
3. Potvrďte instalaci userscriptu.
4. Otevřete například `https://produkty.chmi.cz/aladin/`.
5. V klasickém headeru použijte **Produkty** pro celý katalog nebo **4 mapy** pro
   rychlou volbu teploty, oblačnosti, tříhodinových srážek a větru.

Tlačítko **Nový vzhled** vypne klasický režim. Znovu jej zapnete z nabídky
Tampermonkey nebo plovoucím tlačítkem **Klasický vzhled**.

## 2. Chrome / Edge bez Tampermonkey

Pro verzi 0.5.0 použijte distribuční soubor:

`chmi-classic-chrome-edge-0.5.0.zip`

1. ZIP rozbalte do trvalé složky.
2. Otevřete `chrome://extensions` nebo `edge://extensions`.
3. Zapněte **Režim pro vývojáře**.
4. Zvolte **Načíst rozbalené**.
5. Vyberte rozbalenou složku.
6. V dialogu oprávnění povolte přístup k požadovaným webům ČHMÚ.

Popup rozšíření obsahuje přímý vstup do katalogu a nejčastější živé aplikace.

## 3. Safari na macOS

Pro verzi 0.5.0 použijte zdrojový balík:

`chmi-classic-safari-source-0.5.0.zip`

1. ZIP rozbalte.
2. Otevřete `safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj`.
3. Vyberte schéma `CHMURadarClassicSafari` a spusťte aplikaci.
4. V Safari otevřete **Nastavení → Rozšíření** a povolte ČHMÚ Classic.
5. Povolte přístup k `produkty.chmi.cz`, `www.chmi.cz` a podle použití také
   `hydro.chmi.cz`.
6. Pro lokální nepodepsané rozšíření může být nutné povolit nepodepsaná
   rozšíření v nabídce Vývojář.

Vývojové ověření na macOS lze spustit:

```sh
./script/build_and_run.sh --verify
```

## 4. Hlavní old-look aplikace

- Radar: `https://produkty.chmi.cz/radar/`
- Radar ČHMÚ: `https://www.chmi.cz/#chmi-classic-home-radar`
- Meteosat: `https://produkty.chmi.cz/druzice/?time_range=24`
- Polární družice: `https://www.chmi.cz/namerena-data/polarni-druzice/true-color`
- Geo: `https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color`
- Houby: `https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub`
- ALADIN: `https://produkty.chmi.cz/aladin/`

Na prvních šesti stránkách zůstávají specializované layoutové opravy z verze
0.4.1. ALADIN a další katalogové stránky používají lehčí old-look rám, který
nemění datový backend ani logiku původních formulářů a map.

## 5. Katalog dalších výstupů

Tlačítko **Produkty** zpřístupňuje:

- meteogramy pro obce, letiště, hory, vodní plochy a bod na mapě;
- webkamery;
- aktuální teploty, srážky, stanice, tlak, vlhkost a vítr;
- HPPS srážkoměry;
- radar a blesky;
- synoptické situace a evropské staniční mapy;
- letecké METAR/SPECI, SIGMET, TAF, SWL, nízkou oblačnost, výškový vítr,
  radiosondáže, aerologii/pseudosondáže, VIS-IR a další živé odkazy;
- přechody front, Klementinum, historické mapy teploty a srážek;
- Open Data a stránky s oficiálními zprávami/PDF;
- archiv starého radaru, MSG, AVHRR a index starého ALADINu.

Položky **Živě** vedou na současné oficiální zdroje. Položky **Archiv** vedou
na historické kopie a neposkytují aktuální data.

## 6. Fit-to-window a scrollování

Klasické rozhraní se snaží využít dostupnou šířku a výšku okna bez zbytečného
vodorovného scrollování. U mapových aplikací z verze 0.4.1 zůstávají aktivní
nativní režimy a přepínače `Dle okna / Zoom 4x / Zoom 8x / Web Maps`.

Na katalogových stránkách se původní tabulky a mapy nepřepisují. Pokud samotná
živá aplikace ČHMÚ vyžaduje scrollování kvůli svému obsahu, rozšíření jej
násilně neodstraňuje tak, aby se neztratily ovládací prvky nebo data.

## 7. Když se něco nezobrazí

- Obnovte stránku.
- Ověřte, že je klasický režim zapnutý v popupu nebo Tampermonkey.
- Zkontrolujte oprávnění rozšíření pro konkrétní doménu.
- U Internet Archive počítejte s tím, že některé podřízené historické soubory
  nemusí být zachyceny.
- Pokud ČHMÚ změnil HTML nebo cestu, přiložte při hlášení chyby URL a screenshot.

ČHMÚ Classic neobchází cookies, přístupová omezení ani nedostupnost původního
`intranet.chmi.cz`.
