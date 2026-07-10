const { expect } = require('chai');
const { buildDriver } = require('../config/driver');
const LandingPage = require('../pages/LandingPage');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('02 - Auth Flow Tests (Offline Demo)', function () {
  let driver;
  let landingPage;
  let loginPage;
  let dashboardPage;

  before(async function () {
    driver = await buildDriver();
    landingPage = new LandingPage(driver);
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should open the login modal from the landing page', async function () {
    await landingPage.open();
    await landingPage.clickSignIn();
    await loginPage.waitForModal();
    const title = await loginPage.getText(loginPage.loginModalTitle);
    expect(title).to.include('Welcome Back');
  });

  it('should take a screenshot of the login modal', async function () {
    await loginPage.captureScreenshot('login_modal');
  });

  it('should authenticate via the offline Farmer Demo button and reach dashboard', async function () {
    // Click the Quick Demo Login for Farmer
    await loginPage.clickFarmerDemo();
    
    // Wait for redirect and dashboard loading to finish
    await dashboardPage.waitForDashboardLoad();
    
    const isVisible = await dashboardPage.isDashboardVisible();
    expect(isVisible).to.be.true;
    
    const userName = await dashboardPage.getLoggedInUserName();
    expect(userName).to.equal('Ramu Kumar'); // The default offline farmer user
  });

  it('should take a screenshot of the authenticated dashboard', async function () {
    await dashboardPage.captureScreenshot('dashboard_authenticated');
  });
});
