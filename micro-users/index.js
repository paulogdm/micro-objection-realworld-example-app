// external libs
const {
  router,
  get,
  post,
  put,
  del
} = require('microrouter')
const { send } = require('micro')
const { Model } = require('objection')

// handling errors
const { handleErrors } = require('./error')

// knex declaration and config
const Knex = require('knex')
const knexconfig = require('./models/knexfile')[process.env.NODE_ENV || 'development']
const knex = Knex(knexconfig)

// objection model init
Model.knex(knex)

// user actions
const {
  login,
  createUser,
  patchUser,
  getUser
} = require('./user')

// profiles action
const { getProfile } = require('./profile')

// follow actions
const {
  getFollow,
  newFollow,
  delFollow
} = require('./profile')

const notFound = async (req, res) => send(res, 404, 'Not Found')

module.exports = handleErrors(
  router(
    post('/users/login', login),

    post('/users', createUser),
    put('/users', patchUser),
    get('/users', getUser),

    get('/profiles/:username', getProfile),

    get('/profiles/:username/follow', getFollow),
    post('/profiles/:username/follow', newFollow),
    del('/profiles/:username/follow', delFollow),

    get('/*', notFound),
    post('/*', notFound),
    put('/*', notFound),
    del('/*', notFound)
  )
)
