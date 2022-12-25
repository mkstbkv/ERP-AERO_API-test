const express = require('express');
const router = express.Router();
const logoutController = require("../controllers/logoutController");
const auth = require("../middleware/auth");

router.get("/", auth, logoutController.logout);

module.exports = router;
