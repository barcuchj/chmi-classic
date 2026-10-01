import { createHash } from 'node:crypto';
import { lstatSync, realpathSync, readFileSync, statSync } from 'node:fs';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const DEFAULT_MAX_BYTES = 32 * 1024 * 1024;
const MIME_TYPES = new Set([
  'text/html', 'text/css', 'application/javascript', 'text/javascript', 'application/json',
]);

function result(record, ok, kind, reason, bytes = null, sha256 = null) {
  return { ...record, verification: { ok, kind, reason, actual_bytes: bytes, actual_sha256: sha256 } };
}

function isRenderedFragment(text) {
  // Shape check only, not a full HTML parser. Never execute scripts or change stored bytes.
  const shape = text.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/(?:\s*<br\b[^>]*>\s*)+$/i, '').trim();
  if (!/^<(div|section|table)\b[^>]*>[\s\S]*<\/\1\s*>$/i.test(shape)) return false;
  const stack = [];
  for (const tag of shape.matchAll(/<(\/?)(div|section|table)\b[^>]*>/gi)) {
    const name = tag[2].toLowerCase();
    if (!tag[1]) stack.push(name);
    else if (stack.pop() !== name) return false;
  }
  return stack.length === 0;
}

function isReplayFragment(text) {
  // Some old portal endpoints returned fragments, not full documents. Wayback
  // prepends a toolbar. Remove it only in the validation copy, never the file.
  const marker = '<!-- END WAYBACK TOOLBAR INSERT -->';
  const at = text.indexOf(marker);
  if (at === -1) return !/\bid=["']wm-ipp-base["']/i.test(text) && isRenderedFragment(text);
  const prefix = text.slice(0, at);
  if (!/<div\b[^>]*\bid=["']wm-ipp-base["']/i.test(prefix)
    || !/\b__wm\.wombat\s*\(/.test(prefix)) return false;
  return isRenderedFragment(text.slice(at + marker.length));
}

function validateContent(mime, data, record) {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(data).replace(/^\uFEFF/, '');
  const trimmed = text.trim();
  if (mime === 'text/html') {
    const explicitFragment = record.html_shape === 'fragment';
    if (record.html_shape !== undefined && !explicitFragment)
      return 'Unsupported explicit HTML shape';
    if (explicitFragment && (record.representation !== 'replay-response' || record.http_status !== 200
      || !isReplayFragment(trimmed))) return 'Declared replay fragment needs valid structure, replay-response and recorded HTTP 200';
    const renderedFragment = record.representation === 'rendered-dom' && isRenderedFragment(trimmed);
    if (!explicitFragment && !renderedFragment && (!/<html\b/i.test(trimmed) || !/<body\b/i.test(trimmed)))
      return 'HTML document structure is missing';
    const title = trimmed.match(/<title\b[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
    if (/\b(?:offline|login|log in|sign in|page cannot be displayed|error 404|not found)\b/i.test(title)
      || /<h1\b[^>]*>\s*(?:offline|login|log in|sign in|page cannot be displayed|error 404|not found)\b/i.test(trimmed)
      || (/\b(?:wayback machine|internet archive)\b/i.test(title)
        && !/<(?:main|article)\b/i.test(trimmed)))
      return 'Archive/error/login wrapper is not archived page content';
    return null;
  }
  if (/^(?:\s|<!--[^]*?-->)*<(?:!doctype\s+html|html|head|body)\b/i.test(trimmed))
    return 'HTML content does not match declared MIME type';
  if (mime === 'application/json') {
    try { JSON.parse(text); } catch { return 'Invalid JSON'; }
  } else if (mime === 'application/javascript' || mime === 'text/javascript') {
    try { new vm.Script(text); } catch { return 'Invalid JavaScript syntax'; }
  } else if (mime === 'text/css') {
    if (!/(?:^|})\s*[^{}<>]+\{[^{}]*:[^{};]+(?:;[^{}]*)?\}/s.test(text)) return 'No plausible CSS rule found';
  }
  return null;
}

export function verifyRecord(record, { root, maxBytes = DEFAULT_MAX_BYTES } = {}) {
  if (!record || typeof record !== 'object' || Array.isArray(record))
    return result({}, false, 'invalid', 'Record must be an object');
  const mime = typeof record.mime === 'string' ? record.mime.split(';', 1)[0].trim().toLowerCase() : '';
  if (!Number.isSafeInteger(record.bytes) || record.bytes <= 0 || !/^[a-f\d]{64}$/i.test(record.sha256 ?? ''))
    return result(record, false, 'invalid', 'Expected positive integer bytes and 64-digit SHA-256 are required');
  if (!MIME_TYPES.has(mime)) return result(record, false, 'invalid', 'Unsupported or missing MIME type');
  if (typeof record.path !== 'string' || !record.path || path.isAbsolute(record.path))
    return result(record, false, 'invalid', 'Path must be a non-empty relative path');
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) return result(record, false, 'invalid', 'Invalid maxBytes limit');

  let rootPath;
  let filePath;
  let data;
  let actualStat;
  let digest;
  try {
    rootPath = realpathSync(root);
    filePath = path.resolve(rootPath, record.path);
    if (filePath === rootPath || !filePath.startsWith(rootPath + path.sep))
      return result(record, false, 'invalid', 'Path escapes root');
    const beforeLink = lstatSync(filePath);
    if (beforeLink.isSymbolicLink()) return result(record, false, 'invalid', 'Symbolic links are not accepted');
    const beforeReal = realpathSync(filePath);
    if (beforeReal !== filePath || !beforeReal.startsWith(rootPath + path.sep))
      return result(record, false, 'invalid', 'Resolved path escapes root');
    actualStat = statSync(filePath);
    if (!actualStat.isFile()) return result(record, false, 'invalid', 'Path is not a regular file');
    if (actualStat.size > maxBytes) return result(record, false, 'invalid', `File exceeds ${maxBytes} byte limit`, actualStat.size);
    data = readFileSync(filePath);
    const after = statSync(filePath);
    if (actualStat.size !== after.size || actualStat.mtimeMs !== after.mtimeMs || actualStat.ino !== after.ino || data.length !== after.size)
      return result(record, false, 'invalid', 'File changed while being read', data.length);
    digest = createHash('sha256').update(data).digest('hex');
  } catch (error) {
    return result(record, false, 'invalid', `Cannot safely read file: ${error.code ?? error.message}`);
  }
  const kind = mime === 'text/html'
    ? (record.html_shape === 'fragment' && record.representation === 'replay-response' && isReplayFragment(new TextDecoder().decode(data))
      ? 'html-archived-fragment' : record.representation === 'rendered-dom'
      ? (isRenderedFragment(new TextDecoder().decode(data)) ? 'html-rendered-fragment' : 'html-rendered-document')
      : record.representation ? 'html-archived' : 'html')
    : mime;
  if (data.length !== record.bytes) return result(record, false, kind, 'Byte count mismatch', data.length, digest);
  if (digest.toLowerCase() !== record.sha256.toLowerCase()) return result(record, false, kind, 'SHA-256 mismatch', data.length, digest);
  const contentError = validateContent(mime, data, record);
  if (contentError) return result(record, false, kind, contentError, data.length, digest);
  return result(record, true, kind, 'Verified', data.length, digest);
}

function usage() {
  return 'Usage: node archive_verify.mjs --manifest FILE --root DIR [--output FILE]';
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.includes('-h')) { process.stdout.write(`${usage()}\n`); return 0; }
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    if (!['--manifest', '--root', '--output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
      process.stderr.write(`${usage()}\n`); return 2;
    }
    options[args[i].slice(2)] = args[++i];
  }
  if (!options.manifest || !options.root) { process.stderr.write(`${usage()}\n`); return 2; }
  let inputPath;
  let outputPath;
  let manifest;
  try {
    inputPath = await realpath(options.manifest);
    outputPath = options.output ? path.resolve(options.output) : null;
    if (outputPath && path.resolve(inputPath) === outputPath) throw new Error('Output must not overwrite the input manifest');
    if (outputPath) {
      try {
        if (await realpath(outputPath) === inputPath) throw new Error('Output must not overwrite the input manifest');
      } catch (error) {
        if (error.message.includes('must not overwrite')) throw error;
        if (error.code !== 'ENOENT') throw error;
      }
    }
    manifest = JSON.parse(await readFile(inputPath, 'utf8'));
  } catch (error) {
    process.stderr.write(`Cannot read manifest: ${error.message}\n`); return 2;
  }
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.records)) {
    process.stderr.write('Manifest must have version 1 and a records array\n'); return 2;
  }
  const records = manifest.records.map(record => verifyRecord(record, { root: options.root }));
  const report = { version: 1, records, ok: records.every(item => item.verification.ok) };
  const json = `${JSON.stringify(report, null, 2)}\n`;
  try {
    if (outputPath) await writeFile(outputPath, json, { flag: 'wx', mode: 0o600 });
    else process.stdout.write(json);
  } catch (error) {
    process.stderr.write(`Cannot write report: ${error.message}\n`); return 2;
  }
  return report.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }, error => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
}
