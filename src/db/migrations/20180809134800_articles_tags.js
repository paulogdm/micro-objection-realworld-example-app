exports.up = knex => {
  return knex.schema.createTable('articles_tags', table => {
    table
      .primary(['articleId', 'tagId'])

    table
      .bigInteger('articleId')
      .unsigned()
      .notNullable()

    table
      .bigInteger('tagId')
      .unsigned()
      .notNullable()

    table
      .foreign('articleId')
      .references('articles.id')
      .onDelete('CASCADE')

    table
      .foreign('tagId')
      .references('tags.id')
      .onDelete('CASCADE')
  })
}

exports.down = knex => knex.schema.dropTableIfExists('articles_tags')
