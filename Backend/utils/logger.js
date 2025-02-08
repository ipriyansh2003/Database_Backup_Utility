const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: "logs/application.log" }), 
  ],
});

module.exports = logger;