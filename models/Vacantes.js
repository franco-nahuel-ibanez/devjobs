const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

//crear un SCHEMA
const VacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String, 
        trim: true
    },
    ubicacion:{
        type: String,
        trim: true,
        required: 'La ubicacion es obligatoria',
    },
    salario:{
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion:{
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor:{
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El usuario es obligatorio'
    }
});

// Hooks para realizar acciones antes de insertar en la base de datos
VacantesSchema.pre('save', function(next){
    //crear url
    const url = slug(this.titulo);
    //asignar el id a la url
    this.url = `${url}-${shortid.generate()}`;

    next();
})



module.exports = mongoose.model('Vacante', VacantesSchema)