require("dotenv").config();
const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');
const bodyParser = require("body-parser")
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

//routes
const GeneralRoute = require('./route/General');
const AuthRoute = require('./route/Auth');

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

// helper
const { noEqual } = require("./helpers/hbs");

app.engine(
    'hbs',
    engine({
        helpers: {
            noEqual
        },
        defaultLayout: 'main',
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/",GeneralRoute);
app.use("/auth",AuthRoute);

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});