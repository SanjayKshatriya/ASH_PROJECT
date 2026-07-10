const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Initialize the Selenium WebDriver
 * @returns {Promise<WebDriver>}
 */
async function buildDriver() {
  const options = new chrome.Options();
  
  // Use headless mode in CI or if specified
  if (process.env.CI || process.env.HEADLESS !== 'false') {
    options.addArguments('--headless=new');
  }
  
  // Standard CI optimization flags
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1280,1024');

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = {
  buildDriver
};
