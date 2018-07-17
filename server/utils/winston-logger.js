const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}: ${info.stack}`;
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

function errorHandler() {
  this.handleError = function (error) {
    return logger.error(error);
    // .then(sendMailToAdminIfCritical)
    // .then(determineIfOperationalError);
  }
}

module.exports.errorHandler = new errorHandler();
module.exports.logger = logger;
