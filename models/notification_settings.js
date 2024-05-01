const mongoose = require('mongoose');
const {Schema}  = mongoose;

const notification_setting_schema = new Schema({
    id_customer: {type: Schema.Types.ObjectId, ref: "users"},
    ic_getnewdailyorders: Boolean,
    ic_websitenews: Boolean,
    ic_whengetnewmessage: Boolean,
    ic_orderinvites: Boolean,
    ic_whenbidisaccepted: Boolean,
    ic_whengetnewbid: Boolean,
    ic_isunsubscribed: Boolean
}, {timestamps: true});

module.exports =  mongoose.model("notification_settings", notification_setting_schema);