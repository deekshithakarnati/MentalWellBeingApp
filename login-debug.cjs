const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  console.log('BASE', base);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // forward page console to node console for debugging
  page.on('console', (m) => {
    try {
      console.log('PAGE LOG>', m.text());
    } catch (e) {}
  });

  async function purgeViteOverlays() {
    await page.evaluate(() => {
      try {
        const selectors = ['vite-error-overlay', '#vite-error-overlay', '.vite-error-overlay', '#vite-notification', '.vite-notification'];
        selectors.forEach(s => document.querySelectorAll(s).forEach(e => e.remove()));
        document.querySelectorAll('vite-error-overlay, [id^="vite"], [class*="vite-"]').forEach(el => {
          try { el.style && (el.style.pointerEvents = 'none'); } catch (e) { }
        });
      } catch (e) {}
    });
  }

  try {
    await page.goto(base + '/login', { waitUntil: 'networkidle' });
    console.log('Opened', page.url());

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // remove any Vite overlays that might block clicks
    await purgeViteOverlays();

    await page.click('text=Sign in');

    // wait briefly for navigation or storage writes
    await page.waitForTimeout(1000);

    const ls = await page.evaluate(() => {
      const out = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        out[k] = localStorage.getItem(k);
      }
      return out;
    });

    console.log('localStorage after sign-in:', ls);
    console.log('current URL after sign-in:', page.url());

    // try to click Logout if present
    const logout = await page.$('button:has-text("Logout")');
    if (logout) {
      console.log('Found Logout button, clicking...');
      await purgeViteOverlays();
      await logout.click();
      await page.waitForTimeout(500);
      const ls2 = await page.evaluate(() => {
        const out = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          out[k] = localStorage.getItem(k);
        }
        return out;
      });
      console.log('localStorage after logout:', ls2);
      console.log('URL after logout:', page.url());
    } else {
      console.log('Logout button not found on page');
    }

    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR', e);
    await browser.close();
    process.exit(2);
  }
})();
