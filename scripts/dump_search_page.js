const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("🚀 Launching browser...");
    const statePath = path.join(__dirname, "../sessions/state.json");
    
    // Read state file to extract setAuth value
    const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    const setAuthCookie = state.cookies.find(c => c.name === "setAuth");
    if (!setAuthCookie) {
        console.error("❌ setAuth cookie not found in state.json");
        process.exit(1);
    }
    
    const csrfToken = setAuthCookie.value;
    console.log(`🔑 Extracted CSRF/setAuth Token: ${csrfToken}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        storageState: statePath
    });
    const page = await context.newPage();

    const targetUrl = `https://bhubharati.telangana.gov.in/citizenDashboard?Y3NyZnRva2Vu=${csrfToken}`;
    console.log(`👉 Navigating to dashboard: ${targetUrl}`);
    
    await page.goto(targetUrl, {
        waitUntil: "networkidle"
    });

    console.log("Current URL:", page.url());

    console.log("👉 Clicking the EC Details card...");
    await page.click('div[onclick*="searchECDetails"]');

    console.log("Waiting for search page load...");
    await page.waitForTimeout(5000); // Wait 5 seconds for page load

    const url = page.url();
    const title = await page.title();
    console.log(`📍 Current URL: ${url}`);
    console.log(`📍 Page Title: ${title}`);

    // Dump search page HTML
    const html = await page.content();
    fs.writeFileSync(path.join(__dirname, "search_page.html"), html);
    console.log("💾 Search page HTML saved to search_page.html");

    await browser.close();
})();
