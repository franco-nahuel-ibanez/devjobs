const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true  
    },
    nombre:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

//Metodo para hashear password
usuariosSchema.pre('save', async function(next){
    //si el password ya esta hasheado no hacemos nada
    if(!this.isModified('password')) return next();

    //si no esta hasheado
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();    
} )


//envia alerta cuando un usuario ya esta registrado
usuariosSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoError' && error.code === 11000 ){
        next('Correo ya registrado')
    }else{
        next(error);
    }
    
})

//autenticar usuarios: Recibe un password y utiliza un metodo de bcryp para verificar si 
//el passoword ingresado es el mismo que el que tiene almacenado
usuariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync( password, this.password)
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);