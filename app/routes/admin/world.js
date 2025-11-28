const express = require("express");
const router = express.Router();
const worldController = require("../../controller/admin/world");
const upload = require("../../multer/world"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  worldController.postCreateNews
);

router.get("/edit/:id",  worldController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  worldController.postUpdateNews
);

router.delete("/:id", adminAuth, worldController.deleteNews);


router.get("/download-overlay/:id", adminAuth, worldController.downloadVideoWithOverlay);


module.exports = router;