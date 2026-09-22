# Jak nainstalovat ČHMÚ Classic

ČHMÚ Classic vrací současným stránkám ČHMÚ známý klasický vzhled. Počasí a
snímky dál pocházejí z ČHMÚ; nejde o přehrávání starého počasí z archivu.

## Chci vyzkoušet nejnovější podobu portálu

**Aktuální userscript je 0.7.0-beta.3 — testovací verze.** Má centrální panel
pro aplikace, rozcestník a tlačítko **Zvětšit panel**. Celý původní intranet
ještě obnovený není. Záložky Voda a Ovzduší a červeně přeškrtnuté položky
čekají na dokončení. [Podívejte se na dvě ukázky vzhledu](README.md#jak-beta-vypadá).

Nejjednodušší cesta je přes **Tampermonkey**, správce malých úprav webových
stránek. Pro tuto betu nepotřebujete Xcode ani účet vývojáře.

1. Nainstalujte [Tampermonkey pro svůj prohlížeč](https://www.tampermonkey.net/).
2. Otevřete [instalaci ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. V nabídnutém okně Tampermonkey zvolte **Install / Nainstalovat**, případně
   **Update / Aktualizovat**, pokud už skript máte.
4. Máte-li zároveň staré rozšíření ČHMÚ Classic, vypněte je. Aktivní má být
   pouze jedna varianta, jinak se jejich úpravy mohou překrývat.
5. Otevřete [úvodní stránku ČHMÚ](https://www.chmi.cz/) a jednou ji obnovte.

Beta zatím prošla vývojovým ověřením ve vestavěném prohlížeči. Úplné ověření
instalace v Tampermonkey a chování ve všech prohlížečích ještě není dokončené.

## Jak se nový portál používá

- **Klikněte na modrý odkaz pod mapou.** Aplikace se otevře v centrálním panelu.
- **Zvětšit panel** schová okolní nabídky a ponechá aplikaci více místa.
  Tlačítko **Zpět na portál** nebo Escape nabídky vrátí.
- **Otevřít samostatně** otevře aplikaci v nové záložce. Totéž můžete udělat
  prostředním tlačítkem myši nebo Ctrl+klik (na Macu ⌘+klik) na odkazu.
  S aktivním userscriptem má i samostatná podporovaná aplikace klasický vzhled.
- **Červený přeškrtnutý text není odkaz.** Po najetí myší se dozvíte, proč
  aplikace zatím není dostupná. Nic není potřeba opravovat ve vašem počítači.
- **Nový vzhled** vrátí původní současný web. Klasický vzhled znovu zapnete
  tlačítkem **Klasický vzhled** nebo v nabídce Tampermonkey.

Přímo můžete otevřít také [radar](https://produkty.chmi.cz/radar/),
[Meteosat za 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24),
[ALADIN](https://produkty.chmi.cz/aladin/),
[polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color),
[geostacionární družice](https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color),
[webkamery](https://www.chmi.cz/namerena-data/webkamery)
nebo [mapu růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub).
Rozložení všech těchto aplikací se ještě průběžně dolaďuje.

## Jak získám aktualizaci

Znovu otevřete [stejný instalační odkaz](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js),
potvrďte aktualizaci v Tampermonkey a obnovte otevřené stránky ČHMÚ. Není
potřeba instalovat druhou kopii skriptu. Odkaz sleduje aktuální verzi v `main`,
tedy nyní betu, nikoli poslední stabilní vydání.

## Chrome a Edge – testovací beta bez Tampermonkey

Nový [Chrome/Edge balíček 0.7.0-beta.3](https://github.com/barcuchj/chmi-classic/releases/download/v0.7.0-beta.3/chmi-classic-chrome-edge-0.7.0-beta.3.zip)
obsahuje i centrální portál a webkamery. Je určen k testování: obsah ZIPu,
syntaxe a automatické testy prošly, ale skutečná instalace a rozložení v prohlížeči
ještě nebyly potvrzené.

1. Stáhněte ZIP a rozbalte jej do složky, kterou později nepřesunete ani nesmažete.
2. Otevřete `chrome://extensions` nebo `edge://extensions`.
3. Zapněte **Režim pro vývojáře** a zvolte **Načíst rozbalené**.
4. Vyberte rozbalenou složku, v níž přímo vidíte `manifest.json`.
5. Máte-li Tampermonkey variantu ČHMÚ Classic, vypněte ji pro web ČHMÚ.

Odkaz na webkamery v rozcestníku otevírá oficiální mapu se seznamem kamer;
po výběru kamery má zůstat snímek a časová osa na stejné stránce v klasickém
rámu. Pokud narazíte na oříznuté ovladače nebo zbytečný posuvník, pošlete
[hlášení s obrázkem](https://github.com/barcuchj/chmi-classic/issues) a velikostí okna.

## Starší vydané rozšíření bez nového portálu

Starší samostatně vydané balíčky jsou **0.4.1**. **Neobsahují nový portál
z bety 0.7.0.** Jsou určeny pro starší samostatné úpravy radaru, družic a map.

### Chrome a Edge

1. Stáhněte [rozšíření 0.4.1 pro Chrome a Edge](https://github.com/barcuchj/chmi-classic/releases/download/v0.4.1/chmi-classic-chrome-edge-0.4.1.zip).
2. ZIP rozbalte do složky, kterou později nepřesunete ani nesmažete.
3. Otevřete `chrome://extensions` nebo `edge://extensions`.
4. Zapněte **Režim pro vývojáře** a zvolte **Načíst rozbalené**.
5. Vyberte složku, ve které přímo vidíte soubor `manifest.json`.

Pokud prohlížeč manifest nenajde, vybrali jste nejspíš o úroveň vyšší složku.
Klasický režim zapnete nebo vypnete přes ikonu rozšíření. Před použitím této
varianty vypněte userscript ČHMÚ Classic v Tampermonkey.

### Safari na macOS

Starší Safari varianta je zdrojový projekt pro Xcode, nikoli instalátor na
jedno kliknutí. Pokud Xcode nepoužíváte, začněte userscriptem výše.

1. Stáhněte [Safari zdrojový balíček 0.4.1](https://github.com/barcuchj/chmi-classic/releases/download/v0.4.1/chmi-classic-safari-source-0.4.1.zip) a rozbalte jej.
2. V Xcode otevřete `safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj`.
3. Vyberte schéma `CHMURadarClassicSafari` a spusťte aplikaci na svém Macu.
4. V Safari v **Nastavení → Rozšíření** povolte ČHMÚ Classic a přístup
   k `produkty.chmi.cz` a `www.chmi.cz`.

Lokálně podepsaná vývojová varianta může vyžadovat povolení nepodepsaných
rozšíření v nastavení Safari pro vývojáře, a to znovu po ukončení Safari.
Nový Safari balíček s beta portálem zatím nevydáváme.

## Když se něco nezobrazí

- U družic zvolte **24 h**. V kratším období nemusí být žádný snímek.
- Obnovte stránku a zkontrolujte, že je ČHMÚ Classic v Tampermonkey zapnutý.
- Ověřte oprávnění správce skriptů pro aktuální web. Řiďte se případnou výzvou
  Tampermonkey k povolení spouštění userscriptů v prohlížeči.
- Vypněte druhou kopii skriptu nebo staré rozšíření ČHMÚ Classic.
- Pokud se problém opakuje, [nahlaste chybu](https://github.com/barcuchj/chmi-classic/issues).
  Přiložte adresu stránky, prohlížeč, verzi skriptu a snímek obrazovky bez
  osobních údajů. Pomůže i informace, zda šlo o centrální panel, nebo samostatnou záložku.

Výpadek zdroje ČHMÚ ani chybějící historická data skript neobchází.
Seznam rozpracovaných částí najdete v [TODO.md](TODO.md).
