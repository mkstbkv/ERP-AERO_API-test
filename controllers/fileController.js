const db = require('../mySqlDb');
const path = require('path');
let fs = require('fs');
const config = require("../config");

exports.upload =  async function (req, res, next) {
    try {
        if (!req.file) return res.status(400).send({ message: 'File is missing.' });
        const date = new Date().toISOString();

        const file = {
            title: req.file.filename,
            extension: path.extname(req.file.filename),
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadDate: new Date(date)
        };

        let query = 'INSERT INTO files (title, ext, mimetype, size, uploadDate) VALUES (?, ?, ?, ?, ?);';

        const [result] = await db.getConnection().execute(query, [
            file.title,
            file.extension,
            file.mimetype,
            file.size,
            file.uploadDate,
        ]);

        const id = result.insertId;

        return res.status(200).send({message: 'Created new file', id});

    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.list = async function(req, res, next) {
    try {
        let [files] = await db.getConnection().execute('SELECT * FROM files');
        if (files.length === 0) {
            return res.status(400).send({ message: 'No files' });
        }

        let limit = parseInt(req.query.list_size) || 10;
        let page = parseInt(req.query.page) || 1;
        let offset = limit * (page - 1);

        [files] = await db.getConnection().execute(`SELECT * FROM files ORDER BY id LIMIT ${offset}, ${limit}`);
        if (files.length === 0) {
            return res.status(400).send({ message: 'Please, change query parameters' });
        }
        return res.status(200).send(files);
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.delete = async function(req, res, next) {
    try {
        if (!req.params.id) return res.status(400).send({ message: 'File id is required.' });

        let [file] = await db.getConnection().execute(`SELECT id, title FROM files WHERE id = ?`, [req.params.id]);
        if (file[0]) {
            fs.unlink(`${config.uploadPath}/${file[0].title}`, err => {
                if(err) console.log('Failed to delete file locally');
            });
            await db.getConnection().execute('DELETE FROM files WHERE id = ?', [file[0].id]);
            return res.status(200).send({message: 'File with id ' + file[0].id + ' removed'});
        } else {
            return res.status(400).send({message:  `File with id ${req.params.id} does not exist`});
        }
    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.fileInfo = async function(req, res, next) {
    try {
        if (!req.params.id) return res.status(400).send({ message: 'File id is required.' });

        let [file] = await db.getConnection().execute(`SELECT * FROM files WHERE id = ?`, [req.params.id]);
        if (file[0]) {
            return res.status(200).send({
                title: file[0].title,
                extension: file[0].ext,
                mimetype: file[0].mimetype,
                size: `${(file[0].size / 1e6).toFixed(2)}MB`,
                uploadDate: file[0].uploadDate
            });
        } else {
            return res.status(400).send({message:  `File with id ${req.params.id} does not exist`});
        }

    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.download = async function(req, res, next) {
    try {
        if (!req.params.id) return res.status(400).send({ message: 'File id is required.' });

        let [file] = await db.getConnection().execute(`SELECT * FROM files WHERE id = ?`, [req.params.id]);
        if (file[0]) {
            res.download(config.uploadPath, file[0].title);

            return res.status(200).send({message: 'Successful'});
        } else {
            return res.status(400).send({message:  `File with id ${req.params.id} does not exist`});
        }

    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

exports.update = async function(req, res, next) {
    try {
        if (!req.file || !req.params.id) return res.status(400).send({ message: 'File and id are required.' });
        let [file] = await db.getConnection().execute(`SELECT id, title FROM files WHERE id = ?`, [req.params.id]);
        if (file[0]) {
            const date = new Date().toISOString();
            const fileData = {
                title: req.file.filename,
                extension: path.extname(req.file.filename),
                mimetype: req.file.mimetype,
                size: req.file.size,
                uploadDate: new Date(date)
            };
            fs.writeFile(
                `${config.uploadPath}/${file[0].title}`, req.file, 'utf8', (err) => {
                    if (err) console.log('Failed to update file locally');
                }
            );
            fs.unlink(`${config.uploadPath}/${file[0].title}`, err => {
                if(err) console.log('Failed to delete file locally');
            });

            await db.getConnection()
                .execute('UPDATE files SET title = ?, ext = ?, mimetype = ?, size = ?, uploadDate = ? WHERE id = ?',
                [fileData.title, fileData.extension, fileData.mimetype, fileData.size, fileData.uploadDate ,file[0].id]);

            return res.status(200).send({message: 'File modified successfully'});
        } else {
            return res.status(400).send({message:  `File with id ${req.params.id} does not exist`});
        }

    } catch(e) {
        console.error(e);
        res.status(500).send({ message: e.message });
        next(e);
    }
};

