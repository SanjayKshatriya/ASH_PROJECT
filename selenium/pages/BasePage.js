const { By, until } = require('selenium-webdriver');
const fs = require('fs-extra');
const path = require('path');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    // Default to localhost if BASE_URL is not set
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  }

  async navigate(path = '') {
    // Strip trailing slashes from baseUrl, and leading slashes from path
    const url = `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    await this.driver.get(url);
  }

  async waitForElement(locator, timeout = 5000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async click(locator) {
    const el = await this.waitForElement(locator);
    await this.driver.wait(until.elementIsVisible(el), 5000);
    await this.driver.wait(until.elementIsEnabled(el), 5000);
    await el.click();
  }

  async type(locator, text) {
    const el = await this.waitForElement(locator);
    await this.driver.wait(until.elementIsVisible(el), 5000);
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await this.waitForElement(locator);
    return await el.getText();
  }

  async captureScreenshot(testName) {
    const screenshotDir = path.join(__dirname, '../../Test Results/Screenshots');
    await fs.ensureDir(screenshotDir);
    
    const image = await this.driver.takeScreenshot();
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(screenshotDir, `${safeName}_${Date.now()}.png`);
    
    await fs.writeFile(filePath, image, 'base64');
    return filePath;
  }
}

module.exports = BasePage;
