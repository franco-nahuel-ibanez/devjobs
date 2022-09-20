const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = require('../models/Usuarios')


passport.use( new LocalStrategy({
    //indicamos cuales seran los campo a traves del cuales se realizara la autenticacion
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    const usuario = await Usuarios.findOne({ email });

    if(!usuario) return done(null, false, {
        message: 'Usuario no existente'
    });

    //si el usuarios existe, verificamos si el password es correcto
    const verificarPass = usuario.compararPassword(password)
    if(!verificarPass) return done(null, false, {
        message: 'Password Incorrecto'
    })

    //si el usuario existe y el password es correcto
    return done(null, usuario);
}));


passport.serializeUser( (usuario, done) => done(null, usuario._id));
passport.deserializeUser( async (id, done) => {
    const usuario = await Usuarios.findById(id);
    return done(null, usuario);
})


module.exports = passport;