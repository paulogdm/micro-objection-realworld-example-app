// jwt parser and creation
const { verifyJwt } = require('./jwt')

// follower model
const User = require('./models/User')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

/**
 * finding user by username
 * @param  {String} username
 * @return {User}             User class
 */
const findByUsername = async (username) => {
  const user = await User
    .query()
    .findOne('username', username)

  if (!user) {
    throw new NotFoundError()
  }

  return user
}

/**
 * Deleting a follow entry
 * @param  {} req
 * @param  {} res
 */
const delFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  // target user
  const user = await findByUsername(req.params.username)

  // just removing the relationshipt between requestor and user
  await user
    .$relatedQuery('follower')
    .unrelate()
    .where('id', jwt.id)

  return 'OK'
}

/**
 * New follow entry
 * @param  {} req
 * @param  {} res
 */
const newFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const user = await findByUsername(req.params.username)

  await user
    .$relatedQuery('follower')
    .relate(jwt.id)

  return 'OK'
}

module.exports = {
  newFollow,
  delFollow
}
