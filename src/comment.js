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

/**
 * Helper function that finds articles by slug
 * @param  {String} slug
 * @return {Article}      Article class
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
 * Get comments of a single article
 * @param  {} req
 * @param  {} res
 */
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

/**
 * Creating a new comment for an article
 * @param  {} req
 * @param  {} res
 */
const newComment = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  const { comment } = await json(req)
  const article = await findBySlug(req.params.slug)

  // populating those fields
  comment.userId = jwt.id
  comment.articleId = article.id

  const result = await Comment
    .query()
    .insert(comment)
    .eager('author(profile)')
    .context({jwt})

  return {comment: result}
}

/**
 * Deleting a single comment
 * @param  {} req
 * @param  {} res
 */
const delComment = async (req, res) => {
  const jwt = await verifyJwt(req)

  if (!jwt) {
    throw new UnauthorizedError()
  }

  // wanted comment
  const target = await Comment
    .query()
    .findById(req.params.id)

  // if it doesnt exists
  if (!target) {
    throw new NotFoundError()
  }

  // if user is not the owner
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
