const { send } = require('micro')
const { ValidationError } = require('objection')

/**
 * Handle our error object. Works like a charm with Objection.
 * For now we map only the errors bellow. But feel free to map
 * more errors with objection-db-errors!
 * @param  {IncomingMessage} req
 * @param  {IncomingMessage} res
 * @param  {Error} err Error Expected Class or Generic.
 */
const errorHandler = async (req, res, err) => {
  if (err instanceof ValidationError) {
    send(res, 422, {errors: err.data})
  } else if (err instanceof UnauthorizedError) {
    send(res, 401, 'Unauthorized')
  } else if (err instanceof ForbiddenError) {
    send(res, 403, 'Forbidden')
  } else if (err instanceof NotFoundError) {
    send(res, 404, 'Not Found')
  } else {
    send(res, 500, 'Internal Server Error')
  }
}

/**
 * Try and handle errors if it fails.
 * @param  {Function} fn function to try...catch.
 */
const handleErrors = fn => async (req, res) => {
  try {
    return await fn(req, res)
  } catch (err) {
    console.error(err.stack)
    errorHandler(req, res, err)
  }
}

/**
 * Class error for Unauthorized
 */
class UnauthorizedError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, UnauthorizedError)
  }
}

/**
 * Class error for Forbidden
 */
class ForbiddenError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, ForbiddenError)
  }
}

/**
 * Class error for Not Found
 */
class NotFoundError extends Error {
  constructor (...args) {
    super(...args)
    Error.captureStackTrace(this, NotFoundError)
  }
}

module.exports = {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  handleErrors
}
