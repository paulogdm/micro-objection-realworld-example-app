// jwt parser and creation
const { verifyJwt } = require('./jwt')

// follower model
const User = require('./models/User')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

const delFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const dontWantToFollow = await User
    .query()
    .findOne('username', req.params.username)

  if (!dontWantToFollow) {
    throw new NotFoundError()
  }

  await dontWantToFollow
    .$relatedQuery('following')
    .unrelate()
    .where('id', jwt.id)

  return 'OK'
}

const newFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const wantToFollow = await User
    .query()
    .findOne('username', req.params.username)

  if (!wantToFollow) {
    throw new NotFoundError()
  }

  return wantToFollow
    .$relatedQuery('following')
    .relate(jwt.id)

  return 'OK'
}

module.exports = {
  newFollow,
  delFollow
}
