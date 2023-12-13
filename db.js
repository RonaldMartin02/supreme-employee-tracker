// db.js
const mysql = require('mysql2');
// Create the database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'employee_db'
},
console.log(`You're now connected to the employee_db database.`)
).promise();

// Connect to the database and export the promise-based connection
module.exports = db;