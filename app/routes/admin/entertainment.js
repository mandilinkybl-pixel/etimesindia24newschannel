const express = require("express");
const router = express.Router();
const entertainmentController = require("../../controller/admin/entertainment");
const upload = require("../../multer/entertainment"); // your multer config
const adminAuth = require("../../middleware/admin.auth"); // if you have auth


router.post(
  "/create",
  adminAuth,
  upload.array("media", 2), // max 1 image + 1 video
  entertainmentController.postCreateNews
);

router.get("/edit/:id",  entertainmentController.getEditNews);
router.post(
  "/edit/:id",
  adminAuth,
  upload.array("media", 2),
  entertainmentController.postUpdateNews
);

router.delete("/:id", adminAuth, entertainmentController.deleteNews);

module.exports = router;