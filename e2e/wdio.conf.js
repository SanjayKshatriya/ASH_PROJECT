// ============================================================
// AgroSmartHub 3.0 — WebdriverIO + Appium Configuration
// Target: Android Emulator — Chrome Mobile Browser
// ============================================================

const path = require('path');
const fs   = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://10.0.2.2:5000';
const REPORTS_DIR = path.resolve(__dirname, '..', 'Test Results');

// Ensure output directories exist
['HTML', 'Excel', 'Screenshots', 'Logs', 'Summary'].forEach(d => {
  fs.mkdirSync(path.join(REPORTS_DIR, d), { recursive: true });
});
fs.mkdirSync(path.resolve(__dirname, 'allure-results'), { recursive: true });

exports.config = {
  // ─── Runner ───────────────────────────────────────────────
  runner: 'local',

  // ─── Appium Server ────────────────────────────────────────
  hostname: 'localhost',
  port: 4723,
  path: '/',

  // ─── Test Specs ───────────────────────────────────────────
  specs: [
    './test/specs/**/*.spec.js'
  ],
  exclude: [],

  // ─── Capabilities ─────────────────────────────────────────
  // Driving Chrome on Android emulator — correct for web apps
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': process.env.EMULATOR_NAME || 'emulator-5554',
    'appium:platformVersion': process.env.ANDROID_API || '13',
    'appium:automationName': 'UiAutomator2',
    browserName: 'Chrome',
    'appium:chromedriverAutodownload': true,
    'appium:newCommandTimeout': 300,
    'appium:adbExecTimeout': 60000,
    'appium:autoGrantPermissions': true,
    'goog:chromeOptions': {
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    }
  }],

  // ─── Services ─────────────────────────────────────────────
  services: [
    ['appium', {
      command: 'appium',
      args: {
        port: 4723,
        relaxedSecurity: true,
        log: path.join(REPORTS_DIR, 'Logs', 'appium.log')
      }
    }]
  ],

  // ─── Framework ────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1
  },

  // ─── Reporters ────────────────────────────────────────────
  reporters: [
    'spec',
    ['allure', {
      outputDir: './allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: false
    }]
  ],

  // ─── Base URL ─────────────────────────────────────────────
  baseUrl: BASE_URL,

  // ─── Log Level ────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || 'warn',
  outputDir: path.join(REPORTS_DIR, 'Logs'),

  // ─── Hooks ────────────────────────────────────────────────
  beforeTest(test) {
    // Log each test start to console
    console.log(`\n▶  ${test.parent} → ${test.title}`);
  },

  afterTest(test, context, { error, result, duration, passed, retries }) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${status}  (${duration}ms)`);

    // Capture screenshot on failure
    if (!passed) {
      const ts   = Date.now();
      const name = test.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const file = path.join(REPORTS_DIR, 'Screenshots', `FAIL_${name}_${ts}.png`);
      try {
        browser.saveScreenshot(file);
        console.log(`   📸 Screenshot saved: ${path.basename(file)}`);
      } catch (e) {
        console.warn(`   ⚠ Screenshot failed: ${e.message}`);
      }
    }
  },

  after(result) {
    const logFile = path.join(REPORTS_DIR, 'Logs', 'wdio.log');
    fs.appendFileSync(logFile, `\nTest run completed at ${new Date().toISOString()} with result: ${result}\n`);
  }
};
