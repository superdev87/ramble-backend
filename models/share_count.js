const mongoose = require('mongoose');
const {Schema}  = mongoose;

const share_count_schema = new Schema({
    id_customer : {type : Schema.Types.ObjectId, ref : ""},
    id_order : {type: Schema.Types.ObjectId, ref : ""},
    dt_shared: {type: Date, default: Date.now},
    nm_socialmedia: String,
    ds_linkshared: String,
    qt_share: String,
    qt_copylink: String,
    ic_customersearched: Boolean,
}, {timestamps: true});

module.exports = mongoose.model('share_counts', share_count_schema);