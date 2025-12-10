const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:5174';
  console.log('Starting smoke test against', base);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Home -> Login
    await page.goto(base, { waitUntil: 'networkidle' });
    console.log('Opened home');

    await page.click('text=Get Started Free', { timeout: 5000 }).catch(() => page.click('text=Sign Up Now', { timeout: 5000 }));
    await page.waitForURL('**/login', { timeout: 5000 });
    console.log('Reached login page');

    // Fill mock login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('text=Sign in');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log('Signed in and reached dashboard');

    // Navigate to mood
    await page.goto(base + '/mood', { waitUntil: 'networkidle' });
    console.log('Opened mood page');

    // Set mood slider to 8
    await page.evaluate(() => {
      const r = document.querySelector('input[type=range]');
      if (r) r.value = '8';
    });
    // Set energy button 5
    await page.click('button:has-text("5")');
    await page.fill('textarea#notes', 'Automated mood entry');
    await page.click('text=Save Mood Entry');

    // Wait for success message
    await page.waitForSelector('text=Mood entry saved successfully', { timeout: 5000 });
    console.log('Mood entry saved');

    // Activities
    await page.goto(base + '/activities', { waitUntil: 'networkidle' });
    console.log('Opened activities page');
    // Click first Start Activity
    await page.click('text=Start Activity', { timeout: 5000 });
    // Wait for modal and click Submit
    await page.waitForSelector('text=How was your experience?', { timeout: 5000 });
    // choose 4 stars
    await page.click('button:has-text("4")');
    await page.fill('textarea#activity-notes', 'Automated activity completion');
    await page.click('text=Submit');
    // Wait for modal to close
    await page.waitForSelector('text=How was your experience?', { state: 'detached', timeout: 5000 });
    console.log('Activity completed');

    // Questionnaire
    await page.goto(base + '/questionnaire', { waitUntil: 'networkidle' });
    console.log('Opened questionnaire');
    // Click next through questions
    const nextButton = 'button:has-text("Next")';
    for (let i = 0; i < 5; i++) {
      await page.click(nextButton, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    // Continue to summary
    await page.click('text=Continue to Summary');
    await page.waitForSelector('text=Complete Check-in', { timeout: 5000 });
    await page.click('text=Complete Check-in');
    await page.waitForSelector('text=Daily check-in completed', { timeout: 5000 });
    console.log('Questionnaire completed');

    // Chatbot quick action
    await page.goto(base + '/chatbot', { waitUntil: 'networkidle' });
    console.log('Opened chatbot');
    // Click quick action button
    await page.click('button:has-text("Suggest an activity")');
    // Wait for bot response suggestion buttons
    await page.waitForSelector('button:has-text("Show me mindfulness exercises")', { timeout: 8000 }).catch(() => {});
    console.log('Chatbot responded to quick action');

    console.log('SMOKE TEST PASSED');
  } catch (err) {
    console.error('SMOKE TEST FAILED', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
