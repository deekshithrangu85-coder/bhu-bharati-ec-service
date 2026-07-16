const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("👉 Navigating to login page...");
    await page.goto("https://bhubharati.telangana.gov.in/Citizen");

    console.log("ℹ️ Please log in manually in the browser window.");
    console.log("Waiting for dashboard navigation...");

    // Wait until the URL changes to citizenDashboard
    try {
        await page.waitForURL("**/citizenDashboard", { timeout: 120000 });
        console.log("✅ Reached dashboard!");

        // Wait a couple of seconds for dynamic content to render
        await page.waitForTimeout(3000);

        // Save session state
        await context.storageState({ path: path.join(__dirname, "sessions/state.json") });
        console.log("✅ Session saved to sessions/state.json");

        // Save the HTML content of the dashboard
        const html = await page.content();
        fs.writeFileSync(path.join(__dirname, "dashboard.html"), html);
        console.log("💾 Dashboard HTML saved to dashboard.html");
    } catch (err) {
        console.error("❌ Timeout or error waiting for dashboard:", err.message);
    } finally {
        await browser.close();
    }
})();
