// json parser
const { json } = require('micro')

// bcrypt
const bcrypt = require('bcrypt')

// jwt parser and creation
const { createJwt, verifyJwt } = require('./jwt')

// user model
const User = require('./models/User')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

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

  return Object.assign(fetchedUser.toJSON(), token)
}

const createUser = async (req, res) => {
  const { user } = await json(req)

  const newUser = await User.query().insert(user)

  return newUser
}

const patchUser = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const { user } = await json(req)

  const patchedUser = await User.query().patchAndFetchById(jwt.username, user)

  return patchedUser
}

const getUser = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const selectedUser = await User.query().fetchById(jwt.username)

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return selectedUser
}

module.exports = {
  login,
  createUser,
  patchUser,
  getUser
}
