const express = require("express");
const router = express.Router();
const nationalController = require("../../controller/admin/health");
const upload = require("../../multer/health"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  nationalController.postCreateNews
);

router.get("/edit/:id",  nationalController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  nationalController.postUpdateNews
);

router.delete("/:id", adminAuth, nationalController.deleteNews);


router.get("/download-overlay/:id", adminAuth, nationalController.downloadVideoWithOverlay);




module.exports = router;