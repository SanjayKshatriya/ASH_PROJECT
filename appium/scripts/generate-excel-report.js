const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');

async function generateExcelReport() {
    const reportDir = path.join(__dirname, '..', 'reports');
    
    // Ensure reports dir exists
    if (!fs.existsSync(reportDir)) {
        console.log('No reports directory found. Make sure tests have run and generated JSON reports.');
        return;
    }

    const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.log('No JSON reports found in the reports directory.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Appium E2E Test Results');

    // Header styling
    sheet.columns = [
        { header: 'Test Suite', key: 'suite', width: 30 },
        { header: 'Test Name', key: 'name', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Duration (ms)', key: 'duration', width: 15 },
        { header: 'Error', key: 'error', width: 50 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };

    // Process all JSON reports (WDIO creates one per runner/worker)
    let totalPassed = 0;
    let totalFailed = 0;

    files.forEach(file => {
        const data = fs.readJsonSync(path.join(reportDir, file));
        
        if (data.suites) {
            data.suites.forEach(suite => {
                suite.tests.forEach(test => {
                    const status = test.state;
                    if (status === 'passed') totalPassed++;
                    if (status === 'failed') totalFailed++;

                    const row = sheet.addRow({
                        suite: suite.name,
                        name: test.name,
                        status: status ? status.toUpperCase() : 'UNKNOWN',
                        duration: test.duration,
                        error: test.error ? test.error.message : ''
                    });

                    // Color code status
                    if (status === 'passed') {
                        row.getCell('status').font = { color: { argb: 'FF16A34A' }, bold: true };
                    } else if (status === 'failed') {
                        row.getCell('status').font = { color: { argb: 'FFEF4444' }, bold: true };
                    }
                });
            });
        }
    });

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 15 }
    ];
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.addRow({ metric: 'Total Passed', value: totalPassed });
    summarySheet.addRow({ metric: 'Total Failed', value: totalFailed });
    summarySheet.addRow({ metric: 'Total Executed', value: totalPassed + totalFailed });

    const outputPath = path.join(reportDir, 'Appium_Test_Report.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`✅ Excel report generated successfully: ${outputPath}`);
}

generateExcelReport().catch(err => {
    console.error('Error generating report:', err);
});
