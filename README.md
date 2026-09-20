# ČHMÚ Classic – meteorologické výstupy

## Beta 0.7.0-beta.1 – aplikace na jednom místě

**Testovací beta, nikoli dokončená obnova všech aplikací.** Nyní vyvíjíme především userscript
pro Tampermonkey. Nový portál zatím není zabalený v rozšířeních Chrome/Edge/Safari.
Userscript v `main` obsahuje tuto betu. Kdo chce vyzkoušet nové rozhraní,
otevře [instalační odkaz](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js)
a v Tampermonkey potvrdí aktualizaci. Nemějte současně aktivní starý userscript
i rozšíření ČHMÚ Classic, aby se jejich úpravy nepřekrývaly.

Na úvodní stránce ČHMÚ zůstává jen úzká nabídka **Počasí · Voda · Ovzduší**
a hlavní plocha pro vybranou aplikaci. Rozcestník pod mapou funguje takto:

- **Běžné kliknutí** zobrazí aplikaci uprostřed portálu.
- **Ctrl/⌘+klik nebo prostřední tlačítko** otevře samostatnou záložku na aktuální
  adrese ČHMÚ. S aktivním userscriptem se i tam použije klasický vzhled.
- **Zvětšit panel** dočasně schová okolní nabídky a rozcestník. **Zpět na portál**
  nebo klávesa Escape je vrátí bez nového načítání aplikace.
- **Otevřít samostatně** otevře právě vybranou aplikaci v nové záložce.
- Červený přeškrtnutý název není odkaz. Najetím myší zjistíte, proč daná
  aplikace ještě není obnovená.

Radar má stupnici ukotvenou uvnitř mapy. U Meteosatu se připravuje kompaktní
postranní ovládání s rozbalovacími podrobnostmi; mapa se při práci s ovladači
nemá ztrácet mimo okno. ALADIN přidává čtyři mapy a výraznější nápovědu
k posouvání času kolečkem myši.

**Co ještě není hotové:** úvodní mapa počasí s předpovědí, obsah záložek Voda
a Ovzduší a řada původních aplikací. Probíhá kontrola menších oken, samostatných
záložek a skutečné instalace do Tampermonkey. Vývojová kontrola ve vestavěném
prohlížeči používá dočasné vložení kódu; není náhradou instalačního testu.
Podrobnosti a zbývající práce jsou v [TODO.md](TODO.md).

### Jak beta vypadá

**Radar v portálu:** úzká horní nabídka, mapa a původní rozcestník pod ní.

![Radar v centrálním panelu ČHMÚ Classic](docs/screenshots/portal-radar.png)

**Meteosat po kliknutí na Zvětšit panel:** mapa má celou pracovní plochu,
podrobnější nastavení se rozbaluje vpravo. Tlačítko Zpět na portál vrátí nabídky.

![Meteosat ve zvětšeném panelu](docs/screenshots/meteosat-expanded.png)

Jde o skutečné snímky vývojové bety z 20. 9. 2026, nikoli grafické návrhy.
Zobrazené počasí je stav při pořízení snímků, ne aktuální předpověď.
[Zdroje snímků a rozsah ověření](docs/screenshots/README.md).

ČHMÚ Classic je rozšíření a Tampermonkey userscript pro Chrome, Edge a Safari.
Na současných stránkách ČHMÚ vrací kompaktní vzhled inspirovaný původním webem,
zachovává živé komponenty a datové backendy ČHMÚ a od verze **0.6.0** rozšiřuje
jednotný katalog současných i archivních meteorologických výstupů.

Rozšíření **nenahrazuje data ČHMÚ vlastními mapami ani hodnotami**. Kde současný
oficiální produkt existuje, otevírá se jeho živá stránka. Vypnuté historické
prohlížeče jsou označeny jako **Archiv** a vedou na Internet Archive. Přímé
PNG/JPG/PDF adresy se nevymýšlejí ani nehardcodují, pokud je zdrojová stránka
ČHMÚ neposkytuje stabilně.

## Co umí verze 0.6.0

### Původních šest old-look aplikací

Tyto stránky používají specializovaný layout a zachovávají své původní živé
ovládání:

- [Radar – produkt](https://produkty.chmi.cz/radar/)
- [Radar na úvodní stránce ČHMÚ](https://www.chmi.cz/#chmi-classic-home-radar)
- [Meteosat – animovaný prohlížeč](https://produkty.chmi.cz/druzice/?time_range=24)
- [Polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color)
- [Geostacionární družice](https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color)
- [Pravděpodobnost růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub)

Verze 0.4.1 zůstává základem: pracovní plocha se přizpůsobuje viewportu,
mapové komponenty dostávají resize notifikace a radar zachovává funkční
`Dle okna / Zoom 4x / Zoom 8x / Web Maps` bez překrytí nativního zoomu.
Společná navigace se na užších oknech zalamuje místo vytváření vodorovného
scrollbaru.

### Jednotný katalog „Produkty“

Tlačítko **Produkty** je dostupné v klasickém headeru. Na dalších podporovaných
stránkách vytváří ČHMÚ Classic vlastní kompaktní header s rychlou navigací na
Radar / Radar ČHMÚ / Meteosat / Polární / Geo / Houby a s katalogem.

Katalog obsahuje:

| Skupina | Hlavní živé výstupy |
| --- | --- |
| ALADIN | předpovědní mapy, teplota, oblačnost, srážky, vítr |
| Meteogramy | obce, letiště, hory, vodní plochy, bod na mapě |
| Webkamery | celorepublikový přehled oficiálních kamer |
| Naměřená data | teplota, srážky, srážkoměry HPPS, stanice, tlak, vlhkost, vítr, radar/blesky, Open Data |
| Synoptika | synoptická situace, historie synoptických situací, evropské stanice |
| Letectví | METAR/SPECI, SIGMET, TAF, SWL, nízká oblačnost, výškový vítr, radiosondáže, aerologie/pseudosondáže, VIS-IR, radar/blesky, meteogramy |
| Historie | přechody front, Klementinum, mapy teploty a srážek, územní řady, zprávy a PDF, Open Data |
| Archiv | starý radar INCA, MSG, AVHRR a archivní index starého ALADINu |

Stav odkazů v katalogu je viditelně rozlišen:

- **Živě** – současný oficiální zdroj ČHMÚ;
- **Legacy** – doložený původní endpoint starého portálu; může být po odstavení serveru nedostupný;
- **Přímý soubor/adresář** – doložený původní PNG/JPG/datový endpoint; data se do projektu nekopírují;
- **Archiv** – odkaz na konkrétní snapshot nebo Wayback index, bez živých dat;
- **Nedostupné** – historicky doložený produkt bez bezpečně ověřeného samostatného vieweru/endpointu.

## Historické aplikace a Web Archive

Verze 0.6.0 přidává samostatnou vrstvu `legacy.js` + `legacy.css` pro původní
`intranet.chmi.cz` / `portal.chmi.cz` a doložené statické aplikace pod
`/files/portal/docs/meteo/`. Jde o **vlastní adaptaci**, nikoli kopii starých
CSS/JS nebo obrazových assetů. Pokud původní DOM/backend ještě odpovídá, zůstává
zachován a rozšíření pouze přidá kompaktní klasický header, odkazy na současnou
náhradu/Web Archive a responzivní geometrii.

Systematicky jsou evidovány mimo jiné: starý radar INCA i statický radar, MSG,
AVHRR, ALADIN animace/mapy/meteogramy, webkamery, CELDN blesky a PNG adresář,
VIS-IR JPG adresář, staniční mapy/tabulky/grafy, radar+srážkoměry, aktuální
mapy, ozon/UV, sondáže a vertikální profily, sněhové zpravodajství, výškové
analýzy, Klementinum, přechody front a staré letecké ALADIN/WMO výstupy.

Přesná evidence původních URL, ověřených Wayback timestampů, stavu a licenčního
rozhodnutí je v [ARCHIVE_RESEARCH.md](ARCHIVE_RESEARCH.md). Kde nebyl bezpečně
ověřen konkrétní viewer, položka je v katalogu označena jako `Nedostupné`;
ČHMÚ Classic v takovém případě nevytváří falešné ovládání ani data.

## ALADIN – čtyři klasické mapy

Na `https://produkty.chmi.cz/aladin/` přidává old-look header tlačítko
**4 mapy**. Tlačítko pouze pracuje s původními formulářovými prvky stránky
ČHMÚ a pokusí se zvolit:

1. Teplota ve 2 m
2. Oblačnost
3. Srážky za 3 h
4. Vítr v 10 m

Pokud stránka nabízí volbu rozložení se čtyřmi sloupci, nastaví ji také.
Volba se neprovádí automaticky při načtení stránky, takže se uživateli
nepřepisuje jeho vlastní aktuální výběr. Časové ovládání a samotné mapy
zůstávají nativními prvky ČHMÚ.

## Další old-look stránky

Pro další živé stránky z katalogu se nepřepisuje jejich aplikace. Rozšíření:

- odstraní pouze nadbytečný portálový rám tam, kde je to bezpečně rozpoznáno,
- rozšíří hlavní obsah na dostupnou šířku,
- omezí zbytečný horizontální overflow,
- zachová formuláře, tabulky, mapy, odkazy ke stažení a event handlery ČHMÚ,
- používá responzivní klasický header bez povinného horizontálního scrollování.

Podpora je záměrně řízena allowlistem cest. Ačkoli manifest potřebuje přístup k
`www.chmi.cz/*`, `catalog.js` mimo známé podporované cesty nic nestyluje.

## Živé, archivní a nehardcodované výstupy

### Živě

Ověřené současné rozcestníky zahrnují mimo jiné:

- `https://produkty.chmi.cz/aladin/`
- `https://www.chmi.cz/predpoved-pocasi/meteogramy-aladin/obce`
- `https://www.chmi.cz/namerena-data/webkamery`
- `https://www.chmi.cz/predpoved-pocasi/synopticka-situace`
- `https://www.chmi.cz/namerena-data`
- `https://www.chmi.cz/letectvi`
- `https://www.chmi.cz/namerena-data/historicka-data/klementinum`
- `https://opendata.chmi.cz/`

### Archiv a legacy

- radar INCA – konkrétní Wayback snapshot z 16. 8. 2026;
- MSG – konkrétní Wayback snapshot z 10. 2. 2026;
- AVHRR – konkrétní Wayback snapshot z 14. 6. 2026;
- ALADIN animace/mapy/meteogramy, webkamery a CELDN – doložené původní endpointy
  a Wayback indexy, pokud nebyl spolehlivě ověřen jeden konkrétní timestamp;
- staré portálové stránky stanic, synoptiky, ozonu, sněhu, historie a letectví
  jsou vedeny jako `Legacy` s odkazem na současnou náhradu, pokud je známa.

### PNG/JPG/PDF a export

ČHMÚ Classic dává přednost skutečným ovládacím prvkům zdrojové stránky a
oficiálním rozcestníkům Open Data. Nezavádí odhadnuté URL typu „poslední.png“.
Pokud ČHMÚ na konkrétní živé stránce poskytuje PDF, obrázek, XLS/CSV nebo jiné
stažení, zůstává tento odkaz zachován. Katalog obsahuje také samostatné odkazy
na Open Data a na zprávy/datové přehledy.

## Rychlá instalace přes Tampermonkey

1. Nainstalujte Tampermonkey.
2. Otevřete [userscript ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. Potvrďte instalaci.
4. Otevřete některou z podporovaných stránek nebo ALADIN a v headeru zvolte
   **Produkty**.

Userscript používá stejné JS/CSS zdroje jako rozšíření. Klasický režim lze
vypnout tlačítkem **Nový vzhled** a znovu zapnout z nabídky Tampermonkey nebo
plovoucím tlačítkem **Klasický vzhled**.

## Chrome / Edge

1. Otevřete `chrome://extensions` nebo `edge://extensions`.
2. Zapněte **Režim pro vývojáře**.
3. Zvolte **Načíst rozbalené**.
4. Vyberte složku `chrome-edge`.
5. Přes ikonu rozšíření lze otevřít katalog i hlavní aplikace.

Běžný distribuční ZIP vytváří `./script/package_release.sh`.

## Safari na macOS

Safari wrapper je v:

`./safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj`

Zdroj pravdy je vždy `chrome-edge/`. Soubory v Safari `Resources` se negenerují
ručně; synchronizují je projektové skripty.

Lokální build a ověření na macOS:

```sh
./script/build_and_run.sh --verify
```

Safari build vyžaduje Xcode. Distribuce mimo vlastní Mac vyžaduje odpovídající
Apple signing/notarization workflow.

## Soukromí a oprávnění

Rozšíření ukládá pouze synchronizovanou volbu, zda je klasické rozhraní
zapnuté. Nemá telemetrii a neposílá uživatelská data.

Host permissions ve verzi 0.6.0:

- `https://produkty.chmi.cz/radar/*`
- `https://produkty.chmi.cz/druzice/*`
- `https://produkty.chmi.cz/aladin/*`
- `https://www.chmi.cz/*`
- `https://hydro.chmi.cz/*`
- `https://intranet.chmi.cz/*` a `http://intranet.chmi.cz/*`
- `https://portal.chmi.cz/*` a `http://portal.chmi.cz/*`

Oprávnění pro staré domény slouží výhradně k lokálnímu old-look rámci a
propojení na současnou náhradu/Web Archive; nerozšiřují dostupnost vypnutého
serveru ani neobcházejí přístupová omezení.

Široký match na `www.chmi.cz/*` slouží pro jednotný katalog a allowlistované
živé produkty; mimo allowlist se stránka nemění.

## Technická omezení

- Struktura současného webu ČHMÚ se může změnit. Pak může být nutné aktualizovat
  selektory nebo allowlist cest.
- Preset **4 mapy** u ALADINu hledá skutečné popisky nativních ovládacích prvků.
  Pokud ČHMÚ jejich názvy nebo DOM změní, preset nic nevymýšlí a může vybrat jen
  část položek.
- Rozšíření neobchází přístupová omezení, cookies, autentizaci ani vypnutý
  `intranet.chmi.cz`.
- Internet Archive může mít jednotlivé historické soubory zachyceny neúplně.
- Přímé binární URL PNG/JPG/PDF nejsou garantovány tam, kde je ČHMÚ veřejně
  nevystavuje jako stabilní odkaz.

## Vývoj

Zdroj pravdy: `chrome-edge/`.

Tampermonkey:

```sh
node script/build_userscript.mjs
```

Safari sync/build na macOS:

```sh
./script/build_and_run.sh --verify
```

Release balíčky:

```sh
./script/package_release.sh
```

Podklady a původ odkazů jsou popsány v [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) a detailní archivní inventura v [ARCHIVE_RESEARCH.md](ARCHIVE_RESEARCH.md).
Přehled změn je v [CHANGELOG.md](CHANGELOG.md).
Projekt je licencován pod [MIT licencí](LICENSE).
