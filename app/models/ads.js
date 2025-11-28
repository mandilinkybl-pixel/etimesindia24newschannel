const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    mediaUrl: { type: String, required: true }, // path to image/video
    link: { type: String, default: null },
    sectionKey: { type: String, default: "all" }, // business, crime, etc.
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("ads", adsSchema);
