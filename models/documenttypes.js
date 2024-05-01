const mongoose = require('mongoose');
const {Schema}  = mongoose;

const document_type_schema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_documenttype: {
        type:String,
        required: true,
    },
    ic_otherdocument: {
        type:Boolean,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('document_types', document_type_schema);