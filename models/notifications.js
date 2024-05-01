const mongoose = require('mongoose');
const {Schema}  = mongoose;

const notificationschema = new Schema({
    nm_sitelanguages: {
        type:String,
        required: true,
    },
    nm_avatar: {
        type:String,
        required: true,
    },
    id_customer: {
        id_customer: {type: Schema.Types.ObjectId, ref: "users"},
    },
    ds_title: {
        type:String,
        required: true,
    },
    ds_content: {
        type:String,
        required: true,
    },
    ic_viewed: {
        type: Boolean,
        default: false
    },
    nm_redirectpage: {
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model('notifications', notificationschema);