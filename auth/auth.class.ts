import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
import * as config from '../config';
let shiroTrie = require('shiro-trie');

export class Auth {
    /**
     * Devuelve una instancia de shiro. Implementa un cache en el request actual para mejorar la performance
     *
     * @private
     * @static
     * @param {express.Request} req Corresponde al request actual
     *
     * @memberOf Auth
     */
    private static getShiro(req: express.Request): any {
        let shiro = (req as any).shiro;
        if (!shiro) {
            shiro = shiroTrie.new();
            shiro.add((req as any).user.permisos);
            (req as any).shiro = shiro;
        }
        return shiro;
    }

    /**
     * Inicializa el middleware de auditoría para JSON Web Token
     *
     * @static
     * @param {express.Express} app aplicación de Express
     *
     * @memberOf Auth
     */
    static initialize(app: express.Express) {
        // Configura passport para que utilice JWT
        passport.use(new passportJWT.Strategy(
            {
                secretOrKey: config.auth.privateKey,
                jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeader()
            },
            function (jwt_payload, done) {
                // TODO: Aquí se puede implementar un control del token, por ejemplo si está vencida, rechazada, etc.
                done(null, jwt_payload);
            }
        ));

        // Inicializa passport
        app.use(passport.initialize());
    }

    /**
     * Autentica la ejecución de un middleware
     *
     * @static
     * @returns Middleware de Express.js
     *
     * @memberOf Auth
     */
    static authenticate() {
        return passport.authenticate('jwt', { session: false });
    }

    /**
     * Genera los registros de auditoría en el documento indicado
     *
     * @static
     * @param {mongoose.Document} document Instancia de documento de Mongoose
     * @param {express.Request} req Corresponde al request actual
     *
     * @memberOf Auth
     */
    static audit(document: mongoose.Document, req: express.Request) {
        // El método 'audit' lo define el plugin 'audit'
        let userAndOrg = (Object as any).assign({}, (req as any).user.usuario);
        userAndOrg.organizacion = (req as any).user.organizacion;
        (document as any).audit(userAndOrg);
    }

    /**
     * Controla si el token contiene el string Shiro
     *
     * @static
     * @param {express.Request} req Corresponde al request actual
     * @param {string} string String para controlar permisos
     * @returns {boolean} Devuelve verdadero si el token contiene el permiso
     *
     * @memberOf Auth
     */
    static check(req: express.Request, string: string): boolean {
        if (!(req as any).user || !(req as any).user.permisos) {
            return false;
        } else {
            return this.getShiro(req).check(string);
        }
    }

    /**
     * Obtiene todos los permisos para el string Shiro indicado
     *
     * @static
     * @param {express.Request} req Corresponde al request actual
     * @param {string} string String para controlar permisos
     * @returns {string[]} Array con permisos
     *
     * @memberOf Auth
     */
    static getPermissions(req: express.Request, string: string): string[] {
        if (!(req as any).user || !(req as any).user.permisos) {
            return null;
        } else {
            return this.getShiro(req).permissions(string);
        }
    }
}
