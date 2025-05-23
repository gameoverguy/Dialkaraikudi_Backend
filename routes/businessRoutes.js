const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const pendingBusinessController = require("../controllers/pendingBusinessController");
const verifyToken = require("../middleware/VerifyToken");

router.post("/", businessController.createBusiness);
router.post("/signup", pendingBusinessController.registerBusiness);
router.post("/login", businessController.login);
router.post("/forgotPassword", businessController.forgotPassword);
router.post("/verifyOtp", businessController.verifyOtp);
router.post("/resetPassword", businessController.resetPassword);

router.post(
  "/verifyOtpAndCreateBusiness",
  pendingBusinessController.verifyOtpAndCreateBusiness
);
router.post("/resendBusinessOtp", pendingBusinessController.resendBusinessOtp);

router.get("/", businessController.getAllBusinesses);
router.get("/allbusiness", businessController.getAllBusinessesAdmin);
router.get("/:id", businessController.getBusinessById);
router.put("/:id", businessController.updateBusiness);
router.delete("/:id", businessController.deleteBusiness);
router.post("/bulkuploadbusiness", businessController.bulkUploadBusinesses);
router.get("/category/:id", businessController.getBusinessesByCategory);
router.get("/search/:keyword", businessController.searchBusinesses);

module.exports = router;
