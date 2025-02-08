const { exec } = require("child_process");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const BSON = require("bson");

async function performBackup(dbType, dbConfig, backupDir) {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
  let backupFile, command;

  if (dbType === "mysql") {
    backupFile = path.join(backupDir, `mysql_backup_${timestamp}.sql`);
    command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > ${backupFile}`;
  } else if (dbType === "mongodb") {
    backupFile = path.join(backupDir, `mongodb_backup_${timestamp}`);
    command = `mongodump --uri="mongodb://localhost:27017" --db=${dbConfig.database} --out=${backupFile}`;
  } else {
    throw new Error("Unsupported database type.");
  }

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        console.log(`${dbType} backup failed: ${error.message}`);
        reject(error);
      } else {
        if (fs.existsSync(backupFile)) {
          logger.info(`${dbType} backup successful: ${backupFile}`);
          
          // Generate a PDF with actual backup data
          const pdfFile = generateBackupPDF(dbType, backupFile, timestamp, dbConfig.database);
          resolve({ backupFile, pdfFile });
        } else {
          reject(new Error(`Backup file not created: ${backupFile}`));
        }
      }
    });
  });
}

// **📌 Function to generate a detailed PDF with full backup contents**
function generateBackupPDF(dbType, backupFile, timestamp, dbName) {
  const pdfFile = path.join("backups", `Backup_Report_${timestamp}.pdf`);
  const doc = new PDFDocument({ size: "A4" });
  const stream = fs.createWriteStream(pdfFile);
  
  doc.pipe(stream);
  
  // **📌 Add Report Header**
  doc.fontSize(18).text("Database Backup Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Database Type: ${dbType}`);
  doc.text(`Backup File: ${backupFile}`);
  doc.text(`Timestamp: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.fontSize(12).text("Backup Data:", { underline: true });
  doc.moveDown();
  
  if (dbType === "mysql") {
    // **📌 Read SQL Backup File**
    const backupData = fs.readFileSync(backupFile, "utf8");
    doc.fontSize(10).text(backupData, {
      width: 500,
      align: "left",
      lineBreak: true,
    });
  } else if (dbType === "mongodb") {
    // **📌 Locate BSON Files and Convert to JSON**
    const collectionsDir = path.join(backupFile, dbName);
    if (fs.existsSync(collectionsDir)) {
      const bsonFiles = fs.readdirSync(collectionsDir).filter(file => file.endsWith(".bson"));
      
      bsonFiles.forEach(file => {
        const bsonPath = path.join(collectionsDir, file);
        const bsonData = fs.readFileSync(bsonPath);
        const jsonData = BSON.deserialize(bsonData);

        doc.fontSize(10).text(`Collection: ${file.replace(".bson", "")}`, { underline: true });
        doc.moveDown();
        doc.fontSize(8).text(JSON.stringify(jsonData, null, 2), {
          width: 500,
          align: "left",
          lineBreak: true,
        });
        doc.moveDown();
      });
    } else {
      doc.fontSize(10).text("No BSON data found.");
    }
  }

  doc.end();
  return pdfFile;
}

module.exports = { performBackup };
