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
const knexconfig = require('./config/knexfile')[process.env.NODE_ENV || 'development']
const knex = Knex(knexconfig)

// objection model init
Model.knex(knex)

// user actions
const {
  createUser,
  patchUser,
  getUser
} = require('./user')

// auth
const { login } = require('./auth')

// profiles action
const { getProfile } = require('./profile')

// follow actions
const {
  newFollow,
  delFollow
} = require('./follow')

// articles actions
const {
  createArticle,
  getArticles,
  getBySlug
} = require('./article')

// comments actions
const {
  getComments,
  newComment,
  delComment
} = require('./comment')

// favorites actions
const {
  newFavorite,
  delFavorite
} = require('./favorite')

// feed action
const {
  getFeed
} = require('./feed')

const notFound = async (req, res) => send(res, 404, 'Not Found')

module.exports = handleErrors(
  router(
    post('/users/login', login),

    post('/users', createUser),
    put('/users', patchUser),
    get('/users', getUser),

    get('/profiles/:username', getProfile),

    post('/profiles/:username/follow', newFollow),
    del('/profiles/:username/follow', delFollow),

    post('/articles', createArticle),
    get('/articles', getArticles),

    get('/articles/feed', getFeed),

    get('/articles/:slug/comments', getComments),
    post('/articles/:slug/comments', newComment),
    del('/articles/:slug/comments/:id', delComment),

    post('/articles/:slug/favorite', newFavorite),
    del('/articles/:slug/favorite', delFavorite),

    get('/articles/:slug', getBySlug),

    get('/*', notFound),
    post('/*', notFound),
    put('/*', notFound),
    del('/*', notFound)
  )
)
