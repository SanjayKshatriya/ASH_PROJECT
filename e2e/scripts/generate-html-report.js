#!/usr/bin/env node
// ============================================================
// AgroSmartHub 3.0 — HTML Report Generator
// Reads Allure JSON results → produces standalone execution-report.html
// ============================================================

'use strict';

const fs   = require('fs-extra');
const path = require('path');

// ─── Paths ───────────────────────────────────────────────────
const ALLURE_DIR  = path.resolve(__dirname, '..', 'allure-results');
const OUT_DIR     = path.resolve(__dirname, '..', '..', 'Test Results', 'HTML');
const SHOT_DIR    = path.resolve(__dirname, '..', '..', 'Test Results', 'Screenshots');
const OUT_FILE    = path.join(OUT_DIR, 'execution-report.html');

fs.ensureDirSync(OUT_DIR);

// ─── Parse Allure Results ────────────────────────────────────
function parseAllureResults() {
  const results = [];

  if (!fs.existsSync(ALLURE_DIR)) {
    console.warn('⚠  allure-results directory not found — generating empty report');
    return results;
  }

  const files = fs.readdirSync(ALLURE_DIR).filter(f => f.endsWith('-result.json'));

  for (const file of files) {
    try {
      const raw  = fs.readFileSync(path.join(ALLURE_DIR, file), 'utf8');
      const data = JSON.parse(raw);
      results.push({
        name:      data.name        || 'Unknown Test',
        suite:     (data.labels || []).find(l => l.name === 'suite')?.value || 'General',
        status:    data.status      || 'unknown',
        duration:  data.stop && data.start ? data.stop - data.start : 0,
        message:   data.statusDetails?.message || '',
        trace:     data.statusDetails?.trace   || '',
        start:     data.start || Date.now(),
        stop:      data.stop  || Date.now(),
        uid:       data.uuid  || file.replace('-result.json', '')
      });
    } catch (e) {
      console.warn(`⚠  Could not parse ${file}: ${e.message}`);
    }
  }

  return results.sort((a, b) => a.start - b.start);
}

// ─── Build Summary ───────────────────────────────────────────
function buildSummary(results) {
  const total    = results.length;
  const passed   = results.filter(r => r.status === 'passed').length;
  const failed   = results.filter(r => r.status === 'failed').length;
  const skipped  = results.filter(r => r.status === 'skipped' || r.status === 'broken').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const duration = results.reduce((s, r) => s + r.duration, 0);

  return { total, passed, failed, skipped, passRate, duration };
}

// ─── Format Helpers ──────────────────────────────────────────
function fmtDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function statusBadge(status) {
  const map = {
    passed:  { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  icon: '✅', label: 'PASS'    },
    failed:  { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  icon: '❌', label: 'FAIL'    },
    skipped: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '⏭', label: 'SKIP'    },
    broken:  { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: '⚠️', label: 'BROKEN'  },
    unknown: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)',icon: '❓', label: 'UNKNOWN' }
  };
  const s = map[status] || map.unknown;
  return `<span style="
    display:inline-flex;align-items:center;gap:6px;padding:4px 12px;
    border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.5px;
    color:${s.color};background:${s.bg};border:1px solid ${s.color}40;
  ">${s.icon} ${s.label}</span>`;
}

// ─── Screenshot lookup ───────────────────────────────────────
function findScreenshot(uid, name) {
  if (!fs.existsSync(SHOT_DIR)) return null;
  const safeName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const files = fs.readdirSync(SHOT_DIR);
  const match = files.find(f => f.includes(uid) || f.includes(safeName));
  if (!match) return null;
  const imgBuf = fs.readFileSync(path.join(SHOT_DIR, match));
  return `data:image/png;base64,${imgBuf.toString('base64')}`;
}

// ─── Generate HTML ───────────────────────────────────────────
function generateHTML(results, summary, buildNum, runDate) {
  const suites = {};
  for (const r of results) {
    if (!suites[r.suite]) suites[r.suite] = [];
    suites[r.suite].push(r);
  }

  const testRows = results.map((r, i) => {
    const screenshot = r.status === 'failed' ? findScreenshot(r.uid, r.name) : null;
    const errorBlock = r.message ? `
      <div style="margin-top:12px;padding:12px;background:rgba(239,68,68,0.08);
                  border-left:3px solid #ef4444;border-radius:4px;">
        <div style="color:#ef4444;font-family:monospace;font-size:12px;white-space:pre-wrap;">${
          escapeHtml(r.message).substring(0, 500)
        }</div>
      </div>` : '';
    const screenshotBlock = screenshot ? `
      <div style="margin-top:12px;">
        <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">📸 Failure Screenshot</div>
        <img src="${screenshot}" style="max-width:100%;border-radius:8px;border:1px solid #374151;" />
      </div>` : '';

    return `
    <tr class="test-row" data-status="${r.status}" onclick="toggleDetail(${i})"
        style="cursor:pointer;border-bottom:1px solid #1f2937;transition:background .2s;">
      <td style="padding:14px 16px;color:#9ca3af;font-size:13px;">${i + 1}</td>
      <td style="padding:14px 16px;">
        <div style="font-weight:600;color:#f9fafb;font-size:14px;">${escapeHtml(r.name)}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">${escapeHtml(r.suite)}</div>
      </td>
      <td style="padding:14px 16px;">${statusBadge(r.status)}</td>
      <td style="padding:14px 16px;color:#9ca3af;font-size:13px;font-family:monospace;">
        ${fmtDuration(r.duration)}
      </td>
      <td style="padding:14px 16px;color:#9ca3af;font-size:12px;">
        ${fmtDate(r.start)}
      </td>
    </tr>
    <tr id="detail-${i}" style="display:none;">
      <td colspan="5" style="padding:0 16px 16px 16px;">
        ${errorBlock}${screenshotBlock}
        ${!errorBlock && !screenshotBlock ? '<div style="color:#6b7280;font-size:13px;padding:8px 0;">No additional details available.</div>' : ''}
      </td>
    </tr>`;
  }).join('');

  const suiteCards = Object.entries(suites).map(([suite, tests]) => {
    const p = tests.filter(t => t.status === 'passed').length;
    const f = tests.filter(t => t.status === 'failed').length;
    const s = tests.filter(t => t.status === 'skipped' || t.status === 'broken').length;
    const pct = tests.length > 0 ? Math.round((p / tests.length) * 100) : 0;
    return `
    <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;">
      <div style="font-weight:700;color:#f9fafb;font-size:15px;margin-bottom:12px;">
        ${escapeHtml(suite)}
      </div>
      <div style="display:flex;gap:16px;margin-bottom:12px;">
        <span style="color:#22c55e;font-size:13px;">✅ ${p} pass</span>
        <span style="color:#ef4444;font-size:13px;">❌ ${f} fail</span>
        <span style="color:#f59e0b;font-size:13px;">⏭ ${s} skip</span>
      </div>
      <div style="height:6px;background:#1f2937;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${pct>=80?'#22c55e':pct>=50?'#f59e0b':'#ef4444'};
             border-radius:3px;transition:width .8s;"></div>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-top:6px;">${pct}% pass rate</div>
    </div>`;
  }).join('');

  const passColor = summary.passRate >= 80 ? '#22c55e' : summary.passRate >= 50 ? '#f59e0b' : '#ef4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AgroSmartHub — E2E Execution Report #${buildNum}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
         background:#0a0f1a;color:#f9fafb;min-height:100vh; }
  .test-row:hover { background:rgba(255,255,255,0.03)!important; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .card { animation:fadeIn .4s ease both; }
  @media print { .no-print{display:none!important} }
</style>
</head>
<body>

<!-- Header -->
<div style="background:linear-gradient(135deg,#0f2027,#1a3a2a,#0f2027);
     padding:40px 32px 32px;border-bottom:1px solid #1f2937;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div style="width:52px;height:52px;background:linear-gradient(135deg,#16a34a,#0d9488);
           border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;">🌾</div>
      <div>
        <h1 style="font-size:26px;font-weight:800;color:#f9fafb;">AgroSmartHub 3.0</h1>
        <div style="font-size:14px;color:#6b7280;margin-top:2px;">Appium E2E Execution Report</div>
      </div>
      <div style="margin-left:auto;text-align:right;" class="no-print">
        <div style="font-size:13px;color:#6b7280;">Build</div>
        <div style="font-size:22px;font-weight:700;color:#22c55e;">#${buildNum}</div>
      </div>
    </div>

    <!-- Meta info -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
      <div style="background:rgba(255,255,255,0.04);border:1px solid #1f2937;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">📅 Execution Date</div>
        <div style="font-size:14px;font-weight:600;color:#f9fafb;">${runDate}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid #1f2937;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">⏱ Total Duration</div>
        <div style="font-size:14px;font-weight:600;color:#f9fafb;">${fmtDuration(summary.duration)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid #1f2937;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">📱 Platform</div>
        <div style="font-size:14px;font-weight:600;color:#f9fafb;">Android Chrome (Emulator)</div>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid #1f2937;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">🤖 Framework</div>
        <div style="font-size:14px;font-weight:600;color:#f9fafb;">Appium + WebdriverIO</div>
      </div>
    </div>
  </div>
</div>

<!-- Summary Stat Cards -->
<div style="max-width:1200px;margin:32px auto;padding:0 32px;">
  <div class="card" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:32px;">
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;text-align:center;">
      <div style="font-size:40px;font-weight:800;color:#f9fafb;">${summary.total}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Total Tests</div>
    </div>
    <div style="background:#111827;border:1px solid rgba(34,197,94,0.3);border-radius:16px;padding:24px;text-align:center;">
      <div style="font-size:40px;font-weight:800;color:#22c55e;">${summary.passed}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Passed</div>
    </div>
    <div style="background:#111827;border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:24px;text-align:center;">
      <div style="font-size:40px;font-weight:800;color:#ef4444;">${summary.failed}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Failed</div>
    </div>
    <div style="background:#111827;border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:24px;text-align:center;">
      <div style="font-size:40px;font-weight:800;color:#f59e0b;">${summary.skipped}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Skipped</div>
    </div>
    <div style="background:#111827;border:1px solid ${passColor}40;border-radius:16px;padding:24px;text-align:center;">
      <div style="font-size:40px;font-weight:800;color:${passColor};">${summary.passRate}%</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Pass Rate</div>
    </div>
  </div>

  <!-- Pass Rate Bar -->
  <div class="card" style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:24px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-weight:700;font-size:16px;">Overall Pass Rate</span>
      <span style="font-size:24px;font-weight:800;color:${passColor};">${summary.passRate}%</span>
    </div>
    <div style="height:12px;background:#1f2937;border-radius:6px;overflow:hidden;">
      <div style="height:100%;width:${summary.passRate}%;
           background:linear-gradient(90deg,${passColor},${passColor}cc);
           border-radius:6px;transition:width 1s ease;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:#6b7280;">
      <span>0%</span><span>50%</span><span>100%</span>
    </div>
  </div>

  <!-- Suite Breakdown -->
  ${Object.keys(suites).length > 0 ? `
  <div class="card" style="margin-bottom:32px;">
    <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;color:#f9fafb;">📦 Suite Breakdown</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
      ${suiteCards}
    </div>
  </div>` : ''}

  <!-- Test Results Table -->
  <div class="card" style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;margin-bottom:32px;">
    <div style="padding:20px 24px;border-bottom:1px solid #1f2937;display:flex;
         align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <h2 style="font-size:18px;font-weight:700;color:#f9fafb;">📋 Detailed Test Results</h2>
      <div style="display:flex;gap:8px;" class="no-print">
        <button onclick="filterTests('all')" id="btn-all"
          style="padding:6px 14px;background:#16a34a;border:none;border-radius:6px;
                 color:white;cursor:pointer;font-size:13px;">All</button>
        <button onclick="filterTests('passed')" id="btn-passed"
          style="padding:6px 14px;background:#374151;border:none;border-radius:6px;
                 color:#22c55e;cursor:pointer;font-size:13px;">✅ Passed</button>
        <button onclick="filterTests('failed')" id="btn-failed"
          style="padding:6px 14px;background:#374151;border:none;border-radius:6px;
                 color:#ef4444;cursor:pointer;font-size:13px;">❌ Failed</button>
        <button onclick="filterTests('skipped')" id="btn-skipped"
          style="padding:6px 14px;background:#374151;border:none;border-radius:6px;
                 color:#f59e0b;cursor:pointer;font-size:13px;">⏭ Skipped</button>
      </div>
    </div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;" id="resultsTable">
        <thead>
          <tr style="background:#0d1117;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">#</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">TEST NAME</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">STATUS</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">DURATION</th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">TIME</th>
          </tr>
        </thead>
        <tbody id="resultsBody">
          ${testRows || `
          <tr><td colspan="5" style="padding:40px;text-align:center;color:#6b7280;">
            No test results found. Run the Appium tests first.
          </td></tr>`}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:24px 0;color:#374151;font-size:13px;border-top:1px solid #1f2937;">
    Generated by AgroSmartHub E2E Reporter • ${new Date().toISOString()} •
    <a href="https://webdriver.io" style="color:#22c55e;text-decoration:none;">WebdriverIO</a> +
    <a href="https://appium.io" style="color:#22c55e;text-decoration:none;">Appium</a>
  </div>
</div>

<script>
function toggleDetail(i) {
  const row = document.getElementById('detail-' + i);
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}
function filterTests(status) {
  const rows = document.querySelectorAll('.test-row');
  rows.forEach(row => {
    const detailId = 'detail-' + row.rowIndex;
    const s = row.getAttribute('data-status');
    const show = status === 'all' || s === status || (status === 'skipped' && s === 'broken');
    row.style.display = show ? '' : 'none';
    // Also hide detail row when filtering
    const detail = document.getElementById('detail-' + (row.rowIndex - 1));
    if (detail) detail.style.display = 'none';
  });
}
</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Main ────────────────────────────────────────────────────
function main() {
  const results  = parseAllureResults();
  const summary  = buildSummary(results);
  const buildNum = process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER || '001';
  const runDate  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = generateHTML(results, summary, buildNum, runDate);
  fs.writeFileSync(OUT_FILE, html, 'utf8');

  console.log('\n📊 HTML Report Generated');
  console.log(`   Output  : ${OUT_FILE}`);
  console.log(`   Tests   : ${summary.total} total`);
  console.log(`   Passed  : ${summary.passed}`);
  console.log(`   Failed  : ${summary.failed}`);
  console.log(`   Skipped : ${summary.skipped}`);
  console.log(`   Rate    : ${summary.passRate}%\n`);
}

main();
