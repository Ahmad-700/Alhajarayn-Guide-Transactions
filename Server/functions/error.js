/**
 * will execute the parameter function in try catch block, and will handle the error
 * @param {function} fn 
 * @returns function
 */
function wrapper(fn) {
    return async (req, res, next) => {
        try {
            return await fn(req, res, next);
        } catch (e) {
            return next(e);//errorHandler(4 parameters). So, express knows this is an error handler then throw err to it.
        }
    }
}

function errorHandler(err, req, res, next) {
    if (err instanceof MyError)
        return res.status(err.status).json({ success: false, msg: err.msg || null, errMessage: err.message, error: err,stack:err.stack });
    else if (err) return res.json({ success: false, errMessage: err.message, error: err, msg: err.msg || null,stack:err.stack })
    else return res.json({ success: false, error: err,stack:err.stack })
}

class MyError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status || 400;//403 is forbidden error
    }
}

class BadRequestError extends MyError{
    constructor(message) {
        super(message, 400);
    }
}

class UnauthorizedError extends MyError{
    constructor(message) {
        super(message, 401);
    }
}

class NotFoundError extends MyError{
    constructor(message) {
        super(message, 404);
    }
}


module.exports = { wrapper, errorHandler,MyError,BadRequestError,UnauthorizedError,NotFoundError };