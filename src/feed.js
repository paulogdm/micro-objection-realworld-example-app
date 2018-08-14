// jwt parser and creation
const { verifyJwt } = require('./jwt')

// node's querystyring lib
const querystring = require('querystring')

// article model
const Article = require('./models/Article')

// errors
const {
  UnauthorizedError
} = require('./error')

/**
 * Retrieving a user feed: only articles of people he follows.
 * @param  {} req
 * @param  {} res
 */
const getFeed = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const feedQuery = Article
    .query()
    .joinRelation('author.follower')
    .where('author:follower.id', jwt.id)

  // querystring pagination
  const qs = req.url.split('?').pop()
  const queryParsed = await querystring.parse(qs)
  const limit = queryParsed.limit || 20
  const offset = queryParsed.offset || 0

  // counting the result and also making it contextualized
  const [articles, articlesCount] = await Promise.all([
    feedQuery
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
      .context({jwt})
      .eager('[author(profile), tags]')
      .applyFilter('favorited', 'favoritesCount', 'allFields'),
    feedQuery
      .resultSize()
  ])

  return { articles, articlesCount }
}

module.exports = {
  getFeed
}
