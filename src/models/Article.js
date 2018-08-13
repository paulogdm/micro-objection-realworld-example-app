const { Model } = require('objection')

class Article extends Model {
  static get tableName () {
    return 'Articles'.toLowerCase()
  }

  async $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (json) {
    json = super.$formatJson(json)
    json.favorited = !!json.favorited
    return json
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['userId', 'slug'],
      properties: {
        userId: {
          type: 'integer'
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
    const Favorite = require('./Favorite')
    const ArticleTags = require('./ArticleTags')
    const Comment = require('./Comment')
    return {
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: `${ArticleTags.tableName}.articleId`,
            to: `${ArticleTags.tableName}.tagId`
          },
          to: `${Tag.tableName}.id`
        }
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.userId`,
          to: `${User.tableName}.id`
        }
      },
      favoritedBy: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: `${this.tableName}.id`,
          through: {
            modelClass: Favorite,
            from: `${Favorite.tableName}.articleId`,
            to: `${Favorite.tableName}.userId`
          },
          to: `${User.tableName}.id`
        }
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: `${this.tableName}.id`,
          to: `${Comment.tableName}.articleId`
        }
      }
    }
  }

  static get namedFilters () {
    return {
      favorited: builder => {
        const {jwt} = builder.context()

        if (jwt) {
          builder.select(
            Article.relatedQuery('favoritedBy')
              .select('articleId')
              .where('userId', jwt.id)
              .as('favorited')
          )
        }

        return builder
      },
      favoritesCount: builder => builder.select(
        Article.relatedQuery('favoritedBy')
          .count()
          .as('favoritesCount')
      ),
      allFields: builder => builder.select('articles.*')
    }
  }
}

module.exports = Article
