# Ověření beta 25 — pylový semafor

Ověřeno 3. 10. 2026 v odděleném profilu Chrome for Testing, instalovaným
ČHMÚ Classic `0.7.0-beta.25`, bez Tampermonkey a bez jiných doplňků.
Browser plugin nebyl dostupný; použito řízené skutečné Chromium přes Playwright.
Následující výsledky nejsou tvrzením o instalačním testu Tampermonkey či Safari.

## Ověřený průchod

1. Otevřít [pylový semafor](https://www.chmi.cz/predpoved-pocasi/rizika/pylovy-semafor)
   samostatně: živá mapa, datum a tři termíny se vykreslí v kompaktním rámu.
2. Klávesnicí na původní časové ose přejít 0 → 1 a 1 → 2; URL i označení
   mapy se mění na 4. a 5. 10. Původní komponenta/data zůstávají zachována.
3. Otevřít a zavřít nativní **Legendu**: všech pět stupňů míry ohrožení
   je čitelných uvnitř mapy. Nejde o nově vypočtené zdravotní doporučení.
4. Z úvodu `#classic=radar` kliknout na původní položku **Pylový semafor**:
   centrální mapa ohlásí „Oficiální živá aplikace ČHMÚ“, osa reaguje 0 → 1,
   samostatný odkaz vede na správnou oficiální URL.
5. **Zvětšit panel**, potom Escape: mapa zůstává, nabídky se vrátí.
6. **Nový vzhled** vrátí původní web; zapnutí klasického rozhraní v nabídce
   doplňku a nové načtení opět aktivuje adaptér.
7. Přímé načtení pylové mapy v 390 × 844 px používá nativní konfiguraci
   `rizika.pyl?client=mobile`. Před opravou se adaptér neuplatnil;
   po doplnění přesné mobilní URL se vykreslil klasický rám a osa 0 → 1
   i legenda fungovaly. Všechny tři datumové popisky jsou uvnitř osy
   při mobilním i širokém zobrazení. Finální test je z instalovaných souborů,
   ne z dočasně vloženého CSS.
8. Regrese sdíleného adaptéru na **Aktivitě klíšťat**: nativní osa 0 → 1,
   legenda všech pěti stupňů a přímé mobilní načtení při 390 × 844 px prošly.
   Konfigurace `rizika.klistata?client=mobile`, wrapper ARIA false, dokument
   390/390 × 844/844 px. Nejde o úplný audit klíšťat v centrálním panelu.

## Ikona rozšíření

Po normálním **Reload** doplňku na `chrome://extensions/` a obnovení stránky
se v kartě beta 25 zobrazila původní radarová ikona ze Store podkladů.
Původní obrázek 128 × 128 je identický s položkou místního Store ZIPu;
16/32/48 px jsou jeho zmenšeniny. Manifest uvádí ikony i `action.default_icon`,
rozměry PNG a seznam balíčku pokrývají regresní testy. Store beta 21 tím
nebyla aktualizována; samostatné nahrání/schválení ve Store dosud neproběhlo.
Připnutí tlačítka v uživatelově běžném profilu nebylo tímto testem měněno.

## Rozměry a omezení

- Samostatně i centrálně: dokument 1280/1280 × 800/800 a
  390/390 × 844/844 px (client/scroll), bez posouvání celé stránky.
- Samostatná mapa 1272 × 690 px; v úzkém okně 382 × 752 px.
  Nativní mapu lze posouvat a přibližovat; nejde o rastrový obrázek natažený
  bez zachování poměru stran. Dlouhý rozcestník v mobilním portálu má vlastní
  posouvání, aby mapa nezmizela.
- Nativní časová osa měla vnitřní výšku 84 px. Pouhé zmenšení rodiče
  ořezávalo data; nyní jsou upraveny i vnitřní prvky.
- Původní web ponechává mapovému wrapperu `aria-hidden=true` a
  `aria-disabled=true`, i když skutečný slider už není disabled. Reprodukováno
  také po vypnutí Classicu. Adaptér upravuje jen ARIA stav po ověření živé
  mapy, vybrané pylové vrstvy a povolené třídenní osy. Zakázané nativní
  ovladače se nepovolují násilně. Legendu bylo následně možné normálně otevřít.
- Konzole při úvodním radaru zaznamenala `radar-main.js:458` — čtení `src`
  z undefined. Původ bez rozšíření u této konkrétní radarové chyby nebyl
  porovnán; není označena za prokazatelně nesouvisející. Samostatný pylový
  průchod po opravě nevyvolal novou JS chybu. Starší varování o ARIA focusu
  a nativní viewport varování jsou odlišena od úspěšného vizuálního výsledku.
- Žádná viditelná chybová obrazovka ani prázdná mapa v dokončeném průchodu.

## Předloha a data

Archivní rozcestník odkazuje na
[mapy.php?type=pyly](https://web.archive.org/web/20260825190443/https://info.chmi.cz/bio/mapy.php?type=pyly).
Tělo tohoto historického pylového vieweru není získané; rám proto navazuje
na známý styl intranetu, nikoli na tvrzenou přesnou kopii nedochované stránky.
Živý prohlížeč načetl konfiguraci `api/map/init/rizika.pyl` a datový produkt
`api/data/rizika/pyl/202610030600` z `data-provider.chmi.cz` (HTTP 200).
Datum je pouze pozorovaný příklad; adaptér žádnou datovou URL ani datum
nevytváří, nesnaží se nahradit backend a nepřebírá archivní předpověď.

Zbývá skutečná instalace stejného userscriptu v Tampermonkey, Edge/Safari,
úplný audit alternativních vrstev/animace, čtečka obrazovky a další datové stavy.
Shoda balíčků a jednotkové testy toto nenahrazují.

## Deterministická kontrola

`node script/check.mjs`: 152/152 regresních testů, syntaxe JavaScriptu,
manifest a přesná shoda generovaného userscriptu se společnými zdroji.
`git diff --check` bez chyb. Balíček vytvořen pouze přes
`./script/package_release.sh --chrome-only`; obsahuje 51 souborů včetně
čtyř PNG ikon (52 ZIP položek včetně adresáře).

- Chrome ZIP SHA-256: `fbe54ce1da9a5cdad939389ddd516eeebfb62c1c806bae568d89d12315b92752`.
- Userscript SHA-256: `645b4dc56ed59ab5e96b72eb7935cd227488dc1afa1eb5d0eacfb16e9d12065d`.
