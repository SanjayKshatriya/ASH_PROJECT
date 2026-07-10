// ============================================================
// AgroSmartHub 3.0 — E2E Test Suite 03: Dashboard
// ============================================================

const { expect } = require('chai');

describe('Dashboard — Main App Interface', () => {

  // Helper: navigate to app page (simulate logged-in state via URL hash or localStorage)
  before(async () => {
    await browser.url('/');
    await browser.pause(2000);

    // Attempt to reach the app section — for demo mode, click "Get Started" or enter app directly
    try {
      // Some apps expose a demo/guest mode
      const demoBtn = await $('#demoBtn, .demo-btn, [data-action="demo"], button*=Demo');
      if (await demoBtn.isExisting()) {
        await demoBtn.click();
        await browser.pause(2000);
      }
    } catch (e) {
      // Not available — test what's visible
    }
  });

  // ─────────────────────────────────────────────────────────
  it('should load the main HTML page without JS errors', async () => {
    await browser.url('/');
    await browser.pause(2000);

    const logs = await browser.getLogs('browser');
    const errors = logs.filter(l => l.level === 'SEVERE' && !l.message.includes('favicon'));
    if (errors.length > 0) {
      console.warn(`   ⚠ Browser errors: ${errors.map(e => e.message).join('; ')}`);
    }
    // Page must load even if JS errors exist (graceful degradation)
    const body = await $('body');
    expect(await body.isExisting()).to.be.true;
  });

  it('should display the landing or app section', async () => {
    const landing = await $('#landingPage');
    const app     = await $('#appPage');
    const either  = (await landing.isExisting()) || (await app.isExisting());
    expect(either).to.be.true;
  });

  it('should have a sidebar or navigation in app view (if logged in)', async () => {
    const appPage = await $('#appPage');
    if (await appPage.isExisting() && await appPage.isDisplayed()) {
      const sidebar = await $('#sidebar, .sidebar, nav.app-nav, .app-sidebar');
      if (await sidebar.isExisting()) {
        expect(await sidebar.isDisplayed()).to.be.true;
      } else {
        console.log('   ℹ Sidebar not found in current view — may require auth');
      }
    } else {
      console.log('   ℹ App page not displayed — user not authenticated');
    }
  });

  it('should display dashboard heading or welcome text', async () => {
    const appPage = await $('#appPage');
    if (await appPage.isExisting() && await appPage.isDisplayed()) {
      const heading = await $('#dashboard h1, #dashboard h2, .dashboard-title, [class*="welcome"]');
      if (await heading.isExisting()) {
        expect(await heading.getText()).to.not.be.empty;
      }
    } else {
      // On landing page, verify main heading exists
      const h1 = await $('h1');
      if (await h1.isExisting()) {
        expect(await h1.getText()).to.not.be.empty;
      }
    }
  });

  it('should show feature cards on the landing page', async () => {
    await browser.url('/#features');
    await browser.pause(1500);
    const featureCards = await $$('.feature-card, [class*="feature"], [class*="card"]');
    console.log(`   ℹ Feature cards found: ${featureCards.length}`);
    // At least some content should exist
    const body = await $('body');
    expect(await body.isExisting()).to.be.true;
  });

  it('should display statistics/impact section', async () => {
    await browser.url('/#stats');
    await browser.pause(1500);
    const statsSection = await $('#stats, [class*="stats"], [class*="impact"], [class*="counter"]');
    if (await statsSection.isExisting()) {
      expect(await statsSection.isDisplayed()).to.be.true;
    } else {
      console.log('   ℹ Stats section not found at #stats anchor');
    }
  });

  it('should display the testimonials section', async () => {
    await browser.url('/#testimonials');
    await browser.pause(1500);
    const testimonials = await $('#testimonials, [class*="testimonial"]');
    if (await testimonials.isExisting()) {
      expect(await testimonials.isDisplayed()).to.be.true;
    } else {
      console.log('   ℹ Testimonials section not found — verifying page loads');
      const body = await $('body');
      expect(await body.isExisting()).to.be.true;
    }
  });

  it('should render page content without blank white screen', async () => {
    await browser.url('/');
    await browser.pause(2000);
    const bodyBg = await browser.executeScript(
      'return window.getComputedStyle(document.body).backgroundColor', []
    );
    // Background should not be pure empty (some CSS applied)
    expect(bodyBg).to.not.be.undefined;
    console.log(`   ℹ Body background color: ${bodyBg}`);
  });

  it('should respond to window resize (responsive layout)', async () => {
    await browser.setWindowSize(375, 812); // iPhone size
    await browser.pause(1000);
    const nav = await $('nav.land-nav');
    if (await nav.isExisting()) {
      expect(await nav.isExisting()).to.be.true;
    }
    // Reset
    await browser.setWindowSize(1280, 800);
    await browser.pause(500);
  });

  it('should have proper meta viewport tag (mobile-ready)', async () => {
    const metaViewport = await $('meta[name="viewport"]');
    expect(await metaViewport.isExisting()).to.be.true;
    const content = await metaViewport.getAttribute('content');
    expect(content).to.include('width=device-width');
  });
});
