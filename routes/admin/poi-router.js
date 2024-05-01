const express = require('express');
const router = express.Router();
const poiController = require('../../controllers/admin/poiController'); // Update with the actual path


// Routes for city operations
router.get('/', poiController.all);
router.post('/create', poiController.createPOI);
router.get('/:id', poiController.getPOI);
router.put('/:id', poiController.updatePOI); // Route to update attendance
router.delete('/:id', poiController.deletePOI); // Route to delete attendance
router.get('/pois/:city_id', poiController.getPOIsFromCity);


module.exports = router;
