// models/MainLive.js
const mongoose = require("mongoose");

const MainLiveSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  marqueeText: { type: String, required: true, trim: true, maxlength: 1000 },
  videoUrl: { type: String, required: true, trim: true },
  poster: { type: String, default: "https://i.imgur.com/0z8K8pP.jpg" },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("MainLive", MainLiveSchema);