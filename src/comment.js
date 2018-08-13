// json parser
const { json } = require('micro')

// jwt parser
const { verifyJwt } = require('./jwt')

// article model
const Article = require('./models/Article')

// comment model
const Comment = require('./models/Comment')

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

const getComments = async (req, res) => {
  const jwt = await verifyJwt(req)
  const article = await findBySlug(req.params.slug)

  const result = Comment
    .query()
    .where('articleId', article.id)
    .eager('author(profile)')
    .context({jwt})

  return result
}

const newComment = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const { comment } = await json(req)
  const article = await findBySlug(req.params.slug)

  comment.userId = jwt.id
  comment.articleId = article.id

  const result = await Comment
    .query()
    .insert(comment)
    .eager('author(profile)')
    .context({jwt})

  return {comment: result}
}

const delComment = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const target = await Comment
    .query()
    .findById(req.params.id)

  if (!target) {
    throw new NotFoundError()
  }

  if (target.userId !== jwt.id) {
    throw new UnauthorizedError()
  }

  const numberOfRows = await target
    .$query()
    .delete()

  return {rows: numberOfRows}
}

module.exports = {
  getComments,
  newComment,
  delComment
}
