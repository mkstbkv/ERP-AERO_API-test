exports.info =  async function (req, res, next) {
    try {
        return res.status(200).send(req.user.id);
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

