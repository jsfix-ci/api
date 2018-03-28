import * as mongoose from 'mongoose';
import * as express from 'express';
import * as moment from 'moment';
// import * as async from 'async';

import * as internacionesController from './../controllers/internacion';
import * as camasController from './../controllers/cama';
import { Auth } from './../../../auth/auth.class';
import { model as Prestacion } from '../schemas/prestacion';
import { model as cama } from '../../../core/tm/schemas/camas';
import * as camaRouter from '../../../core/tm/routes/cama';


let router = express.Router();

router.get('/internaciones/ultima/:idPaciente', function (req, res, next) {
    // buscamos la ultima interncion del paciente
    internacionesController.buscarUltimaInternacion(req.params.idPaciente, req.query.estado).then(
        internacion => {
            let salida = { ultimaInternacion: null, cama: null };
            if (internacion && internacion.length > 0) {
                let ultimaInternacion = internacion[0];
                // Ahora buscamos si se encuentra asociada la internacion a una cama 
                camasController.buscarCamaInternacion(mongoose.Types.ObjectId(ultimaInternacion.id), 'ocupada').then(
                    camas => {
                        salida = { ultimaInternacion: ultimaInternacion, cama: null };
                        if (camas && camas.length > 0) {
                            salida.cama = camas[0];
                        }
                        res.json(salida);
                    }).catch(err => {
                        return next(err);
                    });
            } else {
                res.json(null);
            }
        }).catch(error => {
            return next(error);
        });
});

router.get('/internaciones/pases/:idInternacion', function (req, res, next) {
    // buscamos los estados de la cama por donde "estuvo la internacion"
    camasController.buscarPasesCamaXInternacion(mongoose.Types.ObjectId(req.params.idInternacion)).then(
        camas => {
            if (camas) {
                res.json(camas);
            } else {
                res.json(null);
            }
        }).catch(err => {
            return next(err);
        });
});


router.patch('/internaciones/desocuparCama/:idInternacion', function (req, res, next) {
    // buscamos el ultimo estado de la cama por donde "estuvo la internacion"
    camasController.camaXInternacion(mongoose.Types.ObjectId(req.params.idInternacion)).then(
        (unaCama: any) => {
            if (unaCama) {
                let ultimoEstado = unaCama.estados[unaCama.estados.length - 1];
                let dto = {
                    fecha: req.body.fecha,
                    estado: 'desocupada',
                    unidadOrganizativa: ultimoEstado.unidadOrganizativa ? ultimoEstado.unidadOrganizativa : null,
                    especialidades: ultimoEstado.especialidades ? ultimoEstado.especialidades : null,
                    esCensable: ultimoEstado.esCensable,
                    genero: ultimoEstado.genero ? ultimoEstado.genero : null,
                    paciente: null,
                    idInternacion: null
                };

                unaCama.estados.push(dto);
                Auth.audit(unaCama, req);
                // guardamos organizacion
                unaCama.save((errUpdate) => {
                    if (errUpdate) {
                        return next(errUpdate);
                    }
                    res.json(unaCama);
                });

                // res.json(cama);
            } else {
                res.json(null);
            }
        }).catch(err => {
            return next(err);
        });
});


router.get('/internaciones/censo', function (req, res, next) {
    // conceptId de la unidad organizativa
    let unidad = req.query.unidad;//'310022001';
    let fecha = new Date(req.query.fecha);
    camasController.camaOcupadasxUO(unidad, fecha).then(
        camas => {
            if (camas) {
                let salidaCamas = Promise.all(camas.map(c => camasController.desocupadaEnDia(c, fecha)))
                salidaCamas.then(salida => {
                    salida = salida.filter(s => s);
                    let pasesDeCama = Promise.all(salida.map(c => internacionesController.PasesParaCenso(c)))
                    pasesDeCama.then(resultado => {
                        res.json(resultado);
                    }).catch(error => {
                        return next(error);
                    });
                });

            } else {
                res.json(null);
            }
        }).catch(err => {
            return next(err);
        });
});

router.get('/internaciones/censo/disponibilidad', function (req, res, next) {
    // conceptId de la unidad organizativa
    let unidad = req.query.unidad;//'310022001';
    let fecha = new Date(req.query.fecha);

    camasController.disponibilidadXUO(unidad, fecha).then(
        resultado => {
            if (resultado) {
                res.json(resultado);

            } else {
                res.json(null);
            }
        }).catch(err => {
            return next(err);
        });
});

export = router;
