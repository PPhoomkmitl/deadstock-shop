const mysql = require('mysql2/promise');
require("dotenv").config();

const host = process.env.HOST;
const user = process.env.USER;
const passWord = process.env.PASSWORD;
const dataBase = process.env.DATABASE;

// Handle the connection asynchronously
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: host,
      user: user,
      password: passWord,
      database: dataBase,
    });

    console.log('Database is connected!');
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    throw error;
  }
};

// Export a function that returns the connection
module.exports = createConnection;
