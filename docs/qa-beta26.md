# Ověření 0.7.26 — VODA a OVZDUŠÍ

3. 10. 2026, izolovaný Chrome for Testing s opravdu instalovaným rozšířením,
bez Tampermonkey. Browser plugin není dostupný; živé stránky a jejich
ovládání testovány přes Playwright. Nejprve regresní test reprodukoval
nechtěné sloupcové rozložení, poté byla oprava ověřena z instalovaných souborů.

## Změna a průchod

- Nativní styl řadil obsah vlastní hlavičky pod sebe. Explicitní řádkové
  rozložení zmenšilo centrální hlavičku z 88,99 na 26 px; canvas obou map
  následně měřil 1244 × 582 px při portálu 1280 × 800.
- Při 1557 × 985 px měl nativní levý panel legendy část mimo mapu.
  Oprava přidala 57 px vodorovného odsazení; výsledné hranice 9–231 px
  zůstávají v mapě 5–1528 px. Mobilní legenda je také svisle přesunuta
  nad spodní lištu (v rámci mapy), takže její tlačítko lze opět zavřít.
  Dlouhá legenda zachovává vlastní nativní posouvání bez posouvání mapy.
  Syntetický test záporného odsazení -400 px navíc ověřil korekci, není
  vydáván za samostatnou reprodukci původního stavu uživatelovy bety 25.
- Přímé `#classic=water` a `#classic=air` nyní vybere odpovídající záložku,
  skryje meteorologický rozcestník a zachová správný název panelu.
  Změna záložky aktualizuje hash; návrat na Počasí pamatuje předchozí aplikaci.
  Pět DOM regresních testů pokrývá přímý vstup a změny historie.
- Mapový adaptér čeká na vlastní oficiální konfiguraci
  `hydrologie.povrchove-vody` / `ovzdusi.kvalita` (také `?client=mobile`),
  skutečný canvas a povolenou časovou osu. Zablokovaný ovladač, chybějící
  canvas nebo nesprávná konfigurace nejsou označeny jako připravená mapa.
- Wrapper nativní mapy ponechával ARIA hidden/disabled i po povolení osy.
  Po ověření připravenosti adaptér mění pouze wrapper, ne skutečně zakázané
  ovladače. Vypnutí obnovuje původní atributy i celé nativní rozhraní.
- Obě mapy: nativní osa změnila URL, otevření/zavření legendy, přiblížení
  a oddálení fungovalo. OVZDUŠÍ: volba „PM10 – hodinový průměr“ přepnula
  nativní vrstvu a URL uvnitř otevřeného centrálního panelu.
- VODA: „Nový vzhled“ odstranil pouze úpravu, mapu ponechal; opětovné
  zapnutí přes skutečný popup doplňku a načtení klasický rám obnovilo.
- Zvětšení panelu a Escape s fokusem na rodičovském tlačítku zachovaly
  tentýž iframe a vrátily nabídku. Escape uvnitř iframe nebyl tímto testem ověřen.

## Rozměry — client/scroll dokumentu

| Kontext | Dokument | Mapa |
| --- | --- | --- |
| Samostatně, obě aplikace | 1280/1280 × 800/800 | 1260 × 754 |
| Samostatně, obě aplikace | 390/390 × 844/844 | 380 × 780 |
| Centrálně, obě aplikace, mobil | iframe 368/368 × 644/644 | 358 × 608 |
| Zvětšený centrální panel, mobil | iframe 388/388 × 774/774 | 378 × 738 |

Bez posouvání celé stránky a bez duplicitní moderní hlavičky/patičky.
Mobilní nativní ovládání a legenda jsou uvnitř mapy; mapu lze posouvat.
Při přepnutí/zoomu se data mohou krátce znovu načítat — screenshot okamžitě
po přepnutí není sám důkazem chybějících dat. Finální VODA i OVZDUŠÍ mají
vizuálně ověřené mapové podklady a měřicí značky.

## Konzole a zbývající práce

V dokončených průchodech nebyla nová JS chyba ani chybová obrazovka.
Nativní mapový komponent hlásil Canvas2D performance varování, AbortError
při přepínání a v některých navigacích viewport/ARIA varování. Nejsou to
tvrzení o bezchybnosti backendu nebo ověření čtečkou obrazovky.

Přímé načtení/reload alternativní URL `pm10-hodinovy-prumer` a všech dalších
vrstev ještě vyžaduje zmapování a pokrytí manifestem/registry. Oba odkazy
„Tabulka dat“ mají správný oficiální cíl, ale tabulky samy nejsou převlečené
do klasického stylu ani v tomto kroku detailně auditované.
Tampermonkey, Edge/Safari, úplná animace, datové výpadky a další původní
položky rozcestníků zůstávají nedokončené. Průchod není úplná rekonstrukce
historického hydro/air vieweru.

`node script/check.mjs`: 166/166 regresních testů, syntaxe, manifest a
přesná shoda generovaného userscriptu se společnými zdroji. `git diff --check`
bez chyb. Release sestavován jen přes `./script/package_release.sh --chrome-only`.
