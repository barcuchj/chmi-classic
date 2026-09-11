# ToDo

## Rozpracováno

- [ ] Ručně potvrdit dynamické rozložení verze 0.4.1 na šesti referenčních stránkách a alespoň ve dvou desktopových rozměrech okna; zvlášť ověřit, že nikde nevznikl zbytečný horizontální scrollbar.
- [ ] Ručně ověřit, že `Dle okna` na produktovém radaru a případné zrcadlené režimy na homepage radaru nepřekrývají nativní zoom a stále aktivují původní vstupy ČHMÚ.
- [ ] Ručně potvrdit načtení rozbaleného doplňku v Edge a povolení přístupu
  k webům ČHMÚ v Safari.
- [ ] Ručně potvrdit stránku `pravdepodobnost-rustu-hub` v Safari a Tampermonkey
  proti živé interaktivní mapě v běžném prohlížeči.
- [ ] Ručně potvrdit homepage radar na `https://www.chmi.cz/` ve všech třech variantách
  proti živému DOM portálu, zejména časovou osu, vrstvy a responzivní resize.

## Plánováno

- [ ] Připravit publikační balíčky a metadata pro katalogy prohlížečů a katalog userscriptů.
- [ ] Ověřit vzhled polárních družic proti archivnímu snímku AVHRR, až bude daný záznam Internet Archive znovu dostupný.
- [ ] Doplnit případné další polární produkty pouze podle ověřených aktuálních stránek ČHMÚ.

## Dokončeno

- [x] Verze 0.4.1: společné dynamické fit-to-window rozložení pro radar, homepage radar, Meteosat, polární a geostacionární družice a pravděpodobnost růstu hub.
- [x] Verze 0.4.1: odstranění překryvu radarového přepínače s nativními mapovými ovladači pomocí dynamického odsazení.
- [x] Klasický režim radaru včetně přepínače `Dle okna / Zoom 4x / Zoom 8x / Web Maps`.
- [x] Společný zdroj rozšíření pro Chrome/Edge a Safari.
- [x] Klasický režim animovaného prohlížeče Meteosat s produktovou maticí, přehráváním, aktualizací a zachovanými živými daty.
- [x] Klasický rám a výběr produktů pro současné stránky polárních a geostacionárních družic.
- [x] Samostatný Tampermonkey userscript generovaný ze stejného JS/CSS s ovládáním přímo na stránce.
- [x] Radar přes celé okno, výchozí `Web Maps` a zastavení na nejnovějším snímku ve verzi 0.3.0.
- [x] Načtení skutečného rozbaleného rozšíření v Chromium a ověření radaru i družic na živých stránkách ČHMÚ.
- [x] Sestavení a spuštění hostitelské Safari aplikace včetně zabalených zdrojů rozšíření.
- [x] Veřejný GitHub repozitář a vydání 0.3.0 s balíčky pro Chrome/Edge, Safari a Tampermonkey.
- [x] Verze 0.4.0: klasický rám stránky pravděpodobnosti růstu hub při zachování originální živé mapy a jejích funkcí.
- [x] Verze 0.4.0: společná URL podpora pro Chrome/Edge, Safari a generovaný Tampermonkey userscript.
- [x] Verze 0.4.0: společná kompaktní navigace mezi všemi podporovanými old-look stránkami.
- [x] Verze 0.4.0: izolovaný old-look rám pro radarovou sekci na úvodní stránce `www.chmi.cz/`.
