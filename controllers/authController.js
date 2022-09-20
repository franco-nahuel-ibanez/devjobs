const passport = require('passport');
const mongoose = require('mongoose');
const Vacantes = require('../models/Vacantes');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const enviarMail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Verificar si un usuario esta autenticado
exports.verificarUsuario = (req, res, next) => {

    //revisar el usuario
    if(req.isAuthenticated()){
        //si esta autenticado..
        return next()   
    }else{
        // si no los redireccionamos
        res.redirect('/iniciar-sesion')
    }
}


//mostrar vistal de panel de administrador
exports.mostrarPanel = async (req, res) => {
    
    //buscar al usuario autenticado actualmente
    const {userId} = req.user._id; 
    const vacantes = await Vacantes.find({ userId });

    
    
    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra Tus Vacantes',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

//cerrar sesion
exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Sesion Cerrada Correctamente.')
    return res.redirect('/iniciar-sesion');
}


//Formulario para reiniciar el password

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecerPassword', {
        nombrePagina: 'Reestablecer Password',
        tagline: 'Si ya tienes una cuenta pero olvidate tu password ingresa tu email'
    })
}

//generar token y almarcernar en base de datos
exports.enviarToken = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuarios.findOne({ email });

    //si no existe el usuario
    if(!usuario){
        req.flash('error', 'Cuenta no existente');
        return res.redirect('/iniciar-sesion')
    }

    //si el usuario existe generamos el token
    usuario.token = crypto.randomBytes(20).toString('hex');

    usuario.expira = Date.now() + 3600000;

    //guardar usuario
    await usuario.save();

    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    console.log(resetUrl);

    // enviar notificacion por email
    await enviarMail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'revisa tu E-mail para ver las indicaciones');
    res.redirect('/iniciar-sesion');
}