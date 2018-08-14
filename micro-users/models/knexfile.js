module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: '',
      db: '',
      database: '',
      user: '',
      password: '',
      db: 'users',
      database: 'users',
      user: 'root',
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
