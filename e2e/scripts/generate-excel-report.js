#!/usr/bin/env node
// ============================================================
// AgroSmartHub 3.0 — Excel Report Generator
// Reads Allure JSON results → Automation_Test_Report.xlsx
// ============================================================

'use strict';

const ExcelJS = require('exceljs');
const fs      = require('fs-extra');
const path    = require('path');

// ─── Paths ───────────────────────────────────────────────────
const ALLURE_DIR = path.resolve(__dirname, '..', 'allure-results');
const OUT_DIR    = path.resolve(__dirname, '..', '..', 'Test Results', 'Excel');
const OUT_FILE   = path.join(OUT_DIR, 'Automation_Test_Report.xlsx');

fs.ensureDirSync(OUT_DIR);

// ─── Parse Allure Results ────────────────────────────────────
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
        start:    data.start || Date.now(),
        stop:     data.stop  || Date.now()
      });
    } catch (e) {
      console.warn(`⚠ Could not parse ${file}: ${e.message}`);
    }
  }
  return results.sort((a, b) => a.start - b.start);
}

function fmtDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

// ─── Color Palette ───────────────────────────────────────────
const COLORS = {
  headerBg:    '1F2937',
  headerFont:  'F9FAFB',
  pass:        'D1FAE5', // green tint
  passFont:    '065F46',
  fail:        'FEE2E2', // red tint
  failFont:    '7F1D1D',
  skip:        'FEF3C7', // yellow tint
  skipFont:    '78350F',
  unknown:     'F3F4F6',
  unknownFont: '374151',
  titleBg:     '064E3B',
  titleFont:   'ECFDF5',
  accent:      '16A34A',
  border:      'D1D5DB'
};

function rowStyle(status) {
  switch (status) {
    case 'passed':  return { bg: COLORS.pass,    font: COLORS.passFont };
    case 'failed':  return { bg: COLORS.fail,    font: COLORS.failFont };
    case 'skipped':
    case 'broken':  return { bg: COLORS.skip,    font: COLORS.skipFont };
    default:        return { bg: COLORS.unknown,  font: COLORS.unknownFont };
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  const results  = parseAllureResults();
  const total    = results.length;
  const passed   = results.filter(r => r.status === 'passed').length;
  const failed   = results.filter(r => r.status === 'failed').length;
  const skipped  = results.filter(r => ['skipped','broken'].includes(r.status)).length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const duration = results.reduce((s, r) => s + r.duration, 0);
  const buildNum = process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER || '001';
  const runDate  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const wb = new ExcelJS.Workbook();
  wb.creator  = 'AgroSmartHub E2E Reporter';
  wb.created  = new Date();
  wb.modified = new Date();

  // ─────────────────────────────────────────────────────────
  // SHEET 1: Executive Summary
  // ─────────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FF' + COLORS.accent } }
  });

  ws1.columns = [
    { key: 'label', width: 30 },
    { key: 'value', width: 35 }
  ];

  // Title block
  const titleCell = ws1.getCell('A1');
  titleCell.value = '🌾 AgroSmartHub 3.0 — E2E Test Summary';
  titleCell.font  = { bold: true, size: 16, color: { argb: 'FF' + COLORS.titleFont } };
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.mergeCells('A1:B1');
  ws1.getRow(1).height = 36;

  // Blank row
  ws1.addRow([]);

  // Summary rows
  const summaryData = [
    ['Build Number',     `#${buildNum}`],
    ['Execution Date',   runDate],
    ['Platform',         'Android Chrome (Emulator)'],
    ['Framework',        'Appium + WebdriverIO + Mocha'],
    ['Base URL',         process.env.BASE_URL || 'http://10.0.2.2:5000'],
    [],
    ['Total Tests',      total],
    ['Passed',           passed],
    ['Failed',           failed],
    ['Skipped / Broken', skipped],
    ['Pass Rate',        `${passRate}%`],
    ['Total Duration',   fmtDuration(duration)],
    [],
    ['Result',           parseFloat(passRate) >= 80 ? '✅ OVERALL PASS' : '❌ OVERALL FAIL']
  ];

  for (const [label, value] of summaryData) {
    const row = ws1.addRow([label, value]);

    if (!label) continue; // blank row

    const labelCell = row.getCell(1);
    const valueCell = row.getCell(2);

    labelCell.font = { bold: true, color: { argb: 'FF374151' } };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };

    if (label === 'Result') {
      const isPass = parseFloat(passRate) >= 80;
      valueCell.font = { bold: true, color: { argb: 'FF' + (isPass ? COLORS.passFont : COLORS.failFont) } };
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + (isPass ? COLORS.pass : COLORS.fail) } };
    } else if (['Passed'].includes(label)) {
      valueCell.font = { bold: true, color: { argb: 'FF' + COLORS.passFont } };
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.pass } };
    } else if (['Failed'].includes(label)) {
      valueCell.font = { bold: true, color: { argb: 'FF' + COLORS.failFont } };
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.fail } };
    } else if (['Pass Rate'].includes(label)) {
      valueCell.font = { bold: true, size: 12 };
    } else {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }

    // Border
    for (const c of [labelCell, valueCell]) {
      c.border = {
        top:    { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left:   { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right:  { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    }
  }

  // ─────────────────────────────────────────────────────────
  // SHEET 2: Detailed Results
  // ─────────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Detailed Results', {
    properties: { tabColor: { argb: 'FFEF4444' } },
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  ws2.columns = [
    { header: '#',           key: 'num',      width: 6  },
    { header: 'Test Name',   key: 'name',     width: 52 },
    { header: 'Suite',       key: 'suite',    width: 28 },
    { header: 'Status',      key: 'status',   width: 12 },
    { header: 'Duration',    key: 'duration', width: 14 },
    { header: 'Start Time',  key: 'start',    width: 22 },
    { header: 'End Time',    key: 'end',      width: 22 },
    { header: 'Error / Note',key: 'message',  width: 60 }
  ];

  // Style header row
  const headerRow = ws2.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell(cell => {
    cell.font  = { bold: true, color: { argb: 'FF' + COLORS.headerFont }, size: 12 };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF' + COLORS.accent } }
    };
  });

  // Data rows
  results.forEach((r, idx) => {
    const statusLabel = r.status.toUpperCase();
    const row = ws2.addRow({
      num:      idx + 1,
      name:     r.name,
      suite:    r.suite,
      status:   statusLabel,
      duration: fmtDuration(r.duration),
      start:    fmtDate(r.start),
      end:      fmtDate(r.stop),
      message:  r.message.substring(0, 500) // truncate very long errors
    });

    const style = rowStyle(r.status);
    row.height = 22;

    row.eachCell((cell, colNum) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + style.bg } };
      cell.font = { color: { argb: 'FF' + style.font } };
      cell.alignment = { vertical: 'middle', wrapText: colNum === 8 };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left:   { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right:  { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });

    // Center specific columns
    for (const col of [1, 4, 5]) {
      row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  // Add autofilter
  ws2.autoFilter = { from: 'A1', to: 'H1' };

  // ─────────────────────────────────────────────────────────
  // SHEET 3: Suite Summary
  // ─────────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet('Suite Summary', {
    properties: { tabColor: { argb: 'FFF59E0B' } }
  });

  ws3.columns = [
    { header: 'Suite Name', key: 'suite',    width: 35 },
    { header: 'Total',      key: 'total',    width: 10 },
    { header: 'Passed',     key: 'passed',   width: 10 },
    { header: 'Failed',     key: 'failed',   width: 10 },
    { header: 'Skipped',    key: 'skipped',  width: 10 },
    { header: 'Pass Rate',  key: 'passRate', width: 14 }
  ];

  // Header
  ws3.getRow(1).height = 28;
  ws3.getRow(1).eachCell(cell => {
    cell.font  = { bold: true, color: { argb: 'FF' + COLORS.headerFont }, size: 12 };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Suite data
  const suiteMap = {};
  for (const r of results) {
    if (!suiteMap[r.suite]) suiteMap[r.suite] = [];
    suiteMap[r.suite].push(r);
  }

  for (const [suite, tests] of Object.entries(suiteMap)) {
    const p   = tests.filter(t => t.status === 'passed').length;
    const f   = tests.filter(t => t.status === 'failed').length;
    const s   = tests.filter(t => ['skipped','broken'].includes(t.status)).length;
    const pct = tests.length > 0 ? `${((p / tests.length) * 100).toFixed(1)}%` : '0.0%';

    const row = ws3.addRow({ suite, total: tests.length, passed: p, failed: f, skipped: s, passRate: pct });
    row.height = 22;
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.pass } };
    row.getCell(3).font = { color: { argb: 'FF' + COLORS.passFont }, bold: true };
    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.fail } };
    row.getCell(4).font = { color: { argb: 'FF' + COLORS.failFont }, bold: true };
    row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.skip } };
    row.getCell(5).font = { color: { argb: 'FF' + COLORS.skipFont }, bold: true };
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  }

  // ─── Write File ──────────────────────────────────────────
  await wb.xlsx.writeFile(OUT_FILE);

  console.log('\n📊 Excel Report Generated');
  console.log(`   Output: ${OUT_FILE}`);
  console.log(`   Sheets: Summary | Detailed Results | Suite Summary\n`);
}

main().catch(err => {
  console.error('❌ Excel report generation failed:', err.message);
  process.exit(1);
});
