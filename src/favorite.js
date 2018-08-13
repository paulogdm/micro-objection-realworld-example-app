// jwt parser and creation
const { verifyJwt } = require('./jwt')

// follower model
const Article = require('./models/Article')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

const findBySlug = async (slug) => {
  const article = await Article
    .query()
    .findOne('slug', slug)

  if (!article) {
    throw new NotFoundError()
  }

  return article
}

const returnableArticle = async (id, jwt) => {
  return Article
    .query()
    .findById(id)
    .context({jwt})
    .eager('[author(profile), tags(tag)]')
    .applyFilter('favorited', 'favoritesCount', 'allFields')
}

const newFavorite = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const article = await findBySlug(req.params.slug)

  await article
    .$relatedQuery('favoritedBy')
    .relate(jwt.id)

  return returnableArticle(article.id, jwt)
}

const delFavorite = async (req, res) => {
  const jwt = await verifyJwt(req)
  if (!jwt) {
    throw new UnauthorizedError()
  }

  const article = await findBySlug(req.params.slug)

  await article
    .$relatedQuery('favoritedBy')
    .unrelate()
    .where('id', jwt.id)

  return returnableArticle(article.id, jwt)
}

module.exports = {
  newFavorite,
  delFavorite
}
