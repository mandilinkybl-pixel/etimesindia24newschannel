const express = require("express");
const router = express.Router();
const crimeController = require("../../controller/admin/crime");
const upload = require("../../multer/crime"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  crimeController.postCreateNews
);

router.get("/edit/:id",  crimeController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  crimeController.postUpdateNews
);

router.delete("/:id", adminAuth, crimeController.deleteNews);

router.get("/download-overlay/:id", adminAuth, crimeController.downloadVideoWithOverlay);


module.exports = router;