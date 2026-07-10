const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LandingPage extends BasePage {
  // Locators
  get heroTitle() { return By.css('.hero-title'); }
  get signInBtn() { return By.xpath('//button[contains(text(), "Sign In")]'); }
  get getStartedBtn() { return By.xpath('//button[contains(text(), "Get Started")]'); }
  get featuresSection() { return By.id('features'); }
  get testimonialsSection() { return By.id('testimonials'); }

  async open() {
    await this.navigate('index.html');
  }

  async clickSignIn() {
    await this.click(this.signInBtn);
  }

  async clickGetStarted() {
    await this.click(this.getStartedBtn);
  }
}

module.exports = LandingPage;
