const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');
const bodyParser = require("body-parser")
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// env file
require("dotenv").config();

// mySQL
const ECPdb = require("./configs/DBconnection")
const db = require("./configs/db");

//routes
const GeneralRoute = require('./route/General');
const AuthRoute = require('./route/Auth');
const UserRoute = require('./route/User')

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/",GeneralRoute);
app.use("/auth",AuthRoute);
app.use("/user", UserRoute);

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});