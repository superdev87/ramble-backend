const express = require("express");
const adminRouter = express.Router();
const auth = require("../../middleware/auth").auth; // Update with the actual path

// Import child routers
const cityRouter = require("./city-router");
const poiRouter = require("./poi-router");
const multimediaRouter = require("./multimedia-router");
const attendanceRouter = require("./attendance-router");
const userRouter = require("./user-router");
const authRouter = require("./admin-router");

// Apply authentication middleware for admin routes
// adminRouter.use(auth);

// Use child routers with their respective base paths
adminRouter.use("/city", cityRouter);
adminRouter.use("/poi", poiRouter);
adminRouter.use("/multimedia", multimediaRouter);
adminRouter.use("/attendance", attendanceRouter);
adminRouter.use("/user", userRouter);
adminRouter.use("/auth", authRouter);

module.exports = adminRouter;
