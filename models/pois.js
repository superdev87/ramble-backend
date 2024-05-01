const mongoose = require('mongoose');
const { Schema } = mongoose;

const poiSchema = new Schema({
    city: { // 'nm_' for name
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    vl_latitude: { // 'vl_' for value, used here for numerical values like latitude
        type: Number,
        required: true
    },
    vl_longitude: { // 'vl_' for value, used here for numerical values like longitude
        type: Number,
        required: true
    },
    nm_POI: { // 'nm_' for name
        type: String,
        required: true
    },
    vl_radius: { // 'vl_' for value, used here for radius
        type: Number,
        required: false // Set to true if it's a required field
    },
    img_image: { // 'img_' for image, storing the image path or URL
        type: String,
        required: false // Set to true if it's a required field
    },
    aud_audio: { // 'aud_' for audio, storing the audio file path or URL
        type: String,
        required: false // Set to true if it's a required field
    }
});

module.exports = mongoose.model("POI", poiSchema);
