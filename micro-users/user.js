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

const hashPassword = async (pass) => {
  return bcrypt.hash(pass, 10)
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

const createUser = async (req, res) => {
  const { user } = await json(req)

  user.hashed_password = await hashPassword(user.password)
  delete user.password

  const newUser = await User.query().insert(user)

  const token = await createJwt(newUser)

  return {user: Object.assign(newUser.toJSON(), {token})}
}

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

  const patchedUser = await User.query().patchAndFetchById(jwt.id, user)

  return {user: patchedUser}
}

const getUser = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const selectedUser = await User.query().findById(jwt.id)

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {user: selectedUser}
}

module.exports = {
  login,
  createUser,
  patchUser,
  getUser
}
