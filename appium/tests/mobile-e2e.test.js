describe('AgroSmartHub Mobile E2E Test', () => {
    it('should load the landing page successfully on mobile', async () => {
        await browser.url('/');
        const title = await browser.getTitle();
        expect(title).toBe('AgroSmartHub 3.0');
    });

    it('should open the mobile authentication modal and attempt login', async () => {
        await browser.url('/');
        
        // On mobile, the UI might differ, but assuming the login button is accessible
        const getStartedBtn = await $('.btn-primary.pulse-btn');
        await getStartedBtn.waitForDisplayed({ timeout: 5000 });
        await getStartedBtn.click();
        
        // Wait for modal
        const emailInput = await $('#loginEmail');
        await emailInput.waitForDisplayed({ timeout: 5000 });
        
        // Fill credentials
        await emailInput.setValue('test@example.com');
        const passInput = await $('#loginPassword');
        await passInput.setValue('password123');
        
        // Click login
        const loginSubmitBtn = await $('#loginSubmitBtn');
        await loginSubmitBtn.click();
        
        // Wait for toast or redirect (this is just a skeleton for the actual test)
        await browser.pause(2000);
    });

    it('should open the mobile sidebar using hamburger menu and navigate to Marketplace', async () => {
        // Wait for dashboard to load and hamburger to be clickable
        const hamburgerBtn = await $('#hamburgerBtn');
        await hamburgerBtn.waitForDisplayed({ timeout: 10000 });
        await hamburgerBtn.click();
        
        // Wait for sidebar to be visible
        const sidebar = await $('#sidebar');
        await sidebar.waitForDisplayed({ timeout: 5000 });
        
        // Click Marketplace in sidebar
        const marketplaceLink = await $('//*[@id="sidebarNav"]//div[contains(text(), "Marketplace")]/..');
        await marketplaceLink.waitForClickable({ timeout: 5000 });
        await marketplaceLink.click();
        
        // Wait for marketplace to load
        const marketplaceView = await $('#marketplaceView');
        await marketplaceView.waitForDisplayed({ timeout: 5000 });
        
        const isDisplayed = await marketplaceView.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should open the mobile sidebar using hamburger menu and navigate to Crop Health Detection', async () => {
        // Open sidebar again
        const hamburgerBtn = await $('#hamburgerBtn');
        await hamburgerBtn.click();
        
        // Click Crop Health in sidebar
        const cropHealthLink = await $('//*[@id="sidebarNav"]//div[contains(text(), "AI Crop Health")]/..');
        await cropHealthLink.waitForClickable({ timeout: 5000 });
        await cropHealthLink.click();
        
        // Wait for crop health view
        const cropHealthView = await $('#aiDetectionView');
        await cropHealthView.waitForDisplayed({ timeout: 5000 });
        
        const isDisplayed = await cropHealthView.isDisplayed();
        expect(isDisplayed).toBe(true);
    });
});
