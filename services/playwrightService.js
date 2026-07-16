const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

/**
 * Automates the retrieval of the Encumbrance Certificate (EC) document.
 * Supports both local Mock mode and Production portal mode.
 */
async function downloadEC(params) {
    const port = process.env.PORT || 3000;
    const targetUrl = process.env.TARGET_URL || `http://localhost:${port}/mock-search`;
    const statePath = path.join(__dirname, "../sessions/state.json");
    const userDataDir = path.join(__dirname, "../sessions/browser_profile");
    
    // Detect if we should use local Mock simulation or Production portal automation
    const isMockMode = targetUrl.includes("localhost") || targetUrl.includes("127.0.0.1") || targetUrl.includes("mock-search");
    
    console.log(`🤖 Starting Playwright automation. Mode: ${isMockMode ? "MOCK" : "PRODUCTION"} | Target: ${targetUrl}`);
    
    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== "false"
    });

    let contextOptions = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    };

    if (fs.existsSync(statePath)) {
        console.log(`🔑 Loading active session state from: ${statePath}`);
        contextOptions.storageState = statePath;
    } else {
        console.log("⚠️ No saved session state found. Proceeding with clean context.");
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    // Enable browser page logging and error logging for production diagnostics
    if (!isMockMode) {
        page.on("pageerror", (err) => {
            console.error(`🛑 Browser Page JS Error: ${err.message}`);
        });
        page.on("console", (msg) => {
            console.log(`💬 Browser Console: ${msg.text()}`);
        });
    }

    try {
        if (isMockMode) {
            // --- MOCK SIMULATION MODE ---
            await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
            console.log("🌐 Mock page navigation successful.");

            // Dynamically inject matching options to prevent test dropdown selection timeouts
            await page.evaluate((p) => {
                const addOptionIfMissing = (id, val) => {
                    const el = document.getElementById(id);
                    if (el && val) {
                        const exists = Array.from(el.options).some(o => o.text === val || o.value === val);
                        if (!exists) {
                            const opt = document.createElement("option");
                            opt.value = val;
                            opt.text = val;
                            el.appendChild(opt);
                        }
                    }
                };
                addOptionIfMissing("district", p.district);
                addOptionIfMissing("mandal", p.mandal);
                addOptionIfMissing("village", p.village);
            }, params);

            console.log("📄 Filling mock form inputs...");
            await page.selectOption("#district", { label: params.district });
            await page.selectOption("#mandal", { label: params.mandal });
            await page.selectOption("#village", { label: params.village });
            await page.fill("#surveyNo", params.surveyNo);
            await page.fill("#khataNo", params.khataNo);

            console.log("🖱️ Submitting mock form...");
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const [download] = await Promise.all([
                page.waitForEvent("download", { timeout: 30000 }),
                page.click("#submitBtn")
            ]);

            const tempFilename = `EC_${Date.now()}_${params.khataNo}.pdf`;
            const downloadPath = path.join(downloadsDir, tempFilename);
            await download.saveAs(downloadPath);
            return downloadPath;

        } else {
            // --- PRODUCTION PORTAL AUTOMATION MODE ---
            // 1. Read CSRF token from the active session state
            let csrfToken = "";
            if (fs.existsSync(statePath)) {
                const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
                const setAuthCookie = state.cookies.find(c => c.name === "setAuth");
                if (setAuthCookie) csrfToken = setAuthCookie.value;
            }
            
            // 2. Open Search EC Details Page Directly
            const searchUrl = `https://bhubharati.telangana.gov.in/searchECDetails?Y3NyZnRva2Vu=${csrfToken}&actId=ZuODB6MrhF9XEfdku1XEAg%3D%3D`;
            console.log(`👉 Navigating directly to Search EC Details Page: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 45000 });
            
            // 3. Wait for the property search page selectors to load
            console.log("⏳ Waiting for Search EC Details form to load...");
            await page.waitForSelector("#districtId", { timeout: 30000 });
            
            // 4. Fill in the dynamic dropdown forms (District -> Mandal -> Village -> SurveyNo -> KhataNo)
            console.log("✍️ Selecting District...");
            const districtVal = await getSelectValueByText(page, "#districtId", params.district);
            await page.selectOption("#districtId", districtVal);
            await page.dispatchEvent("#districtId", "change");
            await waitForDropdownPopulation(page, "#mandalID");
            
            console.log("✍️ Selecting Mandal...");
            const mandalVal = await getSelectValueByText(page, "#mandalID", params.mandal);
            await page.selectOption("#mandalID", mandalVal);
            await page.dispatchEvent("#mandalID", "change");
            await waitForDropdownPopulation(page, "#villageId");
            
            console.log("✍️ Selecting Village...");
            const villageVal = await getSelectValueByText(page, "#villageId", params.village);
            await page.selectOption("#villageId", villageVal);
            await page.dispatchEvent("#villageId", "change");
            await waitForDropdownPopulation(page, "#surveyNo");
            
            console.log("✍️ Selecting Survey/Sub-Division Number...");
            const surveyVal = await getSelectValueByText(page, "#surveyNo", params.surveyNo);
            await page.selectOption("#surveyNo", surveyVal);
            await page.dispatchEvent("#surveyNo", "change");
            await waitForDropdownPopulation(page, "#khataid");
            
            console.log("✍️ Selecting Khata Number...");
            const khataVal = await getSelectValueByText(page, "#khataid", params.khataNo);
            await page.selectOption("#khataid", khataVal);
            await page.dispatchEvent("#khataid", "change");
            
            // 5. Submit Form & Load Details Grid
            console.log("🖱️ Clicking search button...");
            await page.click("#search");
            await page.click("#search");
            
            // Wait for grid data to load
            await page.waitForTimeout(3000);
            
            // 6. Trigger Document Download Event
            console.log("⏳ Triggering download event via downloadECPDF()...");
            
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const [download] = await Promise.all([
                page.waitForEvent("download", { timeout: 45000 }),
                page.evaluate(() => downloadECPDF())
            ]);

            const tempFilename = `EC_${Date.now()}_${params.khataNo}.pdf`;
            const downloadPath = path.join(downloadsDir, tempFilename);
            await download.saveAs(downloadPath);
            
            // Navigate to about:blank to gracefully close without triggering logout events
            try {
                await page.goto("about:blank");
            } catch (e) {}

            return downloadPath;
        }

    } catch (err) {
        console.error("❌ Playwright service error:", err.message);
        try {
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }
            const errorScreenshotPath = path.join(downloadsDir, "error_screenshot.png");
            await page.screenshot({ path: errorScreenshotPath });
            console.log(`📸 Failure screenshot saved to: ${errorScreenshotPath}`);
            console.log(`📍 Failure URL: ${page.url()}`);
        } catch (screenshotErr) {
            console.error("Failed to capture error screenshot:", screenshotErr.message);
        }
        throw new Error(`Automation retrieval failed: ${err.message}`);
    } finally {
        await context.close();
        await browser.close();
    }
}

/**
 * Helper to match and find dropdown option value case-insensitively, handling bilingual texts.
 */
async function getSelectValueByText(page, selector, searchValue) {
    const value = await page.evaluate(({ sel, val }) => {
        const selectEl = document.querySelector(sel);
        if (!selectEl) return null;
        const options = Array.from(selectEl.options);
        
        // Try strict value or case-insensitive text substring match
        const matched = options.find(opt => 
            opt.value === val || 
            opt.text.toLowerCase().includes(val.toLowerCase())
        );
        return matched ? matched.value : null;
    }, { sel: selector, val: searchValue });

    if (!value) {
        throw new Error(`Could not find option "${searchValue}" in dropdown ${selector}`);
    }
    return value;
}

/**
 * Helper to wait until a dynamic select element is populated with AJAX results.
 */
async function waitForDropdownPopulation(page, selector) {
    await page.waitForFunction((sel) => {
        const selectEl = document.querySelector(sel);
        return selectEl && selectEl.options.length > 1;
    }, selector, { timeout: 15000 });
}

module.exports = { downloadEC };
