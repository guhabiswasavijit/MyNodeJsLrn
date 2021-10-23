const sql = require('mssql')

const config = {
	server: 'localhost',
    database: 'LRN_SQL_SERVER',
    user: 'sa',
    password: 'Lotus2ibm',
    port: 1433,
    multipleStatements: true
}

const pool = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
  sql, pool
}