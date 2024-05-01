const mongoose = require('mongoose');
const {Schema}  = mongoose ;

const fschunk_schema = new Schema({
    id_file : {type: Schema.Types.ObjectId, ref: 'fsfiles'},
    n : Number,
    data: Buffer,
});

module.exports = mongoose.model('fschunks', fschunk_schema);