# ČHMÚ Classic – radar a družice

Rozšíření a Tampermonkey userscript pro Chrome, Edge a Safari. Na současných
stránkách ČHMÚ vrací kompaktní vzhled inspirovaný původními prohlížeči radaru a
družicových snímků.

**Chcete jej pouze používat? Pokračujte návodem [Jak nainstalovat ČHMÚ Classic](INSTALL.md).**

Rozšíření nekopíruje meteorologická data ani starý web. Používá současné aplikace a jejich živá data; pouze upravuje rozložení a přidává ovladače napojené na skutečné prvky aplikací ČHMÚ.

## Co vrací

- výrazný přepínač `Dle okna / Zoom 4x / Zoom 8x / Web Maps`,
- výchozí radar v režimu `Web Maps`, zastavený na nejnovějším snímku,
- radarovou mapu pružně využívající celé dostupné okno,
- kompaktní mapu a ovládací panel vedle sebe,
- světle modré pozadí a jednoduché bílé pracovní okno,
- přepnutí mezi klasickým a současným vzhledem přes ikonu rozšíření,
- zachování původních funkcí, událostí a živých dat ČHMÚ.

Pro družicová data navíc vrací:

- produktovou matici `EU / CE / CZ` podle starého prohlížeče MSG,
- kompaktní ovládání prvního, předchozího, následujícího a posledního snímku, přehrávání, rychlosti a aktualizace,
- zachované volby MTG/MSG, časového rozsahu, mapových vrstev a navigačního kříže,
- klasický rám a přímou volbu produktů na současných stránkách polárních a geostacionárních družic.

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
   - [Animovaný prohlížeč Meteosat – 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24)
   - [Polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color)

ZIP balíček je přiložen u [nejnovějšího vydání](https://github.com/barcuchj/chmi-classic/releases/latest).

Kliknutím na ikonu rozšíření lze klasický vzhled kdykoli vypnout nebo znovu zapnout. V klasické horní liště je navíc tlačítko **Nový vzhled** pro rychlý návrat k současnému rozhraní.

## Safari na macOS

Safari používá samostatný macOS/Xcode wrapper v
`safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj`. Soubory v
`chrome-edge/` (`manifest.json`, `content.js`, `classic.css` a `popup.*`)
zůstávají zdrojem pravdy; build skript je před sestavením synchronizuje do
Safari targetu.

Pro sestavení a spuštění lokální verze:

```sh
cd ..
./script/build_and_run.sh
```

Po prvním spuštění otevřete Safari → **Nastavení → Rozšíření** a povolte
**ČHMÚ Classic – radar a družice**. Pro ověření, že se wrapper spustil, lze použít:

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
- `https://produkty.chmi.cz/druzice/*`
- `https://www.chmi.cz/namerena-data/polarni-druzice/*`
- `https://www.chmi.cz/namerena-data/geostacionarni-druzice/*`

## Technické omezení

Kompatibilita je navázaná na aktuální identifikátory ovládání ČHMÚ. Pokud ČHMÚ zásadně změní HTML stránky, může být potřeba selektory aktualizovat. Rozšíření neobchází přístupová omezení ani neobnovuje vypnutý server `intranet.chmi.cz`.

Starý MSG prohlížeč nabízel také produkty `WV` a `Night-M`. Současný animovaný prohlížeč je pro MSG nenabízí, proto je rozšíření nevytváří jako nefunkční volby. U polárních družic zůstávají vnitřní mapové ovladače současné komponenty ČHMÚ; klasický režim upravuje rám stránky a výběr produktů.

## Ověřený uživatelský průchod

`produkty.chmi.cz/radar/` → klasický přepínač nad mapou → volba `Zoom 4x` nebo `Web Maps` → originální aplikace ČHMÚ změní režim mapy.

`produkty.chmi.cz/druzice/?time_range=24` → produktová matice → volba produktu a projekce → originální aplikace načte živé snímky → klasický přehrávač ovládá skutečnou časovou osu.

Podklady a původ jsou popsány v [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Vývoj a balíčky

Zdroj pravdy je `chrome-edge/`. Tampermonkey soubor se obnoví příkazem
`node script/build_userscript.mjs`. Safari wrapper se synchronizuje a ověří
příkazem `./script/build_and_run.sh --verify`. Všechny tři soubory pro GitHub
Release vytvoří `./script/package_release.sh`.

Projekt je dostupný pod [MIT licencí](LICENSE). ČHMÚ ani EUMETSAT nejsou autory
tohoto rozšíření; jejich živá data a stránky rozšíření pouze zobrazuje.

Přehled změn jednotlivých verzí je v [CHANGELOG.md](CHANGELOG.md).
