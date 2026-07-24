const fs = require('fs');
const content = fs.readFileSync(process.argv[2], 'utf8');
const jsonStr = content.split('---')[1].trim();
const data = JSON.parse(jsonStr);
const failedSteps = data.jobs[0].steps.filter(s => s.conclusion === 'failure');
console.log(JSON.stringify(failedSteps, null, 2));
