const mongoose = require('mongoose');
const {Schema}  = mongoose;

const language_schema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_language: {
        type:String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('languages', language_schema);