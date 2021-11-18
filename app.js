const express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

//routes
const HomeRoute = require('./route/Home');

app.use(cors());

app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(HomeRoute);

app.listen(port, () => {
    console.warn(`Application started at http://localhost:${port}`);
});