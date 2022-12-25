const jwt = require('jsonwebtoken');
const db = require("../mySqlDb");
const auth = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) return res.status(401).send({ message: 'Authorization header is required.' });

    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.BEARER_TOKEN_SECRET, async (err, user) => {
        if (!err) {
            const [token] = await db.getConnection()
                .execute('SELECT hash, user_id FROM tokens WHERE user_id = ? AND hash = ?', [user.id, user.hash]);
            if (token[0]) {
                req.user = user;
                next();
            } else {
                return res.status(401).send({ message: 'Provided token is expired.' });
            }
        } else {
            if (err.message === 'invalid token') return res.status(401).send({ message: 'Provided token is invalid.' });

            if (err.message === 'jwt expired') return res.status(401).send({ message: 'Provided token is expired.' });
        }
    });
}

module.exports = auth;

