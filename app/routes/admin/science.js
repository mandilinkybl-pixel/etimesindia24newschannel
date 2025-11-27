const express = require("express");
const router = express.Router();
const scienceController = require("../../controller/admin/science");
const upload = require("../../multer/scence"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  scienceController.postCreateNews
);

router.get("/edit/:id",  scienceController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  scienceController.postUpdateNews
);

router.delete("/:id", adminAuth, scienceController.deleteNews);

module.exports = router;