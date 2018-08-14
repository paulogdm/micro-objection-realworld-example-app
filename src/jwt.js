// external lib
const jwt = require('jsonwebtoken')

// my secret
const { secret } = require('./config/jwt')[process.env.NODE_ENV || 'development']

/**
 * Function that creates a new JWT token for a given user
 * @param  {String} options.username
 * @param  {String} options.email
 * @param  {Integer/String} options.id
 * @return {String} JWT token
 */
const createJwt = async ({username, email, id}) => {
  const newToken = jwt.sign({
    username,
    email,
    id
  }, secret, { expiresIn: '14d' })

  return newToken
}

/**
 * Decoding our JWT token and making sure we are the ones that
 * created the token
 * @param  {} req
 */
const verifyJwt = async (req) => {
  // no token provided
  if (!req.headers.authorization) return null

  // from "Token x123445xabcd" to "x123445xabcd"
  const token = req.headers.authorization.split(' ').pop()

  try {
    const decoded = jwt.verify(token, secret)
    return decoded
  } catch (err) {
    console.error('Token Verification Failed')
    return null
  }
}

module.exports = {
  createJwt,
  verifyJwt
}
