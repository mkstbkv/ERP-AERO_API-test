const express = require('express');
const cors = require('cors');
const db = require('./mySqlDb');
const signin = require('./routes/signinRouter');
const signup = require('./routes/signupRouter');
const logout = require('./routes/logoutRouter');
const info = require('./routes/infoRouter');
const app = express();
const port = 6000;

app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.static('public'));
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/logout', logout);
app.use('/info', info);

const run = async () => {
    await db.init();

    app.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });
};

run().catch(e => console.error(e));
