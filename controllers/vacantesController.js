const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante =(req, res)=>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.agregarVacante= async (req, res) => {
    const vacante = new Vacante(req.body);
    //crear arreglo de habilidades / skills

    //Usurio autor de la vacante
    vacante.author = req.user._id;
    
    vacante.skills = req.body.skills.split(',')
    
    //guardar en la DB
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

exports.mostrarVacante = async (req, res, next) => {
    //Joins en mongoose
    const vacante = await Vacante.findOne({url: req.params.url}).populate('author').lean();

    if (!vacante) return next();

    res.render('vacante', {
        vacante, 
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) =>{
    const vacante = await Vacante.findOne({url: req.params.url}).lean();
    
    if (!vacante) return next();
    res.render('editar-vacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req, res) =>{
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url},
        vacanteActualizada, {
            new: true,
            runValidators: true
        });

        res.redirect(`/vacantes/${vacante.url}`);

}

exports.eliminarVacante = async(req, res) =>{
    const {id} = req.params;
    const vacante = await Vacante.findById(id);
    if (verificarAutor(vacante, req.user)){
        //Todo bien, elimino la vacante
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
        
    } else {
        //no permitido
        res.status(403).send('Error')
    }
    
}

const verificarAutor = (vacante={}, usuario={}) =>{
    if (!vacante.author.equals(usuario._id)) return false;
    return true;
}

//Sanitizar los campos para el agregar las vacantes
exports.validarVacante=(req, res, next)=>{
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicacion').notEmpty();
    req.checkBody('contrato', 'Selecciona el tipo de Contrato').notEmpty();
    req.checkBody('skilss', 'Agrega al menos una Skill').notEmpty();

    const errores = req.validationErrors();
    //error.msg es donde guarda los errores validationErrors
    if (errores){
        req.flash('error', errores.map( error => error.msg));
        res.render('nueva-vacante',{
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }
    next();

}

exports.buscadorVacante = async(req, res) =>{
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean();

    res.render('home',{
        nombrePagina: `Resultados de la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}