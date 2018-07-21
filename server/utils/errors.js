const httpError = require("http-errors");

const DEFAULT_ERROR_STATUS = 500;
const DEFAULT_ERR_MSG = 'Something wrong happened in the server';
const DEFAULT_ERR_TYPE = 'InternalServerError';

class HttpError extends Error {
    constructor(status = DEFAULT_ERROR_STATUS, type = DEFAULT_ERR_TYPE, message = DEFAULT_ERR_MSG) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.status = status;
        this.type = type;
    }
}

module.exports.BadRequestError = class extends HttpError {
    constructor(message = "The request was not valid") {
        super(400, 'BadRequestError', message);
    }
}

module.exports.AuthorizationError = class  extends HttpError {
    constructor(message = "You are not authorized for accessing the resource you are looking for") {
        super(401, 'AuthorizationError', message);
    }
}

module.exports.NotFoundError = class extends HttpError {
    constructor(message = 'The resource you are looking for does not exist') {
        super(404, 'NotFoundError', message);
    }
}

module.exports.InternalServerError = class extends HttpError {
    // Pass the message to be sent to rest client in the message parameter of the constructor
    constructor(message='Something bad happened in the server', err=null) {
        super(500, 'InternalServerError', message);
        if (err) {
            this.originalError = err;
        }
    }
}

module.exports.BadTokenError = class extends this.AuthorizationError {
    constructor() {
        super("Bad Token");
    }
}

module.exports.MissingTokenError = class extends this.AuthorizationError {
    constructor() {
        super("Missing Token");
    }
}

module.exports.InvalidTokenError = class extends this.AuthorizationError {
    constructor() {
        super("Invalid Token: Token does not match with any user");
    }
}