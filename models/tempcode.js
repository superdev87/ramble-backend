const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Plase provide a valid email']
    },
    verifycode: {
        type: String,
        default: ''
      },
},{ timestamps: true });

module.exports = mongoose.model("tempcodes", schema);
