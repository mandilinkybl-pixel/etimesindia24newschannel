const express = require("express");
const router = express.Router();
const sportsController = require("../../controller/admin/sports");
const upload = require("../../multer/sport"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  sportsController.postCreateNews
);

router.get("/edit/:id",  sportsController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  sportsController.postUpdateNews
);

router.delete("/:id", adminAuth, sportsController.deleteNews);

router.get("/download-overlay/:id", adminAuth, sportsController.downloadVideoWithOverlay);

module.exports = router;