// jwt parser and creation
const { verifyJwt } = require('./jwt')

// article model
const Article = require('./models/Article')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

/**
 * Finding article by slug.
 * @param  {String} slug
 */
const findBySlug = async (slug) => {
  const article = await Article
    .query()
    .findOne('slug', slug)

  if (!article) {
    throw new NotFoundError()
  }

  return article
}

/**
 * Helper that will make sure our queryBuilder
 * is returning the right stuff.
 * @param  {Number/String} id
 * @param  {Object} jwt auth object for context
 * @return {Article}     article with proper fields
 */
const returnableArticle = async (id, jwt) => {
  return Article
    .query()
    .findById(id)
    .context({jwt})
    .eager('[author(profile), tags]')
    .applyFilter('favorited', 'favoritesCount', 'allFields')
}

/**
 * New favorite as requested by user.
 * @param  {} req
 * @param  {} res
 */
const newFavorite = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const article = await findBySlug(req.params.slug)

  // once we fetch the article, just relate it to our user.
  await article
    .$relatedQuery('favoritedBy')
    .relate(jwt.id)

  return returnableArticle(article.id, jwt)
}

/**
 * Removes one article as favorite.
 * @param  {} req
 * @param  {} res
 * @return {Article}
 */
const delFavorite = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const article = await findBySlug(req.params.slug)

  // once we fetch the article, let objection
  // remove the rows
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
