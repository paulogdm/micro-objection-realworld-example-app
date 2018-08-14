exports.up = knex =>
  knex.schema
    .createTable('tags', table => {
      table
        .bigIncrements('id')
        .primary()
      table
        .specificType('tag', 'char(20)')
        .notNullable()
        .unique()
    })

exports.down = knex => knex.schema.dropTableIfExists('tags')
