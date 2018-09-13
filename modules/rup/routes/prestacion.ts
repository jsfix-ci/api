import * as mongoose from 'mongoose';
import * as express from 'express';
import * as moment from 'moment';
// import * as async from 'async';
import { Auth } from './../../../auth/auth.class';
import { model as Prestacion } from '../schemas/prestacion';
import { buscarPaciente } from '../../../core/mpi/controller/paciente';
import * as frecuentescrl from '../controllers/frecuentesProfesional';

import { buscarEnHuds } from '../controllers/rup';
import { Logger } from '../../../utils/logService';
import { makeMongoQuery } from '../../../core/term/controller/grammar/parser';
import { snomedModel } from '../../../core/term/schemas/snomed';
import { toArray } from '../../../utils/utils';

const router = express.Router();
const async = require('async');


/***
 *  Buscar un determinado concepto snomed ya sea en una prestación especifica o en la huds completa de un paciente
 *
 * @param idPaciente: id mongo del paciente
 * @param estado: buscar en prestaciones con un estado distinto a validada
 * @param idPrestacion: buscar concepto/s en una prestacion especifica
 * @param expresion: expresion snomed que incluye los conceptos que estamos buscando
 *
 */

router.get('/prestaciones/huds/:idPaciente', async (req, res, next) => {

    // verificamos que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.idPaciente)) {
        return res.status(404).send('Turno no encontrado');
    }

    // por defecto traemos todas las validadas, si no vemos el estado que viene en la request
    const estado = (req.query.estado) ? req.query.estado : 'validada';

    const query = {
        'paciente.id': req.params.idPaciente,
        $where: 'this.estados[this.estados.length - 1].tipo ==  \"' + estado + '\"'
    };

    if (req.query.idPrestacion) {
        query['_id'] = mongoose.Types.ObjectId(req.query.idPrestacion);
    }

    let conceptos: any = [];

    return Prestacion.find(query, (err, prestaciones) => {

        if (err) {
            return next(err);
        }

        if (!prestaciones) {
            return res.status(404).send('Paciente no encontrado');
        }

        if (req.query.expresion) {
            const querySnomed = makeMongoQuery(req.query.expresion);
            snomedModel.find(querySnomed, { fullySpecifiedName: 1, conceptId: 1, _id: false, semtag: 1 }).sort({ fullySpecifiedName: 1 }).then((docs: any[]) => {

                conceptos = docs.map((item) => {
                    const term = item.fullySpecifiedName.substring(0, item.fullySpecifiedName.indexOf('(') - 1);
                    return {
                        fsn: item.fullySpecifiedName,
                        term,
                        conceptId: item.conceptId,
                        semanticTag: item.semtag
                    };
                });

                // ejecutamos busqueda recursiva
                const data = buscarEnHuds(prestaciones, conceptos);

                res.json(data);
            });
        }
    });
});

router.get('/prestaciones/laboratorio', async function (req, res, next) {
    let match = {
        'solicitud.tipoPrestacion.conceptId': '15220000',
        'solicitud.registros.nombre': { $ne: 'numeroProtocolo' },
        'solicitud.fecha': { '$gte': moment(req.query.fechaDesde, 'YYYY-MM-DD').startOf('day').toDate(), '$lte': moment(req.query.fechaHasta, 'YYYY-MM-DD').endOf('day').toDate() }
    }
        ;
    if (req.query.pacienteDni) {
        match['paciente.documento'] = req.query.pacienteDni;
    }
    let query = [
        {
            '$match':
                match
        }];
    let data2 = await toArray(Prestacion.aggregate(query).cursor({}).exec());
    res.json(data2);
    // let prestaciones = await Prestacion.find({'solicitud.tipoPrestacion.conceptId': '15220000', 'solicitud.registros.nombre': {$ne: 'numeroProtocolo'}});
    // res.json(prestaciones);
});


router.get('/prestaciones/:id*?', (req, res, next) => {

    if (req.params.id) {
        const query = Prestacion.findById(req.params.id);
        query.exec((err, data) => {
            if (err) {
                return next(err);
            }
            if (!data) {
                return next(404);
            }
            res.json(data);
        });
    } else {
        let query;
        if (req.query.estado) {
            const estados = (typeof req.query.estado === 'string') ? [req.query.estado] : req.query.estado;
            query = Prestacion.find({
                // $where: 'this.estados[this.estados.length - 1].tipo ==  \"' + req.query.estado + '\"',
                $where: estados.map(x => 'this.estados[this.estados.length - 1].tipo ==  \"' + x + '"').join(' || '),
            });
        } else {
            query = Prestacion.find({}); // Trae todos
        }

        if (req.query.sinEstado) {
            query.where('estados.tipo').ne(req.query.sinEstado);
        }
        if (req.query.fechaDesde) {
            // query.where('createdAt').gte(moment(req.query.fechaDesde).startOf('day').toDate() as any);
            query.where('ejecucion.fecha').gte(moment(req.query.fechaDesde).startOf('day').toDate() as any);
        }
        if (req.query.fechaHasta) {
            // query.where('createdAt').lte(moment(req.query.fechaHasta).endOf('day').toDate() as any);
            query.where('ejecucion.fecha').lte(moment(req.query.fechaHasta).endOf('day').toDate() as any);
        }
        if (req.query.idProfesional) {
            query.where('solicitud.profesional.id').equals(req.query.idProfesional);
        }
        if (req.query.idPaciente) {
            query.where('paciente.id').equals(req.query.idPaciente);
        }
        if (req.query.idPrestacionOrigen) {
            query.where('solicitud.prestacionOrigen').equals(req.query.idPrestacionOrigen);
        }
        if (req.query.turnos) {
            query.where('solicitud.turno').in(req.query.turnos);
        }

        if (req.query.conceptsIdEjecucion) {
            query.where('ejecucion.registros.concepto.conceptId').in(req.query.conceptsIdEjecucion);
        }
        if (req.query.pacienteDocumento) {
            query.where('paciente.documento').equals(req.query.pacienteDocumento);
        }
        if (req.query.nombrePaciente) {
            query.where('paciente.nombre').equals(RegExp('^.*' + req.query.nombrePaciente + '.*$', 'i'));
        }
        if (req.query.apellidoPaciente) {
            query.where('paciente.apellido').equals(RegExp('^.*' + req.query.apellidoPaciente + '.*$', 'i'));
        }
        if (req.query.origen) {
            query.where('solicitud.ambitoOrigen').equals(req.query.origen);
        }
        if (req.query.numProtocoloDesde) {
            query.where('solicitud.registros.valor').gte(Number(req.query.numProtocoloDesde));
        }
        if (req.query.numProtocoloHasta) {
            query.where('solicitud.registros.valor').lte(Number(req.query.numProtocoloHasta));
        }
        if (req.query.solicitudDesde) {
            query.where('solicitud.fecha').gte(moment(req.query.solicitudDesde).startOf('day').toDate() as any);
        }

        if (req.query.solicitudHasta) {
            query.where('solicitud.fecha').lte(moment(req.query.solicitudHasta).endOf('day').toDate() as any);
        }
        if (req.query.prioridad) {
            query.where('solicitud.registros.valor.solicitudPrestacion.prioridad.id').equals(req.query.prioridad);
        }
        if (req.query.servicio) {
            query.where('solicitud.registros.valor.solicitudPrestacion.servicio.conceptId').equals(req.query.servicio);
        }

        // Solicitudes generadas desde puntoInicio Ventanilla
        // Solicitudes que no tienen prestacionOrigen ni turno
        // Si tienen prestacionOrigen son generadas por RUP y no se listan
        // Si tienen turno, dejan de estar pendientes de turno y no se listan

        if (req.query.tienePrestacionOrigen === 'no') {
            query.where('solicitud.prestacionOrigen').equals(null);
        }

        if (req.query.tieneTurno === 'no') {
            query.where('solicitud.turno').equals(null);
        }

        if (req.query.organizacion) {
            query.where('solicitud.organizacion.id').equals(req.query.organizacion);
        }
        if (req.query.tipoPrestacionSolicititud) {
            query.where('solicitud.tipoPrestacion.conceptId').equals(req.query.tipoPrestacionSolicititud);
        }
        // Ordenar por fecha de solicitud
        if (req.query.ordenFecha) {
            query.sort({ 'solicitud.fecha': -1 });
        } else if (req.query.ordenFechaEjecucion) {
            query.sort({ 'ejecucion.fecha': -1 });
        }

        if (req.query.limit) {
            query.limit(parseInt(req.query.limit, 10));
        }

        query.exec((err, data) => {
            if (err) {
                return next(err);
            }
            if (req.params.id && !data) {
                return next(404);
            }
            res.json(data);
        });
    }
});

router.post('/prestaciones', (req, res, next) => {
    console.log(req.body);
    const data = new Prestacion(req.body);
    Auth.audit(data, req);
    data.save((err) => {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.patch('/prestaciones/:id', (req, res, next) => {
    Prestacion.findById(req.params.id, (err, data: any) => {
        if (err) {
            return next(err);
        }

        switch (req.body.op) {
            case 'paciente':
                if (req.body.paciente) {
                    data.paciente = req.body.paciente;
                }
                break;
            case 'estadoPush':
                if (req.body.estado) {
                    if (data.estados[data.estados.length - 1].tipo === 'validada') {
                        return next('Prestación validada, no se puede volver a validar.');
                    }
                    data['estados'].push(req.body.estado);
                }
                if (req.body.registros) {
                    data.ejecucion.registros = req.body.registros;
                }
                break;
            case 'romperValidacion':
                if (data.estados[data.estados.length - 1].tipo !== 'validada') {
                    return next('Para poder romper la validación, primero debe validar la prestación.');
                }

                if ((req as any).user.usuario.username !== data.estados[data.estados.length - 1].createdBy.documento) {
                    return next('Solo puede romper la validación el usuario que haya creado.');
                }

                data.estados.push(req.body.estado);
                break;
            case 'registros':
                if (req.body.registros) {
                    data.ejecucion.registros = req.body.registros;

                    if (req.body.solicitud) {
                        data.solicitud = req.body.solicitud;
                    }
                }
                break;
            case 'asignarTurno':
                if (req.body.idTurno) {
                    data.solicitud.turno = req.body.idTurno;
                }
                break;
            default:
                return next(500);
        }

        Auth.audit(data, req);
        data.save((error, prestacion) => {
            if (error) {
                return next(error);
            }

            // Actualizar conceptos frecuentes por profesional y tipo de prestacion
            if (req.body.registrarFrecuentes && req.body.registros) {

                const dto = {
                    profesional: Auth.getProfesional(req),
                    tipoPrestacion: prestacion.solicitud.tipoPrestacion,
                    organizacion: prestacion.solicitud.organizacion,
                    frecuentes: req.body.registros
                };
                frecuentescrl.actualizarFrecuentes(dto)
                    .then((resultadoFrec: any) => {
                        Logger.log(req, 'rup', 'update', {
                            accion: 'actualizarFrecuentes',
                            ruta: req.url,
                            method: req.method,
                            data: req.body.listadoFrecuentes,
                            err: false
                        });
                    })
                    .catch((errFrec) => {
                        return next(errFrec);
                    });

            }

            if (req.body.planes) {
                // creamos una variable falsa para cuando retorne hacer el get
                // de todas estas prestaciones

                const solicitadas = [];

                async.each(req.body.planes, (plan, callback) => {
                    const nuevoPlan = new Prestacion(plan);

                    Auth.audit(nuevoPlan, req);
                    nuevoPlan.save((errorPlan, nuevaPrestacion) => {
                        if (errorPlan) { return callback(errorPlan); }

                        solicitadas.push(nuevaPrestacion);

                        callback();

                    });
                }, (err2) => {
                    if (err2) {
                        return next(err2);
                    }

                    // como el objeto de mongoose es un inmutable, no puedo agregar directamente una propiedad
                    // para poder retornar el nuevo objeto con los planes solicitados, primero
                    // debemos clonarlo con JSON.parse(JSON.stringify());
                    const convertedJSON = JSON.parse(JSON.stringify(prestacion));
                    convertedJSON.solicitadas = solicitadas;
                    res.json(convertedJSON);
                });

            } else {
                res.json(prestacion);
            }

            Auth.audit(data, req);
            /*
            Logger.log(req, 'prestacionPaciente', 'update', {
                accion: req.body.op,
                ruta: req.url,
                method: req.method,
                data: data,
                err: err || false
            });
            */
        });
    });
});

export = router;