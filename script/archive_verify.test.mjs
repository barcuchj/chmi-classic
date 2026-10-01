import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { verifyRecord } from './archive_verify.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function fixture(t, content, mime, edits = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'archive-verify-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bytes = Buffer.from(content);
  await writeFile(path.join(root, 'item'), bytes);
  const record = { url: 'https://example.invalid/', capture_url: 'https://archive.invalid/', path: 'item', mime,
    bytes: bytes.length, sha256: digest(bytes), representation: 'WARC response', ...edits };
  return { root, bytes, record };
}

test('accepts valid archived HTML, JavaScript, CSS and JSON; JS is compiled, not executed', async t => {
  for (const [mime, source] of [
    ['text/html', '<!doctype html><html><head><title>Page</title></head><body><main>Archived</main></body></html>'],
    ['application/javascript', 'globalThis.__archiveVerifierMustNotRun = true; const value = 2;'],
    ['text/css', 'body { color: #123; }'],
    ['application/json', '{"ok":true}'],
  ]) {
    const f = await fixture(t, source, mime);
    const checked = verifyRecord(f.record, { root: f.root });
    assert.equal(checked.verification.ok, true, checked.verification.reason);
    assert.equal(checked.verification.actual_bytes, f.bytes.length);
    assert.equal(checked.verification.actual_sha256, digest(f.bytes));
    assert.equal(checked.representation, 'WARC response');
  }
  assert.equal(globalThis.__archiveVerifierMustNotRun, undefined);
});

test('rejects HTML disguised as JavaScript, CSS, or JSON', async t => {
  for (const mime of ['application/javascript', 'text/css', 'application/json']) {
    const f = await fixture(t, '<!doctype html><html><body>wrong content</body></html>', mime);
    assert.match(verifyRecord(f.record, { root: f.root }).verification.reason, /HTML content/);
  }
});

test('rejects offline/login pages and generic Wayback error wrappers as HTML', async t => {
  for (const html of [
    '<!doctype html><html><body><h1>Offline</h1></body></html>',
    '<!doctype html><html><body><h1>Sign in</h1></body></html>',
    '<!doctype html><html><head><title>Wayback Machine</title></head><body><h1>Page cannot be displayed</h1></body></html>',
  ]) {
    const f = await fixture(t, html, 'text/html');
    assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false);
  }
});

test('accepts a real archived HTML page containing archive wrapper scripts', async t => {
  const f = await fixture(t, '<!doctype html><html><head><title>Wayback Machine - Old page</title></head><body><script>/* toolbar */</script><main>Actual archived content</main></body></html>', 'text/html');
  assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, true);
});

test('accepts complete historical HTML without a doctype', async t => {
  const f = await fixture(t, '<html><head><title>Old capture</title></head><body><main>Archived content</main></body></html>', 'text/html');
  assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, true);
});

test('accepts a balanced rendered DOM fragment only with explicit representation metadata', async t => {
  const f = await fixture(t, '<div class="cCR">forecast</div>', 'text/html', { representation: 'rendered-dom' });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true, checked.verification.reason);
  assert.equal(checked.verification.kind, 'html-rendered-fragment');
});

test('accepts rendered fragment followed by inline script without executing it', async t => {
  const f = await fixture(t, '<div id="iWeather-links">links</div><script>throw new Error("must not execute")</script>', 'text/html', { representation: 'rendered-dom' });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true, checked.verification.reason);
  assert.equal(checked.verification.kind, 'html-rendered-fragment');
  assert.equal(globalThis.__archiveVerifierMustNotRun, undefined);
});

test('nested real DOM containers and trailing inline controls remain valid', async t => {
  const f = await fixture(t, '<div class="cCR"><div><table><tr><td>Map</td></tr></table></div></div><br/><br><script>throw Error("never run")</script><!-- footer -->', 'text/html', { representation: 'rendered-dom' });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true, checked.verification.reason);
  assert.equal(checked.verification.kind, 'html-rendered-fragment');
});

test('misnested rendered containers are not accepted', async t => {
  const f = await fixture(t, '<div><section>text</div></section></div>', 'text/html', { representation: 'rendered-dom' });
  assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false);
});

test('complete rendered document is not mislabeled as a fragment', async t => {
  const f = await fixture(t, '<html><body><div>Map</div></body></html>', 'text/html', { representation: 'rendered-dom' });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true);
  assert.equal(checked.verification.kind, 'html-rendered-document');
});

test('rejects the same HTML fragment as replay response and rejects plaintext rendered DOM', async t => {
  const fragment = await fixture(t, '<div class="cOther-days">forecast</div>', 'text/html', { representation: 'replay-response' });
  assert.equal(verifyRecord(fragment.record, { root: fragment.root }).verification.ok, false);
  const plaintext = await fixture(t, 'weather links unavailable', 'text/html', { representation: 'rendered-dom' });
  assert.equal(verifyRecord(plaintext.record, { root: plaintext.root }).verification.ok, false);
});

test('rendered fragment still rejects an offline wrapper heading', async t => {
  const f = await fixture(t, '<div><h1>Offline</h1></div>', 'text/html', { representation: 'rendered-dom' });
  assert.equal(verifyRecord(f.record, { root: f.root }).verification.reason, 'Archive/error/login wrapper is not archived page content');
});

test('accepts an explicitly declared replay HTML fragment with recorded HTTP 200', async t => {
  const f = await fixture(t, '<div class="cCR"><div>forecast</div></div>', 'text/html',
    { representation: 'replay-response', html_shape: 'fragment', http_status: 200 });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true, checked.verification.reason);
  assert.equal(checked.verification.kind, 'html-archived-fragment');
});

test('accepts replay fragment after a recognized Wayback toolbar without executing scripts', async t => {
  const html = '<script>__wm.wombat("source"); throw Error("never execute")</script>'
    + '<link rel="stylesheet" href="toolbar.css"><div id="wm-ipp-base"><div>Toolbar</div></div>'
    + '<!-- END WAYBACK TOOLBAR INSERT --><div class="cOther-days"><div>Forecast</div></div>'
    + '<br/><script>globalThis.__archiveVerifierMustNotRun = true;</script><!-- footer -->';
  const f = await fixture(t, html, 'text/html',
    { representation: 'replay-response', html_shape: 'fragment', http_status: 200 });
  const checked = verifyRecord(f.record, { root: f.root });
  assert.equal(checked.verification.ok, true, checked.verification.reason);
  assert.equal(checked.verification.kind, 'html-archived-fragment');
  assert.equal(globalThis.__archiveVerifierMustNotRun, undefined);
  assert.equal(checked.verification.actual_sha256, digest(f.bytes));
});

test('replay fragment requires explicit shape, response representation and recorded success', async t => {
  const f = await fixture(t, '<div>Forecast</div>', 'text/html',
    { representation: 'replay-response', html_shape: 'fragment', http_status: 200 });
  for (const edits of [{ html_shape: undefined }, { http_status: undefined }, { http_status: 404 },
    { representation: 'replay-cache-body' }, { representation: 'rendered-dom' }]) {
    assert.equal(verifyRecord({ ...f.record, ...edits }, { root: f.root }).verification.ok, false,
      JSON.stringify(edits));
  }
});

test('declared replay fragment rejects errors, unbalanced markup, plaintext and full documents', async t => {
  for (const html of ['<div><h1>Offline</h1></div>', '<div><h1>Not found</h1></div>',
    '<div><section>Map</div></section></div>', 'unavailable', '<html><body><div>Map</div></body></html>']) {
    const f = await fixture(t, html, 'text/html',
      { representation: 'replay-response', html_shape: 'fragment', http_status: 200 });
    assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false, html);
  }
});

test('archive toolbar alone or an unrecognized toolbar prefix cannot pass as a replay fragment', async t => {
  for (const html of [
    '<script>__wm.wombat("source")</script><div id="wm-ipp-base">Toolbar</div><!-- END WAYBACK TOOLBAR INSERT -->',
    '<div id="wm-ipp-base"><div>Toolbar only without closing marker</div></div>',
    'garbage <!-- END WAYBACK TOOLBAR INSERT --><div>Map</div>',
  ]) {
    const f = await fixture(t, html, 'text/html',
      { representation: 'replay-response', html_shape: 'fragment', http_status: 200 });
    assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false);
  }
});

test('reports expected size and hash mismatches', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  assert.match(verifyRecord({ ...f.record, sha256: '0'.repeat(64) }, { root: f.root }).verification.reason, /SHA-256/);
  assert.match(verifyRecord({ ...f.record, bytes: f.record.bytes + 1 }, { root: f.root }).verification.reason, /Byte count/);
});

test('requires expected positive byte count and SHA-256', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  for (const change of [{ bytes: undefined }, { sha256: undefined }, { bytes: 0 }, { sha256: 'bad' }])
    assert.match(verifyRecord({ ...f.record, ...change }, { root: f.root }).verification.reason, /required/);
});

test('rejects traversal and symlink escape', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  assert.match(verifyRecord({ ...f.record, path: '../outside' }, { root: f.root }).verification.reason, /escape/);
  const outside = f.root + '-outside.json';
  await writeFile(outside, '{"ok":true}', { flag: 'wx' });
  t.after(() => rm(outside, { force: true }));
  await symlink(outside, path.join(f.root, 'link'));
  assert.equal(verifyRecord({ ...f.record, path: 'link' }, { root: f.root }).verification.ok, false);
});

test('rejects empty file, malformed JSON and malformed JavaScript', async t => {
  for (const [mime, source] of [['application/json', ''], ['application/json', '{bad'], ['application/javascript', 'function (']]) {
    const f = await fixture(t, source, mime);
    assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false);
  }
});

test('rejects missing files, unsupported MIME, non-document HTML and implausible CSS', async t => {
  const f = await fixture(t, 'plain text', 'text/html');
  assert.equal(verifyRecord(f.record, { root: f.root }).verification.ok, false);
  assert.equal(verifyRecord({ ...f.record, mime: 'image/png' }, { root: f.root }).verification.ok, false);
  assert.equal(verifyRecord({ ...f.record, path: 'absent' }, { root: f.root }).verification.ok, false);
  const css = await fixture(t, 'not a declaration', 'text/css');
  assert.equal(verifyRecord(css.record, { root: css.root }).verification.ok, false);
});

test('rejects record exceeding configured limit', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  assert.equal(verifyRecord(f.record, { root: f.root, maxBytes: 2 }).verification.ok, false);
});

test('CLI succeeds and writes a JSON report', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  const manifest = path.join(f.root, 'manifest.json');
  const output = path.join(f.root, 'report.json');
  await writeFile(manifest, JSON.stringify({ version: 1, records: [f.record] }));
  const run = spawnSync(process.execPath, [new URL('./archive_verify.mjs', import.meta.url).pathname,
    '--manifest', manifest, '--root', f.root, '--output', output], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const report = JSON.parse(await (await import('node:fs/promises')).readFile(output, 'utf8'));
  assert.equal(report.ok, true);
  assert.equal(report.records[0].verification.ok, true);
});

test('CLI returns exit 1 for invalid record content', async t => {
  const f = await fixture(t, '{bad', 'application/json');
  const manifest = path.join(f.root, 'manifest.json');
  await writeFile(manifest, JSON.stringify({ version: 1, records: [f.record] }));
  const run = spawnSync(process.execPath, [new URL('./archive_verify.mjs', import.meta.url).pathname,
    '--manifest', manifest, '--root', f.root], { encoding: 'utf8' });
  assert.equal(run.status, 1, run.stderr);
  assert.equal(JSON.parse(run.stdout).records[0].verification.ok, false);
});

test('CLI returns exit 2 when report output already exists', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  const manifest = path.join(f.root, 'manifest.json');
  const output = path.join(f.root, 'report.json');
  await writeFile(manifest, JSON.stringify({ version: 1, records: [f.record] }));
  await writeFile(output, 'keep me');
  const run = spawnSync(process.execPath, [new URL('./archive_verify.mjs', import.meta.url).pathname,
    '--manifest', manifest, '--root', f.root, '--output', output], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Cannot write report/);
});

test('CLI returns exit 2 when output collides with input manifest', async t => {
  const f = await fixture(t, '{"ok":true}', 'application/json');
  const manifest = path.join(f.root, 'manifest.json');
  await writeFile(manifest, JSON.stringify({ version: 1, records: [f.record] }));
  const run = spawnSync(process.execPath, [new URL('./archive_verify.mjs', import.meta.url).pathname,
    '--manifest', manifest, '--root', f.root, '--output', manifest], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /must not overwrite/);
});
