#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROMIUM_FILES=(manifest.json portal-registry.js embedded.js portal.js portal.css embedded.css
  aladin.js aladin.css webcams.js webcams.css meteogram.js meteogram.css forecast.js forecast.css rainfall.js rainfall.css synoptic.js synoptic.css sonde.js sonde.css klementinum.js klementinum.css stations.js stations.css ticks.js ticks.css bio.js bio.css week.js week.css monthly.js monthly.css regions.js regions.css navigation.js navigation.css
  catalog.js catalog.css legacy.js legacy.css content.js classic.css
  satellite.js satellite.css popup.html popup.css popup.js
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png)

if [[ "${1:-}" == "--chrome-only" ]]; then
  VERSION="$(node -p "require('$PROJECT_ROOT/chrome-edge/manifest.json').version")"
  if [[ ! "$VERSION" =~ ^(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*)){0,3}$ ]]; then
    echo "Unsupported Chrome numeric version: $VERSION" >&2
    exit 2
  fi
  if ! node -e 'const parts = process.argv[1].split(".").map(Number); process.exit(parts.some(n => n > 65535) || parts.every(n => n === 0) ? 1 : 0)' "$VERSION"; then
    echo "Chrome version components must be 0..65535 and not all zero: $VERSION" >&2
    exit 2
  fi
  DIST_ROOT="$PROJECT_ROOT/dist"
  ARCHIVE="$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip"
  mkdir -p "$DIST_ROOT"
  if [[ -e "$ARCHIVE" ]]; then
    echo "Refusing to overwrite existing Chrome package: $ARCHIVE" >&2
    exit 2
  fi
  CHROMIUM_STAGE="$(mktemp -d "$DIST_ROOT/.chrome-stage.XXXXXXXX")"
  trap 'rm -r -- "$CHROMIUM_STAGE"' EXIT
  mkdir -p "$CHROMIUM_STAGE/package"
  for file in "${CHROMIUM_FILES[@]}"; do
    mkdir -p "$(dirname "$CHROMIUM_STAGE/package/$file")"
    cp "$PROJECT_ROOT/chrome-edge/$file" "$CHROMIUM_STAGE/package/$file"
  done
  (
    cd "$CHROMIUM_STAGE/package"
    zip -q -r "$CHROMIUM_STAGE/package.zip" . -x '*.DS_Store'
  )
  mv "$CHROMIUM_STAGE/package.zip" "$ARCHIVE"
  echo "$ARCHIVE"
  exit 0
fi

if [[ "${1:-}" != "" ]]; then
  echo "usage: $0 [--chrome-only]" >&2
  exit 2
fi
if [[ "$(node -p "require('$PROJECT_ROOT/chrome-edge/manifest.json').version")" != "0.6.0" ]]; then
  echo "Safari source package is not synchronized with the current Chromium beta; use --chrome-only." >&2
  exit 2
fi
VERSION="0.6.0"
DIST_ROOT="$PROJECT_ROOT/dist"
CHROMIUM_STAGE="$DIST_ROOT/chmi-classic-chrome-edge-$VERSION"
SAFARI_STAGE="$DIST_ROOT/chmi-classic-safari-source-$VERSION"
SAFARI_RESOURCES="$PROJECT_ROOT/safari/CHMURadarClassicSafari/CHMURadarClassicSafari Extension/Resources"

node "$PROJECT_ROOT/script/build_userscript.mjs"
for file in manifest.json navigation.js navigation.css catalog.js catalog.css legacy.js legacy.css content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$PROJECT_ROOT/chrome-edge/$file" "$SAFARI_RESOURCES/$file"
done

rm -rf "$CHROMIUM_STAGE" "$SAFARI_STAGE"
mkdir -p "$CHROMIUM_STAGE" "$SAFARI_STAGE"

for file in manifest.json navigation.js navigation.css catalog.js catalog.css legacy.js legacy.css content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$PROJECT_ROOT/chrome-edge/$file" "$CHROMIUM_STAGE/$file"
done

cp -R "$PROJECT_ROOT/safari/CHMURadarClassicSafari" "$SAFARI_STAGE/safari"
mkdir -p "$SAFARI_STAGE/chrome-edge" "$SAFARI_STAGE/script"
for file in manifest.json navigation.js navigation.css catalog.js catalog.css legacy.js legacy.css content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$PROJECT_ROOT/chrome-edge/$file" "$SAFARI_STAGE/chrome-edge/$file"
done
cp "$PROJECT_ROOT/script/build_and_run.sh" "$SAFARI_STAGE/script/build_and_run.sh"
cp "$PROJECT_ROOT/README.md" "$PROJECT_ROOT/INSTALL.md" "$PROJECT_ROOT/CHANGELOG.md" \
  "$PROJECT_ROOT/TODO.md" "$PROJECT_ROOT/THIRD_PARTY_NOTICES.md" \
  "$PROJECT_ROOT/ARCHIVE_RESEARCH.md" "$PROJECT_ROOT/LICENSE" "$SAFARI_STAGE/"

rm -f \
  "$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip" \
  "$DIST_ROOT/chmi-classic-safari-source-$VERSION.zip" \
  "$DIST_ROOT/chmi-classic-$VERSION.user.js"

(
  cd "$CHROMIUM_STAGE"
  zip -q -r "$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip" .
)
(
  cd "$SAFARI_STAGE"
  zip -q -r "$DIST_ROOT/chmi-classic-safari-source-$VERSION.zip" . \
    -x '*/xcuserdata/*' '*.xcuserstate' '*.DS_Store'
)
cp "$PROJECT_ROOT/tampermonkey/chmi-classic.user.js" \
  "$DIST_ROOT/chmi-classic-$VERSION.user.js"

echo "Release files:"
find "$DIST_ROOT" -maxdepth 1 -type f -print | sort
