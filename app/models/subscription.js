const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },

  // Razorpay
  razorpaySubscriptionId: { type: String },
  razorpayPaymentId: { type: String },

  // Status
  status: {
    type: String,
    enum: ["created", "active", "expired", "cancelled"],
    default: "created",
  },

  autoRenew: { type: Boolean, default: false }, // ON/OFF

  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
