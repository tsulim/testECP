require("dotenv").config();
const express = require('express');
const {engine} = require('express-handlebars');
const expressSession = require('express-session');
var methodOverride = require('method-override');
const bodyParser = require("body-parser")
const cors = require('cors');
const path = require('path');
const DynamoDBStore = require('connect-dynamodb')(expressSession);
const crediential  = require('./config/Crediential');
const {getParameter} = require('./api/SSM');

//routes
const GeneralRoute = require('./route/General');
const AuthRoute = require('./route/Auth');

// Start of App Configs
const app = express();
const port = 3000;
const maxAge = 604800000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

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

const session = {
    cookie: { maxAge },
    secret: "test-secret",
    resave: false,
    saveUninitialized: false,
    store: new DynamoDBStore({
        table: 'NFT',
        AWSConfigJSON: crediential,
    }),
};

app.use(express.static(path.join(__dirname, 'public')));
app.use("/",GeneralRoute);
app.use("/auth",AuthRoute);

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});