exports.up = knex =>
  knex.schema.createTable('followers', table => {
    table
      .bigInteger('user')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table
      .bigInteger('follower')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table.primary(['follower', 'user'])
  })

exports.down = knex => knex.schema.dropTableIfExists('followers')
