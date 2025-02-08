const { exec } = require("child_process");
const logger = require("./logger");

async function restoreMySQL(backupFile, dbConfig) {
  // Replace backslashes with forward slashes for compatibility
  const normalizedBackupFile = backupFile.replace(/\\/g, "/");
  const command = `mysql -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} < backups/`;

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        logger.error(`MySQL restore failed: ${error.message}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
async function restoreMongoDB(backupFile, dbConfig) {
  const command = `mongodump --uri="mongodb://localhost:27017" --db=${dbConfig.database} --out=backups/`;

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        logger.error(`MongoDB restore failed: ${error.message}`);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Similar functions for PostgreSQL and SQLite...

module.exports = { restoreMySQL, restoreMongoDB };