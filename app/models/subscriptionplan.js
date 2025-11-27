const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  price: { type: Number, required: true },
  razorpayPlanId: { type: String, required: true }, // autopay plan
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
