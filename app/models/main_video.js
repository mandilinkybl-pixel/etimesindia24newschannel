// models/MainLive.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const MainLiveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    marqueeText: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    poster: {
      type: String,
      default: "https://i.imgur.com/0z8K8pP.jpg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },

    // Engagement Fields
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: String, // IP addresses
      },
    ],
    comments: [CommentSchema],

    // Device-wise views - FIXED with default empty array
    deviceViews: {
      type: [
        {
          device: {
            type: String,
            enum: ["mobile", "tablet", "desktop", "unknown"],
            required: true,
          },
          count: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [], // ← THIS PREVENTS THE ERROR FOREVER
    },
  },
  { timestamps: true }
);

// Indexes for performance
MainLiveSchema.index({ isActive: 1, createdAt: -1 });
MainLiveSchema.index({ "comments.createdAt": -1 });

module.exports = mongoose.model("MainLive", MainLiveSchema);