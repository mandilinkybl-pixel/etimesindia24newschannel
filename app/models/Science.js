const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    highlightText: [
      {
        type: String,
      },
    ],

    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },

    image: {
      type: String,
      default: null,
    },

    video: {
      type: String,
      default: null,
    },

    externalLink: {
      type: String,
      default: null,
    },

    extraFields: {
      type: Map,
      of: String,
      default: {},
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Science", NewsSchema);
