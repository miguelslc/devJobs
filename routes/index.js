const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //mostrar vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );

    //agregar vacantes
    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    //mostrar una vacante seleccionada
    router.get('/vacantes/:url', vacantesController.mostrarVacante);
    //editar vacantes
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    //actualizamos la vacante editada
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );
    //eliminar vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante)
    //Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    //Crear Cuentas
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro, 
        usuariosController.crearCuenta
    );
    //Form Login
    router.get('/iniciar-sesion', usuariosController.autenticarUsuario);
    //Iniciar Sesion Chequeo DB
    router.post('/iniciar-sesion', authController.autenticarUsuario);
        //Cerrar Sesion
        router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        usuariosController.cerrarSesion
    )
    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.formRestablecerToken);
    router.get('/restablecer-password/:token', authController.restablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);
    //Panel Administracion
    router.get('/admin-dashboard', 
        authController.verificarUsuario, 
        authController.panelAdministracion
    );
    //Editar perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario, 
        usuariosController.formEditarUsuario
    );

    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.uploadImage,
        usuariosController.editarPerfil
    );

    //buscador de vacantes
    router.post('/buscador', vacantesController.buscadorVacante)
    return router;
} ;

