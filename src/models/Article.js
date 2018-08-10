const { Model } = require('objection')

class Article extends Model {
  static get tableName () {
    return 'Articles'.toLowerCase()
  }

  async $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['userId', 'slug'],
      properties: {
        userId: {
          type: 'string',
          minLength: 1,
          maxLength: 20
        },
        slug: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        title: {
          type: ['string', 'null'],
          minLength: 0,
          maxLength: 255
        },
        description: {
          type: ['string', 'null'],
          minLength: 0,
          maxLength: 255,
          default: ''
        },
        body: {
          type: ['string', 'null']
        },
        createdAt: {type: 'string'},
        updatedAt: {type: 'string'}
      }
    }
  }

  static get relationMappings () {
    const Tag = require('./Tag')
    const User = require('./User')
    return {
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'articles.id',
          through: {
            from: 'articles_tags.articleId',
            to: 'articles_tags.tagId'
          },
          to: 'tags.id'
        }
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'article.userId',
          to: 'user.id'
        }
      }
    }
  }
}

module.exports = Article
