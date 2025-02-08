const express = require("express");
const { performBackup } = require("../services/backupService");
const path = require("path");
const fs = require('fs')
const router = express.Router();

router.post("/backup", async (req, res) => {
  const { host, user, password, database } = req.body;
  try {
    const { backupFile, pdfFile } = await performBackup("mysql", { host, user, password, database }, "backups");
    
    // Redirect to success page with PDF link
    res.redirect(`/success?pdf=${encodeURIComponent(pdfFile)}`);
  } catch (error) {
    res.redirect('/failure')
  }
});

router.post("/backup1", async (req, res) => {
  const { database } = req.body;
  try {
    const { backupFile, pdfFile } = await performBackup("mongodb", { database }, "backups");
    
    res.redirect(`/success?pdf=${encodeURIComponent(pdfFile)}`);
  } catch (error) {
    res.redirect("/success");
  }
});

// Route to download the generated PDF
router.get("/download", (req, res) => {
  const pdfPath = req.query.pdf;
  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath);
  } else {
    res.status(404).send("PDF not found");
  }
});

module.exports = router;
