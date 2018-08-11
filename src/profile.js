// jwt parser and creation
const { verifyJwt } = require('./jwt')

// user model
const User = require('./models/User')

// errors
const { NotFoundError } = require('./error')

const getProfile = async (req, res) => {
  const jwt = await verifyJwt(req)

  const selectedUser = await User
    .query()
    .findOne('username', req.params.username)
    .applyFilter('profile')
    .context({jwt})

  if (!selectedUser) {
    throw new NotFoundError()
  }

  return {profile: selectedUser}
}

module.exports = {
  getProfile
}
