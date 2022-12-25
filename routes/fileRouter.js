const express = require('express');
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middleware/auth");

const { nanoid } = require('nanoid');
const path = require('path');
const config = require('../config');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname))
    },
});

const upload = multer({storage});

router.post("/upload", auth, upload.single('file'), fileController.upload);
router.get("/list", auth, fileController.list);
router.delete("/delete/:id", auth, fileController.delete);
router.get("/:id", auth, fileController.fileInfo);
router.get("/download/:id", auth, fileController.download);
router.put("/update/:id", auth, upload.single('file'), fileController.update);

module.exports = router;
