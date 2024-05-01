const express =  require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth').auth;

router.post('/create', auth, gameController.createGame);
router.post('/join', auth, gameController.joinGame);

module.exports = router;