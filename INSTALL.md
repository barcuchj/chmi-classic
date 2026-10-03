# Jak nainstalovat ČHMÚ Classic

ČHMÚ Classic vrací současným stránkám ČHMÚ známý klasický vzhled. Počasí a
snímky dál pocházejí z ČHMÚ; nejde o přehrávání starého počasí z archivu.

## Chci vyzkoušet nejnovější podobu portálu

**Aktuální userscript je 0.7.0-beta.25 — testovací verze.** Má centrální panel
pro aplikace, rozcestník a tlačítko **Zvětšit panel**. Celý původní intranet
ještě obnovený není. Úvodní předpověď ČR má nově třídenní panel; Voda a Ovzduší mají
živé adaptéry. Červeně přeškrtnuté položky čekají na rekonstrukci.
Na úzkém vysokém okně předpověď využívá místo pod mapou pro seznam měst;
kliknutím na jeho nadpis jej můžete sbalit.
Na samostatném meteogramu zůstává živé vyhledávání míst ČHMÚ; testovací beta
navíc nabízí čtyři poslední navštívená místa. Odkaz na meteogram z původního
rozcestníku je nyní aktivní a otevírá výchozí živý meteogram Prahy. Položka
**Radarové odhady srážek** otevírá současný oficiální přehled pro 1/3/6/24 hodin. Vzhled
instalované bety je ještě potřeba ověřit.
**Detekce blesků** otevře jiný režim živého radaru ČHMÚ se samotnou
bleskovou vrstvou; nejde zatím o úplnou rekonstrukci starého prohlížeče blesků.
**Aladin – animace** zobrazí jednu živou předpovědní mapu s přehráváním
po třech hodinách a volbou rychlosti; **Aladin – mapy** zachová čtyři mapy.
**Synoptická situace** ukazuje živou časovou řadu map. **Sondážní měření**
vedou na naměřené grafy Praha-Libuš; ovládání snímků zůstává součástí ČHMÚ.
**Měření z Klementina** otevírá živé staniční tabulky a záložky v kompaktním
klasickém obalu. Původní obsah této stránky se v archivu nedochoval.
**Meteorologické stanice** otevírají živou mapu ČHMÚ v klasickém rámu; můžete
na ní přepínat základní vrstvy měření. Původní jemnější výběr typů stanic
zatím současná mapa nenabízí. Instalovaný vzhled této nové adaptace ještě
není ověřený.
**Aktivita klíšťat** používá současnou živou mapu a její tři denní kroky.
Klasický rám ponechává mapu na obrazovce; staré archivní obrázky neukazuje.
Také zde zbývá kontrola po instalaci.
**Bio předpověď** má živou mapu se dvěma dny a rozbalovací oblastní přehled.
Její nový klasický obal zatím čeká na vizuální kontrolu po instalaci.
**Týdenní předpověď** zpřístupní živý text ČHMÚ po jednotlivých dnech a
jejich živý graf v samostatné záložce uvnitř panelu. Dlouhý text se posouvá
uvnitř aplikace, ne celou stránkou. Její instalovaný vzhled ještě čeká na
vizuální kontrolu. [Podívejte se na tři ukázky aktuální bety](README.md#jak-beta-vypadá).
**Předpovědi pro kraje** nabízí seznam 14 krajů a volbu dne v klasickém
modrém panelu. Samotný text předpovědi zůstává aktuální z ČHMÚ; v archivu se
jeho historický obsah nedochoval. Také tato nová úprava čeká na instalační
vizuální kontrolu.
**Měsíční výhled** má aktuální slovní předpověď a tlačítko **Grafy a statistika**.
To zobrazí živé grafické PDF ČHMÚ přímo v panelu; odkaz **Otevřít PDF** jej
otevře v samostatné záložce. Staré archivní údaje se nezobrazují jako aktuální.
V Chrome betě 24 je přepínání ověřené. Volba **Na šířku – čitelně** zvětší
text; **Celá stránka** ukáže přehled celého dokumentu. Posuvník uvnitř PDF
je při čitelné velikosti potřeba, ale portál se neposouvá.

Nejjednodušší cesta je přes **Tampermonkey**, správce malých úprav webových
stránek. Pro tuto betu nepotřebujete Xcode ani účet vývojáře.

1. Nainstalujte [Tampermonkey pro svůj prohlížeč](https://www.tampermonkey.net/).
2. Otevřete [instalaci ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. V nabídnutém okně Tampermonkey zvolte **Install / Nainstalovat**, případně
   **Update / Aktualizovat**, pokud už skript máte.
4. Máte-li zároveň staré rozšíření ČHMÚ Classic, vypněte je. Aktivní má být
   pouze jedna varianta, jinak se jejich úpravy mohou překrývat.
5. Otevřete [úvodní stránku ČHMÚ](https://www.chmi.cz/) a jednou ji obnovte.

Beta 24 prošla také instalační kontrolou v odděleném Chrome: kamery,
radar a měsíční výhled v centrálním panelu. Úplné ověření instalace
v Tampermonkey a chování všech aplikací a prohlížečů ještě není dokončené.

## Jak se nový portál používá

- **Klikněte na modrý odkaz pod mapou.** Aplikace se otevře v centrálním panelu.
- **Předpověď pro ČR** otevře živou mapu. Vpravo jsou tři dny s ikonami
  a teplotami pro ráno/odpoledne; kliknutím zvolíte období. Na úzkém displeji
  najdete panel pod mapou. **Není údaj** znamená, že ČHMÚ období právě
  nenabízí. Přístupný seznam měst rozbalíte pod mapou.
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
Přímý odkaz na [radarové odhady srážek](https://hydro.chmi.cz/hppsoldv/main_rain.php)
otevírá jinou aplikaci než běžný radar.
Rozložení všech těchto aplikací se ještě průběžně dolaďuje.

## Jak získám aktualizaci

Znovu otevřete [stejný instalační odkaz](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js),
potvrďte aktualizaci v Tampermonkey a obnovte otevřené stránky ČHMÚ. Není
potřeba instalovat druhou kopii skriptu. Odkaz sleduje aktuální verzi v `main`,
nikoli místní pracovní soubor. Než bude tato beta sloučena do `main`, může odkaz
stále nabízet starší verzi.

## Chrome a Edge – testovací beta bez Tampermonkey

Aktuální [Chrome/Edge balíček 0.7.0-beta.25](https://github.com/barcuchj/chmi-classic/releases/download/v0.7.0-beta.25/chmi-classic-chrome-edge-0.7.0-beta.25.zip)
obsahuje centrální portál a webkamery a sdílí s userscriptem
adaptéry pro předpověď, meteogram, vodu, ovzduší a radarové odhady srážek
i v centrálním panelu, stejně jako animaci ALADINu, synoptickou situaci a
sondážní měření, Klementinum, meteorologické stanice, aktivitu klíšťat,
biometeorologickou, týdenní, krajské i měsíční předpovědi a pylový semafor.
Beta 25 má také vlastní radarovou ikonu pro rozšíření a jeho tlačítko v liště.
Nahraná obchodní ikona sama nedoplňuje ikonu do instalačního manifestu.
Store aktualizace vyžaduje samostatné nahrání a schválení nového ZIPu.
Kamery, radar a měsíční panel byly ověřeny z nainstalované bety 24
bez souběžného Tampermonkey. Zbývající aplikace ještě procházejí kontrolou.

1. Stáhněte ZIP a rozbalte jej do složky, kterou později nepřesunete ani nesmažete.
2. Otevřete `chrome://extensions` nebo `edge://extensions`.
3. Zapněte **Režim pro vývojáře** a zvolte **Načíst rozbalené**.
4. Vyberte rozbalenou složku, v níž přímo vidíte `manifest.json`.
5. Máte-li Tampermonkey variantu ČHMÚ Classic, vypněte ji pro web ČHMÚ.

Při aktualizaci nahraďte soubory v dosavadní složce rozšíření, na stránce
rozšíření klikněte na **Znovu načíst** a obnovte otevřené stránky ČHMÚ.
Nevytvářejte druhou současně aktivní kopii.

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
