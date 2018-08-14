// jwt parser and creation
const { verifyJwt } = require('./jwt')

// user model
const User = require('./models/User')

// errors
const { NotFoundError } = require('./error')

/**
 * from User to a Profile
 * @param  {} req
 * @param  {} res
 */
const getProfile = async (req, res) => {
  const jwt = await verifyJwt(req)

  const selectedUser = await User
    .query()
    .findOne('username', req.params.username)
    .context({jwt})
    .applyFilter('profile')

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {profile: selectedUser}
}

module.exports = {
  getProfile
}
