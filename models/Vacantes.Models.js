const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const slug = require('slug');
const shortId = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la Vacante es Obligatorio',
        trim: true,
    }, 
    empresa: {
        type: String,
        trim: true,
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicacion es obligatoria',
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    }, 
    descripcion: {
        type: String,
        trim: true
    }, 
    url: {
        type: String,
        lowercase: true,
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El usuar es Obligatorio'
    }
});

vacantesSchema.pre('save', function(next){
    const url = slug(this.titulo);
    this.url = `${url}-${shortId.generate()}`;
    next();
});

//Creamos Indice
vacantesSchema.index({titulo: 'text'});

module.exports = mongoose.model('Vacante', vacantesSchema);