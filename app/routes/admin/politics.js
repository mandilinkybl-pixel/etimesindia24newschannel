const express = require("express");
const router = express.Router();
const politicsController = require("../../controller/admin/politics");
const upload = require("../../multer/politics"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  politicsController.postCreateNews
);

router.get("/edit/:id",  politicsController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  politicsController.postUpdateNews
);

router.delete("/:id", adminAuth, politicsController.deleteNews);

router.get("/download-overlay/:id", adminAuth, politicsController.downloadVideoWithOverlay);

module.exports = router;