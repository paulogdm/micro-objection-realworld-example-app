exports.up = knex =>
  knex.schema.createTable('favorites', table => {
    table
      .bigInteger('userId')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table
      .bigInteger('articleId')
      .unsigned()
      .notNullable()
      .references('articles.id')
      .onDelete('CASCADE')
    table.primary(['articleId', 'userId'])
  })

exports.down = knex => knex.schema.dropTableIfExists('favorites')
