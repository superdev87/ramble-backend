const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth").auth;

router.post("/setpersonaldata", auth, userController.setpersonaldata);
router.post("/setaddress", auth, userController.setaddress);
router.post("/setnewpassword", auth, userController.setnewpassword);
router.post(
  "/setnotificatoinsetting",
  auth,
  userController.setnotificationsetting
);
router.post("/setsecuritymode", auth, userController.setsecuremode);
router.post("/setacountcanceled", auth, userController.setaccountcanceled);
router.post("/getme", auth, userController.getmyinfo);
router.get("/getaccountcancelreason", userController.getaccountcancelreason);
router.get("/getnotification", auth, userController.getnotifications);
router.get("/contactus", userController.contactus);
router.post("/addcontact", userController.addcontact);
router.post("/setviewednotification", userController.setViewedNotification);

router.get("/getlanguagelist", userController.getlanguagelist);
router.get("/getlanguageproficiency", userController.getlanguageproficiency);
router.get("/getspecialitylist", userController.getspecialitylist);

router.post("/setaboutmedata", auth, userController.setaboutme);
router.post("/setcurrentplan", auth, userController.setcurrentplan);

router.post("/setwithdrawinfo", auth, userController.setwithdrawinfo);
router.get(
  "/getreviewofresearcher",
  auth,
  userController.getprofileofresearcher
);

router.post("/setpoisetting", auth, userController.setPOISetting);
module.exports = router;
