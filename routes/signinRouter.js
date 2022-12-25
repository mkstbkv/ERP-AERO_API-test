const express = require('express');
const router = express.Router();
const signinController = require("../controllers/signinController");

router.post("/", signinController.signin);
router.post("/new_token", signinController.new_token);

module.exports = router;
