import { AuditPlugin } from '@andes/mongoose-plugin-audit';
import { Document, model, Schema, Types } from 'mongoose';
import { ISeguimientoPaciente } from '../interfaces/seguimiento-paciente.interface';
import { contactoEstrechoSchema } from './contacto-estrecho.schema';

export const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

export const seguimientoPacienteSchema = new Schema(
    {
        fechaInicio: {
            type: Date,
            default: Date.now(),
        },
        origen: { // El origen podría ser: Una ficha, fuente de datos externa, etc.
            id: Types.ObjectId,
            nombre: String,
            tipo: String // autoseguimiento, seguimiento externo, etc.
        },
        score: {
            value: Number,
            fecha: Date
        },
        paciente: {
            id: Types.ObjectId,
            nombre: String,
            apellido: String,
            documento: String,
            telefonoActual: String,
            direccionActual: String,
            sexo: String,
            foto: String,
            fechaNacimiento: Date
        },
        organizacionSeguimiento: {
            id: Types.ObjectId,
            nombre: String,
            codigoSisa: String
        },
        llamados: [
            {
                idPrestacion: Types.ObjectId,
                tipoPrestacion: String,
                fecha: Date
            }
        ],
        ultimoEstado: {
            clave: String,
            valor: Date
        },
        contactosEstrechos: [contactoEstrechoSchema],
        asignaciones: [
            {
                profesional: {
                    id: Types.ObjectId,
                    nombre: String,
                    apellido: String,
                    documento: String
                },
                fecha: Date
            }
        ],
        ultimaAsignacion: {
            profesional: {
                id: Types.ObjectId,
                nombre: String,
                apellido: String,
                documento: String
            },
            fecha: Date
        },
        internacion: Boolean
    });

seguimientoPacienteSchema.plugin(AuditPlugin);
export const SeguimientoPaciente = model<Document & ISeguimientoPaciente>('seguimientoPaciente', seguimientoPacienteSchema, 'seguimientoPacientes');
