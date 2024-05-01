const mongoose = require('mongoose');
const {Schema}  = mongoose;

const lanaguage_proficiency_schema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_proficiency: {
        type:String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('language_proficiencies', lanaguage_proficiency_schema);