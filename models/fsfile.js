const mongoose = require('mongoose');

const fsfile_schema = new mongoose.Schema({
    id_customer : String,
    nm_file: String,
    nm_filewithoutextension: String,
    nm_extension: String,
    nm_filedestination: String,
    nr_chunksize: Number,
    nr_length: Number,
    dt_upload: {type: Date, default:Date.now}
});

module.exports = mongoose.model('fsfiles', fsfile_schema);