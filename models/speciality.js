const mongoose = require('mongoose');
const {Schema}  = mongoose;

const speciality_schema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_speciality: {
        type:String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('specialities', speciality_schema);