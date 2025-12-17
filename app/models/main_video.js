// models/MainLive.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous", trim: true, maxlength: 50 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    ip: { type: String, required: true },
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "unknown"],
      required: true,
    },
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
    viewedBy: [
      {
        ip: { type: String, required: true },
        device: { 
          type: String, 
          enum: ["mobile", "tablet", "desktop", "unknown"],
          required: true 
        },
        fingerprint: { type: String } // Optional: for future browser fingerprint if needed
      },
    ],
    likedBy: [
      {
        ip: { type: String, required: true },
        device: { 
          type: String, 
          enum: ["mobile", "tablet", "desktop", "unknown"],
          required: true 
        },
        fingerprint: { type: String } // Optional
      },
    ],
    comments: [CommentSchema],

    // Device-wise breakdowns
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
      default: [],
    },
    deviceLikes: {
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
      default: [],
    },
    deviceComments: {
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
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for performance
MainLiveSchema.index({ isActive: 1, createdAt: -1 });
MainLiveSchema.index({ "comments.createdAt": -1 });

module.exports = mongoose.model("MainLive", MainLiveSchema);