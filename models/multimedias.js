const mongoose = require('mongoose');
const { Schema } = mongoose;

const multimediaSchema = new Schema({
    nm_fileName: { // 'nm_' for name
        type: String,
        required: true
    },
    tp_fileType: { // 'tp_' for type
        type: String,
        required: true,
        enum: ['image', 'audio'] // Restricts the file type to 'image' or 'audio'
    },
    city: { // Foreign key to City model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    }
});

module.exports = mongoose.model("Multimedia", multimediaSchema);