const {model, Schema} = require('mongoose');

const reservationSchema = new Schema(
    {
        name: String,
        room: String,
        uid: String,
        summary: String,
        status: String,
        color: String,
        start: String,
        end: String
    },
    {
        versionKey: false,
        timestamps: true
    }
)

module.exports = model('Reservation', reservationSchema);