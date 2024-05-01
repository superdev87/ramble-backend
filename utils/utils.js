const multer = require("multer")
const path = require("path");

exports.sendError = ( req, res, statusCode, message, err) => {
    if ( req.app.get('env') === 'development'){
        res.status(statusCode || 500).json({
            message: message || err.message,
            error: err || {}
        });
    } else {
        res.status(statusCode || 500).json({
            message: message || err.message,
            error: {}
        });
    }
}

exports.processItem = (obj) => {
    var bk = obj.toObject();
    bk.id = bk._id;
    delete bk._id;
    return bk;
}

exports.randomcode = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }