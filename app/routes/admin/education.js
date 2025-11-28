const express = require("express");
const router = express.Router();
const educationController = require("../../controller/admin/education");
const upload = require("../../multer/education"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  educationController.postCreateNews
);

router.get("/edit/:id",  educationController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  educationController.postUpdateNews
);

router.delete("/:id", adminAuth, educationController.deleteNews);

router.get("/download-overlay/:id", adminAuth, educationController.downloadVideoWithOverlay);


module.exports = router;