const {model, Schema} = require('mongoose');

const userSchema = new Schema(
    {
        username: String,
        password: String,
    },
    {
        versionKey: false,
        timestamps: false
    }
)

module.exports = model('user', userSchema);