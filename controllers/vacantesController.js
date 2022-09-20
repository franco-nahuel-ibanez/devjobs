//importar modelos
const Vacantes = require('../models/Vacantes');

const multer  = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante = (req, res) => {
    res.render('nuevaVacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Lleva el formulario para publicar tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//agregar nuevas vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    
    const vacante = new Vacantes(req.body);
    
    //usuario creador de la vacante
    //Mongo guarda la refencia del usuario en user._id
    vacante.autor = req.user._id;

    //crear arreglo de skills
    vacante.skills = req.body.skills.split(',')
    
    //almacenar en base de datos
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
    
}

//mostrar informacion de vacante
exports.mostrarVacante = async (req, res, next) => {
    const {url} = req.params;
    const vacante = await Vacantes.findOne({ url }).populate('autor');

    //si no hay resultados
    if(!vacante) return next()


    res.render("vacante", {
        nombrePagina: vacante.titulo,
        empresa: vacante.empresa,
        ubicacion: vacante.ubicacion,
        salario: vacante.salario,
        contrato: vacante.contrato,
        descripcion: vacante.descripcion,
        skills: vacante.skills,
        url: vacante.url,
        reclutadorNombre: vacante.autor.nombre,
        reclutadorImagen: vacante.autor.imagen,
        barra: true
    })
}


exports.formEditarVacante = async (req, res, next) => {
    const {url} = req.params;
    const vacante = await Vacantes.findOne({ url });

    if(!vacante) return next();

    res.render('editar-vacante', {
        nombrePagina: `Editar - ${ vacante.titulo }`,
        titulo: vacante.titulo,
        empresa: vacante.empresa,
        ubicacion: vacante.ubicacion,
        salario: vacante.salario,
        contrato: vacante.contrato,
        descripcion: vacante.descripcion,
        skills: vacante.skills,
        url: vacante.url,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}


exports.editarVacante = async (req, res, next) => {
    const {url} = req.params;
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',')

    //para actualizar un dato primero le pasamos el campo por el que vamos a buscar, luego el dato actualizado
    // y por ultimo un objeto de opciones
    await Vacantes.findOneAndUpdate(
        { url },
        vacanteActualizada, 
        { new:true, runValidators: true }
    );

    res.redirect(`/vacantes/${url}`);

}


//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    //sanitizar los campos

    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();


    //validar datos
    req.checkBody('titulo', 'Agregar un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agregar una Empresa a la Vacante').notEmpty();
    req.checkBody('ubicacion', 'Agregar una Ubicacion a la Vacante').notEmpty();
    req.checkBody('contrato', 'Seleccione el tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agregar al menos una Habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores){
        //recargar vista con los errores
        req.flash('error', errores.map(error => error.msg))
    
        res.render('/nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Lleva el formulario para publicar tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }

    //si no hay errores avanzamos al siguiente middleware
    next()
}

exports.eliminarVacante = async (req, res) => {
    const {id} = req.params;

    const vacante = await Vacantes.findById(id)

    if(verificarAutor(vacante, req.user)){
        //si es el usuario, eliminar vacante
        vacante.remove();
        res.status(200).send('Vacante eliminada correctamente');

    }else{
        //No permitido
        res.status(404).send('Error')
    }
}

const verificarAutor = (vacante = {}, usuario ={} ) => {
    return vacante.autor.equals(usuario._id)
}


//subir archivos en pdf

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'La imagen es demasiado grande. Maximo 100kb')
                }else{
                    req.flash('error', req.message);
                }
            }else{
                req.flash('error', error.message);
            }

            res.redirect('back');
            return;
        }else{
            return next();
        }
    });
}

const configuracionMulter = {
    limits: { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf'){
            //el callback se ejecuta como verdadero o falso
            cb(null, true)
        }else{
            cb(new Error('Formato no valido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('cv');


//almacenar candidatos en la base de datos
exports.contactar = async (req, res, next) => {

    const {url}  = req.params;
    const { nombre, email } = req.body;
    
    const vacante = await Vacantes.findOne({ url });

    //si NO existe la vacante
    if(!vacante) return next()

    //si la vacante existe, creamos al nuevo candidato con los datos del formulario
    const nuevoCandidato = {
        nombre,
        email,
        cv : req.file.filename
    }

    //almacenar el candidato en la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje y redireccion 
    req.flash('correcto', 'Postulacion completada exitosamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const {id} = req.params;
    const vacante = await Vacantes.findById( id );

    console.log(vacante.candidatos)

    if(vacante.autor != req.user._id.toString()){
        return next
    }

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })

}

