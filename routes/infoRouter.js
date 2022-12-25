const express = require('express');
const router = express.Router();
const infoController = require("../controllers/infoController");
const auth = require("../middleware/auth");

router.get("/", auth, infoController.info);

module.exports = router;
