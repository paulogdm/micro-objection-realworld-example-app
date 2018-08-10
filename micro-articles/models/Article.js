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
      required: ['author', 'slug'],
      properties: {
        author: {
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
    return {
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'articles.id',
          through: {
            from: 'articles_tags.article',
            to: 'articles_tags.tag'
          },
          to: 'tags.id'
        }
      }
    }
  }
}

module.exports = Article
