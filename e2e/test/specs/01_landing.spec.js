// ============================================================
// AgroSmartHub 3.0 — E2E Test Suite 01: Landing Page
// ============================================================

const { expect } = require('chai');

describe('Landing Page', () => {

  before(async () => {
    await browser.url('/');
    await browser.pause(2000); // Let JS initialize
  });

  // ─────────────────────────────────────────────────────────
  it('should load the landing page with correct title', async () => {
    const title = await browser.getTitle();
    expect(title).to.include('AgroSmartHub');
  });

  it('should display the main navigation bar', async () => {
    const nav = await $('nav.land-nav');
    expect(await nav.isDisplayed()).to.be.true;
  });

  it('should show the logo with text "AgroSmartHub"', async () => {
    const logoPrimary = await $('.logo-primary');
    const logoText = await logoPrimary.getText();
    expect(logoText).to.include('AgroSmart');
  });

  it('should display the hero heading', async () => {
    // Wait for the hero section to be visible
    await browser.waitUntil(
      async () => (await $('#landingPage')).isDisplayed(),
      { timeout: 10000, timeoutMsg: 'Landing page not visible' }
    );
    const landing = await $('#landingPage');
    expect(await landing.isDisplayed()).to.be.true;
  });

  it('should have Features navigation link', async () => {
    const featuresLink = await $('a[href="#features"]');
    expect(await featuresLink.isExisting()).to.be.true;
    expect(await featuresLink.getText()).to.equal('Features');
  });

  it('should have How It Works navigation link', async () => {
    const howLink = await $('a[href="#how-it-works"]');
    expect(await howLink.isExisting()).to.be.true;
    expect(await howLink.getText()).to.include('How It Works');
  });

  it('should scroll smoothly to features section on nav click', async () => {
    const featuresLink = await $('a[href="#features"]');
    await featuresLink.click();
    await browser.pause(1000);
    // Verify we're still on the same page (SPA)
    const url = await browser.getUrl();
    expect(url).to.include('#features');
  });

  it('should display a call-to-action button', async () => {
    await browser.url('/');
    await browser.pause(1500);
    // CTA button — "Get Started" or "Login" type button in nav
    const ctaArea = await $('.nav-cta');
    expect(await ctaArea.isExisting()).to.be.true;
  });

  it('should show ambient background elements', async () => {
    const ambientBg = await $('.ambient-bg');
    expect(await ambientBg.isExisting()).to.be.true;
  });

  it('should render within 5 seconds (performance check)', async () => {
    const start = Date.now();
    await browser.url('/');
    await browser.waitUntil(
      async () => (await $('nav.land-nav')).isDisplayed(),
      { timeout: 5000, timeoutMsg: 'Page did not load within 5 seconds' }
    );
    const elapsed = Date.now() - start;
    console.log(`   ⏱ Page load time: ${elapsed}ms`);
    expect(elapsed).to.be.lessThan(5000);
  });
});
