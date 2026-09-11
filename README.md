# ČHMÚ Classic – radar, družice a mapy

Rozšíření a Tampermonkey userscript pro Chrome, Edge a Safari. Na současných
stránkách ČHMÚ vrací kompaktní vzhled inspirovaný původními prohlížeči radaru,
družicových snímků a jednoduchými klasickými mapovými stránkami.

**Chcete jej pouze používat? Pokračujte návodem [Jak nainstalovat ČHMÚ Classic](INSTALL.md).**

Rozšíření nekopíruje meteorologická data ani starý web. Používá současné aplikace a jejich živá data; pouze upravuje rozložení a přidává ovladače napojené na skutečné prvky aplikací ČHMÚ. U stránky pravděpodobnosti růstu hub zůstává původní živá mapa, její vrstvy, legenda, ovladače, navigace i datové zdroje beze změny.

## Co vrací

- výrazný přepínač `Dle okna / Zoom 4x / Zoom 8x / Web Maps`,
- výchozí radar v režimu `Web Maps`, zastavený na nejnovějším snímku,
- radarovou mapu pružně využívající celé dostupné okno bez překryvu klasického přepínače s nativními mapovými ovladači,
- kompaktní mapu a ovládací panel vedle sebe,
- světle modré pozadí a jednoduché bílé pracovní okno,
- přepnutí mezi klasickým a současným vzhledem přes ikonu rozšíření,
- zachování původních funkcí, událostí a živých dat ČHMÚ,
- společnou kompaktní navigaci mezi radarem, radarem na úvodní stránce, Meteosatem, polárními a geostacionárními družicemi a mapou růstu hub,
- od verze 0.4.1 společné dynamické „fit-to-window“ rozložení: mapy, boční panely a přehrávač využívají dostupnou šířku a výšku viewportu a interním mapám se po změně velikosti posílá resize událost.

Pro družicová data navíc vrací:

- produktovou matici `EU / CE / CZ` podle starého prohlížeče MSG,
- kompaktní ovládání prvního, předchozího, následujícího a posledního snímku, přehrávání, rychlosti a aktualizace,
- zachované volby MTG/MSG, časového rozsahu, mapových vrstev a navigačního kříže,
- klasický rám a přímou volbu produktů na současných stránkách polárních a geostacionárních družic.

Pro radar na [úvodní stránce ČHMÚ](https://www.chmi.cz/#chmi-classic-home-radar) od verze 0.4.0 přidává:

- old-look rám pouze kolem homepage radarové sekce, nikoli kolem celé úvodní stránky,
- vlastní kompaktní header se společnou navigací ČHMÚ Classic,
- zachování původního radaru/embedu, časové osy, vrstev a původních událostí bez kopírování dat,
- bezpečnou detekci podle nadpisu `Srážky podle radaru` a radarových prvků uvnitř stejné sekce,
- od verze 0.4.1 dynamickou geometrii stejného typu jako produktový radar; pokud homepage obsahuje stejné nativní režimy `Dle okna / Zoom 4x / Zoom 8x / Web Maps`, zobrazí se nad mapou jejich klasické zrcadlené ovládání.

Pro [Pravděpodobnost růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub) od verze 0.4.0 přidává:

- stejný kompaktní klasický rám a horní lištu jako u ostatních podporovaných stránek,
- odstranění nadbytečné portálové navigace z pracovního pohledu,
- pružné využití celé šířky stránky a od verze 0.4.1 mapový prostor dopočítaný podle zbývající výšky viewportu,
- zachování původní živé mapové komponenty ČHMÚ včetně vrstev, legendy, ovladačů, navigace a dat.

## Rychlá instalace přes Tampermonkey

1. Nainstalujte Tampermonkey.
2. Otevřete [userscript ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. Potvrďte instalaci a otevřete některou z podporovaných stránek.

Userscript používá stejné JS/CSS jako rozšíření. Liší se jen instalací a tím,
že klasický režim lze znovu zapnout plovoucím tlačítkem nebo z nabídky
Tampermonkey.

## Instalace v Chrome nebo Edge bez Tampermonkey

1. Otevřete `chrome://extensions` nebo `edge://extensions`.
2. Zapněte **Režim pro vývojáře**.
3. Zvolte **Načíst rozbalené**.
4. Vyberte tuto složku `chrome-edge`.
5. Otevřete některou z podporovaných stránek:

   - [Radar a srážky](https://produkty.chmi.cz/radar/)
   - [Radar na úvodní stránce ČHMÚ](https://www.chmi.cz/#chmi-classic-home-radar)
   - [Animovaný prohlížeč Meteosat – 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24)
   - [Polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color)
   - [Geostacionární družice](https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color)
   - [Pravděpodobnost růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub)

ZIP balíček je přiložen u [nejnovějšího vydání](https://github.com/barcuchj/chmi-classic/releases/latest).

Kliknutím na ikonu rozšíření lze klasický vzhled kdykoli vypnout nebo znovu zapnout. V klasické horní liště je navíc tlačítko **Nový vzhled** pro rychlý návrat k současnému rozhraní.

## Safari na macOS

Safari používá samostatný macOS/Xcode wrapper v
`safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj`. Soubory v
`chrome-edge/` (`manifest.json`, `navigation.js`, `navigation.css`, `content.js`,
`classic.css`, `satellite.js`, `satellite.css` a `popup.*`) zůstávají zdrojem pravdy; build skript je před
sestavením synchronizuje do Safari targetu.

Pro sestavení a spuštění lokální verze:

```sh
cd ..
./script/build_and_run.sh
```

Po prvním spuštění otevřete Safari → **Nastavení → Rozšíření** a povolte
**ČHMÚ Classic – radar, družice a mapy**. Pro ověření, že se wrapper spustil, lze použít:

```sh
cd ..
./script/build_and_run.sh --verify
```

Lokální build je určený k vývoji a testování. Distribuce mimo vlastní Mac
vyžaduje podepsání aplikace podle pravidel Apple.

Při změnách neupravujte ručně kopii v
`safari/CHMURadarClassicSafari/CHMURadarClassicSafari Extension/Resources`,
protože ji další build znovu synchronizuje ze souborů v `chrome-edge/`.

## Soukromí a oprávnění

Rozšíření běží pouze na níže uvedených cestách. Ukládá jedinou synchronizovanou hodnotu určující, zda je klasický vzhled zapnutý. Nemá telemetrii a neodesílá data.

- `https://produkty.chmi.cz/radar/*`
- `https://www.chmi.cz/` (pouze vložená radarová sekce na homepage)
- `https://produkty.chmi.cz/druzice/*`
- `https://www.chmi.cz/namerena-data/polarni-druzice/*`
- `https://www.chmi.cz/namerena-data/geostacionarni-druzice/*`
- `https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub*`

## Technické omezení

Kompatibilita je navázaná na aktuální identifikátory ovládání ČHMÚ. Pokud ČHMÚ zásadně změní HTML stránky, může být potřeba selektory aktualizovat. Rozšíření neobchází přístupová omezení ani neobnovuje vypnutý server `intranet.chmi.cz`.

Starý MSG prohlížeč nabízel také produkty `WV` a `Night-M`. Současný animovaný prohlížeč je pro MSG nenabízí, proto je rozšíření nevytváří jako nefunkční volby. U polárních družic zůstávají vnitřní mapové ovladače současné komponenty ČHMÚ; klasický režim upravuje rám stránky a výběr produktů. Totéž platí pro pravděpodobnost růstu hub: rozšíření upravuje pouze rám a rozložení stránky, nikoli mapový backend nebo data.

## Ověřený uživatelský průchod

`produkty.chmi.cz/radar/` → klasický přepínač nad mapou → volba `Zoom 4x` nebo `Web Maps` → originální aplikace ČHMÚ změní režim mapy.

`www.chmi.cz/#chmi-classic-home-radar` → old-look se aplikuje pouze na sekci „Srážky podle radaru“ → původní radarová komponenta a její ovládání zůstávají uvnitř sekce.

`produkty.chmi.cz/druzice/?time_range=24` → produktová matice → volba produktu a projekce → originální aplikace načte živé snímky → klasický přehrávač ovládá skutečnou časovou osu.

`www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub` → klasický rám stránky → původní živá mapová komponenta zůstává na místě a její vlastní vrstvy, legenda a ovládání nejsou nahrazovány.

Podklady a původ jsou popsány v [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Vývoj a balíčky

Zdroj pravdy je `chrome-edge/`. Tampermonkey soubor se obnoví příkazem
`node script/build_userscript.mjs`. Safari wrapper se synchronizuje a ověří
příkazem `./script/build_and_run.sh --verify`. Všechny tři soubory pro GitHub
Release vytvoří `./script/package_release.sh`; skript před balením vždy znovu
vygeneruje Tampermonkey userscript ze společných zdrojů.

Projekt je dostupný pod [MIT licencí](LICENSE). ČHMÚ ani EUMETSAT nejsou autory
tohoto rozšíření; jejich živá data a stránky rozšíření pouze zobrazuje.

Přehled změn jednotlivých verzí je v [CHANGELOG.md](CHANGELOG.md).
