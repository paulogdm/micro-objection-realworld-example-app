const jwt = require('jsonwebtoken')

const secret = 'myrealworldappsecret'

const createJwt = async ({username, email}) => {
  const newToken = jwt.sign({
    username,
    email
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
