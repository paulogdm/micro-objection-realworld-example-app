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
    json.following = !!json.following
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
          maxLength: 20
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

  static get namedFilters () {
    return {
      profile: builder => {
        const {jwt} = builder.context()

        if (jwt) {
          builder.select(
            User
              .relatedQuery('follower')
              .findOne('id', jwt.id)
              .count()
              .as('following')
          )
        }

        return builder.select([
          'users.username',
          'users.bio',
          'users.image'
        ])
      }
    }
  }

  static get relationMappings () {
    const Follower = require('./Follower')
    return {
      follower: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.id`,
          through: {
            modelClass: Follower,
            from: `${Follower.tableName}.user`,
            to: `${Follower.tableName}.follower`
          },
          to: `${this.tableName}.id`
        }
      },
      following: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.id`,
          through: {
            modelClass: Follower,
            from: `${Follower.tableName}.follower`,
            to: `${Follower.tableName}.user`
          },
          to: `${this.tableName}.id`
        }
      }
    }
  }
}

module.exports = User
