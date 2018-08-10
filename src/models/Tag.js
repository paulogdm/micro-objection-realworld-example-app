const { Model } = require('objection')

class Tag extends Model {
  static get tableName () {
    return 'Tags'.toLowerCase()
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['tag'],
      properties: {
        tag: {
          type: 'string',
          minLength: 1,
          maxLength: 20
        }
      }
    }
  }

  static get relationMappings () {
    const Article = require('./Article')
    return {
      articles: {
        relation: Model.ManyToManyRelation,
        modelClass: Article,
        join: {
          from: 'tags.id',
          through: {
            from: 'articles_tags.tagId',
            to: 'articles_tags.articleId'
          },
          to: 'articles.id'
        }
      }
    }
  }
}

module.exports = Tag
