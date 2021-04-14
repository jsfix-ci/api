import { MongoQuery, ResourceBase } from '@andes/core';
import { Auth } from '../../auth/auth.class';
import { ZonaSanitaria } from './schemas/zonaSanitarias';

class ZonasSanitariasResource extends ResourceBase {
    Model = ZonaSanitaria;
    resourceName = 'zonasSantiarias';
    searchFileds = {
        nombre: MongoQuery.partialString
    };
}

export const ZonasSanitariasCtr = new ZonasSanitariasResource();
export const ZonasSanitariasRouter = ZonasSanitariasCtr.makeRoutes();
