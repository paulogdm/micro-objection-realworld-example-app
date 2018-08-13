// json parser
const { json } = require('micro')

// slugify to transform "a beatiful title" to "a-beatiful-title"
const slugify = require('slugify')

// jwt parser and creation
const { verifyJwt } = require('./jwt')

// to generate random slugs
const { randomBytes } = require('crypto')

// node's querystyring lib
const querystring = require('querystring')

// user model
const Tag = require('./models/Tag')

// article model
const Article = require('./models/Article')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

/**
 * Function that slugifies a title
 * @param  {String} title Title that we want to slugify
 * @return {String}       Slug
 * Eg: slugMe('Im a title') => 'im-a-title'
 *     slugMe('Im a title') => 'im-a-title-1234567890'
 */
const slugMe = async (title) => {
  if (!title) return

  const slugCandidate = slugify(title, { lower: true })

  // checking uniqueness of our slug
  const slugTarget = await Article
    .query()
    .findOne('slug', slugCandidate)

  // if it exists, append a little hash and pray to the math gods of collisions
  if (slugTarget) {
    return `${slugCandidate}-${randomBytes(5).toString('hex')}`
  }

  return slugCandidate
}

/**
 * Upsert a tag
 * @param  {String} tag Tag to be inserted
 */
const tagUpsert = async (tag) => {
  try {
    await Tag.query().insert({ tag })
  } catch (err) {
    // tag exists
  }
}

/**
 * It handles tagList from body.
 * @param  {Array} tagList Array of tags
 * @return {Array}         returns array of ids.
 * Eg: handleTagList(['x', 'y', 'z']) => [{id:1}, {id:2}, {id:3}]
 */
const handleTagList = async (tagList) => {
  if (tagList) {
    await Promise.all(tagList.map(tagUpsert))
  }

  const tags = await Tag
    .query()
    .select('id')
    .whereIn('tag', tagList)

  return tags
}

/**
 * Helper that applies common fields to our queries
 * @param  {QueryBuilder} query Query that will be returned
 * @param  {Object} jwt   Given auth object for context
 * @return {QueryBuilder}       modified query
 */
const applyRelatedFields = async (query, jwt) => {
  query
    .context({jwt})
    .eager('[author(profile), tags]')
    .applyFilter('favorited', 'favoritesCount', 'allFields')

  return query
}

/**
 * Sometimes we modify a query so much that it is safer to
 * just fetch and Article again and return it.
 * @param  {Number/String} id  id of the article
 * @param  {Object} jwt auth object
 * @return {QueryBuilder}     query with new stuff
 */
const returnableArticle = async (id, jwt) => {
  const query = Article
    .query()
    .findById(id)
  return applyRelatedFields(query, jwt)
}

/**
 * Creates an article based on input of our user.
 * @param  {} req
 * @param  {} res
 */
const createArticle = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  // parsing body
  const { article } = await json(req)

  // maybe a ES6 pick here?
  // either way, we know our fields for now,
  // but a better way would be to request the fields
  // from our Article.jsonSchema and map from there.
  const newArticle = {
    title: article.title,
    description: article.description,
    body: article.body
  }

  // handling our slug
  newArticle.slug = await slugMe(article.title)
  // author is the requester
  newArticle.userId = jwt.id

  // tags need to be handled.
  newArticle.tags = await handleTagList(article.tagList)

  // now we can finally upsert everything, with relations and everything.
  const { id } = await Article
    .query()
    .upsertGraph(
      newArticle, {
        relate: true
      })

  return returnableArticle(id, jwt)
}

/**
 * This function translates a querystring to builder functions
 * @param  {QueryBuilder} queryBuilder      our query object as usual
 * @param  {String} options.tag             exact match of a tag
 * @param  {String} options.author          exact match of an author
 * @param  {String} options.favorited       exact match of a favorite
 */
const handleQueryString = (queryBuilder, {tag, author, favorited}) => {
  if (tag) {
    queryBuilder
      .joinRelation('tags')
      .where('tags.tag', tag)
  }

  if (author) {
    queryBuilder
      .joinRelation('author')
      .where('author.username', author)
  }

  if (favorited) {
    queryBuilder
      .joinRelation('favoritedBy')
      .where('favoritedBy.username', favorited)
  }
}

/**
 * Function that retrieves many articles for our users.
 * @param  {} req
 * @param  {} res
 */
const getArticles = async (req, res) => {
  // separating querystring from the url itself
  const qs = req.url.split('?').pop()
  // transforming querystring into an object
  const queryParsed = await querystring.parse(qs)

  // initializing our Article query
  const queryArticle = Article.query()
  // applying all criterias of querystring to our query
  handleQueryString(queryArticle, queryParsed)

  // limit and offset, with default values
  const limit = queryParsed.limit || 20
  const offset = queryParsed.offset || 0

  // auth is opt
  const jwt = await verifyJwt(req)

  // executing both the query and the count
  const [articles, articlesCount] = await Promise.all([
    queryArticle
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
      .context({jwt})
      .eager('[author(profile), tags]')
      .applyFilter('favorited', 'favoritesCount', 'allFields'),
    queryArticle.resultSize()
  ])

  return { articles, articlesCount }
}

/**
 * Updating an article by his slug.
 * Only the author can do that!
 * @param  {} req
 * @param  {} res
 */
const updateBySlug = async (req, res) => {
  const jwt = await verifyJwt(req)
  const { slug } = req.params

  // first, we need to fetch the wanted article
  const oldArticle = await Article
    .query()
    .findOne('slug', slug)

  // now a few checks
  // does the result exist?
  if (!oldArticle) {
    throw new NotFoundError()
  }

  // does it belongs to the requestor?
  if (oldArticle.author !== jwt.id) {
    throw new UnauthorizedError()
  }

  // parse body
  const { article } = await json(req)

  // handle taglist
  oldArticle.tags = await handleTagList(article.tagList)

  // handle taglist
  if (oldArticle.title !== article.title) {
    oldArticle.title = await slugMe(article.title)
    oldArticle.slug = await slugMe(article.title)
  }

  oldArticle.description = article.description || oldArticle.description
  oldArticle.body = article.body || oldArticle.body

  const { id } = await Article
    .query()
    .upsertGraph(
      oldArticle, {
        relate: true,
        unrelate: true
      })

  return returnableArticle(id, jwt)
}

const getBySlug = async (req, res) => {
  const jwt = await verifyJwt(req)
  const { slug } = req.params

  const article = await Article
    .query()
    .findOne('slug', slug)
    .context({jwt})
    .eager('[author(profile), tags]')
    .applyFilter('favorited', 'favoritesCount', 'allFields')
    .context({jwt})

  if (!article) {
    throw new NotFoundError()
  }

  return {article}
}

module.exports = {
  createArticle,
  getArticles,
  updateBySlug,
  getBySlug
}
