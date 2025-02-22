import * as mongoose from 'mongoose';

export const RoboSchema = new mongoose.Schema({
    // SMS Options
    message: String,
    phone: String,

    // Andes Services
    service: String,
    params: mongoose.Schema.Types.Mixed,


    // Emails options
    subject: String,
    email: String,

    // Template name and extra data to render HTML emails (view handlebars)
    template: String,
    extras: mongoose.Schema.Types.Mixed,

    // Aplicatin who send SMS or Email
    from: String,

    // Number of tries
    tries: Number,

    // timestamps
    createdAt: Date,
    updatedAt: Date,

    // options to send message at certain time
    scheduledAt: Date,

    // State of proccess
    status: {
        type: String,
        enum: ['pending', 'success', 'error', 'canceled'],
        required: true,
        default: 'pending'
    },

    // Array de dispositivos registrados en pacienteApp
    device_id: {
        type: [String],
        required: false
    },

    // Tokens FCM registrado en pacienteApp
    device_fcm_token: String,

    // Campo para pushNotifications
    notificationData: {
        title: String,
        body: String,
        extraData: Object,
        sound: String,
        badge: Number,
        icon: String,
        contentAvailable: Boolean,
        alert: Object,
        required: false
    },

    // Para exportar HUDS
    idExportHuds: mongoose.Schema.Types.ObjectId
});

RoboSchema.index({
    status: 1,
    scheduledAt: 1
});

export const RoboModel = mongoose.model('sendMessageCache', RoboSchema, 'sendMessageCache');

