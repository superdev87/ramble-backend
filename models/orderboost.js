const mongoose = require('mongoose');
const {Schema}  = mongoose;

const orderboost_schema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_countrycurrency: {
        type:String,
        required: true,
    },
    nm_boost: {
        type:String,
        required: true,
    },
    ds_boost: {
        type:String,
        required: true,
    },
    vl_boost: {
        type:String,
        required: true,
    },
    ic_type: {
        type: String,
        enum: ['Basic', 'Hightlight', 'Urgency']
    }
}, {timestamps: true});

module.exports = mongoose.model('orderboosts', orderboost_schema);