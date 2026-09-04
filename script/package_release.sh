#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="0.3.0"
DIST_ROOT="$PROJECT_ROOT/dist"
CHROMIUM_STAGE="$DIST_ROOT/chmi-classic-chrome-edge-$VERSION"
SAFARI_STAGE="$DIST_ROOT/chmi-classic-safari-source-$VERSION"

rm -rf "$CHROMIUM_STAGE" "$SAFARI_STAGE"
mkdir -p "$CHROMIUM_STAGE" "$SAFARI_STAGE"

for file in manifest.json content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$PROJECT_ROOT/chrome-edge/$file" "$CHROMIUM_STAGE/$file"
done

cp -R "$PROJECT_ROOT/safari/CHMURadarClassicSafari" "$SAFARI_STAGE/safari"
mkdir -p "$SAFARI_STAGE/chrome-edge" "$SAFARI_STAGE/script"
for file in manifest.json content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$PROJECT_ROOT/chrome-edge/$file" "$SAFARI_STAGE/chrome-edge/$file"
done
cp "$PROJECT_ROOT/script/build_and_run.sh" "$SAFARI_STAGE/script/build_and_run.sh"
cp "$PROJECT_ROOT/README.md" "$PROJECT_ROOT/INSTALL.md" "$PROJECT_ROOT/LICENSE" "$SAFARI_STAGE/"

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
