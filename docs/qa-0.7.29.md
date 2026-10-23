# QA 0.7.29 – sdílení instalace a katalogová hlavička

Ověřeno 23. 10. 2026, instalované unpacked rozšíření v odděleném Chrome
profilu bez Tampermonkey. Runtime popupu potvrzuje 0.7.29.

## Historická data

Před opravou měl `#chmi-catalog-classic-brand` při 1280 × 800 px
výšku 550,39 px a `flex-direction: column`. Nativní styly přebíraly
rozložení i výšku společné lišty. Oprava v `catalog.css` jí určuje
vodorovný směr, začátek řádku, automatickou výšku a neexpandující flex.

Živý web po opravě:

- Přímé otevření historických dat: 1280 × 800, hlavička 38 px,
  nadpis y=61 a první karta y=145,6; první dvě řady dat viditelné bez scrollu.
- 390 × 844: hlavička se přirozeně zalomí do 92,52 px, první karta
  y=194,9 až 397,9. Žádný vodorovný přesah dokumentu.
- Kliknutí HISTORICKÁ DATA z portálu otevře samostatnou kartu se stejnou
  kompaktní hlavičkou a první kartou nad přehybem.
- Podstránka `/namerena-data/historicka-data/mapy-teploty-vzduchu`
  a `/letectvi`: stejná společná lišta je vodorovná a pod 100 px.
  Nejde o úplný audit všech katalogových aplikací.

## Sdílení

Pevná URL ověřená živou veřejnou stránkou Chrome Web Store s názvem
ČHMÚ Classic – meteorologické výstupy:
https://chromewebstore.google.com/detail/ogciancfjbeghkcjkhijmbaabpohccpp

- Portál 390 × 844 i 1280 × 800: otevření nabídky, kopírování přes nativní
  Clipboard API a následné přečtení přesné URL ze schránky testovacího
  prohlížeče. Žádný přesah nabídky; Escape ji zavře.
- Popup doplňku: skutečný klik a úspěšné dokončení Clipboard API,
  zpětná vazba a vizuálně zkontrolovaný screenshot.
- Pět regresních testů skutečné sdílecí funkce: veřejný payload,
  zrušení nativního dialogu bez dalšího zápisu, chybějící/odmítnuté sdílení,
  odmítnutá schránka a explicitní kopírování bez otevření systémového dialogu.
- Systémový dialog byl vyvolán v Chrome; doručení sociální síti nebo
  konkrétnímu příjemci se netestovalo. Dostupnost cílových služeb určuje OS.

## Sestavení a rozsah

`node script/build_userscript.mjs`, `node script/check.mjs`:
shoda generovaného userscriptu se zdroji, syntaxe, manifest a 191/191 testů.
`sharing.js` a `sharing.css` jsou společné pro popup, homepage a generovaný
userscript. Chrome nevyžaduje nové hosty ani clipboard oprávnění.
Aktualizovány README, TODO, CHANGELOG a PRIVACY.

Instalace Tampermonkey a Safari/Edge nebyly znovu ověřeny.
Oprava katalogu nenahrazuje datové aplikace; živý obsah ČHMÚ zůstává původní.
Starší místní rozpracované moduly nejsou součástí této verze.
