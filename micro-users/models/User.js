const { Model } = require('objection')

class User extends Model {
  static get tableName () {
    return 'Users'.toLowerCase()
  }

  async $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (json) {
    json = super.$formatJson(json)
    delete json.hashed_password
    return json
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['username', 'email', 'hashed_password'],
      properties: {
        id: {
          type: 'integer'
        },
        username: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        email: {
          type: 'string',
          minLength: 0,
          maxLength: 255
        },
        hashed_password: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        bio: {
          type: ['string', 'null'],
          minLength: 0,
          maxLength: 255,
          default: ''
        },
        image: {
          type: ['string', 'null'],
          minLength: 0,
          maxLength: 255,
          default: ''
        },
        createdAt: {type: 'string'},
        updatedAt: {type: 'string'}
      }
    }
  }
}

module.exports = User
