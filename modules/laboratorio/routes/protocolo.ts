import * as mongoose from 'mongoose';
import * as express from 'express';
import { model as Organizacion } from '../../../core/tm/schemas/organizacion';
import { getUltimoNumeroProtocolo } from '../controller/protocolo';
import { getResultadosAnteriores } from '../controller/protocolo';

let router = express.Router();
let async = require('async');

router.get('/protocolo/numero/', async function (req, res, next) {
    // console.log('/protocolo/numero/')
    const ObjectId = require('mongoose').Types.ObjectId;
    let idEfector = new ObjectId(req.query.idEfector);
    let ultimoNumeroProtocolo = await getUltimoNumeroProtocolo(idEfector);
    let anio = new Date().getFullYear().toString().substr(-2);
    let prefijo;
    try {
        Organizacion.findOne(idEfector).then((organizacion: any) => {
            prefijo = organizacion.prefijosLab.prefijo;
            ultimoNumeroProtocolo++
            let nuevoNumeroProtocolo = {
                numeroCompleto: ultimoNumeroProtocolo + '-' + prefijo + anio,
                numero: ultimoNumeroProtocolo
            }
            res.json(nuevoNumeroProtocolo);
        });
    } catch (e) {
        console.log(e)
        res.json(e);

    }

});

router.get('/practicas/resultadosAnteriores', async function (req, res, next) {
    const ObjectId = require('mongoose').Types.ObjectId;
    let idPaciente = new ObjectId(req.query.idPaciente);
    let practicaConceptId = req.query.practicaConceptId;
    console.log('idPaciente',idPaciente)
    console.log('practicaConceptId',practicaConceptId)
    let resultadosAnteriores = await getResultadosAnteriores(idPaciente, practicaConceptId);

    res.json(resultadosAnteriores);
});


export = router;
