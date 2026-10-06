#!/usr/bin/env node
// catalog.mjs — the product catalog's derived half + its verify probe. Zero deps; Node >= 18.
//
// Ships inside the agentic-workflow plugin (`plugins/agentic-workflow/tools/`) and is
// copied into a venture as `tools/catalog.mjs` by /agentic-workflow:bootstrap, /adopt and
// /sync (WORKFLOW.md §6.1 "The catalog"). Everything it writes is deterministic and sorted,
// so `git diff docs/product/catalog/` IS the log of API and data-model changes.
//
//   node tools/catalog.mjs               generate docs/product/catalog/{api,data-model,README}.md
//   node tools/catalog.mjs --check       exit 1 if the generated files are out of date
//   node tools/catalog.mjs --verify      exit 1 if any features.md anchor does not resolve
//   node tools/catalog.mjs --selftest    run against the bundled fixture tree (CI; no venture needed)
//   options: --root <dir> (default cwd) · --config <file> (default <root>/catalog.config.json)
//
// Why it exists (owner, 2026-08-19): sessions were building on OLD knowledge because
// nothing said what the product IS — a 1,848-line CHANGELOG and a 1,303-line JOURNEY
// say what happened; 304 route files, a 158 KB Prisma schema and an openapi endpoint
// were ground truth nobody derived a readable inventory from; and landing pages were
// written from a noisy changelog. The catalog is state, not history: derived halves
// (this file) that cannot go stale, a curated `features.md` rewritten in place, and a
// probe (`--verify`) that fails when a row's anchors stop resolving.
//
// Conventions detected (config overrides all of them):
//   routes  — Nuxt/Nitro file routes under `server/api/**`: `foo.get.ts` → GET /api/foo,
//             `[id].get.ts` → /api/…/:id, `index.get.ts` → the directory, `foo.ts` → ANY,
//             `[...slug].ts` → /api/…/*slug. Auth class = the first `require<Something>(`
//             call in the handler (configurable `authPatterns`), else `—`.
//   schema  — Prisma: `prisma/schema.prisma` and/or `prisma/schema/*.prisma`: models
//             (fields, type, modifiers, attributes, `@@` block attributes) and enums.
//   Neither found → the derived files carry a stub saying how to point the config at
//   the project's routes/schema. The curated `features.md` is never generated here.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync, mkdtempSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ROOT = path.resolve(opt('--root', process.cwd()));

const DEFAULTS = {
  routesDir: 'server/api',
  routePrefix: '/api',
  schemaFiles: ['prisma/schema.prisma', 'prisma/schema/*.prisma'],
  outDir: 'docs/product/catalog',
  featuresFile: 'docs/product/catalog/features.md',
  authPatterns: ['require[A-Z][A-Za-z]*'],
  ignore: ['**/node_modules/**', '**/.d.ts'],
};

function loadConfig(root) {
  const p = path.resolve(root, opt('--config', 'catalog.config.json'));
  if (!existsSync(p)) return { ...DEFAULTS, _configPath: null };
  try { return { ...DEFAULTS, ...JSON.parse(readFileSync(p, 'utf8')), _configPath: p }; }
  catch (e) { throw new Error(`catalog.config.json is not valid JSON: ${e.message}`); }
}

// ── fs helpers ─────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (name !== 'node_modules') walk(p, out); }
    else out.push(p);
  }
  return out;
}
function globSimple(root, pattern) {
  // Supports one `*` in the basename only (e.g. prisma/schema/*.prisma).
  const abs = path.resolve(root, pattern);
  if (!abs.includes('*')) return existsSync(abs) ? [abs] : [];
  const dir = path.dirname(abs); const re = new RegExp('^' + path.basename(abs).split('*').map(escapeRe).join('.*') + '$');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => path.join(dir, f));
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rel = (root, p) => path.relative(root, p).split(path.sep).join('/');

// ── routes ─────────────────────────────────────────────────────────────────
const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
function deriveRoutes(root, cfg) {
  const dir = path.resolve(root, cfg.routesDir);
  const files = walk(dir).filter((f) => /\.(ts|js|mjs)$/.test(f) && !f.endsWith('.d.ts'));
  const authRe = new RegExp(`\\b(${cfg.authPatterns.join('|')})\\s*\\(`);
  const rows = [];
  for (const f of files) {
    const r = rel(dir, f);
    const parts = r.split('/');
    let base = parts.pop().replace(/\.(ts|js|mjs)$/, '');
    let method = 'ANY';
    const m = base.match(/^(.*)\.([a-z]+)$/);
    if (m && METHODS.has(m[2])) { base = m[1]; method = m[2].toUpperCase(); }
    const segs = [...parts, base].filter((s) => s !== 'index').map((s) =>
      s.replace(/^\[\.\.\.(\w+)\]$/, '*$1').replace(/^\[(\w+)\]$/, ':$1'));
    const url = cfg.routePrefix + (segs.length ? '/' + segs.join('/') : '');
    let auth = '—';
    try { const src = readFileSync(f, 'utf8'); const a = src.match(authRe); if (a) auth = a[1]; } catch { /* unreadable → dash */ }
    rows.push({ method, url, auth, handler: rel(root, f) });
  }
  rows.sort((a, b) => a.url.localeCompare(b.url) || a.method.localeCompare(b.method));
  return { rows, found: existsSync(dir), dir: cfg.routesDir };
}
function renderApi(routes, cfg) {
  const head = ['# API catalog — derived (do not edit; regenerate with `node tools/catalog.mjs`)', '',
    `_Routes derived from \`${routes.dir}\` by file convention; \`git diff\` on this file is the API change log. ` +
    'Auth = the first `require…(` call in the handler (heuristic; see catalog.config.json `authPatterns`)._', ''];
  if (!routes.found) return [...head, `_No \`${routes.dir}\` directory found. Point \`catalog.config.json\` → \`routesDir\` at the project's routes, or set it to \`none\`._`, ''].join('\n');
  const body = ['| Method | Path | Auth | Handler |', '|---|---|---|---|', ...routes.rows.map((r) => `| ${r.method} | \`${r.url}\` | ${r.auth} | \`${r.handler}\` |`)];
  return [...head, `**${routes.rows.length} routes.**`, '', ...body, ''].join('\n');
}

// ── prisma schema ──────────────────────────────────────────────────────────
function deriveSchema(root, cfg) {
  const files = cfg.schemaFiles.flatMap((g) => globSimple(root, g));
  const models = new Map(); const enums = new Map();
  for (const f of files) {
    const src = readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
    const blockRe = /^\s*(model|enum)\s+(\w+)\s*\{([\s\S]*?)^\s*\}/gm;
    let m;
    while ((m = blockRe.exec(src))) {
      const [, kind, name, body] = m;
      const lines = body.split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter(Boolean);
      if (kind === 'enum') { enums.set(name, { values: lines.filter((l) => /^\w+$/.test(l)), file: rel(root, f) }); continue; }
      const fields = []; const block = [];
      for (const l of lines) {
        if (l.startsWith('@@')) { block.push(l); continue; }
        const fm = l.match(/^(\w+)\s+([\w.]+)(\[\])?(\?)?\s*(.*)$/);
        if (!fm) continue;
        const [, fname, ftype, arr, opt_, attrs] = fm;
        fields.push({ name: fname, type: `${ftype}${arr || ''}${opt_ || ''}`, attrs: attrs.trim() });
      }
      models.set(name, { fields, block, file: rel(root, f) });
    }
  }
  return { models: [...models.entries()].sort(([a], [b]) => a.localeCompare(b)), enums: [...enums.entries()].sort(([a], [b]) => a.localeCompare(b)), files: files.map((f) => rel(root, f)) };
}
function renderSchema(schema) {
  const head = ['# Data-model catalog — derived (do not edit; regenerate with `node tools/catalog.mjs`)', '',
    '_Models and enums derived from the Prisma schema; `git diff` on this file is the data-model change log._', ''];
  if (!schema.files.length) return [...head, '_No Prisma schema found. Point `catalog.config.json` → `schemaFiles` at the project\'s schema, or set it to `[]`._', ''].join('\n');
  const out = [...head, `**${schema.models.length} models, ${schema.enums.length} enums** — from ${schema.files.map((f) => `\`${f}\``).join(', ')}.`, ''];
  for (const [name, mdl] of schema.models) {
    out.push(`## ${name}`, '', `_\`${mdl.file}\`_`, '', '| Field | Type | Attributes |', '|---|---|---|');
    for (const f of mdl.fields) out.push(`| ${f.name} | \`${f.type}\` | ${f.attrs ? '`' + f.attrs.replace(/`/g, '\'') + '`' : ''} |`);
    if (mdl.block.length) out.push('', mdl.block.map((b) => `- \`${b}\``).join('\n'));
    out.push('');
  }
  if (schema.enums.length) {
    out.push('## Enums', '');
    for (const [name, e] of schema.enums) out.push(`- **${name}**: ${e.values.join(' · ')}`);
    out.push('');
  }
  return out.join('\n');
}

// ── features.md (curated) — parse rows for README + verify ─────────────────
function parseFeatures(root, cfg) {
  const p = path.resolve(root, cfg.featuresFile);
  if (!existsSync(p)) return { exists: false, rows: [], path: cfg.featuresFile };
  const lines = readFileSync(root ? p : p, 'utf8').split('\n');
  const rows = [];
  let header = null;
  for (const l of lines) {
    if (!l.trim().startsWith('|')) { header = null; continue; }
    const cells = l.trim().slice(1, -1).split('|').map((c) => c.trim());
    if (!header) { header = cells.map((c) => c.toLowerCase().replace(/[^a-z]+/g, '')); continue; }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    if (cells.length !== header.length) continue;
    const row = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    if (row.id && /^F-\d+/i.test(row.id)) rows.push(row);
  }
  return { exists: true, rows, path: cfg.featuresFile };
}
// Anchor grammar inside the `anchors` cell (backticked, comma/space separated):
//   `GET /api/x/:id`  route (method + path)  ·  `/api/x`  path, any method
//   `Model` or `Model.field` (capitalised)     data model / field
//   `server/api/…`, `app/…`, any token with a `/` and an extension → file path
function verifyFeatures(root, cfg, routes, schema, features) {
  const problems = [];
  const routeSet = new Set(routes.rows.map((r) => `${r.method} ${r.url}`));
  const pathSet = new Set(routes.rows.map((r) => r.url));
  const modelMap = new Map(schema.models.map(([n, m]) => [n, new Set(m.fields.map((f) => f.name))]));
  for (const row of features.rows) {
    const anchors = [...(row.anchors || '').matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter(Boolean);
    if (!anchors.length) { problems.push(`${row.id}: no anchors`); continue; }
    for (const a of anchors) {
      const rm = a.match(/^([A-Z]+)\s+(\/\S+)$/);
      if (rm) { if (!routeSet.has(`${rm[1]} ${rm[2]}`)) problems.push(`${row.id}: route not in api.md — ${a}`); continue; }
      if (a.startsWith('/')) { if (!pathSet.has(a)) problems.push(`${row.id}: path not in api.md — ${a}`); continue; }
      const mm = a.match(/^([A-Z]\w*)(?:\.(\w+))?$/);
      if (mm && !a.includes('/')) {
        if (!modelMap.has(mm[1])) problems.push(`${row.id}: model not in data-model.md — ${a}`);
        else if (mm[2] && !modelMap.get(mm[1]).has(mm[2])) problems.push(`${row.id}: field not on ${mm[1]} — ${a}`);
        continue;
      }
      if (a.includes('/')) { if (!existsSync(path.resolve(root, a))) problems.push(`${row.id}: file missing — ${a}`); continue; }
      problems.push(`${row.id}: unrecognised anchor — ${a}`);
    }
  }
  return problems;
}

// ── README (generated summary) ─────────────────────────────────────────────
function renderReadme(routes, schema, features, cfg) {
  const live = features.rows.filter((r) => /^live/i.test(r.status || ''));
  const marketable = live.filter((r) => /^yes/i.test(r.marketable || ''));
  const recent = [...features.rows]
    .filter((r) => r.lastchange)
    .sort((a, b) => (b.lastchange.match(/\d{4}-\d{2}-\d{2}/) || [''])[0].localeCompare((a.lastchange.match(/\d{4}-\d{2}-\d{2}/) || [''])[0]))
    .slice(0, 5);
  return [
    '# Product catalog — what the product IS (not what happened)',
    '',
    '_Read this first in any session (≤40 lines; generated by `node tools/catalog.mjs`). ' +
    'History lives in CHANGELOG/JOURNEY; state lives here. WORKFLOW.md §6.1._',
    '',
    `- **API**: ${routes.found ? `${routes.rows.length} routes` : 'no routes dir'} → \`api.md\``,
    `- **Data model**: ${schema.files.length ? `${schema.models.length} models, ${schema.enums.length} enums` : 'no schema'} → \`data-model.md\``,
    `- **Features**: ${features.exists ? `${features.rows.length} rows, ${live.length} live, ${marketable.length} marketable` : 'features.md not seeded yet'} → \`features.md\``,
    '',
    '## Last 5 changed features',
    '',
    ...(recent.length ? recent.map((r) => `- ${r.id} · ${r.name} — ${r.status} — ${r.lastchange}`) : ['- _(none recorded)_']),
    '',
    '## How to use',
    '',
    '- Building on a route/model/component? Read its row in `features.md` and the matching `api.md` / `data-model.md` section first.',
    '- Changed a route, the schema, or a catalogued anchor? Regenerate (`node tools/catalog.mjs`) and rewrite the feature row **in the same PR** — the reviewer gates it.',
    '- Marketing/landing copy draws facts ONLY from `features.md` rows with `marketable: yes` and `status: live`.',
    '- `--check` (stale derived files) and `--verify` (anchors that no longer resolve) are the probes `/agentic-workflow:groom` and the reviewer run.',
    '',
  ].join('\n');
}

// ── generate / check / verify ──────────────────────────────────────────────
function build(root) {
  const cfg = loadConfig(root);
  const routes = cfg.routesDir === 'none' ? { rows: [], found: false, dir: 'none' } : deriveRoutes(root, cfg);
  const schema = deriveSchema(root, cfg);
  const features = parseFeatures(root, cfg);
  const files = {
    'api.md': renderApi(routes, cfg),
    'data-model.md': renderSchema(schema),
    'README.md': renderReadme(routes, schema, features, cfg),
  };
  return { cfg, routes, schema, features, files };
}
function generate(root) {
  const b = build(root);
  const out = path.resolve(root, b.cfg.outDir); mkdirSync(out, { recursive: true });
  for (const [name, content] of Object.entries(b.files)) writeFileSync(path.join(out, name), content);
  return b;
}
function check(root) {
  const b = build(root);
  const out = path.resolve(root, b.cfg.outDir);
  const stale = Object.entries(b.files).filter(([name, content]) => !existsSync(path.join(out, name)) || readFileSync(path.join(out, name), 'utf8') !== content).map(([n]) => n);
  return { stale, b };
}
function verify(root) {
  const b = build(root);
  if (!b.features.exists) return { problems: [`${b.cfg.featuresFile} does not exist — seed it from templates/catalog-features.md`], b };
  return { problems: verifyFeatures(root, b.cfg, b.routes, b.schema, b.features), b };
}

// ── selftest (bundled fixture) ─────────────────────────────────────────────
function selftest() {
  const fixture = path.join(HERE, 'fixtures', 'catalog');
  if (!existsSync(fixture)) { console.error(`selftest: fixture missing at ${fixture}`); return 1; }
  const tmp = mkdtempSync(path.join(tmpdir(), 'catalog-selftest-'));
  const fails = [];
  const ok = (name, cond, detail) => { if (cond) console.log(`  ok   ${name}`); else { console.error(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); fails.push(name); } };
  try {
    cpSync(fixture, tmp, { recursive: true });
    // 1. generate → expected shape
    const b = generate(tmp);
    ok('routes derived: 5 rows incl. :id, *slug, ANY', b.routes.rows.length === 5
      && b.routes.rows.some((r) => r.url === '/api/orders/:id' && r.method === 'GET')
      && b.routes.rows.some((r) => r.url === '/api/files/*slug' && r.method === 'ANY')
      && b.routes.rows.some((r) => r.url === '/api/orders' && r.method === 'POST' && r.auth === 'requireStaff'),
      JSON.stringify(b.routes.rows));
    ok('schema derived: 2 models, 1 enum, fields + block attrs', b.schema.models.length === 2 && b.schema.enums.length === 1
      && b.schema.models.find(([n]) => n === 'Order')[1].fields.some((f) => f.name === 'total' && f.type === 'Decimal')
      && b.schema.models.find(([n]) => n === 'Order')[1].block.some((l) => l.startsWith('@@unique')),
      JSON.stringify(b.schema.models.map(([n, m]) => [n, m.fields.length, m.block])));
    ok('generated files are deterministic (second run identical)', JSON.stringify(build(tmp).files) === JSON.stringify(b.files));
    ok('README counts features: 2 rows, 2 live, 1 marketable', /2 rows, 2 live, 1 marketable/.test(b.files['README.md']), b.files['README.md']);
    // 2. --check: clean now, stale after a route is added
    ok('--check clean right after generate', check(tmp).stale.length === 0);
    writeFileSync(path.join(tmp, 'server/api/orders/[id].delete.ts'), 'export default defineEventHandler(() => { requireManager(); })\n');
    ok('--check reports api.md + README stale after a new route file', check(tmp).stale.includes('api.md') && check(tmp).stale.includes('README.md'), JSON.stringify(check(tmp).stale));
    generate(tmp);
    // 3. --verify: clean fixture, then a broken anchor
    ok('--verify clean on the fixture', verify(tmp).problems.length === 0, JSON.stringify(verify(tmp).problems));
    const fp = path.join(tmp, 'docs/product/catalog/features.md');
    writeFileSync(fp, readFileSync(fp, 'utf8').replace('`Order.total`', '`Order.totalz`').replace('`GET /api/orders/:id`', '`GET /api/orderz/:id`'));
    const v = verify(tmp).problems;
    ok('--verify flags a missing field and a missing route', v.some((p) => /field not on Order/.test(p)) && v.some((p) => /route not in api.md/.test(p)), JSON.stringify(v));
    // 4. no conventions → stubs, exit 0
    const bare = mkdtempSync(path.join(tmpdir(), 'catalog-bare-'));
    const bb = generate(bare);
    ok('no routes/schema → stub files, no throw', /No `server\/api`/.test(bb.files['api.md']) && /No Prisma schema/.test(bb.files['data-model.md']));
    rmSync(bare, { recursive: true, force: true });
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  if (fails.length) { console.error(`catalog selftest: ${fails.length} failure(s)`); return 1; }
  console.log('catalog selftest: clean'); return 0;
}

// ── main ───────────────────────────────────────────────────────────────────
try {
  if (flag('--selftest')) process.exit(selftest());
  if (flag('--check')) {
    const { stale, b } = check(ROOT);
    if (stale.length) { console.error(`catalog --check: STALE ${stale.join(', ')} — run \`node tools/catalog.mjs\` (out dir ${b.cfg.outDir})`); process.exit(1); }
    console.log('catalog --check: current'); process.exit(0);
  }
  if (flag('--verify')) {
    const { problems } = verify(ROOT);
    if (problems.length) { console.error(`catalog --verify: ${problems.length} unresolved anchor(s)\n  ` + problems.join('\n  ')); process.exit(1); }
    console.log('catalog --verify: every anchor resolves'); process.exit(0);
  }
  const b = generate(ROOT);
  console.log(`catalog: wrote ${Object.keys(b.files).join(', ')} → ${b.cfg.outDir} (${b.routes.rows.length} routes, ${b.schema.models.length} models, ${b.features.rows.length} feature rows)`);
} catch (e) {
  console.error(`catalog: ${e.message}`); process.exit(2);
}
