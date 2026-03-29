const mysql = require('mysql2')

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'calendly_clone',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
})

module.exports = pool
