const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');

exports.formCrearCuenta =(req, res)=>{
    res.render('crear-cuenta',{
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes, solo debes crear una cuenta'
    })
}

exports.validarRegistro = (req, res, next) => {

    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('repetir_password').escape();

    req.checkBody('nombre', 'El nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El Email es Obligatorio').isEmail();
    req.checkBody('password', 'El Password es Obligatorio').notEmpty();
    req.checkBody('repetir_password', 'Debe Repetir Password').notEmpty()
    req.checkBody('password', 'Los passwords no coinciden').equals(req.body.repetir_password);
    
    const errors = req.validationErrors();
    
    if (errors) {
        req.flash('error',errors.map(error => error.msg));
        res.render('crear-cuenta',{
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes, solo debes crear una cuenta',
            mensajes: req.flash()
        })
        return;
    }

    next();
}

exports.crearCuenta= async (req, res, next) =>{
    //guardo los datos que vienen por body
    const usuario = new Usuarios(req.body);
    try {
        //los guardo en la DB de mongo
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

exports.autenticarUsuario = async(req, res, next) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesion DevJobs'
    })
}

exports.formEditarUsuario = (req, res)=>{
    res.render('editar-perfil',{
        nombrePagina: 'Edita tu Perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarPerfil = async(req, res, next)=>{
    const usuarios = await Usuarios.findById(req.user._id)
    usuarios.nombre = req.body.nombre;
    usuarios.email = req.body.email;
    if(req.body.password) {
        usuarios.password = req.body.password;
    }
    if(req.file) {
        usuarios.imagen = req.file.filename;
    }
    await usuarios.save();
    req.flash('correcto', 'Datos actualizados Correctamente');
    
    res.redirect('/admin-dashboard')
}

exports.cerrarSesion =(req, res)=>{
    req.logout();
    req.flash('correcto', 'Cerraste Sesion Corectamente');
    return res.redirect('/iniciar-sesion');
}

//Satinizamos los campos de editar perfiles
exports.validarPerfil=(req, res, next)=>{
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if (req.body.password){
        req.sanitizeBody('password').escape();
    }

    req.checkBody('nombre', 'El nombre No puede ir Vacio').notEmpty();
    req.checkBody('email', 'El email No puede ir Vacio').notEmpty();

    const errores = req.validationErrors();

    if (errores){
        req.flash('error', errores.map( error => error.msg));
        res.render('editar-perfil',{
            nombrePagina: 'Edita tu Perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen : req.user.imagen,
            mensajes: req.flash()
        })
    }
    next();
}

exports.uploadImage = (req, res, next) => {
    upload(req, res, (error) => {
        if (error){
            if (error instanceof multer.MulterError){
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande. Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/admin-dashboard');
            return;
        } else {
            return next();
        }
    });
};

//Opciones Multer
const configurationMulter = {
    //se permite una tamaño de 100KB
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, `${__dirname}../../public/uploads/perfiles`);
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    //Se permite un cierto formato
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg'|| file.mimetype === 'image/png'){
            //el callback se ejecuta como true o false
            cb(null, true) //archivo valido
        } else {
            cb(new Error('Formato No Válido'), false) //archivo invalido
        }
    },
}

const upload = multer(configurationMulter).single('imagen');