const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
    const statePath = path.join(__dirname, "sessions/state.json");
    const artifactDir = "C:\\Users\\deeks\\.gemini\\antigravity-ide\\brain\\440dc9d3-196d-492f-8fb1-4b347cfdfc2b";

    console.log("🚀 Launching browser...");
    const browser = await chromium.launch({ headless: false });
    
    let contextOptions = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    };
    if (fs.existsSync(statePath)) {
        contextOptions.storageState = statePath;
    }
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    // Listen to console and errors
    page.on("pageerror", (err) => {
        console.error(`🛑 Browser Page JS Error: ${err.message}`);
    });
    page.on("console", (msg) => {
        console.log(`💬 Browser Console: ${msg.text()}`);
    });

    try {
        console.log("👉 Extracting CSRF token from session state...");
        const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
        const setAuthCookie = state.cookies.find(c => c.name === "setAuth");
        const csrfToken = setAuthCookie ? setAuthCookie.value : "";
        
        const targetUrl = `https://bhubharati.telangana.gov.in/citizenDashboard?Y3NyZnRva2Vu=${csrfToken}`;
        console.log(`👉 Navigating to: ${targetUrl}`);
        
        await page.goto(targetUrl, {
            waitUntil: "networkidle",
            timeout: 30000
        });

        console.log("✅ Reached citizen dashboard! Clicking 'searchECDetails'...");
        await page.click('div[onclick*="searchECDetails"]');
        
        // Wait for search page
        await page.waitForSelector("#districtId", { timeout: 15000 });
        console.log("✅ Search page loaded. Attempting to select District...");

        // Select district using the exact logic
        const params = { district: "Bhadradri Kothagudem" };
        
        await page.evaluate(({ sel, val }) => {
            const selectEl = document.querySelector(sel);
            if (!selectEl) return;
            const options = Array.from(selectEl.options);
            const matched = options.find(opt => 
                opt.value === val || 
                opt.text.toLowerCase().includes(val.toLowerCase())
            );
            if (matched) {
                selectEl.value = matched.value;
                const event = new Event("change", { bubbles: true });
                selectEl.dispatchEvent(event);
                console.log(`Client selected value: ${matched.value} (${matched.text})`);
            } else {
                console.error(`Could not match option for ${val}`);
            }
        }, { sel: "#districtId", val: params.district });

        console.log("⏳ Waiting 10 seconds to observe Mandal population and console outputs...");
        await page.waitForTimeout(10000);
        
        const searchScreenshot = path.join(artifactDir, "diagnostic_search_screenshot.png");
        await page.screenshot({ path: searchScreenshot });
        console.log(`📸 Saved search page screenshot to: ${searchScreenshot}`);

    } catch (err) {
        console.error("❌ Diagnostic error:", err.message);
    } finally {
        await browser.close();
    }
})();
