//la llamada a mongoose y la configuracion de la db debe ir primero que todo
const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const router = require('./routes');
const { engine } = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator')
const flash = require('connect-flash');
const passport = require('./config/passport');

//llamar a nuestras variables de entorno
require('dotenv').config({path: 'variables.env'});

const app = express();

//habilitar body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//validacion de campos con express-validator
// app.use( body() );
app.use(expressValidator());


//habilitar handlebars como view
app.engine('handlebars',
    engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
        partialsDir: path.join(__dirname, 'views/partials')
    })
);
app.set('view engine', 'handlebars');

//static files
path
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.DATABASE
    })
}));

//Inicializar passport
app.use( passport.initialize() );
app.use( passport.session() );


//alertas y flash messages
app.use(flash());

//Crear middleware
app.use( (req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
})

//router
app.use('/', router());



app.listen( process.env.PUERTO, () => {
    console.log("Server on port 5000")
})