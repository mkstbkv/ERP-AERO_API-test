const { nanoid } = require('nanoid');

const db = require('../mySqlDb');
const bcrypt = require("bcrypt");
const {generateBearerToken, generateRefreshToken} = require("../middleware/generateTokens");

exports.signup =  async function (req, res, next) {
    try {
        if (!req.body.id || !req.body.password) {
            return res.status(400).send({ message: 'User id or password is missing.' });
        }

        const [rest] = await db.getConnection().execute('SELECT id FROM users WHERE id = ?', [req.body.id]);

        if (rest[0]) {
            return res.status(400).send({ message: 'User already registered.' });
        } else {
            const id = req.body.id
            const salt = await bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
            const password = await bcrypt.hashSync(req.body.password, salt)

            let query = 'INSERT INTO users (id, password) VALUES (?, ?)';
            await db.getConnection().execute(query, [id, password]);

            const hash = nanoid(15);
            const bearerToken = generateBearerToken({ id: id, hash: hash });
            const refreshToken = generateRefreshToken({ id: id });


            query = 'INSERT INTO tokens (hash, user_id) VALUES (?, ?)';
            await db.getConnection().execute(query, [hash, id]);
            return res.status(200).send({ bearerToken: `Bearer ${bearerToken}`, refreshToken: refreshToken});
        }
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

