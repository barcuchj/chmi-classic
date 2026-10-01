#!/usr/bin/env node
// Offline queue from a visible Wayback URL inventory. Does not fetch resources.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyRecord } from './archive_verify.mjs';

const SOURCE_MIMES = new Set(['text/html', 'application/javascript', 'text/javascript']);
const EXTRA_MIMES = new Set(['text/css', 'application/json']);
const VENDOR = /\/(?:jquery(?:[.-]|\/)|jquery-ui|leaflet(?:[.-]|\/)|bootstrap(?:[.-]|\/)|overlib(?:[.-]|\/)|vendor\.)/i;
function originalUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash)
    throw new Error('Expected a public HTTP(S) original URL without credentials or fragment');
  return url;
}
function captureType(href, original) {
  const capture = new URL(href);
  if (capture.origin !== 'https://web.archive.org') throw new Error('Expected a Wayback URL');
  const match = capture.pathname.match(/^\/web\/([0-9]{1,14}(?:[a-z]+_)?\*?|\*)\/(https?:\/\/.*)$/);
  if (!match || match[2] + capture.search !== original) throw new Error('Capture URL does not match original URL');
  return match[1].includes('*') ? 'calendar' : 'capture';
}

export function buildQueue(index, manifest, { root, includeVendor = false, includeAssets = false } = {}) {
  if (!index || !Array.isArray(index.rows) || index.rows.length > 10000)
    throw new Error('Index requires a rows array (at most 10000 visible rows)');
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.records) || manifest.records.length > 10000)
    throw new Error('Manifest requires version 1 and records array (at most 10000 records)');
  const receipts = new Map();
  const invalidReceipts = [];
  for (const record of manifest.records) {
    const verified = verifyRecord(record, { root });
    try {
      originalUrl(record.url);
      if (captureType(record.capture_url, record.url) !== 'capture') throw new Error('Receipt needs a concrete capture');
    } catch { verified.verification.ok = false; verified.verification.reason = 'Receipt needs valid original and matching concrete capture URL'; }
    if (!verified.verification.ok) invalidReceipts.push(verified);
    const list = receipts.get(record.url) ?? [];
    list.push(verified);
    receipts.set(record.url, list);
  }
  const entries = [];
  const seen = new Set();
  let duplicateRows = 0;
  let ignoredMimeRows = 0;
  const invalidIndexRows = [];
  for (const row of index.rows) {
    if (!row || !Array.isArray(row.cells) || typeof row.cells[0] !== 'string' || typeof row.cells[1] !== 'string')
      throw new Error('Each index row needs original URL and MIME cells');
    const url = row.cells[0];
    const mime = row.cells[1].split(';')[0].trim().toLowerCase();
    if (!SOURCE_MIMES.has(mime) && !(includeAssets && EXTRA_MIMES.has(mime))) { ignoredMimeRows++; continue; }
    let parsed, capture;
    try { parsed = originalUrl(url); capture = captureType(row.href, url); }
    catch (error) { invalidIndexRows.push({ url, capture_url: row.href, reason: error.message }); continue; }
    if (seen.has(url)) { duplicateRows++; continue; }
    seen.add(url);
    const candidates = receipts.get(url) ?? [];
    // A rendered DOM export is useful evidence, but not the replay source requested by this queue.
    const valid = candidates.find(item => item.verification.ok && item.mime.split(';')[0].trim().toLowerCase() === mime
      && item.representation === 'replay-response');
    const vendor = VENDOR.test(parsed.pathname);
    const rendered = candidates.some(item => item.verification.ok && item.representation === 'rendered-dom');
    const status = valid ? 'verified-source' : vendor && !includeVendor ? 'vendor-reference' : 'pending';
    const reason = valid ? 'Matching local replay bytes, MIME and SHA-256 verified'
      : vendor && !includeVendor ? 'Known vendor reference; use --include-vendor to queue'
      : rendered ? 'Rendered DOM exists, but replay source is still missing'
      : candidates.length ? 'No valid matching replay receipt; retry source collection' : 'No downloaded source receipt';
    entries.push({ url, capture_url: row.href, mime, status, reason, selection: capture,
      group: parsed.origin + parsed.pathname, vendor,
      ...(valid ? { path: valid.path, bytes: valid.bytes, sha256: valid.sha256,
        local_capture_url: valid.capture_url, indexed_capture_verified: row.href === valid.capture_url } : {}) });
  }
  entries.sort((a, b) => a.url < b.url ? -1 : a.url > b.url ? 1 : 0);
  const groups = new Map();
  for (const entry of entries) { const urls = groups.get(entry.group) ?? []; urls.push(entry.url); groups.set(entry.group, urls); }
  const counts = { indexed_rows: index.rows.length, selected_urls: entries.length, duplicate_rows: duplicateRows,
    ignored_mime_rows: ignoredMimeRows, invalid_index_rows: invalidIndexRows.length,
    pending: 0, verified_source: 0, vendor_reference: 0, invalid_receipts: invalidReceipts.length };
  for (const entry of entries) counts[entry.status.replaceAll('-', '_')]++;
  return { version: 1, source: index.source ?? null, counts, entries,
    groups: [...groups].map(([key, urls]) => ({ key, urls })), invalid_receipts: invalidReceipts, invalid_index_rows: invalidIndexRows };
}

function readJson(file) {
  const bytes = readFileSync(file);
  if (bytes.length > 32 * 1024 * 1024) throw new Error('Input exceeds 32 MiB');
  return JSON.parse(bytes.toString('utf8'));
}
export function main(args = process.argv.slice(2)) {
  const usage = 'Usage: node archive_queue.mjs --index FILE --manifest FILE --root DIR [--include-vendor] [--include-assets] [--output FILE]';
  if (args.includes('--help') || args.includes('-h')) { process.stdout.write(usage + '\n'); return 0; }
  try {
    const options = {};
    for (let i = 0; i < args.length; i++) {
      if (['--include-vendor', '--include-assets'].includes(args[i])) options[args[i].slice(2)] = true;
      else if (['--index', '--manifest', '--root', '--output'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) options[args[i].slice(2)] = args[++i];
      else throw new Error(usage);
    }
    if (!options.index || !options.manifest || !options.root) throw new Error(usage);
    const result = buildQueue(readJson(options.index), readJson(options.manifest), { root: options.root,
      includeVendor: options['include-vendor'], includeAssets: options['include-assets'] });
    const json = JSON.stringify(result, null, 2) + '\n';
    if (options.output) writeFileSync(options.output, json, { flag: 'wx', mode: 0o600 });
    else process.stdout.write(json);
    return result.invalid_receipts.length || result.invalid_index_rows.length ? 1 : 0;
  } catch (error) { process.stderr.write(error.message + '\n'); return 2; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) process.exitCode = main();
