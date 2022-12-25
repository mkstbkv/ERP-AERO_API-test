const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

exports.generateBearerToken = function (userEmail) {
    return jwt.sign(userEmail, process.env.BEARER_TOKEN_SECRET, { expiresIn: process.env.BEARER_TOKEN_EXPIRES_IN });
}

exports.generateRefreshToken = function (userEmail) {
    return jwt.sign(userEmail, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
}
