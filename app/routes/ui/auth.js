const express = require("express");
const {
  sendSignupOtp,
  signup,
  login,
  logout,
  getMe,
} = require("../../controller/ui/auth");
const { protect } = require("../../middleware/auth");

const router = express.Router();

router.post("/send-otp", sendSignupOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect,logout);
router.get("/me", protect, getMe);

module.exports = router;