const rootPath = __dirname;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    rootPath,
    uploadPath: path.join(rootPath, 'public/uploads'),
    mysqlConfig: {
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
    },
};
