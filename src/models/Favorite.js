const { Model } = require('objection')

class Favorite extends Model {
  static get tableName () {
    return 'Favorites'.toLowerCase()
  }

  static get idColumn () {
    return ['userId', 'articleId']
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['userId', 'articleId'],
      properties: {
        userId: {
          type: 'integer'
        },
        articleId: {
          type: 'integer'
        }
      }
    }
  }
}

module.exports = Favorite
