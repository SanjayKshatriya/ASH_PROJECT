const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../results.json');
const outDir = path.join(__dirname, '../../Test Results/HTML');
const outFile = path.join(outDir, 'execution-report.html');

function generateHTML() {
  if (!fs.existsSync(resultsPath)) {
    console.error('results.json not found!');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const stats = results.stats;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selenium Automation Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; flex: 1; text-align: center; border: 1px solid #e5e7eb; }
    .stat-card.pass { border-color: #10b981; color: #047857; }
    .stat-card.fail { border-color: #ef4444; color: #b91c1c; }
    .stat-card h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-card p { margin: 0; font-size: 32px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
    th { background-color: #f9fafb; font-weight: 600; color: #4b5563; }
    .status-pass { color: #10b981; font-weight: bold; }
    .status-fail { color: #ef4444; font-weight: bold; }
    .suite-name { font-weight: bold; background: #f3f4f6; padding: 10px 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Selenium E2E Execution Report</h1>
    
    <div class="summary">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <p>${stats.tests}</p>
      </div>
      <div class="stat-card pass">
        <h3>Passed</h3>
        <p>${stats.passes}</p>
      </div>
      <div class="stat-card fail">
        <h3>Failed</h3>
        <p>${stats.failures}</p>
      </div>
      <div class="stat-card">
        <h3>Duration</h3>
        <p>${(stats.duration / 1000).toFixed(2)}s</p>
      </div>
    </div>

    <h2>Test Details</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        ${results.passes.map(test => `
        <tr>
          <td>${test.fullTitle}</td>
          <td class="status-pass">PASS</td>
          <td>${test.duration}ms</td>
          <td>-</td>
        </tr>`).join('')}
        ${results.failures.map(test => `
        <tr>
          <td>${test.fullTitle}</td>
          <td class="status-fail">FAIL</td>
          <td>${test.duration}ms</td>
          <td style="color:red; font-size:12px;">${test.err.message}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, html);
  console.log('✅ HTML Report generated at:', outFile);
}

generateHTML();
