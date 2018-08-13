const { Model } = require('objection')

class ArticleTags extends Model {
  static get tableName () {
    return 'Articles_Tags'.toLowerCase()
  }

  static get idColumn () {
    return ['articleId', 'tagId']
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['articleId', 'tagId'],
      properties: {
        articleId: {
          type: 'integer'
        },
        tagId: {
          type: 'integer'
        }
      }
    }
  }
}

module.exports = ArticleTags
