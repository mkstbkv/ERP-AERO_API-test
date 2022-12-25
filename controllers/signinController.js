const db = require('../mySqlDb');
const bcrypt = require("bcrypt");
const { generateBearerToken } = require("../middleware/generateTokens");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

exports.signin =  async function (req, res, next) {
    try {

        if (!req.body.id || !req.body.password) return res.status(400).send({ message: 'User id or password is missing.'});

        const [rest] = await db.getConnection()
            .execute('SELECT id, password FROM users WHERE id = ?', [req.body.id]);
        if (!rest[0]) {
            return res.status(404).send({ message: 'User not found.' });
        } else {
            const isMatch = await bcrypt.compareSync(req.body.password, rest[0].password);
            if (isMatch) {
                const hash = nanoid(15);
                const [hashTok] = await db.getConnection()
                    .execute('SELECT * FROM tokens WHERE user_id = ?', [req.body.id]);

                if (hashTok[0]) {
                    await db.getConnection()
                        .execute('UPDATE tokens SET hash = ? WHERE user_id = ?', [hash, req.body.id]);
                } else {
                    await db.getConnection()
                        .execute('INSERT INTO tokens (hash, user_id) VALUES (?, ?)', [hash , req.body.id]);
                }

                const bearerToken = generateBearerToken({ id: rest[0].id, hash: hash });
                return res.status(200).send({ bearerToken: `Bearer ${bearerToken}` });
            } else {
                return res.status(400).send({ message: 'Password  is wrong.' });
            }
        }
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.new_token = async function(req, res, next) {
    try {
        const refreshToken = req.get('Authorization');

        if (!refreshToken) return res.status(401).send({ message: 'Authorization header is required.' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).send({ message: err.message });
            const hash = nanoid(15);

            const [hashTok] = await db.getConnection()
                .execute('SELECT * FROM tokens WHERE user_id = ?', [user.id]);

            if (hashTok[0]) {
                await db.getConnection()
                    .execute('UPDATE tokens SET hash = ? WHERE user_id = ?', [hash, user.id]);
            } else {
                await db.getConnection()
                    .execute('INSERT INTO tokens (hash, user_id) VALUES (?, ?)', [hash , user.id]);
            }

            const bearerToken = generateBearerToken({ id: user.id, hash: hash });
            return res.status(200).send({ bearerToken: `Bearer ${bearerToken}` });
        });

    } catch(e) {
        if (e.message === 'invalid token')
            return res.status(401).send({ message: 'Provided token is invalid.' });

        if (e.message === 'jwt expired')
            return res.status(401).send({ message: 'Provided token is expired.' });

        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

