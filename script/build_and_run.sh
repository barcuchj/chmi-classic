#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="CHMURadarClassicSafari"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROMIUM_ROOT="$PROJECT_ROOT/chrome-edge"
PROJECT="$PROJECT_ROOT/safari/CHMURadarClassicSafari/CHMURadarClassicSafari.xcodeproj"
SCHEME="CHMURadarClassicSafari"
CONFIGURATION="Debug"
DERIVED_DATA="$PROJECT_ROOT/.build/safari"
APP_BUNDLE="$DERIVED_DATA/Build/Products/$CONFIGURATION/$APP_NAME.app"
EXTENSION_RESOURCES="$PROJECT_ROOT/safari/CHMURadarClassicSafari/CHMURadarClassicSafari Extension/Resources"

usage() {
  echo "usage: $0 [run|--debug|--logs|--telemetry|--verify]" >&2
}

case "$MODE" in
  run|--debug|debug|--logs|logs|--telemetry|telemetry|--verify|verify)
    ;;
  *)
    usage
    exit 2
    ;;
esac

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

for file in manifest.json navigation.js navigation.css content.js classic.css satellite.js satellite.css popup.html popup.css popup.js; do
  cp "$CHROMIUM_ROOT/$file" "$EXTENSION_RESOURCES/$file"
done

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$DERIVED_DATA" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  build

open_app() {
  /usr/bin/open -n "$APP_BUNDLE"
}

case "$MODE" in
  run)
    open_app
    ;;
  --debug|debug)
    lldb -- "$APP_BUNDLE/Contents/MacOS/$APP_NAME"
    ;;
  --logs|logs)
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$APP_NAME\""
    ;;
  --telemetry|telemetry)
    open_app
    /usr/bin/log stream --info --style compact --predicate "subsystem == \"local.chmi-radar-classic.CHMURadarClassicSafari\""
    ;;
  --verify|verify)
    open_app
    sleep 2
    pgrep -x "$APP_NAME" >/dev/null
    ;;
esac
