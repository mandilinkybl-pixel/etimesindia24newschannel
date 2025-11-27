const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/auth");

router.post("/signup", controller.adminSignup);
router.post("/login", controller.adminLogin);

router.post("/forgot", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);

router.get("/logout", controller.logout);

module.exports = router;
