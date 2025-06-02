const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const pendingBusinessController = require("../controllers/pendingBusinessController");
const verifyToken = require("../middleware/VerifyToken");
const requireRole = require("../middleware/requireRole");

// get the dashboard stats
router.get(
  "/dashboard/:id",
  verifyToken,
  requireRole("business"),
  businessController.getBusinessDashboard
);
// used to create business
router.post(
  "/",
  verifyToken,
  requireRole("admin"),
  businessController.createBusiness
);
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
// get all business
router.get(
  "/",
  verifyToken,
  requireRole("admin"),
  businessController.getAllBusinesses
);
// currently used to get all business for listing page...could be removed
router.get("/allbusiness", businessController.getAllBusinessesAdmin);
//get the details of that particular business with counting views
router.get("/:id", businessController.getBusinessById);
//without couting views
router.get(
  "/getbusinessforpanel/:id",
  verifyToken,
  requireRole("admin", "business"),
  businessController.getBusinessForPanelById
);
router.put(
  "/:id",
  verifyToken,
  requireRole("admin", "business"),
  businessController.updateBusiness
);
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  businessController.deleteBusiness
);
router.post(
  "/bulkuploadbusiness",
  verifyToken,
  requireRole("admin"),
  businessController.bulkUploadBusinesses
);
router.get("/category/:id", businessController.getBusinessesByCategory);
router.get("/search/:keyword", businessController.searchBusinesses);

module.exports = router;
