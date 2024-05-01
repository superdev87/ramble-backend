const mongoose = require('mongoose');
const {Schema}  = mongoose;

const contactus_schema = new Schema({
    id_user: {type: Schema.Types.ObjectId, ref: "users"},
    tp_customer: {
        type: Number,  //0 is only customer and 1 is only researcher and 2 is both
        default: 0
    },
    nm_customer: String,
    ds_telephone: String,
    ds_email: String,
    cd_order: String,
    ds_contactcomments: String,
    id_contactreason: { type: Schema.Types.ObjectId, ref: 'contactreasons'},
    attachedFiles: [{
        type: String
    }]
}, {timestamps: true});

module.exports = mongoose.model('contact_us', contactus_schema);