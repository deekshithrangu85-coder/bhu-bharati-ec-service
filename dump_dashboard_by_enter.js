const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("👉 Navigating to Bhu Bharati Citizen portal...");
    await page.goto("https://bhubharati.telangana.gov.in/Citizen");

    console.log("\nℹ️  INSTRUCTIONS:");
    console.log("1. Please log in manually in the browser window.");
    console.log("2. Navigate to the dashboard or search page.");
    console.log("3. Once you are there, press ENTER in this terminal to save session.");

    process.stdin.once("data", async () => {
        try {
            const url = page.url();
            const title = await page.title();
            console.log(`\n📍 Current URL: ${url}`);
            console.log(`📍 Page Title: ${title}`);

            // Save session state
            await context.storageState({ path: path.join(__dirname, "sessions/state.json") });
            console.log("✅ Session saved to sessions/state.json");

            // Save HTML content
            const html = await page.content();
            fs.writeFileSync(path.join(__dirname, "dashboard.html"), html);
            console.log("💾 Page HTML saved to dashboard.html");
        } catch (err) {
            console.error("❌ Error saving session/HTML:", err.message);
        } finally {
            await browser.close();
            process.exit(0);
        }
    });
})();
