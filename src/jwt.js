const jwt = require('jsonwebtoken')

const { secret } = require('./config/jwt')[process.env.NODE_ENV || 'development']

const createJwt = async ({username, email, id}) => {
  const newToken = jwt.sign({
    username,
    email,
    id
  }, secret, { expiresIn: '14d' })

  return newToken
}

const verifyJwt = async (req) => {
  if (!req.headers.authorization) return null

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
