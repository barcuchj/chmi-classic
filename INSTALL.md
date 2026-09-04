# Jak nainstalovat ČHMÚ Classic

ČHMÚ Classic vrací na současné stránky radaru a družicových snímků kompaktní
vzhled a ovládání starého prohlížeče. Data stále přicházejí přímo z ČHMÚ.

## Nejjednodušší možnost: Tampermonkey

Tato varianta funguje v Chrome, Edge, Firefoxu a dalších prohlížečích, pro které
je dostupný správce userscriptů Tampermonkey.

1. Nainstalujte rozšíření Tampermonkey z katalogu svého prohlížeče.
2. Otevřete [instalaci ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. Tampermonkey zobrazí instalační stránku. Potvrďte **Install / Nainstalovat**.
4. Otevřete [radar](https://produkty.chmi.cz/radar/) nebo [družicové snímky za 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24).

Tlačítko **Nový vzhled** klasický režim vypne. Zpět jej zapnete plovoucím
tlačítkem **Klasický vzhled** nebo z nabídky Tampermonkey.

## Chrome a Edge bez Tampermonkey

1. Na stránce [Releases](https://github.com/barcuchj/chmi-classic/releases/latest)
   stáhněte soubor `chmi-classic-chrome-edge-0.3.0.zip`.
2. ZIP rozbalte do složky, kterou později nepřesunete ani nesmažete.
3. Otevřete `chrome://extensions` nebo `edge://extensions`.
4. Zapněte **Režim pro vývojáře**.
5. Klikněte na **Načíst rozbalené** a vyberte rozbalenou složku.

Klasický režim lze zapnout a vypnout přes ikonu rozšíření. Po nové verzi je
potřeba stáhnout nový ZIP a původní složku nahradit.

## Safari na macOS

Bez účtu Apple Developer nelze nabídnout běžně podepsanou instalaci jedním
kliknutím. GitHub proto obsahuje zdrojový Xcode projekt pro lokální použití:

1. Na stránce [Releases](https://github.com/barcuchj/chmi-classic/releases/latest)
   stáhněte `chmi-classic-safari-source-0.3.0.zip` a rozbalte jej.
2. Otevřete `safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj` v Xcode.
3. Vyberte schéma `CHMURadarClassicSafari` a spusťte aplikaci na svém Macu.
4. V Safari otevřete **Nastavení → Rozšíření** a povolte ČHMÚ Classic.
5. Pokud Safari lokální nepodepsané rozšíření odmítne, zapněte v nabídce
   **Vývojář** volbu **Povolit nepodepsaná rozšíření**. Safari může toto povolení
   po ukončení vyžadovat znovu.

## Podporované stránky

- [Radar a srážky](https://produkty.chmi.cz/radar/)
- [Animovaný prohlížeč Meteosat – 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24)
- [Polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color)
- geostacionární družicové produkty na `www.chmi.cz/namerena-data/`

## Když se nic nezobrazí

- U družic nejprve zvolte časový rozsah **24 h**; v kratším intervalu nemusí být
  žádný snímek.
- Obnovte stránku.
- Ověřte, že je rozšíření nebo userscript zapnutý pro adresy `chmi.cz`.
- Pokud ČHMÚ změní strukturu stránky, založte [Issue](https://github.com/barcuchj/chmi-classic/issues)
  a přiložte adresu stránky a snímek obrazovky.
