const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
function parseOptions(html) {
    const regex = /<option\b[^>]*\bvalue=(["']?)([^"'>\s]*)\1[^>]*>([\s\S]*?)<\/option>/gi;
    const options = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        let text = match[3]
            .replace(/&nbsp;/gi, " ")
            .replace(/\xa0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        options.push({
            value: match[2],
            text: text
        });
    }
    return options;
}
function findOptionValue(options, searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const exactMatch = options.find(opt => 
        opt.value.toLowerCase() === term || 
        opt.text.toLowerCase() === term
    );
    if (exactMatch) return exactMatch.value;
    const subMatch = options.find(opt => 
        opt.text.toLowerCase().includes(term)
    );
    if (subMatch) return subMatch.value;
    return null;
}
async function downloadEC(params) {
    const port = process.env.PORT || 3000;
    const targetUrl = process.env.TARGET_URL || `http://localhost:${port}/mock-search`;
    const statePath = path.join(__dirname, "../sessions/state.json");
    
    const isMockMode = targetUrl.includes("localhost") || targetUrl.includes("127.0.0.1") || targetUrl.includes("mock-search");
    const baseUrl = isMockMode ? `http://localhost:${port}` : "https://bhubharati.telangana.gov.in";

    console.log(`🚀 Starting API-level automation via Playwright Network Stack. Mode: ${isMockMode ? "MOCK" : "PRODUCTION"} | BaseUrl: ${baseUrl}`);

    // Launch headless browser to utilize its trusted network context (no UI page created)
    const browser = await chromium.launch({ headless: true });
    
    let contextOptions = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    };
    if (fs.existsSync(statePath)) {
        contextOptions.storageState = statePath;
    }
    
    const context = await browser.newContext(contextOptions);
    const request = context.request; // Playwright APIRequestContext (Chromium network layer)

    // Extract cookies and initial CSRF token manually from state.json to build explicit Cookie header
    let cookieHeader = "";
    let csrfToken = "";
    if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
        cookieHeader = state.cookies.map(c => `${c.name}=${c.value}`).join("; ");
        const setAuthCookie = state.cookies.find(c => c.name === "setAuth");
        if (setAuthCookie) csrfToken = setAuthCookie.value;
    }

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Referer": `${baseUrl}/searchECDetails`,
        "Origin": baseUrl
    };
    if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
    }

    try {

        // Helper to update the CSRF token from active browser context cookies (in case of server-side rotation)
        async function syncCsrfToken() {
            const cookies = await context.cookies();
            const setAuthCookie = cookies.find(c => c.name === "setAuth");
            if (setAuthCookie) {
                const oldToken = csrfToken;
                csrfToken = setAuthCookie.value;
                if (oldToken !== csrfToken) {
                    console.log(`🔄 CSRF Token rotated: ${oldToken} -> ${csrfToken}`);
                }
            }
        }

        // --- Step 1: Resolve District ID ---
        console.log(`🔍 Resolving District: "${params.district}"...`);
        let districtId = "";
        
        if (isMockMode) {
            districtId = "Burgampadu_ID"; // Mock dummy ID
        } else {
            const searchPageUrl = `${baseUrl}/searchECDetails?Y3NyZnRva2Vu=${csrfToken}&actId=ZuODB6MrhF9XEfdku1XEAg%3D%3D`;
            const res = await request.get(searchPageUrl, { headers });
            
            // Check if Bhu Bharati redirected to the login page (due to expired cookies)
            if (res.url().includes("/login")) {
                throw new Error("Session expired or rejected by Bhu Bharati (redirected to /login). Please run 'npm run session:save' to log in.");
            }

            const html = await res.text();
            const options = parseOptions(html);
            console.log(`💬 Diagnostic: Parsed ${options.length} district options from search page.`);
            
            districtId = findOptionValue(options, params.district);
            if (!districtId) {
                throw new Error(`Could not find District matching "${params.district}"`);
            }
            console.log(`✅ District ID resolved to: ${districtId}`);
            await syncCsrfToken();
        }

        // --- Step 2: Resolve Mandal ID ---
        console.log(`🔍 Resolving Mandal: "${params.mandal}"...`);
        const mandalUrl = `${baseUrl}/getMandalFromDivisionCitizenPortal?district=${districtId}&csrf=${csrfToken}`;
        const mandalRes = await request.get(mandalUrl, { headers });
        const mandalHtml = await mandalRes.text();
        const mandalOptions = parseOptions(mandalHtml);
        const mandalId = findOptionValue(mandalOptions, params.mandal);
        if (!mandalId) {
            throw new Error(`Could not find Mandal matching "${params.mandal}"`);
        }
        console.log(`✅ Mandal ID resolved to: ${mandalId}`);
        await syncCsrfToken();

        // --- Step 3: Resolve Village ID ---
        console.log(`🔍 Resolving Village: "${params.village}"...`);
        const villageUrl = `${baseUrl}/getVillageFromMandalCitizenPortal?mandalId=${mandalId}&csrf=${csrfToken}`;
        const villageRes = await request.get(villageUrl, { headers });
        const villageHtml = await villageRes.text();
        const villageOptions = parseOptions(villageHtml);
        const villageId = findOptionValue(villageOptions, params.village);
        if (!villageId) {
            throw new Error(`Could not find Village matching "${params.village}"`);
        }
        console.log(`✅ Village ID resolved to: ${villageId}`);
        await syncCsrfToken();

        // --- Step 4: Resolve Survey ID ---
        console.log(`🔍 Resolving Survey No: "${params.surveyNo}"...`);
        const surveyUrl = `${baseUrl}/getSurveyECDetails?VillageId=${villageId}&csrf=${csrfToken}`;
        const surveyRes = await request.get(surveyUrl, { headers });
        const surveyHtml = await surveyRes.text();
        console.log(`💬 Diagnostic: surveyRes status=${surveyRes.status()}, url=${surveyRes.url()}, bodyLength=${surveyHtml.length}`);
        if (surveyRes.url().includes("/login")) {
            throw new Error("Session expired or rejected by Bhu Bharati (redirected to /login) during Survey retrieval. Please run 'npm run session:save'.");
        }
        const surveyOptions = parseOptions(surveyHtml);
        const surveyId = findOptionValue(surveyOptions, params.surveyNo);
        if (!surveyId) {
            console.log("💬 Diagnostic: Available Survey options on Bhu Bharati page:", surveyOptions.map(o => `"${o.text}" (value: "${o.value}")`));
            throw new Error(`Could not find Survey Number matching "${params.surveyNo}"`);
        }
        console.log(`✅ Survey ID resolved to: ${surveyId}`);
        await syncCsrfToken();
        console.log(`🔍 Resolving Khata No: "${params.khataNo}"...`);
        const khataUrl = `${baseUrl}/getKhataNoCitizenEC?VillageId=${villageId}&SurveyId=${surveyId}&csrf=${csrfToken}`;
        const khataRes = await request.get(khataUrl, { headers });
        const khataHtml = await khataRes.text();
        const khataOptions = parseOptions(khataHtml);
        const khataId = findOptionValue(khataOptions, params.khataNo);
        if (!khataId) {
            console.log("💬 Diagnostic: Available Khata options on Bhu Bharati page:", khataOptions.map(o => `"${o.text}" (value: "${o.value}")`));
            throw new Error(`Could not find Khata Number matching "${params.khataNo}"`);
        }
        console.log(`✅ Khata ID resolved to: ${khataId}`);
        await syncCsrfToken();
        console.log("🔍 Executing search to populate Bhu Bharati session cache...");
        const searchDetailsUrl = `${baseUrl}/getEcDetails?VillageId=${villageId}&SurveyId=${surveyId}&khata=${khataId}&mndlname=${encodeURIComponent(params.mandal)}&distname=${encodeURIComponent(params.district)}&villname=${encodeURIComponent(params.village)}&csrf=${csrfToken}`;
        const searchDetailsRes = await request.get(searchDetailsUrl, { headers });
        const searchDetailsHtml = await searchDetailsRes.text();
        
        // Check if there are truly no transactions done
        if (searchDetailsHtml.trim() === "1" || searchDetailsHtml.includes("no transaction done")) {
            throw new Error("There is no transaction done on the said survey no / sub-division no.");
        }
        
        console.log("✅ Search executed and cached successfully.");
        await syncCsrfToken();
        console.log("⏳ Triggering backend EC document generation...");
        const downloadDetailsUrl = `${baseUrl}/downloadEcDetails`;
        
        const triggerRes = await request.post(downloadDetailsUrl, {
            headers,
            form: {
                VillageId: villageId,
                SurveyId: surveyId,
                khata: khataId,
                csrf: csrfToken
            }
        });
        const tempFilePath = await triggerRes.text();
        if (!tempFilePath || tempFilePath.trim() === "ERROR") {
            throw new Error("Bhu Bharati backend failed to generate the certificate (returned 'ERROR').");
        }
        console.log(`✅ EC document generated. Temporary server file path: ${tempFilePath}`);
        console.log("📥 Downloading EC PDF binary data...");
        const getFileUrl = `${baseUrl}/downloadMVcertificate?filePath=${encodeURIComponent(tempFilePath)}`;
        const fileRes = await request.get(getFileUrl, { headers });
        const buffer = await fileRes.body();
        const downloadsDir = path.join(__dirname, "../Download");
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }
        const filename = `EC_${Date.now()}_${params.khataNo}.pdf`;
        const localFilePath = path.join(downloadsDir, filename);
        fs.writeFileSync(localFilePath, buffer);
        console.log(`✅ EC PDF successfully saved locally to: ${localFilePath}`);
        return localFilePath;
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

module.exports = { downloadEC };
