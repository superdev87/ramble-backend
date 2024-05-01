const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/admin/attendanceController'); // Update with the actual path

// Routes for attendance operations
router.get('/', attendanceController.all);
router.post('/record', attendanceController.recordAttendance);
router.get('/:id', attendanceController.getAttendance);
router.put('/:id', attendanceController.updateAttendance); // Route to update attendance
router.delete('/:id', attendanceController.deleteAttendance); // Route to delete attendance
router.post('/search', attendanceController.searchAttendance); // Route to delete attendance

module.exports = router;
