exports.up = knex =>
  knex.schema.createTable('followers', table => {
    table
      .specificType('user', 'char(20)')
      .notNullable()
      .references('users.username')
      .onDelete('CASCADE')
    table
      .specificType('follower', 'char(20)')
      .notNullable()
      .references('users.username')
      .onDelete('CASCADE')
    table.unique(['follower', 'user'])
  })

exports.down = knex => knex.schema.dropTableIfExists('followers')
