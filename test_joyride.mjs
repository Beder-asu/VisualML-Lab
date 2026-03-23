import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  await page.waitForSelector('#how-it-works-btn', { visible: true });
  await page.click('#how-it-works-btn');
  
  try {
      await page.waitForSelector('.__floater__open', { timeout: 2000 });
  } catch(e) {
      await page.waitForSelector('button[title="Open the dialog"]', { timeout: 2000 });
      await page.click('button[title="Open the dialog"]');
  }

  await page.waitForSelector('button[title="Next"]', { timeout: 5000 });
  await page.click('button[title="Next"]');
  
  // Wait a bit to let React process
  await new Promise(r => setTimeout(r, 1000));
  
  const fired = await page.evaluate(() => window.__JOYRIDE_CALLBACK_FIRED);
  const data = await page.evaluate(() => window.__LATEST_JOYRIDE_DATA);
  
  console.log("=== CALLBACK FIRED? ===", fired);
  console.log("=== LATEST DATA ===", JSON.stringify(data, null, 2));
  
  await browser.close();
})();
