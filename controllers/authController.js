const passport = require ('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/admin-dashboard',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
})

//revisar si el usuario está autenticado
exports.verificarUsuario=(req, res, next)=>{
    if (req.isAuthenticated()){
        return next(); //está autenticado
    }

    res.redirect('/iniciar-sesion');
}

exports.panelAdministracion=async (req, res)=>{
    //consultar el usuario autenticado
    const vacantes = await Vacante.find({author: req.user._id}).lean();
    console.log(vacantes);
    res.render('admin-dashboard',{
        nombrePagina: 'Panel de Administracion de DevJobs',
        tagline: 'Crea y Administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes, 
    })
}

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecer-password',{
        nombrePagina: "Restablecer Password",
        tagline: "Si ya tienes una cuenta, pero olvidaste tu password, ingresa tu mail"
    })
}

exports.formRestablecerToken = async(req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario){
        req.flash('error', 'Mail incorrecto');
        return res.redirect('/iniciar-sesion');
    }
    //el usuario existe, generamos token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiration = Date.now() + 3600000;

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;

    //TODO: Enviar notificacion por mail
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset',
    })
    req.flash('correcto', 'Revisa tu email para continuar')
    res.redirect('/iniciar-sesion')
}


exports.restablecerPassword = async(req, res)=>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expiration: {
            $gt: Date.now()
        }
    });

    if (!usuario){
        req.flash('error', 'El Formulario ya no es Válido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    res.render('nuevo-password',{
        nombrePagina: 'Nuevo Password',

    })
}

//Almacena el nuevo password en la DB
exports.guardarPassword = async(req, res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expiration: {
            $gt: Date.now()
        }
    });

    if (!usuario){
        req.flash('error', 'El Formulario ya no es Válido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    //Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expiration = undefined;

    //agrear y eliminar valores del objeto
    await usuario.save();

    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion');

}