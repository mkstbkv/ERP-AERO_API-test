const express = require('express');
const cors = require('cors');
const db = require('./mySqlDb');
const signin = require('./routes/signinRouter');
const signup = require('./routes/signupRouter');
const app = express();
const port = 6000;

app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.static('public'));
app.use('/signin', signin);
app.use('/signup', signup);

const run = async () => {
    await db.init();

    app.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });
};

run().catch(e => console.error(e));
