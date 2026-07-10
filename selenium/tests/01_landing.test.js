const { expect } = require('chai');
const { buildDriver } = require('../config/driver');
const LandingPage = require('../pages/LandingPage');

describe('01 - Landing Page Tests', function () {
  let driver;
  let landingPage;

  before(async function () {
    driver = await buildDriver();
    landingPage = new LandingPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should load the landing page successfully', async function () {
    await landingPage.open();
    const title = await landingPage.getText(landingPage.heroTitle);
    expect(title).to.include('Smart Farming');
  });

  it('should display the core features section', async function () {
    const features = await landingPage.waitForElement(landingPage.featuresSection);
    const isDisplayed = await features.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('should take a screenshot of the landing page', async function () {
    await landingPage.captureScreenshot('landing_page_load');
  });
});
