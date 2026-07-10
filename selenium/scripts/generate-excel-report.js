const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const resultsPath = path.join(__dirname, '../results.json');
const outDir = path.join(__dirname, '../../Test Results/Excel');
const outFile = path.join(outDir, 'Automation_Test_Report.xlsx');

async function generateExcel() {
  if (!fs.existsSync(resultsPath)) {
    console.error('results.json not found!');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const stats = results.stats;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AgroSmartHub CI';
  
  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  
  summarySheet.addRows([
    { metric: 'Total Tests', value: stats.tests },
    { metric: 'Passed', value: stats.passes },
    { metric: 'Failed', value: stats.failures },
    { metric: 'Duration (s)', value: (stats.duration / 1000).toFixed(2) },
    { metric: 'Pass Percentage', value: `${((stats.passes / stats.tests) * 100).toFixed(2)}%` }
  ]);

  // Format summary headers
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

  // Sheet 2: Test Details
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.columns = [
    { header: 'Suite', key: 'suite', width: 30 },
    { header: 'Test Name', key: 'testName', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error', key: 'error', width: 50 }
  ];

  detailsSheet.getRow(1).font = { bold: true };
  detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

  // Process all tests
  const allTests = [...results.passes, ...results.failures];
  
  allTests.forEach(test => {
    const isPass = !test.err || Object.keys(test.err).length === 0;
    const suiteName = test.fullTitle.replace(test.title, '').trim();
    
    const row = detailsSheet.addRow({
      suite: suiteName,
      testName: test.title,
      status: isPass ? 'PASS' : 'FAIL',
      duration: test.duration || 0,
      error: isPass ? '' : test.err.message
    });

    // Color code status
    const statusCell = row.getCell(3);
    statusCell.font = { 
      color: { argb: isPass ? 'FF008000' : 'FFFF0000' },
      bold: true
    };
  });

  fs.mkdirSync(outDir, { recursive: true });
  await workbook.xlsx.writeFile(outFile);
  console.log('✅ Excel Report generated at:', outFile);
}

generateExcel();
