const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}: ${info.stack}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'combined-log.log'
    })
  ]
});

module.exports = logger;
