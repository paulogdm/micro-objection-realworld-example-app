exports.up = knex => {
  return knex.schema.createTable('articles_tags', table => {
    table
      .primary(['article', 'tag'])

    table
      .bigInteger('article')
      .unsigned()
      .notNullable()

    table
      .bigInteger('tag')
      .unsigned()
      .notNullable()

    table
      .foreign('article')
      .references('articles.id')
      .onDelete('CASCADE')

    table
      .foreign('tag')
      .references('tags.id')
      .onDelete('CASCADE')
  })
}

exports.down = knex => knex.schema.dropTableIfExists('articlestags')
