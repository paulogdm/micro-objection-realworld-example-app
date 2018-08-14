// json parser
const { json } = require('micro')

// bcrypt
const bcrypt = require('bcryptjs')

// jwt parser and creation
const { createJwt, verifyJwt } = require('./jwt')

// user model
const User = require('./models/User')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

/**
 * Here we hash our passwords.
 * @param  {String} pass  password to hash
 * @return {String}       hash
 */
const hashPassword = async (pass) => {
  return bcrypt.hash(pass, 10)
}

/**
 * Creates a user.
 * @param  {} req
 * @param  {} res
 */
const createUser = async (req, res) => {
  const { user } = await json(req)

  user.hashed_password = await hashPassword(user.password)
  delete user.password

  const newUser = await User
    .query()
    .insert(user)

  const token = await createJwt(newUser)

  return {user: Object.assign(newUser.toJSON(), {token})}
}

/**
 * Updates a user
 * @param  {} req [description]
 * @param  {} res [description]
 */
const patchUser = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const { user } = await json(req)

  if (user.password) {
    user.hashed_password = await hashPassword(user.password)
    delete user.password
  }

  const patchedUser = await User
    .query()
    .patchAndFetchById(jwt.username, user)

  return {user: patchedUser}
}

/**
 * Fetches a user from our database.
 * @param  {} req
 * @param  {} res
 */
const getUser = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const selectedUser = await User
    .query()
    .findById(jwt.id)

  // if user was deleted
  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {user: selectedUser}
}

module.exports = {
  createUser,
  patchUser,
  getUser
}
