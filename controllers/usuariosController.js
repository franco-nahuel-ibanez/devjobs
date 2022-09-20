const mongoose = require('mongoose');
const multer = require('multer');
const Usuarios = require('../models/Usuarios');
const shortid = require('shortid');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'La imagen es demasiado grande. Maximo 100kb')
                }else{
                    req.flash('error', req.message)
                }
            }else{
                req.flash('error', error.message);
            }

            res.redirect('/administracion');
            return;
        }else{
            return next();
        }
    });
}

//opciones de multer
//los archivos que son subidos con multer los podemos encontrar con REQ.FILE
const configuracionMulter = {
    limits: { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //el callback se ejecuta como verdadero o falso
            cb(null, true)
        }else{
            cb(new Error('Formato no valido'), false)
        }
    }
}


const upload = multer(configuracionMulter).single('imagen');



exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear Cuenta DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis'
    })
}

exports.crearUsuario = async (req, res, next) => {
    
    const usuario = new Usuarios(req.body);
    
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
        
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
    
}


exports.validarRegistro = (req, res, next) => {

    //sanitizar datos de entrada 
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    //validar datos
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Los password no coinciden').equals(req.body.password);

    const errores = req.validationErrors();


    if(errores){
        //si hay errores
        req.flash('error', errores.map( error => error.msg ))
    
        res.render('crear-cuenta', {
            nombrePagina: 'Crear Cuenta DevJobs',
            tagline: 'Comienza a publicar tus vacantes gratis',           
            mensajes: req.flash()
        })

        return;
    } 

    //si NO hay errores
    next();

 
    return
}

//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion DevJobs',
    })
}

//editar perfil
exports.formEditarPerfil = (req, res) => {

    const { nombre, email, password } = req.user; 

    res.render('editar-perfil', {
        nombrePagina: 'Editar perfil',
        nombre: nombre,
        email: email,
        password: password,
        imagen: req.user.imagen,
        cerrarSesion: true,
    })
}

//guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const {_id} = req.user
    const usuario = await Usuarios.findById({ _id })

    //asignamos los nuevos valores que nos llegan desde el formulario de editar perfil
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if(req.body.password) {
        usuario.password = req.body.password;
    };

    //verificamos que el tamaño de la imagen no exceda el limite establecido
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    
    req.flash('correcto', 'Cambios Guardados Correctamente.')
    //redireccionar a administracion
    res.redirect('/administracion')
}

//validar formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    //sanitizar campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();

    if(req.body.password){
        req.sanitizeBody('password').escape();
    }

    //validar datos
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El E-mail no puede ir vacio').notEmpty();

    //crear arreglo de errores
    const errores = req.validationErrors();

    //si hay errores
    if(errores){
        req.flash('error', errores.map(error => error.msg))

        res.render('editar-perfil', {
            nombrePagina: 'Editar perfil',
            nombre: nombre,
            email: email,
            password: password,
            cerrarSesion: true,
            mensajes : req.flash,
            imagen: req.user.imagen
        })

    }

    //si no hay errores
    next();



}