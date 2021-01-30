
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']

  });
  const page = await browser.newPage();
  await page.goto('https://baidu.com');
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();