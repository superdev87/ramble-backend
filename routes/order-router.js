const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth').auth;
router
    .route('/getdocumenttypes')
    .get(orderController.getDocumentTypes);
router
    .route('/getorderboosttypes')
    .get(orderController.getOrderBoostList);
router
    .route('/addcountry')
    .get(orderController.addHcchMember)
router.get('/checkhcchmember', auth, orderController.checkHcchMember);
router.post('/createorder', auth, orderController.createorder);
router.post('/submitclientid', auth, orderController.submitclientid);
router.post('/setorderboost', auth, orderController.setOrderBoost)

router.get('/getorderwithresearcher', auth, orderController.getorderwithresearcher);
router.get('/getordercntwithresearcher', auth, orderController.getordercntwithresearcher);
router.get('/getorderwithclient', auth, orderController.getorderwithclient);
router.get('/getordercntwithclient', auth, orderController.getordercntwithclient);
router.get('/getorderbyid', auth, orderController.getorderbyid);
router.post('/addevent', auth, orderController.addevent);
router.post('/addproblemevent', auth, orderController.addproblemevent);
module.exports = router;