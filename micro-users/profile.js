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

  const [selectedUser, isRelated] = await Promise.all([
    User
      .query()
      .findById(req.params.username)
      .pick(['username', 'bio', 'image']),

    Follower
      .query()
      .findById([req.params.username, jwt.username])
  ])

  selectedUser.following = !!isRelated

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {profile: selectedUser}
}

module.exports = {
  getProfile
}
