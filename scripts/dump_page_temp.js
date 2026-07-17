const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: path.join(__dirname, "../sessions/state.json")
    });

    const page = await context.newPage();
    console.log("Navigating to dashboard...");
    await page.goto("https://bhubharati.telangana.gov.in/citizenDashboard", {
        waitUntil: "networkidle"
    });

    const url = page.url();
    const title = await page.title();
    console.log(`Current URL: ${url}`);
    console.log(`Page Title: ${title}`);

    // Wait a bit to let any dynamic elements load
    await page.waitForTimeout(3000);

    const html = await page.content();
    fs.writeFileSync(path.join(__dirname, "scratch_page.html"), html);
    console.log("HTML page content dumped to scratch_page.html");

    await browser.close();
})();
