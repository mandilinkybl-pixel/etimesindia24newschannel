// app/routes/ui/engagement.js

const express = require("express");
const router = express.Router();

const {
  trackView,
  toggleLike,
  addComment,
  getStats,
} = require("../../controller/ui/commentcontroller");

// POST: Track view when page loads
router.post("/video/:id/view", trackView);

// POST: Toggle like
router.post("/video/:id/like", toggleLike);

// POST: Add comment
router.post("/video/:id/comment", addComment);

// GET: Get latest stats & comments (for popup refresh)
router.get("/video/:id/stats", getStats);

module.exports = router;