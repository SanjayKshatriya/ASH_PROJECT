const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  // Locators
  get sidebar() { return By.id('sidebar'); }
  get userName() { return By.css('.user-name-sm'); }
  get loadingOverlay() { return By.id('appLoading'); }
  get appShell() { return By.id('appShell'); }
  
  // Specific sections we can check to ensure the dashboard loaded
  get revenueCard() { return By.xpath('//*[contains(text(), "Total Revenue")]'); }
  get activeCropsCard() { return By.xpath('//*[contains(text(), "Active Crops")]'); }
  get sidebarMarketplace() { return By.xpath('//*[@id="sidebarNav"]//div[contains(text(), "Marketplace")]/..'); }
  get sidebarCropHealth() { return By.xpath('//*[@id="sidebarNav"]//div[contains(text(), "AI Crop Health")]/..'); }
  get marketplaceView() { return By.id('marketplaceView'); }
  get aiDetectionView() { return By.id('aiDetectionView'); }
  async waitForDashboardLoad() {
    // Wait for the loading overlay to disappear
    await this.driver.wait(async () => {
      const display = await this.driver.findElement(this.loadingOverlay).getCssValue('display');
      return display === 'none';
    }, 10000, 'Dashboard loading overlay did not disappear');

    // Wait for app shell to be visible
    await this.waitForElement(this.appShell, 5000);
    await this.waitForElement(this.sidebar, 5000);
  }

  async getLoggedInUserName() {
    return await this.getText(this.userName);
  }

  async isDashboardVisible() {
    const el = await this.waitForElement(this.sidebar);
    return await el.isDisplayed();
  }

  async navigateToMarketplace() {
    await this.click(this.sidebarMarketplace);
    await this.waitForElement(this.marketplaceView, 5000);
  }

  async navigateToCropHealth() {
    await this.click(this.sidebarCropHealth);
    await this.waitForElement(this.aiDetectionView, 5000);
  }
}

module.exports = DashboardPage;
