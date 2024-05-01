const mongoose = require('mongoose');
const {Schema}  = mongoose;

const contactreason = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_contactreason : {
        type:String,
        required: true,
    },
    ic_profile: {
        type: Boolean,
        required: true
    },
    
}, {timestamps: true});


module.exports = mongoose.model('contactreasons', contactreason);