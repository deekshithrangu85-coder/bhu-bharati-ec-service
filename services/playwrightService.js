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
        page.on("response", (response) => {
            if (response.status() >= 400) {
                console.error(`❌ Failed to load resource: ${response.url()} (Status: ${response.status()})`);
            }
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
            const downloadsDir = path.join(__dirname, "../Download");
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
            
            // 2. Open Citizen Dashboard & click Search EC Details card to load jQuery and page scripts correctly
            const dashboardUrl = `https://bhubharati.telangana.gov.in/citizenDashboard?Y3NyZnRva2Vu=${csrfToken}`;
            console.log(`👉 Navigating to Citizen Dashboard: ${dashboardUrl}`);
            await page.goto(dashboardUrl, { waitUntil: "networkidle", timeout: 45000 });
            
            // Check for redirection to login/session expiry
            const currentUrl = page.url();
            if (currentUrl.includes("/login") || currentUrl.includes("/Citizen") || currentUrl.toLowerCase().endsWith("/citizen")) {
                throw new Error("Session expired or rejected by Bhu Bharati (redirected to login page). Please run 'npm run session:save' to log in.");
            }
            
            console.log("👉 Clicking the Search EC Details card...");
            await page.click('div[onclick*="searchECDetails"]');
            
            // Wait for navigation and network to become idle to let scripts load fully
            console.log("⏳ Waiting for search page load and script execution...");
            await page.waitForLoadState("networkidle");
            
            // Check if the card click redirected to login
            if (page.url().includes("/login")) {
                throw new Error("Session expired or rejected by Bhu Bharati when loading search page (redirected to login). Please run 'npm run session:save'.");
            }
            
            // 3. Wait for the property search page selectors to load
            console.log("⏳ Waiting for Search EC Details form to load...");
            await page.waitForSelector("#districtId", { timeout: 30000 });
            await page.waitForTimeout(3000); // 3-second safety buffer for script binding/initialization
            
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
            console.log("🖱️ Force-enabling and clicking search button...");
            await page.evaluate(() => {
                const btn = document.querySelector("#search");
                if (btn) {
                    btn.disabled = false;
                    btn.removeAttribute("disabled");
                }
            });
            await page.click("#search");
            
            // Wait for grid data to load
            console.log("⏳ Waiting for grid data load...");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000); // 2-second safety buffer for rendering
            
            // Check if there are truly no transactions done
            const pageText = await page.innerText("body");
            if (pageText.includes("no transaction done") || pageText.includes("no transaction")) {
                throw new Error("There is no transaction done on the said survey no / sub-division no.");
            }
            
            // 6. Trigger Document Download Event
            console.log("⏳ Triggering download event via downloadECPDF()...");
            
            const downloadsDir = path.join(__dirname, "../Download");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            // Setup a dialog listener to catch warnings (e.g. "no transaction done")
            let dialogPromiseResolve;
            const dialogPromise = new Promise((resolve) => {
                dialogPromiseResolve = resolve;
            });

            page.on("dialog", async (dialog) => {
                const message = dialog.message();
                console.log(`💬 Portal Dialog alert popped up: "${message}"`);
                await dialog.dismiss();
                dialogPromiseResolve(message);
            });

            const downloadPromise = page.waitForEvent("download", { timeout: 45000 });

            const [result] = await Promise.all([
                Promise.race([
                    downloadPromise.then(dl => ({ type: "download", value: dl })),
                    dialogPromise.then(msg => ({ type: "dialog", value: msg }))
                ]),
                page.evaluate(() => downloadECPDF())
            ]);

            if (result.type === "dialog") {
                throw new Error(`Bhu Bharati Portal warning: "${result.value}"`);
            }

            const download = result.value;

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
        // If it is a known portal warning error, don't screenshot or prefix it, throw immediately
        if (err.message.includes("Tribal Villages") || err.message.includes("no transaction")) {
            throw err;
        }
        
        console.error("❌ Playwright service error:", err.message);
        try {
            const downloadsDir = path.join(__dirname, "../Download");
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
        if (!isMockMode) {
            try {
                await context.storageState({ path: statePath });
                console.log("💾 Session state successfully updated and saved to sessions/state.json.");
            } catch (e) {
                console.error("⚠️ Failed to update session state in finally block:", e);
            }
        }
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
