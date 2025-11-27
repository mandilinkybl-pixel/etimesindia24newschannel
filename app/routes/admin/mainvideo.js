// routes/admin.js
const express = require("express");
const router = express.Router();
const adminLiveController = require("../../controller/admin/mainvideo");
const isAdmin = require("../../middleware/admin.auth"); // your auth
const upload = require("../../multer/livevideo"); // Import your multer config

router.get("/", isAdmin, adminLiveController.getAdminLive);
router.post("/", isAdmin, upload.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'posterFile', maxCount: 1 }
]), adminLiveController.postAdminLive);

module.exports = router;