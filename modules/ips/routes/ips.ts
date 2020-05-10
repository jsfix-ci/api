import * as express from 'express';
import { getDocumentReference, IPS } from '../controller/ips';

const router = express.Router();

router.get('/fhir/documentReference/', async (req, res, next) => {
    try {
        // verify token IPS
        const custodian = req.query.custodian;
        const subjIdentifier = req.query['subject:identifier'].split('|');
        if (custodian && subjIdentifier.length > 0) {
            const patientID = subjIdentifier[1];
            const documentReference = await getDocumentReference(patientID);
            return res.json(documentReference);

        } else {
            return null;
        }
    } catch (err) {
        return next(err);
    }
});

router.get('/fhir/binary/', async (req, res, next) => {
    try {
        // to do: Deberia generar el ips 
        const binary = null;
        return res.json(binary);
    } catch (err) {
        return next(err);
    }
});


// ESTE CODIGO ESTA DEPRECADO Y HAY Q REVISAR

// router.get('/document/:id', async (req, res, next) => {
//     try {
//         const saludDigital = new SaludDigitalClient(FHIR.domain, FHIR.ips_host, FHIR.secret);
//         const custodian = req.query.custodian;
//         const bundle = await saludDigital.solicitud({ patient: req.params.id, custodian, loinc: '60591-5' });
//         return res.json(bundle);
//     } catch (err) {
//         return next(err);
//     }
// });

// router.get('/binary:url', async (req, res, next) => {
//     try {
//         const saludDigital = new SaludDigitalClient(FHIR.domain, FHIR.ips_host, FHIR.secret);
//         const urlBinary = req.params.urlBinary;
//         const bundle = await saludDigital.getBinary(urlBinary);
//         return res.json(bundle);
//     } catch (err) {
//         return next(err);
//     }
// });



export = router;