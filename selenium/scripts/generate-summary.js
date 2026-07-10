const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../results.json');
const outDir = path.join(__dirname, '../../Test Results/Summary');
const outFile = path.join(outDir, 'summary.md');

function generateSummary() {
  if (!fs.existsSync(resultsPath)) {
    console.error('results.json not found!');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const stats = results.stats;
  const passPercentage = ((stats.passes / stats.tests) * 100).toFixed(2);
  
  // Extract deployed URL from env, or default
  const deployUrl = process.env.BASE_URL || 'http://localhost:5000';

  let failedTestsList = '';
  if (results.failures.length > 0) {
    failedTestsList = results.failures.map(test => 
      `- **${test.title}**\n  - Failure Reason: \`${test.err.message}\``
    ).join('\n');
  } else {
    failedTestsList = '*None. All tests passed!* 🎉';
  }

  const summaryMarkdown = `# Live GitHub Pages E2E Test Summary

**Deployment URL:**
${deployUrl}

**Total Tests:** ${stats.tests}
**Passed:** ${stats.passes}
**Failed:** ${stats.failures}
**Skipped:** ${stats.pending}
**Pass Percentage:** ${passPercentage}%

### Failed Tests:
${failedTestsList}

---
*Generated automatically by AgroSmartHub CI*
`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, summaryMarkdown);
  console.log('✅ Summary Markdown generated at:', outFile);

  // If running in GitHub Actions, append to step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
  }
}

generateSummary();
