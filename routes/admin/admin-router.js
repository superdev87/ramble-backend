const express = require('express');
const router = express.Router();
const userController = require('../../controllers/adminController');

router
    .route('/register')
    .post(userController.register);
router
    .route('/registerwithgoogle')
    .post(userController.registerwithgoogle);
router
    .route('/login')
    .post(userController.login);
router
    .route('/loginwithgoogle')
    .post(userController.loginwithgoogle);

router
    .route('/verification')
    .post(userController.verification);

router
    .route('/resend')
    .post(userController.resend);

router
    .route('/forgotpassword')
    .post(userController.forgotPassword);

router
    .route('/resetcode')
    .post(userController.resetcode);

router
    .route('/setUpPassword')
    .post(userController.setUpPassword);

router
    .route('/getResearchsID')
    .get(userController.getResearchers);

router
    .route('/getClientsID')
    .get(userController.getClients);

router
    .route("/setnewpassword")
    .post(userController.setnewpassword);
module.exports = router;