const mysql = require('mysql2/promise');
const config = require('./config');

let connection;

module.exports = {
    async init() {
        connection = await mysql.createConnection(config.mysqlConfig);
    },
    getConnection() {
        return connection;
    }
}
