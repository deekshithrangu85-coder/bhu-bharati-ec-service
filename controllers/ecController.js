const playwrightService = require("../services/playwrightService");
const fs = require("fs");

/**
 * Handles the POST /api/ec/download request.
 */
async function downloadEC(req, res) {
    const { district, mandal, village, surveyNo, survey, khataNo, khata } = req.body;
    
    const finalSurveyNo = surveyNo || survey;
    const finalKhataNo = khataNo || khata;

    // 1. Validation
    if (!district || !mandal || !village || !finalSurveyNo || !finalKhataNo) {
        return res.status(400).json({
            success: false,
            message: "Missing required parameter(s). Please provide district, mandal, village, surveyNo (or survey), and khataNo (or khata)."
        });
    }

    let filePath = null;

    try {
        // 2. Automate document retrieval via Playwright UI automation
        filePath = await playwrightService.downloadEC({
            district,
            mandal,
            village,
            surveyNo: finalSurveyNo,
            khataNo: finalKhataNo
        });


        // 3. Send file directly through response stream
        res.download(filePath, "Encumbrance_Certificate.pdf", (err) => {
            if (err) {
                console.error("❌ Error sending file response:", err.message);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Error streaming the downloaded document."
                    });
                }
                // Cleanup on error (since file might be corrupted or incomplete)
                cleanupFile(filePath);
            }
        });

    } catch (err) {
        console.error("❌ Controller error:", err.stack);
        cleanupFile(filePath);
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

/**
 * Safely removes a file from the filesystem.
 * @param {string} filePath - Absolute path to the file
 */
function cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up temporary file: ${filePath}`);
        } catch (unlinkErr) {
            console.error(`⚠️ Failed to clean up file at ${filePath}:`, unlinkErr.message);
        }
    }
}

module.exports = {
    downloadEC
};