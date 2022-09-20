//importar modelos
const Vacante = require('../models/Vacantes');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find();
    


    if(!vacantes) return next();

    res.render('home', {
        nombrePagina: "DevJobs",
        tagline: "Encuentra y publica trabajos para desarrolladores Web",
        barra: true,
        boton: true,
        vacantes
    })
}

