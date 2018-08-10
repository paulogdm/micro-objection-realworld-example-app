// external libs
const { router, get, post, del } = require('microrouter')
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
  createArticle,
  getArticles
} = require('./article')

const notFound = async (req, res) => send(res, 404, 'Not Found')

module.exports = handleErrors(
  router(
    post('/articles', createArticle),
    get('/articles', getArticles),

    get('/*', notFound),
    post('/*', notFound),
    del('/*', notFound)
  )
)
