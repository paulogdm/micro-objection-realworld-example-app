const { Model } = require('objection')

class User extends Model {
  static get tableName () {
    return 'Followers'.toLowerCase()
  }

  static get idColumn () {
    return ['user', 'follower']
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['user', 'follower'],
      properties: {
        user: {
          type: 'string'
        },
        follower: {
          type: 'string'
        }
      }
    }
  }
}

module.exports = User