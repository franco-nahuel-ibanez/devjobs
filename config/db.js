const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env' });

//conectar mongoose a la base de datos 
mongoose.connect(process.env.DATABASE, {useNewUrlParser:true});

//verificar si se conecto correctamente
mongoose.connection.on('error', (error) => {
    console.log(error);
})

//importar los modelos (SCHEMAS)
require('../models/Vacantes');
require('../models/Usuarios');
