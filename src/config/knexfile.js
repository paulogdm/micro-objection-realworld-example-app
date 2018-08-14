module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: 'realworldapp.cgzvcdvzxooo.us-east-1.rds.amazonaws.com',
      db: 'realworldapp',
      database: 'realworldapp',
      user: 'root',
      password: 'hRDm1XpOHKsyynnjPJcGUBLzeLLaIqsk',
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
