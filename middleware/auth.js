const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { sendError } = require("../utils/utils");

exports.auth = (req, res, next) => {
    const auth = req.get("Authorization")  || '';
    const token = auth.replace("Bearer ", "").trim();
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            console.error('Error verifying user token:', err.message, "\n" + token);
            return sendError(req, res, 400, err.message);
        }
        // tslint:disable:no-unused-variable
        const {timestamp, ...decoded} = data;
        req.authinfo = decoded;
		return next();
    });
};

