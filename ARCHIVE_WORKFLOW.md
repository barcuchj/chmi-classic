# Lokální archivní sběr a kontrola

Nástroje používají jen vestavěné moduly Node.js. Nestahují z internetu,
nepouštějí archivní JavaScript a nic nepublikují. Cizí zdroje patří do
ignorovaného `.build/`; jejich získání není souhlas s distribucí.

## Společná kontrola

Z kořene projektu spusť `node script/check.mjs`. Existujícím builderem
sestaví userscript v dočasné kopii zdrojů, porovná bajty s aktuálním
`tampermonkey/chmi-classic.user.js`, zkontroluje syntaxi vlastního JS
a spustí všechny `script/*.test.mjs`. Kopii odstraní i při chybě.
Userscript nepřepíše; nesoulad hlásí jako chybu. Po schválené změně
jej sestav `node script/build_userscript.mjs` a kontrolu zopakuj.
Nevytváří Chrome ZIP, nemění Safari ani GitHub.

Úspěch není důkaz vykreslení: UI změny ověř také v builtin browseru
(živá data, ovládání, dynamická velikost, ořez a scrollbary).

## Manifest skutečně získaných souborů

JSON verze 1 má pole `records`. Každý záznam obsahuje `url`, konkrétní
`capture_url`, `path` relativní k `--root`, `mime`, kladné `bytes`, očekávaný
`sha256` a `representation`. Bajty a hash přebírej z nezávisle ověřeného
downloadu/individuálního manifestu. URL/HTTP metadata nástroj přenáší,
neověřuje je síťovým dotazem. `replay-response` = export replay odpovědi;
`rendered-dom` = export DOM včetně explicitních fragmentů;
`replay-cache-body` = tělo resource cache. Nejsou to původní wire bytes ČHMÚ.
Aktuální příklady jsou v `.build/archive-reference-20260926/tooling/receipts.json`.

Některé původní endpointy vracely jen HTML fragment (např. úvodní mapa,
třídenní předpověď a rozcestník). U takového skutečně pozorovaného HTTP 200
zaznamenej `representation: "replay-response"`, `html_shape: "fragment"`
a `http_status: 200`. Verifier kontroluje vyvážené kontejnery fragmentu,
případně až za rozpoznanou Wayback lištou, a označí jej
`html-archived-fragment`, nikoli vykreslený DOM. Bez těchto explicitních
údajů fragment jako replay odpověď neprojde. HTTP status je evidovaná
metadatová informace, nikoli síťově ověřený výsledek tohoto nástroje.

```sh
node script/archive_verify.mjs --manifest .build/archive-reference-20260926/tooling/receipts.json --root .
node script/archive_queue.mjs --index .build/archive-reference-20260926/indexes/chmi-wayback-meteo-url-index-290-20260926.json --manifest .build/archive-reference-20260926/tooling/receipts.json --root .
```

Verifier kontroluje velikost, SHA-256, bezpečnou cestu a základní typ obsahu.
Odmítá symlinky, únik mimo root, soubory nad 32 MiB, HTML chyby místo CSS/JS,
neplatný JSON a syntakticky neplatný klasický JS. JS pouze kompiluje, nikdy
nevykonává. Není to úplný HTML/CSS parser ani ověření funkčnosti aplikace.

Fronta čte uložené viditelné řádky indexu (`rows[].cells`, `href`), ne pouhé
odkazy. Přeskakuje jen ověřenou `replay-response` přesně stejné původní URL
a MIME. Jiný capture uvádí jako `local_capture_url` a netvrdí, že ověřila
indexovaný snapshot. DOM export/cache zůstávají ve frontě replay zdrojů.
Query varianty seskupuje, ale nepokládá za shodně stažené. Kalendář `*`
nenahrazuje vymyšleným timestampem. Neplatné řádky odděluje v
`invalid_index_rows`; původní inventář neupravuje.

`--include-assets` přidá CSS/JSON; `--include-vendor` známé knihovny.
Bez něj jsou označeny `vendor-reference`. Neznámé bundly se nevyřazují
odhadem. Fronta není seznam hotových aplikací ani všech Wayback zachycení.

`--output FILE` musí být nový soubor; existující výstup se nepřepíše.
Bez něj píší JSON na stdout. Exit 0 = platný report (fronta může být
neprázdná), 1 = neplatné receipts/řádky, 2 = chybný vstup/CLI/zápis.

## Používaný postup

1. Z fronty vyber zdroj; u kalendáře vyber snapshot ručně.
2. Získej jej viditelným downloadem v builtin browseru. Respektuj blokace;
   skripty nejsou cestou k obcházení `ERR_BLOCKED_BY_CLIENT`.
3. Ověř nový stabilní soubor, typ, bajty a hash. Zaznamenej capture, metodu,
   známý HTTP status a licenci v individuálním manifestu.
4. Doplň strojový manifest a spusť verifier/frontu znovu. Chybová těla
   zachovej odděleně, nejsou zdrojem ČHMÚ.
5. Implementaci ověř `check.mjs`, UI také živým browser testem.
   Aktualizuj TODO; download není dokončená rekonstrukce.
