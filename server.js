require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const ecRoutes = require("./routes/ecRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/ec", ecRoutes);

// Mock Citizen Portal Routes for Testing & Safe Automation Demonstration
app.get("/mock-search", (req, res) => {
    res.sendFile(path.join(__dirname, "mock_search_page.html"));
});

// --- Live-like Bhu Bharati Mock Backend API Endpoints ---
app.get("/getMandalFromDivisionCitizenPortal", (req, res) => {
    res.send('<option value="0">Please select</option><option value="Burgampadu_ID">Burgampadu</option>');
});

app.get("/getVillageFromMandalCitizenPortal", (req, res) => {
    res.send('<option value="0">Please select</option><option value="Mothepattinagar_ID">Mothepattinagar</option>');
});

app.get("/getSurveyECDetails", (req, res) => {
    res.send('<option value="">Please select</option><option value="6/1_ID">6/1</option>');
});

app.get("/getKhataNoCitizenEC", (req, res) => {
    res.send('<option value="0">Please select</option><option value="248_ID">248</option>');
});

app.post("/downloadEcDetails", (req, res) => {
    res.send("C:\\dharani_portal\\temp\\EC_Report_123.pdf");
});

app.get("/downloadMVcertificate", (req, res) => {
    const streamContent = 
        "BT\n" +
        "  /F1 16 Tf\n" +
        "  70 780 Td\n" +
        "  (Telangana Bhu Bharati - Encumbrance Certificate) Tj\n" +
        "  0 -35 Td\n" +
        "  (District: Bhadradri Kothagudem [MOCK]) Tj\n" +
        "  0 -22 Td\n" +
        "  (Mandal: Burgampadu [MOCK]) Tj\n" +
        "  0 -22 Td\n" +
        "  (Village: Mothepattinagar [MOCK]) Tj\n" +
        "  0 -22 Td\n" +
        "  (Survey/Sub-Division No: 6/1 [MOCK]) Tj\n" +
        "  0 -22 Td\n" +
        "  (Khata Number: 248 [MOCK]) Tj\n" +
        "  0 -45 Td\n" +
        "  (Status: Direct API-Level Document Retrieved Successfully) Tj\n" +
        "ET";

    const pdfString = 
        `%PDF-1.1\n` +
        `1 0 obj\n` +
        `  << /Type /Catalog\n` +
        `     /Pages 2 0 R\n` +
        `  >>\n` +
        `endobj\n` +
        `2 0 obj\n` +
        `  << /Type /Pages\n` +
        `     /Kids [ 3 0 R ]\n` +
        `     /Count 1\n` +
        `  >>\n` +
        `endobj\n` +
        `3 0 obj\n` +
        `  << /Type /Page\n` +
        `     /Parent 2 0 R\n` +
        `     /Resources <<\n` +
        `       /Font <<\n` +
        `         /F1 4 0 R\n` +
        `       >>\n` +
        `     >>\n` +
        `     /MediaBox [ 0 0 595 842 ]\n` +
        `     /Contents 5 0 R\n` +
        `  >>\n` +
        `endobj\n` +
        `4 0 obj\n` +
        `  << /Type /Font\n` +
        `     /Subtype /Type1\n` +
        `     /BaseFont /Helvetica\n` +
        `  >>\n` +
        `endobj\n` +
        `5 0 obj\n` +
        `  << /Length ${streamContent.length} >>\n` +
        `stream\n` +
        `${streamContent}\n` +
        `endstream\n` +
        `endobj\n` +
        `xref\n` +
        `0 6\n` +
        `0000000000 65535 f \n` +
        `0000000009 00000 n \n` +
        `0000000074 00000 n \n` +
        `0000000135 00000 n \n` +
        `0000000260 00000 n \n` +
        `0000000325 00000 n \n` +
        `trailer\n` +
        `  << /Size 6\n` +
        `     /Root 1 0 R\n` +
        `  >>\n` +
        `startxref\n` +
        `399\n` +
        `%%EOF\n`;

    res.setHeader("Content-Disposition", "attachment; filename=Mock_EC_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfString, "utf-8"));
});

app.get("/swagger.json", (req, res) => {
    res.sendFile(path.join(__dirname, "swagger.json"));
});


app.post("/mock-download", (req, res) => {
    console.log("📥 Mock download requested with payload:", req.body);
    const { district, mandal, village, surveyNo, khataNo } = req.body;
    
    // Construct dynamic PDF text contents
    const streamContent = 
        "BT\n" +
        "  /F1 16 Tf\n" +
        "  70 780 Td\n" +
        "  (Telangana Bhu Bharati - Encumbrance Certificate) Tj\n" +
        "  0 -35 Td\n" +
        `  (District: ${district || ""}) Tj\n` +
        "  0 -22 Td\n" +
        `  (Mandal: ${mandal || ""}) Tj\n` +
        "  0 -22 Td\n" +
        `  (Village: ${village || ""}) Tj\n` +
        "  0 -22 Td\n" +
        `  (Survey/Sub-Division No: ${surveyNo || ""}) Tj\n` +
        "  0 -22 Td\n" +
        `  (Khata Number: ${khataNo || ""}) Tj\n` +
        "  0 -45 Td\n" +
        "  (Status: Document Retrieved Successfully) Tj\n" +
        "ET";

    const pdfString = 
        `%PDF-1.1\n` +
        `1 0 obj\n` +
        `  << /Type /Catalog\n` +
        `     /Pages 2 0 R\n` +
        `  >>\n` +
        `endobj\n` +
        `2 0 obj\n` +
        `  << /Type /Pages\n` +
        `     /Kids [ 3 0 R ]\n` +
        `     /Count 1\n` +
        `  >>\n` +
        `endobj\n` +
        `3 0 obj\n` +
        `  << /Type /Page\n` +
        `     /Parent 2 0 R\n` +
        `     /Resources <<\n` +
        `       /Font <<\n` +
        `         /F1 4 0 R\n` +
        `       >>\n` +
        `     >>\n` +
        `     /MediaBox [ 0 0 595 842 ]\n` +
        `     /Contents 5 0 R\n` +
        `  >>\n` +
        `endobj\n` +
        `4 0 obj\n` +
        `  << /Type /Font\n` +
        `     /Subtype /Type1\n` +
        `     /BaseFont /Helvetica\n` +
        `  >>\n` +
        `endobj\n` +
        `5 0 obj\n` +
        `  << /Length ${streamContent.length} >>\n` +
        `stream\n` +
        `${streamContent}\n` +
        `endstream\n` +
        `endobj\n` +
        `xref\n` +
        `0 6\n` +
        `0000000000 65535 f \n` +
        `0000000009 00000 n \n` +
        `0000000074 00000 n \n` +
        `0000000135 00000 n \n` +
        `0000000260 00000 n \n` +
        `0000000325 00000 n \n` +
        `trailer\n` +
        `  << /Size 6\n` +
        `     /Root 1 0 R\n` +
        `  >>\n` +
        `startxref\n` +
        `399\n` +
        `%%EOF\n`;

    res.setHeader("Content-Disposition", "attachment; filename=Mock_EC_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfString, "utf-8"));
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Bhu Bharati EC Service Running"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});