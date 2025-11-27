const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },

    duration: {
      type: Number, // number of days
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
