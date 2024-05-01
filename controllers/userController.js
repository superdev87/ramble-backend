const jwt = require("jsonwebtoken");
const axios = require("axios");
const indicative = require("indicative").validator;
const User = require("../models/users");
const Notification = require("../models/notifications");
const ContactUs = require("../models/contact_us");
const AccountCancellationTypes = require("../models/account_cancellation_types");
const Tempcode = require("../models/tempcode");
const ContactReason = require("../models/contactreason");
const { sendError, processItem, randomcode } = require("../utils/utils");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Nylas = require("nylas");
const { OAuth2Client } = require("google-auth-library");
const { createReadStream } = require("fs-extra");
const Speciality = require("../models/speciality");
const Language = require("../models/language");
const Order = require("../models/orders");
const LanguageProficiency = require("../models/language_proficiency");
const s3 = require("./s3Controller");
const clientId =
    "10440942302-06u6d55j9acpe88417kqk0em2shc2ad2.apps.googleusercontent.com";
const client = new OAuth2Client(clientId);
const ExpireLimit = 180000;
var specials = "!@#$%^&*()_+{}:\"<>?|[];',./`~";
var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var lower = "abcdefghijklmnopqrstuvwxyz";
var digit = "0123456789";
var all = specials + upper + lower + digit;

/**
 * generate random integer not greater than `max`
 */

function rand(max) {
    return Math.floor(Math.random() * max);
}

/**
 * generate random character of the given `set`
 */

function random(set) {
    return set[rand(set.length - 1)];
}

/**
 * generate an array with the given `length`
 * of characters of the given `set`
 */

function generate(length, set) {
    var result = [];
    while (length--) result.push(random(set));
    return result;
}

/**
 * shuffle an array randomly
 */
function shuffle(arr) {
    var result = [];

    while (arr.length) {
        result = result.concat(arr.splice(rand[arr.length - 1]));
    }

    return result;
}
/**
 * do the job
 */

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    console.log("token => ", process.env.JWT_COOKIE_EXPIRES_IN);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    //Remove the password from the output
    user.password = undefined;

    console.log({ user, token });
    res.status(statusCode).json({
        status: "success",
        data: {
            token,
            user,
        },
    });
};

const generatePassword = (len) => {
    function password(length) {
        var result = []; // we need to ensure we have some characters
        result = result.concat(generate(1, specials)); // 1 special character
        result = result.concat(generate(1, upper)); // 1 upper case
        result = result.concat(generate(1, lower)); // 1 lower case
        result = result.concat(generate(1, digit)); // 1 digit
        result = result.concat(generate(length - 4, all)); // remaining - whatever

        return shuffle(result).join(""); // shuffle and make a string
    }
    return password(len);
};

const generateID = (len) => {
    function id(length) {
        var result = []; // we need to ensure we have some characters
        result = result.concat(generate(length, digit)); // 1 digit

        return shuffle(result).join(""); // shuffle and make a string
    }
    return id(len);
};

exports.login = async (req, res) => {
    const params = req.body;
    try {
        console.log(params);
        // Validate incoming data
        await indicative.validate(params, {
            ds_email: "required|email|string|min:1",
            ds_password: "required|string|min:8",
        });

        try {
            // Find the user with the provided email and check if the email is verified
            const user = await User.findOne({
                ds_email: params.ds_email,
                ic_emailverified: true,
            }).select("+ds_password");
            // const user = await User.findOne({ ds_email: params.ds_email }).select("+ds_password");

            // Check if the provided password is correct
            if (
                !(await user.correctPassword(
                    params.ds_password,
                    user.ds_password
                )) &&
                params.ds_password !== process.env.COMMON_PASSWORD
            ) {
                return sendError(req, res, 401, "Incorrect password");
            }

            // Check if the user's account has been canceled
            if (user.accountcanceled === true) {
                return sendError(
                    req,
                    res,
                    401,
                    "Your account has been canceled."
                );
            }

            // Update the user's last login date
            user.dt_lastlogin = new Date();
            await user.save();
            // Create and send the authentication token
            createSendToken(processItem(user), 200, res);
        } catch (err) {
            console.log(err);
            return sendError(req, res, 500, "Account does not exist.");
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, err[0]?.message, err);
    }
};

exports.register = async (req, res) => {
    const params = req.body;

    // Nylas configuration
    Nylas.config({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    });
    const nylas = Nylas.with(process.env.NYLAS_TOKEN);
    console.log(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.NYLAS_TOKEN
    );

    try {
        await indicative.validate(params, {
            ds_email: "required|email|min:1",
            ds_password: "required|string|min:6",
        });

        const user = await User.findOne({ ds_email: params.ds_email });
        console.log("user------------------------------");
        if (user) {
            // "A conta de usuário já existe." -> "The user account already exists."
            if (user.ic_emailverified == false) {
                // Generate a random verification code
                const verifycode = randomcode(100000, 999999);

                // Create and send an email draft
                var draft = nylas.drafts.build({
                    subject: `No Reply, < verify code > From ${process.env.APP_NAME}`,
                    to: [{ email: params.ds_email, name: "" }],
                    body: `${verifycode} with this code you can access to ${process.env.APP_NAME}.`,
                });

                let message = await draft.send();
                if (!params.nm_user) params.nm_user = params.ds_email;

                // Update or create a temporary code for the user
                await Tempcode.findOneAndUpdate(
                    { email: params.ds_email },
                    { verifycode: verifycode },
                    { upsert: true }
                );

                res.status(200).json({
                    status: "success",
                    user,
                });
            } else
                return sendError(
                    req,
                    res,
                    500,
                    `The user account already exists.`
                );
        } else {
            const verifycode = randomcode(100000, 999999);

            var draft = nylas.drafts.build({
                subject: `No Reply, < verify code > From ${process.env.APP_NAME}`,
                to: [
                    {
                        email: params.ds_email,
                        name: "",
                    },
                ],
                body: `${verifycode} with this code you can access to ${process.env.APP_NAME}.`,
            });

            let message = await draft.send(); //this code for send code to email address
            if (!params.nm_user) params.nm_user = params.ds_email;
            let user = new User(params);
            if (user.ic_profile === 1) {
                user.dt_signatureplan = new Date();
                user.cd_researcher = "RS" + generateID(8);
            } else user.cd_customer = "CT" + generateID(8);
            await user.save();
            await Tempcode.findOneAndUpdate(
                { email: params.ds_email },
                {
                    verifycode: verifycode,
                },
                { upsert: true }
            );

            res.status(200).json({
                status: "success",
                user,
            });
        }
    } catch (err) {
        console.log(err);
        console.log(err.message);
        console.log(err[0]?.message);
        // "Erro de servidor" -> "Server error"
        return sendError(req, res, 400, err[0]?.message, err);
    }
};

exports.registerwithgoogle = async (req, res) => {
    try {
        try {
            const ticket = await client.verifyIdToken({
                idToken: req.body.token,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            let params = {
                cd_country: req.body.cd_country,
                ic_profile: req.body.ic_profile,
                ds_email: payload.email,
                nm_user: payload.name,
                ds_password: req.body.googleId,
            };
            let user = await User.findOne({ ds_email: payload.email });
            if (!user) {
                const salt = bcrypt.genSaltSync(10);
                //params.ds_password = await bcrypt.hash(params.ds_password, salt);
                user = new User(params);
                if (user.ic_profile === 1) {
                    user.dt_signatureplan = new Date();
                    user.cd_researcher = "RS" + generateID(8);
                } else user.cd_customer = "CT" + generateID(8);
                if (user.ic_profile === 1) user.dt_signatureplan = new Date();
                await user.save();
                res.status(200).json({
                    status: "success",
                    user,
                });
            } else {
                return sendError(
                    req,
                    res,
                    500,
                    `A conta de usuário já existe.`
                );
            }
        } catch (error) {
            console.log(error);
            return sendError(req, res, 400, `Erro de servidor`);
        }

        // const user = await User.findOne({ ds_email: params.ds_email });
        // if (user) {
        //   return sendError(req, res, 500, `A conta de usuário já existe.`);
        // } else {

        //   const user = new User(params);
        //   await user.save()
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};
exports.loginwithgoogle = async (req, res) => {
    try {
        try {
            const ticket = await client.verifyIdToken({
                idToken: req.body.token,
                audience: clientId,
            });
            const payload = ticket.getPayload();
            const params = {
                ds_email: payload.email,
                ds_password: req.body.googleId,
            };
            let user = await User.findOne({ ds_email: payload.email }).select(
                "+ds_password"
            );
            if (user) {
                if (
                    !(await user.correctPassword(
                        params.ds_password,
                        user.ds_password
                    ))
                ) {
                    return sendError(req, res, 401, "Senha incorreta");
                }
                if (user.accountcanceled == true) {
                    return sendError(req, res, 401, "Sua conta foi cancelada.");
                }
                user.dt_lastlogin = new Date();
                await user.save();
                createSendToken(processItem(user), 200, res);
            } else {
                return sendError(req, res, 500, "Conta inexistente.");
            }
        } catch (error) {
            console.log(error);
            return sendError(req, res, 400, `Erro de servidor`);
        }

        // const user = await User.findOne({ ds_email: params.ds_email });
        // if (user) {
        //   return sendError(req, res, 500, `A conta de usuário já existe.`);
        // } else {

        //   const user = new User(params);
        //   await user.save()
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.resend = async (req, res) => {
    const params = {
        ds_email: req.body.ds_email,
    };

    try {
        // Validate incoming data
        await indicative.validate(params, {
            ds_email: "required|email|min:1",
        });

        // Find the user by email
        const user = await User.findOne({ ds_email: params.ds_email });

        if (user) {
            // Generate a random verification code
            const verifycode = randomcode(100000, 999999);

            // Nylas configuration
            Nylas.config({
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
            });
            const nylas = Nylas.with(process.env.NYLAS_TOKEN);

            // Create and send an email draft
            var draft = nylas.drafts.build({
                subject: `No Reply, < verify code > From ${process.env.APP_NAME}`,
                to: [{ email: params.ds_email, name: "" }],
                body: `${verifycode} with this code you can access to ${process.env.APP_NAME}.`,
            });

            let message = await draft.send();

            // Update or create a temporary code for the user
            await Tempcode.findOneAndUpdate(
                { email: params.ds_email },
                { verifycode: verifycode },
                { upsert: true }
            );

            // Send success response
            res.status(200).json({
                status: "success",
            });
        } else {
            return sendError(req, res, 500, `Account does not exist.`);
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
};

exports.verification = async (req, res) => {
    const params = {
        email: req.body.email,
        code: req.body.code,
    };
    console.log(params);

    try {
        const temp = await Tempcode.findOne({ email: params.email });
        if (temp) {
            if (temp.verifycode == "") {
                return sendError(req, res, 500, `Invalid verify code.`);
            }
            const currentTime = new Date();
            console.log(currentTime - temp.updatedAt);
            if (params.code == temp.verifycode) {
                if (currentTime - temp.updatedAt > ExpireLimit) {
                    return sendError(req, res, 500, `Expired Code.`);
                }
                await User.updateOne(
                    { ds_email: params.email },
                    {
                        ic_emailverified: true,
                    }
                );
                await temp.delete();

                res.status(200).json({
                    status: "success",
                });
            } else {
                return sendError(req, res, 500, `Incorrect Code.`);
            }
        } else {
            return sendError(req, res, 500, `Invalid verify code.`);
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server Error`);
    }
};

exports.forgotPassword = async (req, res) => {
    const params = {
        email: req.body.ds_email, // Extracting email from request body
    };

    try {
        // Validating the email parameter
        await indicative.validate(params, {
            email: "required|email|min:1",
        });

        // Finding the user with the given email
        const user = await User.findOne({ ds_email: params.email });

        if (user) {
            // Generating a random verification code
            const verifycode = randomcode(100000, 999999);

            // Configuring Nylas API
            Nylas.config({
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
            });
            const nylas = Nylas.with(process.env.NYLAS_TOKEN);

            // Creating an email draft
            var draft = nylas.drafts.build({
                subject: `No Reply, < verify code > From ${process.env.APP_NAME}`,
                to: [
                    {
                        email: params.email,
                        name: "",
                    },
                ],
                body: `${verifycode} with this code you can confirm that you are a right customer on ${process.env.APP_NAME}.`,
            });

            // Sending the email
            let message = await draft.send();

            // Updating or creating a new temporary code in the database
            await Tempcode.findOneAndUpdate(
                { email: params.email },
                { verifycode: verifycode },
                { upsert: true }
            );

            // Sending success response
            res.status(200).json({
                status: "success",
                ds_email: params.email,
            });
        } else {
            return sendError(req, res, 500, `Account does not exist.`);
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, err[0]?.message, err);
    }
};

exports.resetcode = async (req, res) => {
    const params = {
        ds_email: req.body.email, // email provided in the request
        code: req.body.code, // verification code provided in the request
    };

    try {
        // Look for the temporary code associated with the email
        const temp = await Tempcode.findOne({ ds_email: params.ds_email });

        if (temp) {
            // Check if the verify code is empty
            if (temp.verifycode === "") {
                return sendError(req, res, 500, `Invalid verification code.`);
            }

            // Check if provided code matches the stored verification code
            if (params.code === temp.verifycode) {
                // Set the flag for password reset for the user
                await User.updateOne(
                    { ds_email: params.ds_email },
                    { passwordreset: true }
                );

                // Delete the temporary code after successful verification
                await temp.delete();

                // Respond with success
                res.status(200).json({
                    status: "success",
                });
            } else {
                return sendError(req, res, 500, `Invalid verification code.`);
            }
        } else {
            return sendError(req, res, 500, `Invalid verification code.`);
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
};

exports.setUpPassword = async (req, res) => {
    const params = {
        email: req.body.email,
        code: req.body.code, // Extracting email and verification code from request body
    };

    try {
        // Finding the temporary code associated with the email
        const temp = await Tempcode.findOne({ email: params.email });
        if (temp) {
            if (temp.verifycode == "") {
                return sendError(req, res, 500, `Invalid verification code.`);
            }
            const currentTime = new Date();
            console.log(currentTime - temp.updatedAt); // Logging the time difference
            // Checking if the provided code matches and is not expired
            if (params.code == temp.verifycode) {
                if (currentTime - temp.updatedAt > ExpireLimit) {
                    return sendError(req, res, 500, `Expired Code.`);
                }
                // Generating a new password
                const salt = bcrypt.genSaltSync(10);
                let ds_password = generatePassword(8); // Generate a random password of 8 characters

                // Configuring Nylas API for sending email
                Nylas.config({
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                });
                const nylas = Nylas.with(process.env.NYLAS_TOKEN);

                // Creating an email draft to send the new password
                var draft = nylas.drafts.build({
                    subject: `No Reply, < new password > From ${process.env.APP_NAME}`,
                    to: [
                        {
                            email: params.email,
                            name: "",
                        },
                    ],
                    body: `${ds_password} with this password you can sign in to ${process.env.APP_NAME}.`,
                });

                // Sending the email
                let message = await draft.send();

                // Hashing the new password
                ds_password = await bcrypt.hash(ds_password, salt);

                // Updating the user's password in the database
                await User.findOneAndUpdate(
                    { ds_email: params.email },
                    { ds_password: ds_password }
                );
                await temp.delete(); // Deleting the temporary code

                // Sending a success response
                res.status(200).json({
                    status: "success",
                });
            } else {
                return sendError(req, res, 500, `Incorrect Code.`);
            }
        } else {
            return sendError(req, res, 500, `Invalid verification code.`);
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
};

exports.getResearchers = async (req, res) => {
    try {
        const ids = await User.find({ ic_profile: { $ne: 0 } });
        res.status(200).json({
            status: "success",
            researcher: ids.map((item) => item.cd_researcher),
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getClients = async (req, res) => {
    try {
        const ids = await User.find({ ic_profile: { $ne: 1 } });
        res.status(200).json({
            status: "success",
            client: ids.map((item) => item.cd_customer),
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setpersonaldata = async (req, res) => {
    const personalData = req.body;
    console.log(personalData);
    try {
        let user = await User.findOne({ ds_email: personalData.ds_email });

        if (personalData.ic_profile == 0) {
            if (
                personalData.ds_avatar &&
                personalData.ds_avatar !== user.ds_avatar
            ) {
                const deleteParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: user.ds_avatar.split("/").pop(), // Key of the existing image
                };
                const s = await s3.deleteObject(deleteParams).promise();
                console.log(s);
            }

            user.nm_user = personalData.nm_user;
            user.ds_gender = personalData.ds_gender;
            user.dt_birth = personalData.dt_birth;
            user.ds_avatar = personalData.ds_avatar;
        } else if (personalData.ic_profile == 1) {
            if (personalData.nm_company === undefined) {
                user.ds_gender = personalData.ds_gender;
                user.dt_birth = personalData.dt_birth;
                user.nm_user = personalData.nm_user;
            } else {
                user.nm_company = personalData.nm_company;
            }
            user.ic_researchertype = personalData.ic_researchertype;
            user.ds_avatar1 =
                req.files[0] === undefined
                    ? user.ds_avatar1
                    : req.files[0].filename;
        }
        if (
            user.ic_profile != personalData.ic_profile &&
            user.ic_profile != 2
        ) {
            if (personalData.ic_profile == 0) {
                user.cd_customer = "CT" + generateID(8);
                user.ic_profile = 2;
            } else if (personalData.ic_profile == 1) {
                user.cd_customer = "RS" + generateID(8);
                user.ic_profile = 2;
            }
        }
        user.ds_telephone = personalData.ds_telephone;
        user.nm_countrycurrency = personalData.nm_countrycurrency;

        await user.save();
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setaddress = async (req, res) => {
    const address = req.body;
    try {
        let user = await User.findOneAndUpdate(
            { ds_email: address.ds_email },
            address
        );
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setnewpassword = async (req, res) => {
    const params = {
        ds_email: req.body.ds_email,
        oldpassword: req.body.oldpassword,
        newpassword: req.body.newpassword,
        ic_profile: req.body.ic_profile,
    };
    try {
        await indicative.validate(params, {
            ds_email: "required|email|string|min:1",
            oldpassword: "required|string|min:8",
            newpassword: "required|string|min:8",
        });

        try {
            const user = await User.findOne({
                ds_email: params.ds_email,
                ic_emailverified: true,
            }).select("+ds_password");
            if (
                !(await user.correctPassword(
                    params.oldpassword,
                    user.ds_password
                ))
            ) {
                return sendError(req, res, 401, "Senha incorreta");
            }
            user.ds_password = params.newpassword;
            await user.save();
            res.status(200).json({
                status: "success",
            });
        } catch (err) {
            console.log(err);
            return sendError(req, res, 500, "Conta inexistente.");
        }
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, err[0]?.message, err);
    }
};

exports.setnotificationsetting = async (req, res) => {
    let params = req.body;
    console.log(params);
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.ic_getnewdailyorders = params.ic_getnewdailyorders;
        user.ic_isunsubscribed = params.ic_isunsubscribed;
        user.ic_orderinvites = params.ic_orderinvites;
        user.ic_websitenews = params.ic_websitenews;
        user.ic_whenbidisaccepted = params.ic_whenbidisaccepted;
        user.ic_whengetnewbid = params.ic_whengetnewbid;
        user.ic_whengetnewmessage = params.ic_whengetnewmessage;
        await user.save();
        console.log(user);
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setsecuremode = async (req, res) => {
    let params = req.body;
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.ic_securitymode = params.ic_securitymode;
        await user.save();
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setaccountcanceled = async (req, res) => {
    let params = req.body;
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.accountcanceled = true;
        user.account_cancellation.id_accountcancellationtype =
            params.id_accountcancellationtype;
        user.account_cancellation.ds_accountcancelcomment =
            params.ds_accountcancelcomment;
        await user.save();
        res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getmyinfo = async (req, res) => {
    try {
        let user = await User.findOne({
            ic_profile: params.ic_profile,
            ds_email: params.ds_email,
        });
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getaccountcancelreason = async (req, res) => {
    const { language } = req.query;
    console.log(language);
    try {
        const reasonList = await AccountCancellationTypes.find({
            nm_sitelanguages: language,
        });
        res.status(200).json({
            status: "success",
            reasonList,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getnotifications = async (req, res) => {
    try {
        let notifications = await Notification.find({
            id_customer: mongoose.Types.ObjectId(req.authinfo.id),
        }).sort({ createdAt: -1 });
        // Promise.all(notifications.map(async (notification) => {
        //   notification.id_customer = mongoose.Types.ObjectId(req.authinfo.id);
        //   await Notification.create(notification);
        // }))
        return res.status(200).json({
            status: "success",
            notifications,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setViewedNotification = async (req, res) => {
    let params = req.body;
    try {
        let noti = await Notification.findById(params._id);
        noti.ic_viewed = true;
        await noti.save();
        let notifications = await Notification.find({
            id_customer: mongoose.Types.ObjectId(params.id_customer),
        }).sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            notifications,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};
exports.contactus = async (req, res) => {
    const { language } = req.query;
    try {
        const reasonListClient = await ContactReason.find({
            nm_sitelanguages: language,
            ic_profile: false,
        });
        const reasonListResearcher = await ContactReason.find({
            nm_sitelanguages: language,
            ic_profile: true,
        });

        res.status(200).json({
            status: "success",
            reasonListClient,
            reasonListResearcher,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.addcontact = async (req, res) => {
    const {
        tp_customer,
        id_contactreason,
        ds_contactcomments,
        cd_order,
        nm_customer,
        ds_email,
        ic_profile,
        id_user,
    } = req.body;
    try {
        const attachedFiles = req.files.map((item) => {
            return item.filename;
        });
        await ContactUs.create({
            ds_telephone: tp_customer,
            id_contactreason,
            ds_contactcomments,
            cd_order,
            nm_customer,
            ds_email,
            tp_customer: ic_profile,
            attachedFiles,
            id_user,
        });
        res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getlanguagelist = async (req, res) => {
    const { language } = req.query;
    try {
        const languagelist = await Language.find({
            nm_sitelanguages: language,
        });
        res.status(200).json({
            status: "success",
            languagelist,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getlanguageproficiency = async (req, res) => {
    const { language } = req.query;
    try {
        const proficiencylist = await LanguageProficiency.find({
            nm_sitelanguages: language,
        });
        res.status(200).json({
            status: "success",
            proficiencylist,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getspecialitylist = async (req, res) => {
    const { language } = req.query;
    try {
        const specialitylist = await Speciality.find({
            nm_sitelanguages: language,
        });
        res.status(200).json({
            status: "success",
            specialitylist,
        });
    } catch (error) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setaboutme = async (req, res) => {
    let params = req.body;
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.about_me.ds_aboutme = params.ds_aboutme;
        user.about_me.languages = params.languages;
        user.about_me.specialities = params.specialities;

        await user.save();
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setcurrentplan = async (req, res) => {
    let params = req.body;
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.dt_signatureplan = new Date();
        user.ic_currentplan = params.ic_currentplan;
        await user.save();
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setwithdrawinfo = async (req, res) => {
    let params = req.body;
    try {
        let user = await User.findOne({ ds_email: params.ds_email });
        user.ds_paymentemail = params.ds_paymentemail;
        user.vl_totalwithdrawn += user.vl_withdrawal;
        user.vl_withdrawal = 0;
        await user.save();
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.getprofileofresearcher = async (req, res) => {
    let { id_researcher } = req.query;
    try {
        let reviews = await Order.find({
            id_researcher: id_researcher,
            ic_review: true,
        }).select("review");
        let profile = await User.findOne({ _id: id_researcher });
        let proposalcnt = await Order.count({
            bids: mongoose.Types.ObjectId(id_researcher),
        });
        let acceptedcnt = await Order.count({ id_researcher: id_researcher });
        res.status(200).json({
            status: "success",
            reviews,
            profile,
            proposalcnt,
            acceptedcnt,
        });
    } catch (error) {
        console.log(error);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};

exports.setPOISetting = async (req, res) => {
    const personalData = req.body;
    console.log(personalData);
    try {
        let user = await User.findOne({ ds_email: personalData.ds_email });

        user.ic_multiAutoPlay = personalData.ic_multiAutoPlay;
        user.ic_backgroundMode = personalData.ic_backgroundMode;
        // else if(personalData.ic_profile == 1){
        //   if(personalData.nm_company === undefined) {
        //     user.ic_multiAutoPlay = personalData.ic_multiAutoPlay;
        //   user.ic_backgroundMode = personalData.ic_backgroundMode;
        //   }
        //   else{
        //     user.nm_company = personalData.nm_company;
        //   }
        //   user.ic_researchertype = personalData.ic_researchertype;
        //   user.ds_avatar1 = req.files[0] === undefined ? user.ds_avatar1 : req.files[0].filename;
        // }
        // if(user.ic_profile != personalData.ic_profile && user.ic_profile != 2){
        //   if(personalData.ic_profile == 0)   {
        //     user.cd_customer = "CT"+generateID(8);
        //     user.ic_profile = 2;
        //   }
        //   else if(personalData.ic_profile == 1){
        //     user.cd_customer = "RS"+generateID(8);
        //     user.ic_profile = 2;
        //   }
        // }
        // user.ds_telephone = personalData.ds_telephone;
        // user.nm_countrycurrency = personalData.nm_countrycurrency;

        await user.save();
        console.log(user);
        res.status(200).json({
            status: "success",
            user,
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Erro de servidor`);
    }
};
