#!/usr/bin/env node
// Build in a disposable mirror; never overwrite the installed/generated userscript.
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function main(args = process.argv.slice(2)) {
  const usage = 'Usage: node script/check.mjs [--root PROJECT_DIR]';
  if (args.includes('--help') || args.includes('-h')) { process.stdout.write(usage + '\n'); return 0; }
  if (args.length && !(args.length === 2 && args[0] === '--root')) { process.stderr.write(usage + '\n'); return 2; }
  const root = resolve(args.length ? args[1] : dirname(dirname(fileURLToPath(import.meta.url))));
  const source = join(root, 'chrome-edge'), scripts = join(root, 'script');
  if (!existsSync(join(source, 'manifest.json')) || !existsSync(join(scripts, 'build_userscript.mjs'))) {
    process.stderr.write('Not a CHMI Classic source root\n'); return 2;
  }
  const scratch = mkdtempSync(join(os.tmpdir(), 'chmi-check-'));
  function run(label, commandArgs) {
    process.stdout.write(`\n${label}\n`);
    const env = { ...process.env };
    // A nested node --test must not inherit the parent's test-worker context.
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, commandArgs, { cwd: root, env, stdio: 'inherit', timeout: 120000 });
    if (result.error) process.stderr.write(result.error.message + '\n');
    return result.status === 0 && !result.error;
  }
  let ok = true;
  try {
    mkdirSync(join(scratch, 'script'));
    cpSync(source, join(scratch, 'chrome-edge'), { recursive: true });
    cpSync(join(scripts, 'build_userscript.mjs'), join(scratch, 'script', 'build_userscript.mjs'));
    if (!run('Userscript build (scratch only)', [join(scratch, 'script', 'build_userscript.mjs')])) return 1;
    const generatedPath = join(scratch, 'tampermonkey', 'chmi-classic.user.js');
    const generated = readFileSync(generatedPath);
    const currentPath = join(root, 'tampermonkey', 'chmi-classic.user.js');
    const same = existsSync(currentPath) && generated.equals(readFileSync(currentPath));
    process.stdout.write(`Userscript matches sources: ${same}; SHA-256 ${createHash('sha256').update(generated).digest('hex')}\n`);
    ok = same;
    const syntax = [generatedPath, ...readdirSync(source).filter(name => name.endsWith('.js')).map(name => join(source, name)),
      ...readdirSync(scripts).filter(name => name.endsWith('.mjs')).map(name => join(scripts, name))];
    for (const file of syntax) if (!run(`Syntax: ${file}`, ['--check', file])) ok = false;
    const tests = readdirSync(scripts).filter(name => name.endsWith('.test.mjs')).sort().map(name => join(scripts, name));
    if (!tests.length) { process.stderr.write('No tests found\n'); ok = false; }
    else if (!run('All Node regression tests', ['--test', ...tests])) ok = false;
    return ok ? 0 : 1;
  } catch (error) { process.stderr.write(error.message + '\n'); return 2; }
  finally { rmSync(scratch, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main();
