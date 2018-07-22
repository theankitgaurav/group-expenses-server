const logger = require('./winston-logger');

class ErrorHandler {
    handleError (err)  {
        if (!!err.originalError) {
            logger.error(err.originalError);
        } else {
            logger.error(err);
        }
        const statusCode = err.status || 500;
        const type = err.type || 'InternalServerError';
        const message = err.message || 'Something wrong happened in the server';
        return {statusCode, type, message};
    }
}


module.exports = ErrorHandler;