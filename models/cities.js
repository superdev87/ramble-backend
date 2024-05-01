const mongoose = require('mongoose');
const { Schema } = mongoose;

const citySchema = new Schema({
    nm_name: {
        type: String,
        required: true
    },
    img_image: {
        type: String,
        required: false
    },
    vl_latitude: { // 'vl_' for value, used here for numerical values like latitude
        type: Number,
        required: true
    },
    vl_longitude: { // 'vl_' for value, used here for numerical values like longitude
        type: Number,
        required: true
    },
});

module.exports = mongoose.model("City", citySchema);
