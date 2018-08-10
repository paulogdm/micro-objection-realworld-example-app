// jwt parser and creation
const { verifyJwt } = require('./jwt')

// follower model
const Follower = require('./models/Follower')

// errors
const { UnauthorizedError } = require('./error')

const getFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const myFollowList = Follower
    .query()
    .where('follower', jwt.username)

  return myFollowList
}

const delFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  await Follower
    .query()
    .delete()
    .where({
      user: req.params.username,
      follower: jwt.username
    })

  return 'OK'
}

const newFollow = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  await Follower
    .query()
    .insert({
      user: req.params.username,
      follower: jwt.username
    })

  return 'OK'
}

module.exports = {
  getFollow,
  newFollow,
  delFollow
}
