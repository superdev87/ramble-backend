const express = require('express');
const router = express.Router();
const multimediaController = require('../../controllers/admin/multimediaController'); // Update with the actual path

// Routes for multimedia operations
router.get('/', multimediaController.all);
router.post('/add', multimediaController.addMultimedia);
router.get('/:id', multimediaController.getMultimedia);
router.put('/:id', multimediaController.updateMultimedia); // Route to update attendance
router.delete('/:id', multimediaController.deleteMultimedia); // Route to delete attendance

module.exports = router;
