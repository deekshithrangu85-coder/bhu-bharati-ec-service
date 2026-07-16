const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();

    await page.goto("https://bhubharati.telangana.gov.in/Citizen");

    console.log("Login manually...");
    console.log("After reaching the Search EC Details page, press ENTER here.");

    process.stdin.once("data", async () => {
        const statePath = path.join(__dirname, "sessions/state.json");
        const stateDir = path.dirname(statePath);
        if (!fs.existsSync(stateDir)) {
            fs.mkdirSync(stateDir, { recursive: true });
        }
        await context.storageState({ path: statePath });

        console.log("✅ Session saved successfully.");
        process.exit(0);
    });
})();