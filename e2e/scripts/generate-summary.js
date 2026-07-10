#!/usr/bin/env node
// ============================================================
// AgroSmartHub 3.0 — Summary.md + GitHub Actions Summary Generator
// ============================================================

'use strict';

const fs   = require('fs-extra');
const path = require('path');

const ALLURE_DIR = path.resolve(__dirname, '..', 'allure-results');
const OUT_DIR    = path.resolve(__dirname, '..', '..', 'Test Results', 'Summary');
const OUT_FILE   = path.join(OUT_DIR, 'summary.md');

fs.ensureDirSync(OUT_DIR);

function parseAllureResults() {
  const results = [];
  if (!fs.existsSync(ALLURE_DIR)) return results;

  const files = fs.readdirSync(ALLURE_DIR).filter(f => f.endsWith('-result.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(ALLURE_DIR, file), 'utf8'));
      results.push({
        name:     data.name || 'Unknown Test',
        suite:    (data.labels || []).find(l => l.name === 'suite')?.value || 'General',
        status:   data.status || 'unknown',
        duration: data.stop && data.start ? data.stop - data.start : 0,
        message:  data.statusDetails?.message || '',
        start:    data.start || Date.now()
      });
    } catch (e) {
      // Skip malformed files
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

function fmtDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function statusEmoji(status) {
  switch (status) {
    case 'passed':  return '✅';
    case 'failed':  return '❌';
    case 'skipped': return '⏭';
    case 'broken':  return '⚠️';
    default:        return '❓';
  }
}

function main() {
  const results  = parseAllureResults();
  const total    = results.length;
  const passed   = results.filter(r => r.status === 'passed').length;
  const failed   = results.filter(r => r.status === 'failed').length;
  const skipped  = results.filter(r => ['skipped','broken'].includes(r.status)).length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const duration = results.reduce((s, r) => s + r.duration, 0);
  const buildNum = process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER || '001';
  const username = process.env.GITHUB_REPOSITORY_OWNER || 'YOUR_USERNAME';
  const repoName = (process.env.GITHUB_REPOSITORY || 'YOUR_USERNAME/YOUR_REPO').split('/')[1] || 'YOUR_REPO';
  const runDate  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const reportUrl = `https://${username}.github.io/${repoName}/reports/latest/execution-report.html`;

  // ─── Build overall result badge ─────────────────────────
  const overallPass = parseFloat(passRate) >= 80;
  const resultBadge = overallPass ? '🟢 **OVERALL PASS**' : '🔴 **OVERALL FAIL**';

  // ─── Suite breakdown ────────────────────────────────────
  const suiteMap = {};
  for (const r of results) {
    if (!suiteMap[r.suite]) suiteMap[r.suite] = [];
    suiteMap[r.suite].push(r);
  }

  const suiteTable = Object.entries(suiteMap).map(([suite, tests]) => {
    const p   = tests.filter(t => t.status === 'passed').length;
    const f   = tests.filter(t => t.status === 'failed').length;
    const s   = tests.filter(t => ['skipped','broken'].includes(t.status)).length;
    const pct = tests.length > 0 ? `${((p / tests.length) * 100).toFixed(1)}%` : '0.0%';
    return `| ${suite} | ${tests.length} | ${p} | ${f} | ${s} | ${pct} |`;
  }).join('\n');

  // ─── Detailed results table ──────────────────────────────
  const detailRows = results.map((r, i) =>
    `| ${i+1} | ${statusEmoji(r.status)} | ${r.name} | ${r.suite} | ${fmtDuration(r.duration)} | ${r.message ? r.message.substring(0,80) + '...' : '-'} |`
  ).join('\n');

  // ─── Failed tests section ────────────────────────────────
  const failedTests = results.filter(r => r.status === 'failed');
  const failedSection = failedTests.length > 0 ? `
## ❌ Failed Tests

${failedTests.map(r => `
### ${r.name}
- **Suite**: ${r.suite}
- **Duration**: ${fmtDuration(r.duration)}
- **Error**: \`${r.message.substring(0, 200)}\`
`).join('\n')}` : '';

  // ─── Generate Markdown ──────────────────────────────────
  const md = `# 🌾 AgroSmartHub 3.0 — Android Appium E2E Test Summary

> ${resultBadge}

## 📊 Run Information

| Property | Value |
|----------|-------|
| **Build Number** | #${buildNum} |
| **Execution Date** | ${runDate} |
| **Platform** | Android Chrome (Emulator) |
| **Framework** | Appium + WebdriverIO + Mocha |
| **Total Duration** | ${fmtDuration(duration)} |

## 📈 Test Results

| Metric | Count |
|--------|-------|
| 📦 Total Tests | **${total}** |
| ✅ Passed | **${passed}** |
| ❌ Failed | **${failed}** |
| ⏭ Skipped | **${skipped}** |
| 📊 Pass Rate | **${passRate}%** |

${overallPass
  ? `> ✅ **Tests PASSED** with a ${passRate}% pass rate — above the 80% threshold.`
  : `> ❌ **Tests FAILED** with a ${passRate}% pass rate — below the 80% threshold.`
}

## 🌐 Live Report

📄 **View Full Report**: [${reportUrl}](${reportUrl})

## 📦 Suite Breakdown

| Suite | Total | Passed | Failed | Skipped | Pass Rate |
|-------|-------|--------|--------|---------|-----------|
${suiteTable || '| No suites found | 0 | 0 | 0 | 0 | 0% |'}

## 📋 All Test Results

| # | Status | Test Name | Suite | Duration | Error |
|---|--------|-----------|-------|----------|-------|
${detailRows || '| - | - | No results | - | - | - |'}
${failedSection}

---
*Generated by AgroSmartHub E2E Reporter on ${new Date().toISOString()}*
`;

  fs.writeFileSync(OUT_FILE, md, 'utf8');
  console.log(`\n📝 Summary generated: ${OUT_FILE}`);

  // ─── Also write GitHub Actions Job Summary ───────────────
  const ghSummaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (ghSummaryFile) {
    const ghSummary = `# Android Appium Test Summary

| | |
|--|--|
| **Build Number** | #${buildNum} |
| **Execution Date** | ${runDate} |
| **Total Tests** | ${total} |
| ✅ Passed | ${passed} |
| ❌ Failed | ${failed} |
| ⏭ Skipped | ${skipped} |
| **Pass Rate** | ${passRate}% |

${overallPass ? '## ✅ Result: PASS' : '## ❌ Result: FAIL'}

## 📄 Report URL
[${reportUrl}](${reportUrl})

## 📦 Suite Breakdown
| Suite | Total | Passed | Failed | Pass Rate |
|-------|-------|--------|--------|-----------|
${Object.entries(suiteMap).map(([suite, tests]) => {
  const p   = tests.filter(t => t.status === 'passed').length;
  const f   = tests.filter(t => t.status === 'failed').length;
  const pct = tests.length > 0 ? `${((p / tests.length) * 100).toFixed(1)}%` : '0%';
  return `| ${suite} | ${tests.length} | ${p} | ${f} | ${pct} |`;
}).join('\n') || '| No suites | 0 | 0 | 0 | 0% |'}
`;
    fs.appendFileSync(ghSummaryFile, ghSummary, 'utf8');
    console.log('✅ GitHub Actions Job Summary written');
  }
}

main();
