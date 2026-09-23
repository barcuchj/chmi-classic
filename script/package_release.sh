#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROMIUM_FILES=(manifest.json portal-registry.js embedded.js portal.js portal.css embedded.css
  aladin.js aladin.css webcams.js webcams.css navigation.js navigation.css
  catalog.js catalog.css legacy.js legacy.css content.js classic.css
  satellite.js satellite.css popup.html popup.css popup.js)

if [[ "${1:-}" == "--chrome-only" ]]; then
  VERSION="0.7.0-beta.4"
  DIST_ROOT="$PROJECT_ROOT/dist"
  CHROMIUM_STAGE="$DIST_ROOT/chmi-classic-chrome-edge-$VERSION"
  node --test "$PROJECT_ROOT/script/manifest.test.mjs"
  node "$PROJECT_ROOT/script/build_userscript.mjs"
  rm -rf "$CHROMIUM_STAGE"
  rm -f "$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip"
  mkdir -p "$CHROMIUM_STAGE"
  for file in "${CHROMIUM_FILES[@]}"; do
    cp "$PROJECT_ROOT/chrome-edge/$file" "$CHROMIUM_STAGE/$file"
  done
  (
    cd "$CHROMIUM_STAGE"
    zip -q -r "$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip" .
  )
  echo "$DIST_ROOT/chmi-classic-chrome-edge-$VERSION.zip"
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
