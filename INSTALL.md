# Jak nainstalovat ČHMÚ Classic

ČHMÚ Classic vrací na současné stránky radaru, družicových snímků a vybraných
map ČHMÚ kompaktní klasický vzhled. Data stále přicházejí přímo z ČHMÚ.

## Kterou možnost zvolit?

Pro běžné používání doporučujeme **Tampermonkey**. Funguje v Chrome, Edge,
Firefoxu a dalších prohlížečích, kde je Tampermonkey dostupný, a instalace trvá
jen několik kliknutí.

Pokud nechcete Tampermonkey, můžete v Chrome nebo Edge načíst rozšíření ručně.
Tato varianta vyžaduje zapnutý **Režim pro vývojáře**, ale nevyžaduje účet ani
publikaci v katalogu rozšíření.

Safari na macOS má samostatnou variantu, která se spouští jako lokální Xcode
aplikace. Pro běžného uživatele je jednodušší použít Tampermonkey nebo Chrome/
Edge.

## Doporučená instalace: Tampermonkey

Tato varianta funguje v Chrome, Edge, Firefoxu a dalších prohlížečích, pro které
je dostupný správce userscriptů Tampermonkey.

1. Nainstalujte [Tampermonkey pro svůj prohlížeč](https://www.tampermonkey.net/).
2. Otevřete [instalaci ČHMÚ Classic](https://raw.githubusercontent.com/barcuchj/chmi-classic/main/tampermonkey/chmi-classic.user.js).
3. Tampermonkey zobrazí instalační stránku. Klikněte na **Install / Nainstalovat**.
4. Vraťte se na stránku ČHMÚ a případně ji jednou obnovte.
5. Otevřete například [radar](https://produkty.chmi.cz/radar/), [radar na úvodní stránce ČHMÚ](https://www.chmi.cz/#chmi-classic-home-radar), [družicové snímky za 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24) nebo [pravděpodobnost růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub).

Poznáte to podle bílého pracovního rámu, titulku **ČHMÚ Radar** nebo společné
lišty **Radar / Radar ČHMÚ / Meteosat / Polární / Geo / Houby**.

Tlačítko **Nový vzhled** klasický režim na aktuální stránce vypne. Zpět jej
zapnete plovoucím tlačítkem **Klasický vzhled** nebo z nabídky Tampermonkey.

## Chrome a Edge bez Tampermonkey

1. Stáhněte [balíček pro Chrome a Edge](https://github.com/barcuchj/chmi-classic/releases/latest/download/chmi-classic-chrome-edge-0.4.1.zip).
2. ZIP rozbalte do složky, kterou později nepřesunete ani nesmažete.
3. Otevřete `chrome://extensions` nebo `edge://extensions`.
4. Zapněte **Režim pro vývojáře**.
5. Klikněte na **Načíst rozbalené**.
6. Vyberte rozbalenou složku, ve které přímo vidíte soubor `manifest.json`.

Pokud prohlížeč hlásí, že manifest nenalezl, vybrali jste o úroveň vyšší
složku. Otevřete rozbalený ZIP a vyberte složku s `manifest.json`.

Klasický režim lze zapnout a vypnout přes ikonu rozšíření. Po nové verzi je
potřeba stáhnout nový ZIP, rozbalit jej do nové složky a v `chrome://extensions`
nebo `edge://extensions` načíst novou složku. Starou složku můžete ponechat,
dokud se přesvědčíte, že nová verze funguje.

## Safari na macOS

Bez účtu Apple Developer nelze nabídnout běžně podepsanou instalaci jedním
kliknutím. GitHub proto obsahuje zdrojový Xcode projekt pro lokální použití:

1. Stáhněte [Safari zdrojový balíček](https://github.com/barcuchj/chmi-classic/releases/latest/download/chmi-classic-safari-source-0.4.1.zip) a rozbalte jej.
2. Otevřete `safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj` v Xcode.
3. Vyberte schéma `CHMURadarClassicSafari` a spusťte aplikaci na svém Macu.
4. V Safari otevřete **Nastavení → Rozšíření** a povolte ČHMÚ Classic.
5. V oprávněních rozšíření povolte přístup k `produkty.chmi.cz` a `www.chmi.cz`.
6. Pokud Safari lokální nepodepsané rozšíření odmítne, zapněte v nabídce
   **Vývojář** volbu **Povolit nepodepsaná rozšíření**. Safari může toto povolení
   po ukončení vyžadovat znovu.

## Podporované stránky

- [Radar a srážky](https://produkty.chmi.cz/radar/)
- [Radar na úvodní stránce ČHMÚ](https://www.chmi.cz/#chmi-classic-home-radar)
- [Animovaný prohlížeč Meteosat – 24 hodin](https://produkty.chmi.cz/druzice/?time_range=24)
- [Polární družice](https://www.chmi.cz/namerena-data/polarni-druzice/true-color)
- [Geostacionární družice](https://www.chmi.cz/namerena-data/geostacionarni-druzice/true-color)
- [Pravděpodobnost růstu hub](https://www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub)

V klasickém headeru je na všech podporovaných stránkách stejná kompaktní navigace:
**Radar / Radar ČHMÚ / Meteosat / Polární / Geo / Houby**. Odkaz aktuální aplikace
ponechává její současnou URL, takže se při kliknutí na aktivní položku neztratí query
parametry nebo právě zvolený družicový produkt.

Na úvodní stránce ČHMÚ rozšíření neobaluje celý portál. Detekuje pouze sekci
**Srážky podle radaru**, přidá jí klasický rám a ponechá uvnitř originální radar,
časovou osu, vrstvy a jejich event handlery.

Na stránce pravděpodobnosti růstu hub se mění pouze okolní rám a rozložení.
Původní mapa, vrstvy, legenda, ovládací prvky, navigace a data ČHMÚ zůstávají
součástí originální živé mapové komponenty.

## Když se nic nezobrazí

- U družic nejprve zvolte časový rozsah **24 h**; v kratším intervalu nemusí být
  žádný snímek.
- Obnovte stránku.
- V Chrome/Edge otevřete stránku rozšíření a ověřte, že je ČHMÚ Classic zapnutý.
- V Tampermonkey otevřete **Installed userscripts** a ověřte, že je ČHMÚ Classic
  zapnutý.
- V Safari zkontrolujte oprávnění rozšíření zvlášť pro `www.chmi.cz`.
- Pokud se zobrazuje nový vzhled, klikněte na ikonu rozšíření a povolte přístup
  pro aktuální web.
- Pokud ČHMÚ změní strukturu stránky, založte [Issue](https://github.com/barcuchj/chmi-classic/issues)
  a přiložte adresu stránky a snímek obrazovky.

## Družicové snímky

U animovaného prohlížeče družic nejprve zvolte **24 h**. Při kratším intervalu
nemusí server vrátit žádné snímky a ovládací prvky pak mohou vypadat prázdně.
