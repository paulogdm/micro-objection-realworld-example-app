// jwt parser and creation
const { verifyJwt } = require('./jwt')

// user model
const User = require('./models/User')
// follower model
const Follower = require('./models/Follower')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

const getProfile = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const selectedUser = await User
    .query()
    .findOne('username', req.params.username)

  const isRelated = await selectedUser
    .$relatedQuery('follower')
    .where('id', jwt.id).debug()

  console.info(isRelated)

  selectedUser.following = !!isRelated

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {profile: selectedUser}
}

module.exports = {
  getProfile
}
