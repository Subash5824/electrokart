const fs = require('fs');
const path = require('path');
const config = require('./config');

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()}: ${message}\n`;
    console.log(log);
    if (config.logging.level === 'info' || config.logging.level === 'debug') {
      fs.appendFileSync(config.logging.file, log);
    }
  },
  
  error: (message, error) => {
    const log = `[ERROR] ${new Date().toISOString()}: ${message} ${error ? error.stack || error : ''}\n`;
    console.error(log);
    fs.appendFileSync(config.logging.file, log);
  },
  
  warn: (message) => {
    const log = `[WARN] ${new Date().toISOString()}: ${message}\n`;
    console.warn(log);
    if (config.logging.level !== 'error') {
      fs.appendFileSync(config.logging.file, log);
    }
  },
  
  debug: (message) => {
    if (config.logging.level === 'debug') {
      const log = `[DEBUG] ${new Date().toISOString()}: ${message}\n`;
      console.debug(log);
      fs.appendFileSync(config.logging.file, log);
    }
  }
};

module.exports = logger;