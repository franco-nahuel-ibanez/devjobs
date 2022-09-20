const {Router} = require('express');
const router = Router();

//controladores
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports =  () => {

    router.get('/', homeController.mostrarTrabajos);

    //crear vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante    
    );
    
    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );
    
    //mostar info de una vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante)

    
    //editar vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url',  
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    //eliminar una vacante
    router.delete('/vacantes/eliminar/:id', 
        authController.verificarUsuario,
        vacantesController.eliminarVacante
    )

    
    //crear cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario    
    );


    //autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    
    //cerrar sesion
    router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Resetear password
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken)


    //panel de administracion
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    )


    //editar perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    )

    router.post('/editar-perfil',
        authController.verificarUsuario,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );


    //Recibir mensajes de candidatos
    router.post('/vacantes/:url', 
        vacantesController.subirCV,
        vacantesController.contactar
    )

    //Muesta los candidatos de las vacantes
    router.get('/candidatos/:id', 
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    )


    return router;
}
