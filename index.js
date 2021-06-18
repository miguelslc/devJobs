const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const Handlebars = require('handlebars')
const hbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');
const path = require('path');
require('dotenv').config({path: 'variables.env'});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressValidator());

// view engine setup
// Settings for Handlebars moved to ./helpers/handlebars.js

app.engine('handlebars', 
    hbs({
        defaultLayout: 'main',
        helpers: require('./helpers/handlebars'),
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        //partialsDir: path.join(app.get('views'), 'partials' ),
        layoutDir: path.join(app.get('views'), 'layouts'),
})
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// static files
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + "/public/"));

app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave:false,
    saveUninitialized:  false,
    //store: new MongoStore({mongooseConnection: mongoose.connection}),
    store: MongoStore.create({ mongoUrl: process.env.DATABASE })
}))


//Inicializador de Passport
app.use(passport.initialize());
app.use(passport.session());

//Alertas y flash message
app.use(flash());
//Middleware propio de mensajes y alertas
app.use((req, res, next) =>{
    res.locals.mensajes = req.flash();
    next();
})

app.use('/', router());

// Creamos a un controlador de rutas : createError <- http-errors
app.use((req, res, next)=>{
    next(createError(404, 'No Encontrado'));
});

//administracion de errores
//El error, siempre es lo primero que entra
//Guardo el status, pero no lo paso al front
app.use((error, req, res, next)=>{
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
})

//Heroku asigna puerto y host;
const port = process.env.PORT;
const host = '0.0.0.0';

app.listen(port, host,()=>{
    console.log(`Server running on port ${port}`)
});
