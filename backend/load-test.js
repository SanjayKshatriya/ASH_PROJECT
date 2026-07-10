const autocannon = require('autocannon');

console.log('🚀 Starting Baseline Load Test for AgroSmartHub...');
console.log('Target: 100 concurrent virtual users for 1 minute');
console.log('Endpoint: GET http://localhost:5000/api/health\n');

const instance = autocannon({
  url: 'http://localhost:5000/api/health',
  connections: 100, // 100 virtual users
  duration: 60,     // 1 minute
  pipelining: 1,    // default
}, (err, result) => {
  if (err) {
    console.error('Error running test:', err);
    return;
  }
  
  console.log('\n✅ Load Test Completed!\n');
  console.log('--- TEST RESULTS ---');
  console.log(`Requests sent: ${result.requests.total}`);
  console.log(`Requests per second (RPS): ${Math.round(result.requests.average)} req/sec`);
  console.log(`Errors/Timeouts: ${result.errors + result.timeouts}`);
  console.log('\n--- RESPONSE TIMES ---');
  console.log(`Min: ${result.latency.min} ms`);
  console.log(`Average: ${result.latency.average} ms`);
  console.log(`Max: ${result.latency.max} ms`);
  console.log(`p99 (99% of requests faster than): ${result.latency.p99} ms`);
  
  console.log('\n--- THROUGHPUT ---');
  console.log(`Average data transfer: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
});

// Display real-time progress
autocannon.track(instance, { renderProgressBar: true });
