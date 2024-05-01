const mongoose = require('mongoose');
const {Schema}  = mongoose;

const account_cancellation_type = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_accountcancellationreason : {
        type:String,
        required: true,
    }
}, {timestamps: true});


module.exports = mongoose.model('account_cancellation_types', account_cancellation_type);