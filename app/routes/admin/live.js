const express = require("express");
const router = express.Router();
const liveController = require("../../controller/admin/live");
const upload = require("../../multer/live"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  liveController.postCreateNews
);

router.get("/edit/:id",  liveController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  liveController.postUpdateNews
);

router.delete("/:id", adminAuth, liveController.deleteNews);

router.get("/download-overlay/:id", adminAuth, liveController.downloadVideoWithOverlay);


module.exports = router;