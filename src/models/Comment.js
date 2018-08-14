const { Model } = require('objection')

class Comment extends Model {
  static get tableName () {
    return 'Comments'.toLowerCase()
  }

  async $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['body', 'userId', 'articleId'],
      properties: {
        id: {
          type: 'integer'
        },
        body: {
          type: 'string'
        },
        userId: {
          type: 'integer'
        },
        articleId: {
          type: 'integer'
        },
        createdAt: {
          type: 'string'
        },
        updatedAt: {
          type: 'string'
        }
      }
    }
  }

  static get relationMappings () {
    const User = require('./User')
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.userId`,
          to: `${User.tableName}.id`
        }
      }
    }
  }
}

module.exports = Comment
