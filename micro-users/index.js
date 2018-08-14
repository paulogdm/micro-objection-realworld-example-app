// external libs
const { router, get, post, put } = require('microrouter')
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

const SERVICE_ENTRYPOINT = '/users'

const notFound = async (req, res) => send(res, 404, 'Not Found')

module.exports = handleErrors(
  router(
    post(`${SERVICE_ENTRYPOINT}/login`, login),

    post(`${SERVICE_ENTRYPOINT}`, createUser),
    put(`${SERVICE_ENTRYPOINT}`, patchUser),
    get(`${SERVICE_ENTRYPOINT}`, getUser),

    get('/*', notFound),
    post('/*', notFound),
    put('/*', notFound)
  )
)
