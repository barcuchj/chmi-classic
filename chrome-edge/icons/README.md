# Ikona ČHMÚ Classic

`icon-128.png` je původní neutrální radarová ikona projektu připravená
v Classic chatu pro Chrome Web Store. Zdroj: místně uložený balíček
`chrome-store/chmi-classic-chrome-web-store-assets.zip`, položka `icon-128.png`
(22. 9. 2026). Nejde o oficiální logo ČHMÚ. Původní 128px PNG je zachováno
beze změny; varianty 16/32/48 px jsou jeho zmenšeniny pro manifest a lištu.

Obnovení menších variant na macOS:

```sh
for size in 16 32 48; do
  sips -z "$size" "$size" chrome-edge/icons/icon-128.png \
    --out "chrome-edge/icons/icon-$size.png"
done
```

Instalační balíček obsahuje všechny čtyři PNG. Test manifestu kontroluje
jejich skutečné rozměry a shodné odkazy pro rozšíření i tlačítko v liště.
Nahrání ikony do položky Store samotný manifest rozšíření nenahrazuje.
