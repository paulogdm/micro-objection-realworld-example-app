// json parser
const { json } = require('micro')

// bcrypt
const bcrypt = require('bcrypt')

// jwt parser and creation
const { createJwt } = require('./jwt')

// user model
const User = require('./models/User')

// errors
const {
  UnauthorizedError
} = require('./error')

/**
 * Comparing a given password against a bcrypt hash.
 * @param  {String} pass Password given by the user
 * @param  {String} hash Hash retrieved from the DB
 * @return {[type]}      [description]
 */
const comparePassword = async (pass, hash) => {
  return bcrypt.compare(pass, hash)
}

const login = async (req, res) => {
  const { user } = await json(req)

  const [fetchedUser] = await User.query().where('email', user.email)

  if (!fetchedUser) {
    // instead of NotFound, we throw unauthorized because we don't
    // want our user spoofing emails and asking questions like
    // "the email xxxxx@xxxxx exists in your service?"
    throw new UnauthorizedError()
  }

  const passMatch = await comparePassword(user.password, fetchedUser.hashed_password)

  if (!passMatch) {
    throw new UnauthorizedError()
  }

  const token = await createJwt(fetchedUser)

  return {user: Object.assign(fetchedUser.toJSON(), {token})}
}

module.exports = {
  login
}
