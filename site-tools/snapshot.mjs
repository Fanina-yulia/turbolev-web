// Snapshot of the live static site https://turbolev.net into ./site (one-off consolidation).
// Crawls from sitemap + blog catalogs, follows same-host links/assets, writes files 1:1 and a manifest.
// Usage: node site-tools/snapshot.mjs [baseUrl] [outDir]
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const BASE = new URL(process.argv[2] || 'https://turbolev.net');
const OUT = process.argv[3] || 'site';
const SEEDS = ['/', '/ru/', '/uk/blog/', '/ru/blog/', '/sitemap.xml', '/robots.txt',
  '/favicon.png', '/favicon.ico', '/apple-touch-icon.png', '/poslugy/', '/ru/uslugi/', '/kontakty/', '/ru/kontakty/',
  '/polityka-konfidentsiinosti/', '/ru/politika-konfidencialnosti/'];
const TEXT = /^(text\/|application\/(json|ld\+json|javascript|xml|xhtml\+xml)|image\/svg)/i;

const seen = new Map(); // path -> record
const external = new Set();
const queue = [];
const enqueue = (p) => { if (!seen.has(p)) { seen.set(p, null); queue.push(p); } };

function normalize(ref, from) {
  if (!ref || /^(tel:|mailto:|javascript:|data:|#)/i.test(ref)) return null;
  let u;
  try { u = new URL(ref.replace(/&amp;/g, '&'), new URL(from, BASE)); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  if (u.hostname !== BASE.hostname) { external.add(u.origin + u.pathname); return null; }
  return decodeURI(u.pathname);
}

function extract(body, from) {
  const found = new Set();
  const add = (r) => { const p = normalize(r, from); if (p) found.add(p); };
  for (const m of body.matchAll(/(?:href|src|content|poster|data-src)=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of body.matchAll(/srcset=["']([^"']+)["']/gi)) m[1].split(',').forEach((s) => add(s.trim().split(/\s+/)[0]));
  for (const m of body.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(m[1]);
  for (const m of body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) add(m[1]);
  for (const m of body.matchAll(/^Sitemap:\s*(\S+)/gim)) add(m[1]);
  return found;
}

function filePathFor(p, ct) {
  if (p.endsWith('/')) return path.join(OUT, p, 'index.html');
  if (!path.extname(p) && /html/i.test(ct)) return path.join(OUT, p, 'index.html');
  return path.join(OUT, p);
}

async function fetchOne(p) {
  const url = new URL(p, BASE);
  const r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'turbolev-snapshot/1' } });
  const ct = r.headers.get('content-type') || '';
  const buf = Buffer.from(await r.arrayBuffer());
  const rec = { path: p, status: r.status, type: ct, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') };
  if (r.status >= 300 && r.status < 400) { rec.location = r.headers.get('location'); return rec; }
  if (r.status !== 200) return rec;
  const file = filePathFor(p, ct);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  rec.file = file;
  if (TEXT.test(ct)) for (const q of extract(buf.toString('utf8'), p)) enqueue(q);
  return rec;
}

SEEDS.forEach(enqueue);
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try { seen.set(p, await fetchOne(p)); } catch (e) { seen.set(p, { path: p, error: String(e.message || e) }); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

// 404 page as served by the site
try {
  const r = await fetch(new URL('/__tl_404_probe__/', BASE));
  if (r.status === 404) await writeFile(path.join(OUT, '404.html'), Buffer.from(await r.arrayBuffer()));
} catch {}

const records = [...seen.values()].filter(Boolean).sort((a, b) => a.path.localeCompare(b.path));
const summary = {
  base: BASE.href, generatedAt: new Date().toISOString(), total: records.length,
  ok: records.filter((r) => r.status === 200).length,
  notOk: records.filter((r) => r.status !== 200).map((r) => ({ path: r.path, status: r.status, error: r.error })),
  external: [...external].sort(),
};
await mkdir('site-tools', { recursive: true });
await writeFile('site-tools/manifest.json', JSON.stringify({ summary, records }, null, 1));
console.log(JSON.stringify({ ...summary, external: summary.external.length }, null, 1));
