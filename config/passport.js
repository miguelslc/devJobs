const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const bcrypt = require('bcrypt');

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done)=>{
    const usuario = await Usuarios.findOne({email});

    if (!usuario) return done(null, false, {
        message: 'Usuario No existe'
    });
    //El usuario existe, verificamos credenciales
    const verificarPassword = bcrypt.compareSync(password, usuario.password);
    if (!verificarPassword) return done (null, false, {
        message: "Usuario o Password Incorrecto"
    })

    return done(null, usuario)
}));

passport.serializeUser((usuario, done)=> done(null, usuario._id));

passport.deserializeUser(async (id, done)=>{
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
})

module.exports = passport;