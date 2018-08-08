const bcrypt = require('bcrypt')

const { Model } = require('objection')

const hashPassword = async (pass) => {
  return bcrypt.hash(pass, 10)
}

class User extends Model {
  static get tableName () {
    return 'User'.toLowerCase()
  }

  async $beforeInsert () {
    this.hashed_password = await hashPassword(this.password)
    delete this.password
  }

  async $beforeUpdate () {
    if (this.password) {
      this.hashed_password = await hashPassword(this.password)
      delete this.password
    }

    this.updatedAt = new Date().toISOString()
  }

  $formatJson (json) {
    json = super.$formatJson(json)
    delete json.hashed_password
    return json
  }

  static get idColumn () {
    return 'username'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['username', 'email', 'hashed_password'],
      properties: {
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
