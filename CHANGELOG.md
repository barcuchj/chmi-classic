# Přehled změn

## 0.4.0 – 2026-09-11

- Přidána společná kompaktní navigace v old-look headeru mezi produktovým radarem, radarem na úvodní stránce ČHMÚ, Meteosatem, polárními družicemi, geostacionárními družicemi a pravděpodobností růstu hub.
- Aktivní navigační položka zachovává aktuální URL aplikace, aby zůstaly zachovány query parametry nebo zvolený dataset/produkt, pokud jej stránka vyjadřuje URL.
- Přidán izolovaný old-look rám pro radarovou sekci `Srážky podle radaru` přímo na `https://www.chmi.cz/`; zbytek homepage se nestyluje.
- Homepage radar ponechává původní embed/mapu, časovou osu, vrstvy, datový backend a event handlery ČHMÚ.
- Přidány společné zdroje `navigation.js` a `navigation.css`; Safari synchronizace a release balení je kopírují stejně jako ostatní zdroje z `chrome-edge/`.
- Přidán klasický rám pro živou stránku `www.chmi.cz/namerena-data/pravdepodobnost-rustu-hub`.
- Zachována je originální živá mapová komponenta ČHMÚ včetně vrstev, legendy, ovladačů, navigace, dat a responzivního chování.
- Doplněn kompaktní horní pruh, pracovní rám a mapové rozložení ve stejném vizuálním stylu jako stávající klasické stránky.
- Rozšířena oprávnění a `match` pravidla Chrome/Edge, Safari a generovaného Tampermonkey userscriptu.
- Popup rozšíření obsahuje přímý odkaz na stránku pravděpodobnosti růstu hub.
- Release balení před vytvořením artefaktů nově vždy regeneruje Tampermonkey userscript ze společných zdrojů.
- Dokumentace a distribuční verze zvýšeny na 0.4.0.

## 0.3.0 – 2026-09-04

- Radar nově využívá celé dostupné okno a panel zůstává samostatně posuvný.
- Výchozí radarový režim je `Web Maps`.
- Po otevření se animace zastaví na nejnovějším dostupném snímku.
- Zachována je responzivní mobilní varianta.
- Opravena výška vnitřní mapy `Web Maps` na úzkém okně.
- Opravena viditelnost mapy a kompaktní horní lišta na polárních a geostacionárních stránkách.
- Součástí vydání jsou Chrome/Edge ZIP, Safari zdrojový balíček a samostatný
  Tampermonkey userscript.

## 0.2.0 – 2026-09-04

- Přidán klasický prohlížeč družicových snímků MSG/MTG.
- Přidán klasický rám a přepínání produktů polárních a geostacionárních družic.
- Přidána Safari varianta a společný build.
- Přidána Tampermonkey varianta generovaná ze stejného JavaScriptu a CSS.

## 0.1.0

- První klasická varianta radarové stránky s přepínačem
  `Dle okna / Zoom 4x / Zoom 8x / Web Maps`.
