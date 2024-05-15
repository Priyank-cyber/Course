const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'course'
});

db.connect((err) => {
  if (err) throw err;
  console.log('The Database is connected');
});

module.exports = db;
