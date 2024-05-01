const express = require('express');
const router = express.Router();
const cityController = require('../../controllers/admin/cityController'); // Update with the actual path


// Routes for city operations
router.get('/', cityController.all);
router.post('/create', cityController.createCity);
router.get('/:id', cityController.getCity);
router.put('/:id', cityController.updateCity); // Route to update attendance
router.delete('/:id', cityController.deleteCity); // Route to delete attendance


module.exports = router;
