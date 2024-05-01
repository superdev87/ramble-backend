const mongoose = require('mongoose');
const {Schema}  = mongoose;

const order_event_type = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_currentorderstatus : {
        type:String,
        required: true,
    }
}, {timestamps: true});


module.exports = mongoose.model('order_event_types', order_event_type);