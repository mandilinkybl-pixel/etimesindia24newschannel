const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planName: String,
  amount: Number,
  paymentMode: { type: String, enum: ["autopay", "wallet", "upi", "card"] },

  razorpayPaymentId: String,
  razorpaySubscriptionId: String,

  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model("Purchase", purchaseSchema);
