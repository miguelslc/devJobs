const mongoose = require('mongoose');
require('dotenv').config({path:'variables.env'});

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser:true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
})

mongoose.connection.on('error', (error)=>{
    console.log(error);
})

require('../models/Usuarios.Models');
require('../models/Vacantes.Models');
