const express = require("express");
const router = express.Router();
const environmentController = require("../../controller/admin/environment");
const upload = require("../../multer/enviroment"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  environmentController.postCreateNews
);

router.get("/edit/:id",  environmentController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  environmentController.postUpdateNews
);

router.delete("/:id", adminAuth, environmentController.deleteNews);

router.get("/download-overlay/:id", adminAuth, environmentController.downloadVideoWithOverlay);


module.exports = router;