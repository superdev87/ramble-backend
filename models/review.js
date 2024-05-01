const mongoose = require('mongoose');
const {Schema}  = mongoose;

const review_schema = new Schema({
    id_customerfrom : {type: Schema.Types.ObjectId, ref: 'customers'},
    id_customerto: {type: Schema.Types.ObjectId, ref: 'customers'},
    nr_rating: Number,
    ds_review: String
}, {timestamps: true});

module.exports = mongoose.model('reviews', review_schema);
    
