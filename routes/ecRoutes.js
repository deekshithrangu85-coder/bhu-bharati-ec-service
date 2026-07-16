const express = require("express");
const router = express.Router();

const ecController = require("../controllers/ecController");

router.post("/download", ecController.downloadEC);

module.exports = router;