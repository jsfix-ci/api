"use strict";
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var ubicacionSchema = require('./ubicacion');
var pacienteSchema = new mongoose.Schema({
    identificadores: [{
            entidad: String,
            valor: String
        }],
    documento: {
        type: String,
        es_indexed: true
    },
    activo: Boolean,
    estado: {
        type: String,
        required: true,
        enum: ["temporal", "validado", "recienNacido", "extranjero"],
        es_indexed: true
    },
    nombre: {
        type: String,
        es_indexed: true
    },
    apellido: {
        type: String,
        es_indexed: true
    },
    alias: String,
    contacto: [{
            tipo: {
                type: String,
                enum: ["Teléfono Fijo", "Teléfono Celular", "Email", ""]
            },
            valor: String,
            ranking: Number,
            ultimaActualizacion: Date,
            activo: Boolean
        }],
    direccion: [{
            valor: String,
            codigoPostal: String,
            ubicacion: ubicacionSchema,
            ranking: Number,
            geoReferencia: {
                type: [Number],
                index: '2d' // create the geospatial index
            },
            ultimaActualizacion: Date,
            activo: Boolean
        }],
    sexo: {
        type: String,
        enum: ["femenino", "masculino", "otro", ""],
        es_indexed: true
    },
    genero: {
        type: String,
        enum: ["femenino", "masculino", "otro", ""]
    },
    fechaNacimiento: {
        type: Date,
        es_indexed: true
    },
    fechaFallecimiento: Date,
    estadoCivil: {
        type: String,
        enum: ["casado", "separado", "divorciado", "viudo", "soltero", "concubino", "otro", ""]
    },
    foto: String,
    Nacionalidad: String,
    relaciones: [{
            relacion: {
                type: String,
                enum: ["padre", "madre", "hijo", "hermano", "tutor", ""]
            },
            referencia: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'paciente'
            },
            nombre: String,
            apellido: String,
            documento: String
        }],
    financiador: [{
            entidad: {
                id: mongoose.Schema.Types.ObjectId,
                nombre: String
            },
            codigo: String,
            activo: Boolean,
            fechaAlta: Date,
            fechaBaja: Date,
            ranking: Number,
        }],
    claveBlocking: [String],
    entidadesValidadoras: [String]
});
//Defino Virtuals
pacienteSchema.virtual('nombreCompleto').get(function () {
    return this.nombre + ' ' + this.apellido;
});
//Creo un indice para fulltext Search
pacienteSchema.index({
    '$**': 'text'
});
//conectamos con elasticSearch
pacienteSchema.plugin(mongoosastic, {
    hosts: ['localhost:9200'],
    index: 'andes',
    type: 'paciente'
});
var paciente = mongoose.model('paciente', pacienteSchema, 'paciente');
module.exports = paciente;
//# sourceMappingURL=paciente.js.map