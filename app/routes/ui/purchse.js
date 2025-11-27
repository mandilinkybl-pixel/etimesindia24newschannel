const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controller/ui/purchase');
const { protect } = require('../../middleware/auth');

// Purchase Plan (POST)
router.get("/plan/:planid", protect, subscriptionController.getPlanPage);

// AJAX: Create Razorpay subscription (called by frontend JS)
router.post("/create-subscription", protect, subscriptionController.createSubscription);

// AJAX: Save subscription after Razorpay payment
router.post("/verify", protect, subscriptionController.verifyAndSave);

// User's subscription history
router.get("/history", protect, subscriptionController.subscriptionHistory);

// Success screen
router.get("/success", protect, subscriptionController.successPage);
module.exports = router;