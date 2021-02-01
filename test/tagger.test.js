import { getBestMatchTags } from '../src/utils'
import { handleTags } from '../src/utils/bookmark'
import puppeteer from 'puppeteer'

async function devModeToggler(browser) {
    const [extension] = await browser.pages();
    await extension.goto("chrome://extensions");
    await extension.waitForTimeout(100);
    const devModeToggle = await extension.evaluateHandle(
        'document.querySelector("body > extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode")'
    );
    await devModeToggle.click();
    await extension.waitForTimeout(100);
    await extension.waitForTimeout(100);

}
test('url title to tags', async () => {
    let title = '扩展程序 - vue-chrome-extension-boilerplate'
    let url = 'https://github.com/yguan/bookmark-tagging/blob/master/app/js/data/chrome-bookmark-parser.js'
    let tagGroups =
        ["书签栏", "Bookmark", "asd", "mongodb", "工作", "dmartech", "华为", "cdp", "创业", "前端", "python", "爬虫", "django", "工具配置", "黑苹果", "git", "rust", "机器学习", "svm", "telegram", "k8s", "数仓", "复旦", "知识图谱", "grakn", "信息安全", "学习", "spark", "java", "tdd", "数据质量", "其他书签", "haskell", "restful", "機器學習", "炒股", "go", "centos", "arch", "shadowsocks", "量化交易", "阿里云", "hub", "typscript", "空投", "新建文件夹"]
    let result = getBestMatchTags(url, title, tagGroups)
});

test('chrome bookmarks', async () => {
    const extensionPath = 'D:\\Documents\\chrome-extensioin-bookmark-manager\\dist'
    const userDataDir = 'D:\\Documents\\chrome-extensioin-bookmark-manager\\userData'
    const browser = await puppeteer.launch({
        headless: false, // extension are allowed only in the head-full mode
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        // devtools: true,
        userDataDir: userDataDir,
        // executablePath: 'C:\Program Files\Google\Chrome\Application\chrome.exe',
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            'devtools'
        ]
    });
    // devModeToggler(browser)
    const page = await browser.newPage()
    await page.waitForTimeout(100);
    await page.goto("https://www.baidu.com")
    await page.keyboard.press('Esc')
    await page.keyboard.press('Alt')
    await page.keyboard.press('H')
    await page.waitForTimeout(50000);
    await browser.close()
})