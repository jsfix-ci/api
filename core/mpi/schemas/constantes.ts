const constantes = {
    SEXO: {
        type: String,
        required: true,
        es_indexed: true,
        enum: ['femenino', 'masculino', 'otro']
    },
    ESTADOCIVIL: {
        type: String,
        enum: ['casado', 'separado', 'divorciado', 'viudo', 'soltero', 'concubino', 'otro', null]
    },
     PARENTEZCO : {
        type: String,
        enum: ['padre', 'madre', 'hijo', 'hermano', 'tutor']
     },
     ESTADO : {
        type: String,
        required: true,
        es_indexed: true,
        enum: ['temporal', 'validado', 'recienNacido', 'extranjero']
     }
};
export = constantes;
