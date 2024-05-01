const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    em_email: { // 'em_' for email
        type: String,
        required: true
    },
    vl_latitude: { // 'vl_' for value, used here for the latitude
        type: Number,
        required: true
    },
    vl_longitude: { // 'vl_' for value, used here for the longitude
        type: Number,
        required: true
    },
    dt_timeIn: { // 'dt_' for date, used here for the time in
        type: Date,
        required: true
    },
    dt_timeOut: { // 'dt_' for date, used here for the time out
        type: Date
    }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
