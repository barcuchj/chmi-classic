import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildQueue } from './archive_queue.mjs';

const base = 'https://intranet.chmi.cz/files/portal/docs/meteo/';
const row = (suffix, mime = 'text/html', calendar = false) => ({ cells: [base + suffix, mime], href: 'https://web.archive.org/web/20260210150546' + (calendar ? '*' : '') + '/' + base + suffix });
function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'chmi-queue-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const body = '<html><body><h1>ALADIN</h1></body></html>';
  writeFileSync(path.join(root, 'ala.html'), body);
  const record = { url: base + 'ov/ala.html', capture_url: row('ov/ala.html').href, path: 'ala.html', mime: 'text/html', bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'), representation: 'replay-response' };
  return { root, record, manifest: { version: 1, records: [record] } };
}
test('only an exact verified replay source skips collection', t => {
  const f = fixture(t); const result = buildQueue({ rows: [row('ov/ala.html'), row('sat/msg.html')] }, f.manifest, f);
  assert.equal(result.counts.verified_source, 1); assert.equal(result.counts.pending, 1);
});
test('bad checksum remains queued and invalid receipt reported', t => {
  const f = fixture(t); f.record.sha256 = '0'.repeat(64);
  const result = buildQueue({ rows: [row('ov/ala.html')] }, f.manifest, f);
  assert.equal(result.entries[0].status, 'pending'); assert.equal(result.counts.invalid_receipts, 1);
});
test('query presets share display group, not downloaded status', t => {
  const f = fixture(t); const result = buildQueue({ rows: [row('ov/ala.html'), row('ov/ala.html?id=2')] }, f.manifest, f);
  assert.equal(result.groups.length, 1); assert.equal(result.entries[1].status, 'pending');
});
test('rendered DOM is not the downloaded replay source', t => {
  const f = fixture(t); f.record.representation = 'rendered-dom';
  const result = buildQueue({ rows: [row('ov/ala.html')] }, f.manifest, f);
  assert.equal(result.counts.pending, 1); assert.match(result.entries[0].reason, /Rendered DOM/);
});
test('vendor exclusion explicit, include flag queues it', t => {
  const f = fixture(t); const index = { rows: [row('js/jquery-1.7.1.min.js', 'application/javascript')] };
  assert.equal(buildQueue(index, f.manifest, f).entries[0].status, 'vendor-reference');
  assert.equal(buildQueue(index, f.manifest, { ...f, includeVendor: true }).entries[0].status, 'pending');
});
test('CSS and JSON optional; images never queued', t => {
  const f = fixture(t); const index = { rows: [row('a.css', 'text/css'), row('b.json', 'application/json'), row('c.png', 'image/png')] };
  assert.equal(buildQueue(index, f.manifest, f).entries.length, 0);
  assert.equal(buildQueue(index, f.manifest, { ...f, includeAssets: true }).entries.length, 2);
});
test('calendar does not invent a replay timestamp', t => {
  const f = fixture(t); const result = buildQueue({ rows: [row('ov/ala.html', 'text/html', true)] }, f.manifest, f);
  assert.equal(result.entries[0].selection, 'calendar'); assert.match(result.entries[0].capture_url, /46\*\//);
});
test('same exact URL deduplicated, output order deterministic', t => {
  const f = fixture(t); const result = buildQueue({ rows: [row('z.html'), row('a.html'), row('z.html')] }, f.manifest, f);
  assert.equal(result.counts.duplicate_rows, 1); assert.equal(result.entries[0].url, base + 'a.html');
});
test('invalid inventory and wrong playback association fail closed', t => {
  const f = fixture(t);
  assert.throws(() => buildQueue({}, f.manifest, f), /rows/);
  assert.throws(() => buildQueue({ rows: [ { cells: [] } ] }, f.manifest, f));
  const wrong = row('a.html'); wrong.href = row('b.html').href;
  const result = buildQueue({ rows: [wrong] }, f.manifest, f);
  assert.equal(result.counts.invalid_index_rows, 1); assert.equal(result.entries.length, 0);
  assert.throws(() => buildQueue({ rows: [] }, { records: [] }, f), /version/);
});
test('receipt needs exact matching original/capture association', t => {
  const f = fixture(t); f.record.capture_url = row('wrong.html').href;
  const result = buildQueue({ rows: [row('ov/ala.html')] }, f.manifest, f);
  assert.equal(result.entries[0].status, 'pending'); assert.equal(result.counts.invalid_receipts, 1);
});
test('other capture useful but not claimed to verify indexed snapshot', t => {
  const f = fixture(t); f.record.capture_url = f.record.capture_url.replace('20260210150546', '20250101010101');
  const result = buildQueue({ rows: [row('ov/ala.html')] }, f.manifest, f);
  assert.equal(result.entries[0].status, 'verified-source'); assert.equal(result.entries[0].indexed_capture_verified, false);
});
test('MIME mismatch does not skip a source', t => {
  const f = fixture(t);
  assert.equal(buildQueue({ rows: [row('ov/ala.html', 'application/javascript')] }, f.manifest, f).counts.pending, 1);
});
test('CLI writes fresh output and refuses overwrite', t => {
  const f = fixture(t); const index = path.join(f.root, 'index.json'), manifest = path.join(f.root, 'manifest.json'), output = path.join(f.root, 'queue.json');
  writeFileSync(index, JSON.stringify({ rows: [row('ov/ala.html')] })); writeFileSync(manifest, JSON.stringify(f.manifest));
  const args = [fileURLToPath(new URL('./archive_queue.mjs', import.meta.url)), '--index', index, '--manifest', manifest, '--root', f.root, '--output', output];
  assert.equal(spawnSync(process.execPath, args).status, 0); const before = readFileSync(output, 'utf8');
  assert.equal(spawnSync(process.execPath, args).status, 2); assert.equal(readFileSync(output, 'utf8'), before);
});
