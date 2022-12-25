const db = require('../mySqlDb');
const {nanoid} = require("nanoid");
const {generateBearerToken} = require("../middleware/generateTokens");

exports.logout =  async function (req, res, next) {
    try {
        const hash = nanoid(15);
        await db.getConnection()
            .execute('DELETE FROM tokens WHERE user_id = ?', [req.user.id]);
        const bearerToken = generateBearerToken({ id: req.user.id, hash: hash });

        return res.status(200).send({ bearerToken: `Bearer ${bearerToken}` });
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};


