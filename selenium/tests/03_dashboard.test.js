const { expect } = require('chai');
const { buildDriver } = require('../config/driver');
const LandingPage = require('../pages/LandingPage');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('03 - Dashboard Functionality Tests', function () {
  let driver;
  let dashboardPage;

  before(async function () {
    driver = await buildDriver();
    
    // We need to be logged in to test the dashboard, so perform the login flow first
    const landingPage = new LandingPage(driver);
    const loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    
    await landingPage.open();
    await landingPage.clickSignIn();
    await loginPage.waitForModal();
    await loginPage.clickFarmerDemo();
    await dashboardPage.waitForDashboardLoad();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should display the Revenue card', async function () {
    const revenueCard = await dashboardPage.waitForElement(dashboardPage.revenueCard);
    const isDisplayed = await revenueCard.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should display the Active Crops card', async function () {
    const cropsCard = await dashboardPage.waitForElement(dashboardPage.activeCropsCard);
    const isDisplayed = await cropsCard.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should navigate to the Marketplace successfully', async function () {
    await dashboardPage.navigateToMarketplace();
    const marketplaceView = await dashboardPage.waitForElement(dashboardPage.marketplaceView);
    const isDisplayed = await marketplaceView.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should navigate to AI Crop Health Detection successfully', async function () {
    await dashboardPage.navigateToCropHealth();
    const cropHealthView = await dashboardPage.waitForElement(dashboardPage.aiDetectionView);
    const isDisplayed = await cropHealthView.isDisplayed();
    expect(isDisplayed).to.be.true;
  });
});
