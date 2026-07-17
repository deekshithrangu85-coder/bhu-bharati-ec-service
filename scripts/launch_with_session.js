const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    const statePath = path.join(__dirname, "../sessions/state.json");
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const setAuthCookie = state.cookies.find(c => c.name === "setAuth");
    const csrfToken = setAuthCookie ? setAuthCookie.value : "";
    
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        storageState: statePath
    });
    const page = await context.newPage();

    const targetUrl = `https://bhubharati.telangana.gov.in/citizenDashboard?Y3NyZnRva2Vu=${csrfToken}`;
    console.log(`👉 Navigating to: ${targetUrl}`);
    await page.goto(targetUrl);

    console.log("Browser opened. Check if it remains on the dashboard or redirects to login.");
    await page.pause();
})();
