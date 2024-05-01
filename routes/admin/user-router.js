const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/userController"); // Update with the actual path

// Routes for attendance operations
router.get("/", userController.all);
router.post("/record", userController.recordAttendance);
router.get("/:id", userController.getAttendance);
router.put("/:id", userController.updateAttendance); // Route to update attendance
router.delete("/:id", userController.deleteAttendance); // Route to delete attendance
router.post("/search", userController.searchAttendance); // Route to delete attendance

module.exports = router;
