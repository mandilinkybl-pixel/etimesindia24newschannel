const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    resetOtp: { type: Number },
    resetOtpExpiry: { type: Date },

    // Subscriptions history (references to Subscription documents)
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ],
  },
  { timestamps: true }
);

// Virtual: Check if user currently has an active (non-expired) subscription
userSchema.virtual("hasActivePlan").get(function () {
  if (!this.subscriptions || !Array.isArray(this.subscriptions)) {
    return false;
  }

  // For this to work, subscriptions should be populated!
  return this.subscriptions.some((sub) => {
    if (!sub || !sub.endDate) return false;
    return new Date(sub.endDate) > new Date() && sub.status === "active";
  });
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);