import { Auth } from './../../../auth/auth.class';
import * as express from 'express';
import * as agenda from '../schemas/agenda';
import * as mongoose from 'mongoose';

let router = express.Router();

router.get('/agenda/paciente/:idPaciente', function (req, res, next) {
    if (req.params.idPaciente) {
        let query;
        query = agenda.find({ 'bloques.turnos.paciente.id': req.params.idPaciente });
        query.limit(10);
        query.sort({ horaInicio: -1 });
        // query.select({ 'organizacion.nombre':1 });
        query.exec(function (err, data) {
            if (err) {
                return next(err);
            }
            // console.log(data);
            res.json(data);
        });
    }
})

router.get('/agenda/:id*?', function (req, res, next) {

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {

        agenda.findById(req.params.id, function (err, data) {
            if (err) {
                next(err);
            };

            res.json(data);
        });
    } else {
        let query;
        query = agenda.find({});

        if (req.query.fechaDesde) {
            query.where('horaInicio').gte(req.query.fechaDesde);
        }

        if (req.query.fechaHasta) {
            query.where('horaFin').lte(req.query.fechaHasta);
        }

        if (req.query.idProfesional) {
            query.where('profesionales._id').equals(req.query.idProfesional);
        }

        if (req.query.idTipoPrestacion) {
            query.where('tipoPrestaciones._id').equals(req.query.idTipoPrestacion);
        }

        if (req.query.espacioFisico) {
            query.where('espacioFisico._id').equals(req.query.espacioFisico);
        }

        if (req.query.estado) {
            query.where('estado').equals(req.query.estado);
        }

        if (req.query.organizacion) {
            query.where('organizacion._id').equals(req.query.organizacion);
        }

        // Filtra por el array de tipoPrestacion enviado como parametro
        if (req.query.tipoPrestaciones) {
            console.log('1', req.query.tipoPrestaciones)
            query.where('tipoPrestaciones._id').in(req.query.tipoPrestaciones);
        }


        // Dada una lista de prestaciones, filtra las agendas que tengan al menos una de ellas como prestación
        if (req.query.prestaciones) {
            let arr_prestaciones: any[] = JSON.parse(req.query.prestaciones);
            let variable: any[] = [];
            arr_prestaciones.forEach((prestacion, index) => {

                variable.push({ 'prestaciones._id': prestacion.id });
            });
            query.or(variable);
        }

        if (req.query.profesionales) {
            query.where('profesionales._id').in(req.query.profesionales);
        }

        // Dada una lista de profesionales, filtra las agendas que tengan al menos uno de ellos
        // if (req.query.profesionales) {
        //     let arr_profesionales: any[] = JSON.parse(req.query.profesionales);
        //     let variable: any[] = [];
        //     arr_profesionales.forEach((profesional, index) => {
        //         variable.push({ 'profesionales._id': profesional.id })
        //     });
        //     query.or(variable);
        // }

        // Si rango es true  se buscan las agendas que se solapen con la actual en algún punto
        if (req.query.rango) {
            let variable: any[] = [];
            variable.push({ 'horaInicio': { '$lte': req.query.desde }, 'horaFin': { '$gt': req.query.desde } });
            variable.push({ 'horaInicio': { '$lte': req.query.hasta }, 'horaFin': { '$gt': req.query.hasta } });
            variable.push({ 'horaInicio': { '$gt': req.query.desde, '$lte': req.query.hasta } });
            query.or(variable);
        }

        if (!Object.keys(query).length) {
            res.status(400).send('Debe ingresar al menos un parámetro');
            return next(400);
        }

        query.sort({ 'horaInicio': 1 });

        query.exec(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }
});

router.post('/agenda', function (req, res, next) {
    let data = new agenda(req.body);
    Auth.audit(data, req);
    data.save((err) => {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.put('/agenda/:id', function (req, res, next) {
    agenda.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.delete('/agenda/:id', function (req, res, next) {
    agenda.findByIdAndRemove(req.params.id, req.body, function (err, data) {
        if (err) {
            return next(err);
        }

        res.json(data);
    });
});

router.patch('/agenda/:id?', function (req, res, next) {


    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next('ID Inválido');
    }


    agenda.findById(req.params.id, function (err, data) {

        if (err) {
            return next(err);
        }

        if (req.body.turnos) {

            let turnos = req.body.turnos;

            // TODO: REFACTOR SWITCH & métodos (no se rían, pueden tener un hijo igual)
            for (let y = 0; y < turnos.length; y++) {
                switch (req.body.op) {
                    case 'darAsistencia': darAsistencia(req, data, turnos[y]._id);
                        break;
                    case 'sacarAsistencia': sacarAsistencia(req, data, turnos[y]._id);
                        break;
                    case 'liberarTurno': liberarTurno(req, data, turnos[y]._id);
                        break;
                    case 'bloquearTurno': bloquearTurno(req, data, turnos[y]._id);
                        break;
                    case 'suspenderTurno': suspenderTurno(req, data, turnos[y]._id);
                        break;
                    case 'reasignarTurno': reasignarTurno(req, data, turnos[y]._id);
                        break;
                    case 'guardarNotaTurno': guardarNotaTurno(req, data, turnos[y]._id);
                        break;
                    case 'editarAgenda': editarAgenda(req, data);
                        break;
                    case 'Disponible':
                    case 'Publicada': actualizarEstado(req, data);
                        break;
                    case 'Pausada':
                    case 'prePausada':
                    case 'Suspendida': actualizarEstado(req, data);
                        break;
                    default:
                        next('Error: No se seleccionó ninguna opción.');
                        break;
                }
                Auth.audit(data, req);
                data.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.json(data);
                });
            }
        } else {
            switch (req.body.op) {
                case 'darAsistencia': darAsistencia(req, data);
                    break;
                case 'sacarAsistencia': sacarAsistencia(req, data);
                    break;
                case 'liberarTurno': liberarTurno(req, data);
                    break;
                case 'bloquearTurno': bloquearTurno(req, data);
                    break;
                case 'suspenderTurno': suspenderTurno(req, data);
                    break;
                case 'reasignarTurno': reasignarTurno(req, data);
                    break;
                case 'guardarNotaTurno': guardarNotaTurno(req, data);
                    break;
                case 'editarAgenda': editarAgenda(req, data);
                    break;
                case 'Disponible':
                case 'Publicada': actualizarEstado(req, data);
                    break;
                case 'Pausada':
                case 'prePausada':
                case 'Suspendida': actualizarEstado(req, data);
                    break;
                default:
                    next('Error: No se seleccionó ninguna opción.');
                    break;
            }
            Auth.audit(data, req);
            data.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.json(data);
            });
        }
    });

});


// Turno
function darAsistencia(req, data, tid = null) {
    let turno = getTurno(req, data, tid);
    console.log(turno);
    turno.asistencia = true;
}

// Turno
function sacarAsistencia(req, data, tid = null) {
    let turno = getTurno(req, data, tid);
    turno.asistencia = false;
}

// Turno
function liberarTurno(req, data, tid = null) {
    let turno = getTurno(req, data, tid);
    turno.estado = 'disponible';
    delete turno.paciente;
    turno.tipoPrestacion = null;
}

// Turno
function bloquearTurno(req, data, tid = null) {

    let turno = getTurno(req, data, tid);

    if (turno.estado !== 'bloqueado') {
        turno.estado = 'bloqueado';
    } else {
        turno.estado = 'disponible';
    }
}

// Turno
function suspenderTurno(req, data, tid = null) {
    let turno = getTurno(req, data, tid);

    turno.estado = 'bloqueado';
    delete turno.paciente;
    delete turno.tipoPrestacion;
    turno.motivoSuspension = req.body.motivoSuspension;

    return data;
}

// Turno
function reasignarTurno(req, data, tid = null) {
    let turno = getTurno(req, data, tid);

    turno.estado = 'disponible';
    delete turno.paciente;
    turno.prestacion = null;
    turno.motivoSuspension = null;
}

// Agenda
function editarAgenda(req, data) {
    if (req.body.profesional) {
        data.profesionales = req.body.profesional;
    }
    data.espacioFisico = req.body.espacioFisico;
}

// Agenda
function actualizarEstado(req, data) {

    // Si se pasa a estado Pausada, guardamos el estado previo
    if (req.body.estado === 'Pausada') {
        data.prePausada = data.estado;
    }
    // Si se pasa a Publicada
    if (req.body.estado === 'Publicada') {
        data.estado = 'Publicada';
        data.bloques.forEach((bloque, index) => {
            bloque.accesoDirectoProgramado = bloque.accesoDirectoProgramado + bloque.reservadoProfesional;
            bloque.reservadoProfesional = 0;
        });
    }

    // Cuando se reanuda de un estado Pausada, se setea el estado guardado en prePausa
    if (req.body.estado === 'prePausada') {
        data.estado = data.prePausada;
    } else {
        data.estado = req.body.estado;
    }

}

// function suspenderAgenda(req, data) {
//     data.estado = req.body.estado;
// }

// function publicarAgenda(req, data) {
//     data.estado = req.body.estado;
// }

// Turno
function guardarNotaTurno(req, data, tid = null) {

    let turno = getTurno(req, data, tid);

    turno.nota = req.body.textoNota;
}

/**
 * 
 * @param req 
 * @param data 
 * @param idTurno 
 * 
 * 
 */
function getTurno(req, data, idTurno = null) {
    let turno;

    idTurno = idTurno || req.body.idTurno;

    for (let x = 0; x < Object.keys(data).length; x++) {
        if (data.bloques[x] != null) {
            turno = (data as any).bloques[x].turnos.id(idTurno);
        }
        if (turno !== null) {
            return turno;
        }
    }
}

export = router;
