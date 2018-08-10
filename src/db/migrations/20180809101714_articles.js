exports.up = knex =>
  knex.schema.createTable('articles', table => {
    table
      .bigIncrements('id')
      .primary()
    table
      .bigInteger('userId')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table
      .string('slug')
      .notNullable()
      .unique()
    table.string('title')
    table.string('description')
    table.text('body')
    table.datetime('createdAt').defaultTo(knex.fn.now())
    table.datetime('updatedAt').defaultTo(knex.fn.now())
  })

exports.down = knex => knex.schema.dropTableIfExists('articles')
