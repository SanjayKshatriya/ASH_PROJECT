const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  // Locators
  get authOverlay() { return By.id('authOverlay'); }
  get loginModalTitle() { return By.xpath('//h2[contains(text(), "Welcome Back")]'); }
  
  // Demo Login Buttons
  get farmerDemoBtn() { return By.xpath('//button[contains(@onclick, "demoLogin(\'farmer\')")]'); }
  get buyerDemoBtn() { return By.xpath('//button[contains(@onclick, "demoLogin(\'buyer\')")]'); }

  async waitForModal() {
    await this.waitForElement(this.authOverlay);
    await this.waitForElement(this.loginModalTitle);
    // Add small sleep to allow css transitions to complete
    await this.driver.sleep(500); 
  }

  async clickFarmerDemo() {
    await this.click(this.farmerDemoBtn);
  }
}

module.exports = LoginPage;
