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

// follower model
const Article = require('./models/Article')

// errors
const {
  UnauthorizedError,
  NotFoundError
} = require('./error')

const slugMe = async (title) => {
  if (!title) return

  const slugCandidate = slugify(title, { lower: true })

  const slugTarget = await Article.query().where('slug', slugCandidate)

  if (slugTarget.length !== 0) {
    return `${slugCandidate}-${randomBytes(5).toString('hex')}`
  }

  return slugCandidate
}

const tagUpsert = async (tag) => {
  try {
    await Tag.query().insert({ tag })
  } catch (err) {
    // tag exists
  }
}

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

const createArticle = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const { article } = await json(req)

  // maybe a ES6 pick here?
  const newArticle = {
    title: article.title,
    description: article.description,
    body: article.body
  }

  newArticle.slug = await slugMe(article.title)
  newArticle.userId = jwt.id

  newArticle.tags = await handleTagList(article.tagList)

  const { id } = await Article
    .query()
    .upsertGraph(
      newArticle, {
        relate: true
      })

  return id
}

const handleQueryString = (queryBuilder, {tag, author, favorited}) => {
  if (tag) {
    queryBuilder
      .joinRelation('tags')
      .where('tags.tag', tag)
  }

  if (author) {
    queryBuilder
      .joinRelation('author')
      .where('users.username', author)
  }

  if (favorited) {
    queryBuilder
      .joinRelation('favoritedBy')
      .where('favoritedBy.username', favorited)
  }
}

const getArticles = async (req, res) => {
  const qs = req.url.split('?').pop()
  const queryParsed = await querystring.parse(qs)

  const queryArticle = Article.query()
  handleQueryString(queryArticle, queryParsed)

  const limit = queryParsed.limit || 20
  const offset = queryParsed.offset || 0

  const jwt = await verifyJwt(req)

  const [articles, articlesCount] = await Promise.all([
    queryArticle
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
      .eager('author(profile)')
      .context({jwt}),
    queryArticle.resultSize()
  ])

  return { articles, articlesCount }
}

const updateBySlug = async (req, res) => {
  const jwt = await verifyJwt(req)
  const { slug } = req.params

  const oldArticle = await Article
    .query()
    .findOne('slug', slug)

  if (!oldArticle) {
    throw new NotFoundError()
  }

  if (oldArticle.author !== jwt.id) {
    throw new UnauthorizedError()
  }

  const { article } = await json(req)

  oldArticle.tags = await handleTagList(article.tagList)

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

  return 'OK'
}

const getBySlug = async (req, res) => {
  const jwt = await verifyJwt(req)
  const { slug } = req.params

  const article = await Article
    .query()
    .findOne('slug', slug)
    .eager('author(profile)')
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
