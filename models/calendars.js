const {model, Schema} = require('mongoose');

const calendarSchema = new Schema(
    {
        name: String,
        url: String,
        room: String,
        lastCheck: {
            type: Date,
            default: null
        },
        color: String,
    }
)

module.exports = model('Calendar', calendarSchema);