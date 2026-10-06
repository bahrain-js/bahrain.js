#!/usr/bin/env node
// ci-wait.mjs — deterministic GitHub Actions tracking for the diff-bearing commit.
// Zero deps; Node >= 18; needs `git` and `gh` on PATH (live mode only).
//
//   node tools/ci-wait.mjs [ref] [--expect wf1,wf2] [--timeout-s 1800] [--poll-s 20]
//                          [--grace-s 120] [--no-wait] [--json] [--selftest]
//
//   ref: a branch, a sha (any length — resolved to 40 chars), or pr:N (the PR's
//        head commit). Default: HEAD.
//
// Exit codes (the whole point — an agent branches on these, never on prose):
//   0  GREEN    every run for the commit concluded successfully (and every
//               --expect workflow ran)
//   1  RED      at least one run failed / was cancelled / timed out
//   2  TIMEOUT  runs still pending when --timeout-s elapsed
//   3  NO-RUNS  no workflow run appeared for this commit within --grace-s
//               (path-filtered CI, workflow_dispatch-only, or Actions disabled)
//   4  EXPECT   runs concluded green but an --expect workflow never triggered
//   5  USAGE    bad ref / gh missing / not a repo
//
// Why (owner, 2026-08-19 + orderly §12 LA-8): the agent burned tokens polling
// CI and still got it wrong — `cmd | tail` reports tail's exit status; a
// PR-level check summary describes the HEAD commit, which after a docs-only
// push is not the commit carrying the code; a path-filtered ci.yml leaves the
// PR reading "all checks passed" while the real run is in flight elsewhere; a
// short SHA makes `gh run list --commit` silently return []. This script asks
// exactly one question — "what is the state of every workflow run for THIS
// full 40-char commit?" — and answers it with an exit code. Run it in the
// background (`run_in_background`) and the agent pays zero tokens while
// waiting; the notification arrives when the state is decided.
//
// The decision core is pure (`decide()`), so --selftest exercises it on
// fixtures with no network; live mode only shells out to git/gh.

import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const REF = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true && !/^\d+$/.test('')) && argv[0] && !argv[0].startsWith('--') ? argv[0] : 'HEAD';
const TIMEOUT_S = parseInt(opt('--timeout-s', '1800'), 10);
const POLL_S = parseInt(opt('--poll-s', '20'), 10);
const GRACE_S = parseInt(opt('--grace-s', '120'), 10);
const EXPECT = (opt('--expect', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

const sh = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
};

// ── the pure decision core ─────────────────────────────────────────────────
// runs: [{workflowName, status: queued|in_progress|completed|waiting|requested|pending,
//         conclusion: success|failure|cancelled|timed_out|skipped|neutral|action_required|null,
//         url}]
// Returns {state: 'green'|'red'|'pending'|'none'|'expect-missing', lines, missing}
export function decide(runs, { expect = [] } = {}) {
  const lines = runs.map((r) => `  ${r.workflowName}: ${r.status === 'completed' ? r.conclusion : r.status}${r.url ? ` — ${r.url}` : ''}`);
  if (!runs.length) return { state: 'none', lines, missing: expect };
  const bad = runs.filter((r) => r.status === 'completed' && !['success', 'skipped', 'neutral'].includes(r.conclusion));
  if (bad.length) return { state: 'red', lines, missing: [] };
  const pending = runs.filter((r) => r.status !== 'completed');
  if (pending.length) return { state: 'pending', lines, missing: [] };
  const ran = new Set(runs.map((r) => r.workflowName));
  const missing = expect.filter((w) => !ran.has(w));
  if (missing.length) return { state: 'expect-missing', lines, missing };
  return { state: 'green', lines, missing: [] };
}

// ── live helpers ───────────────────────────────────────────────────────────
function resolveSha(ref) {
  if (/^pr:\d+$/i.test(ref)) {
    const n = ref.slice(3);
    const r = sh('gh', ['pr', 'view', n, '--json', 'headRefOid', '--jq', '.headRefOid']);
    if (r.code !== 0 || !/^[0-9a-f]{40}$/.test(r.out)) return null;
    return r.out;
  }
  const r = sh('git', ['rev-parse', ref]);
  if (r.code !== 0 || !/^[0-9a-f]{40}$/.test(r.out)) return null;   // LA-8: never a short sha
  return r.out;
}
function listRuns(sha) {
  const r = sh('gh', ['run', 'list', '--commit', sha, '--limit', '50', '--json', 'workflowName,status,conclusion,url']);
  if (r.code !== 0) return null;
  try { return JSON.parse(r.out || '[]'); } catch { return null; }
}
const sleep = (s) => new Promise((res) => setTimeout(res, s * 1000));

// ── selftest ───────────────────────────────────────────────────────────────
function selftest() {
  const fails = [];
  const ok = (name, cond, detail) => { if (cond) console.log(`  ok   ${name}`); else { console.error(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); fails.push(name); } };
  const R = (w, status, conclusion = null) => ({ workflowName: w, status, conclusion, url: '' });
  ok('all success → green', decide([R('ci', 'completed', 'success'), R('deploy', 'completed', 'success')]).state === 'green');
  ok('skipped/neutral do not block green', decide([R('ci', 'completed', 'success'), R('lint', 'completed', 'skipped')]).state === 'green');
  ok('one failure → red even while others pend', decide([R('ci', 'completed', 'failure'), R('deploy', 'in_progress')]).state === 'red');
  ok('cancelled → red', decide([R('ci', 'completed', 'cancelled')]).state === 'red');
  ok('timed_out → red', decide([R('ci', 'completed', 'timed_out')]).state === 'red');
  ok('queued/in_progress → pending', decide([R('ci', 'queued'), R('deploy', 'completed', 'success')]).state === 'pending');
  ok('no runs → none (the path-filter/false-green trap: NOT green)', decide([]).state === 'none');
  ok('green but an expected workflow never ran → expect-missing (LA-8 path filter)',
    (() => { const d = decide([R('docs', 'completed', 'success')], { expect: ['ci'] }); return d.state === 'expect-missing' && d.missing[0] === 'ci'; })());
  ok('expected workflow ran → green', decide([R('ci', 'completed', 'success')], { expect: ['ci'] }).state === 'green');
  ok('action_required → red (a run stuck on approval is not green)', decide([R('ci', 'completed', 'action_required')]).state === 'red');
  if (fails.length) { console.error(`ci-wait selftest: ${fails.length} failure(s)`); return 1; }
  console.log('ci-wait selftest: clean'); return 0;
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  if (flag('--selftest')) process.exit(selftest());
  if (sh('gh', ['--version']).code !== 0) { console.error('ci-wait: gh not on PATH'); process.exit(5); }
  const sha = resolveSha(REF);
  if (!sha) { console.error(`ci-wait: cannot resolve '${REF}' to a full 40-char sha`); process.exit(5); }
  const short = sha.slice(0, 7);
  const start = Date.now();
  let lastPrint = '';
  for (;;) {
    const runs = listRuns(sha);
    if (runs === null) { console.error('ci-wait: gh run list failed'); process.exit(5); }
    const d = decide(runs, { expect: EXPECT });
    const elapsed = Math.round((Date.now() - start) / 1000);
    const line = `${d.state} (${runs.length} run(s), ${elapsed}s)`;
    if (line !== lastPrint) { console.log(`ci-wait ${short}: ${line}`); d.lines.forEach((l) => console.log(l)); lastPrint = line; }
    if (flag('--json')) { console.log(JSON.stringify({ sha, state: d.state, runs, missing: d.missing })); }
    if (d.state === 'green') { console.log(`ci-wait: GREEN — every run for ${short} concluded successfully`); process.exit(0); }
    if (d.state === 'red') { console.error(`ci-wait: RED — a run for ${short} failed/cancelled/timed out (see above)`); process.exit(1); }
    if (d.state === 'expect-missing') { console.error(`ci-wait: EXPECTED WORKFLOW NEVER RAN for ${short}: ${d.missing.join(', ')} — path filter or dispatch-only; this is NOT green (LA-8)`); process.exit(4); }
    if (d.state === 'none' && elapsed >= GRACE_S) { console.error(`ci-wait: NO RUNS for ${short} after ${GRACE_S}s — path-filtered CI, dispatch-only workflow, or Actions disabled; treat as unverified, never as green (LA-8)`); process.exit(3); }
    if (flag('--no-wait')) { console.log('ci-wait: --no-wait — current state reported above'); process.exit(d.state === 'none' ? 3 : 2); }
    if (elapsed >= TIMEOUT_S) { console.error(`ci-wait: TIMEOUT after ${TIMEOUT_S}s — still ${d.state}`); process.exit(2); }
    await sleep(POLL_S);
  }
}
main();
