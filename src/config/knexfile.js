module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: '',
      db: '',
      database: '',
      user: '',
      password: '',
      charset: '',
      ssl: 'Amazon RDS'
    },
    pool: {
      min: 2,
      max: 10
    },
    useNullAsDefault: true
  }
}
