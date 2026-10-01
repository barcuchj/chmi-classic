import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'chmi-check-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ['script', 'chrome-edge', 'tampermonkey']) mkdirSync(path.join(root, dir));
  writeFileSync(path.join(root, 'chrome-edge', 'manifest.json'), '{}');
  const output = path.join(root, 'tampermonkey', 'chmi-classic.user.js');
  writeFileSync(output, '// fixture\n');
  writeFileSync(path.join(root, 'script', 'build_userscript.mjs'), "import {writeFileSync,mkdirSync} from 'node:fs'; import {fileURLToPath} from 'node:url'; const d=fileURLToPath(new URL('../tampermonkey/',import.meta.url));mkdirSync(d,{recursive:true});writeFileSync(d+'chmi-classic.user.js','// fixture\\n');");
  writeFileSync(path.join(root, 'script', 'fixture.test.mjs'), "import test from 'node:test'; test('fixture',()=>{});");
  return { root, output, run: () => spawnSync(process.execPath, [fileURLToPath(new URL('./check.mjs', import.meta.url)), '--root', root], { encoding: 'utf8' }) };
}
test('common check builds, compares, runs tests and leaves original untouched', t => {
  const f = fixture(t), before = readFileSync(f.output, 'utf8'); const result = f.run();
  assert.equal(result.status, 0, result.stdout + result.stderr); assert.match(result.stdout, /matches sources: true/);
  assert.equal(readFileSync(f.output, 'utf8'), before);
});
test('stale generated userscript fails without overwriting it', t => {
  const f = fixture(t); writeFileSync(f.output, '// user changes\n'); const result = f.run();
  assert.equal(result.status, 1); assert.match(result.stdout, /matches sources: false/);
  assert.equal(readFileSync(f.output, 'utf8'), '// user changes\n');
});
test('a failing regression test fails common check', t => {
  const f = fixture(t); writeFileSync(path.join(f.root, 'script', 'fixture.test.mjs'), "import test from 'node:test';test('failure',()=>{throw Error('fixture error')});");
  assert.equal(f.run().status, 1);
});
test('bad root and invalid CLI fail clearly', () => {
  const command = fileURLToPath(new URL('./check.mjs', import.meta.url));
  assert.equal(spawnSync(process.execPath, [command, '--root', '/nonexistent-chmi-fixture']).status, 2);
  assert.equal(spawnSync(process.execPath, [command, '--unexpected']).status, 2);
});
