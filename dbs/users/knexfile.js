module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: '',
      db: 'users',
      database: 'users',
      user: 'root',
      password: '',
      charset: 'utf8',
      ssl: 'Amazon RDS'
    },
    pool: {
      min: 2,
      max: 10
    },
    useNullAsDefault: true
  }
}
