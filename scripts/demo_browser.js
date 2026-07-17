const playwrightService = require("../services/playwrightService");
require("dotenv").config();

// Force HEADLESS to false so the Chromium browser window is visible
process.env.HEADLESS = "false";

const isProductionRun = process.argv.length > 2;

if (!isProductionRun) {
    const port = process.env.PORT || 3000;
    process.env.TARGET_URL = `http://localhost:${port}/mock-search`;
}

// Parse arguments or fallback to default values
const params = {
    district: process.argv[2] || "Burgampadu",
    mandal: process.argv[3] || "Burgampadu",
    village: process.argv[4] || "Mothepattinagar",
    surveyNo: process.argv[5] || "6/1",
    khataNo: process.argv[6] || "248"
};

console.log("🚀 Starting browser-level EC retrieval demo in visible Chromium...");
console.log("Parameters:", params);

playwrightService.downloadEC(params)
    .then((filePath) => {
        console.log(`\n✅ Success! EC PDF downloaded and saved to:\n👉 ${filePath}`);
        process.exit(0);
    })
    .catch((err) => {
        console.error(`\n❌ Demo failed:`, err.message);
        process.exit(1);
    });
