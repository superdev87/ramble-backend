const mongoose = require('mongoose');
const {Schema}  = mongoose;

const hcch_member = new Schema({
    cd_country: {
        type:String,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('hcchmembers', hcch_member);