const express = require("express");

const router = express.Router();

const apiController = require("../controller/api");

// Trending News API
router.get("/trending-news", apiController.getTrendingNews);

module.exports = router;