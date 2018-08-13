// jwt parser and creation
const { verifyJwt } = require('./jwt')

// follower model
const User = require('./models/User')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

const findByUsername = async (username) => {
  const user = await User
    .query()
    .findOne('username', username)

  if (!user) {
    throw new NotFoundError()
  }

  return user
}

const delFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const dontWantToFollow = await findByUsername(req.params.username)

  await dontWantToFollow
    .$relatedQuery('follower')
    .unrelate()
    .where('id', jwt.id)

  return 'OK'
}

const newFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const wantToFollow = await findByUsername(req.params.username)

  await wantToFollow
    .$relatedQuery('follower')
    .relate(jwt.id)

  return 'OK'
}

module.exports = {
  newFollow,
  delFollow
}
