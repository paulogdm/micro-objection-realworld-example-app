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
  newArticle.author = jwt.username

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
      .where('author', author)
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

  const [articles, total] = await Promise.all([
    queryArticle
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc'),
    queryArticle.resultSize()
  ])

  return { articles, total }
}

module.exports = {
  createArticle,
  getArticles
}
