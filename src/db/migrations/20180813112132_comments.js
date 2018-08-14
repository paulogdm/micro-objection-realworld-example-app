exports.up = knex =>
  knex.schema.createTable('comments', table => {
    table
      .bigIncrements('id')
      .primary()
    table
      .text('body')
      .notNullable()
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
    table.datetime('createdAt').defaultTo(knex.fn.now())
    table.datetime('updatedAt').defaultTo(knex.fn.now())
  })

exports.down = knex => knex.schema.dropTableIfExists('comments')
