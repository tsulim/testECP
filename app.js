// Requried libraries in project
require("dotenv").config();
const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
const cors = require('cors');
var favicon = require('serve-favicon')
const path = require('path');

//routes
const GeneralRoute = require('./route/General');
const AuthRoute = require('./route/Auth');

// Start of App Configs
const app = express();
const port = 3000;

app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')))
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

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

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});