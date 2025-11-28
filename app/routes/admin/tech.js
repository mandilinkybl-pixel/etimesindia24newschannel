const express = require("express");
const router = express.Router();
const techController = require("../../controller/admin/technology");
const upload = require("../../multer/tecnology"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  techController.postCreateNews
);

router.get("/edit/:id",  techController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  techController.postUpdateNews
);

router.delete("/:id", adminAuth, techController.deleteNews);
router.get("/download-overlay/:id", adminAuth, techController.downloadVideoWithOverlay);




module.exports = router;