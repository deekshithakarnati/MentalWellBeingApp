const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  console.log('BASE URL:', base);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Inject mock_user before any page loads
  await context.addInitScript(() => {
    try {
      localStorage.setItem('mock_user', JSON.stringify({ id: 'mock-1', email: 'test@example.com', google_user_data: { given_name: 'test' } }));
    } catch (e) {}
  });

  const page = await context.newPage();

  try {
    await page.goto(base + '/dashboard', { waitUntil: 'networkidle' });
    console.log('Navigated to', page.url());

    // Wait for nav to render
    await page.waitForTimeout(500);

    const logout = await page.$('button:has-text("Logout")');
    console.log('Logout button present:', !!logout);
    if (logout) {
      await logout.click();
      await page.waitForTimeout(500);
      const mockUser = await page.evaluate(() => localStorage.getItem('mock_user'));
      console.log('mock_user after clicking Logout:', mockUser);
      console.log('Current URL after logout:', page.url());
    }

    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR', e);
    await browser.close();
    process.exit(2);
  }
})();
