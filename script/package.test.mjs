import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "chrome-edge/manifest.json"), "utf8"));
const packageSource = readFileSync(join(root, "script/package_release.sh"), "utf8");

test("Chrome package includes every asset referenced by the manifest", () => {
  const declaration = /CHROMIUM_FILES=\(([\s\S]*?)\)/.exec(packageSource);
  assert.ok(declaration, "CHROMIUM_FILES declaration is missing");
  const files = declaration[1].trim().split(/\s+/);
  assert.equal(new Set(files).size, files.length, "package contains duplicate entries");
  const referenced = new Set(["manifest.json", "popup.html"]);
  for (const file of Object.values(manifest.icons ?? {})) referenced.add(file);
  for (const file of Object.values(manifest.action.default_icon ?? {})) referenced.add(file);
  for (const rule of manifest.content_scripts) {
    for (const file of [...(rule.js ?? []), ...(rule.css ?? [])]) referenced.add(file);
  }
  for (const file of referenced) assert.ok(files.includes(file), `${file} is missing from Chrome package`);
});

test("Chrome package creates directories for nested icon assets", () => {
  assert.match(packageSource, /mkdir -p "\$\(dirname "\$CHROMIUM_STAGE\/package\/\$file"\)"/);
});
