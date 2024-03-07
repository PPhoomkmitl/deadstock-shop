const mysql = require('mysql');
require("dotenv").config();

const host = process.env.HOST;
const user = process.env.USER;
const passWord = process.env.PASSWORD;
const dataBase = process.env.DATABASE;

const dbConnect = mysql.createConnection({
    host: host,
    user: user,
    password: passWord,
    database: dataBase,
});

dbConnect.connect(function (err) {
    if (err) {
        console.log("Cannot Connected Database!") ;
        throw err;
    }
    console.log("Database is Connected!");
});

module.exports = dbConnect;
