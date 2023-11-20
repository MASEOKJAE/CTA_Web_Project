var mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'sky',
  password: '1234',
  database: 'CTA',
});

module.exports = db;
