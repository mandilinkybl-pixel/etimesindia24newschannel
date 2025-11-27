const express = require("express");
const router = express.Router();
const upload = require("../../multer/ads");
const adsController = require("../../controller/admin/ads");
const adminAuth = require("../../middleware/admin.auth");
router.get("/",adminAuth, adsController.getAdsPage);

router.post("/create",adminAuth, upload.single("media"), adsController.createAds);
router.post("/update/:id",adminAuth, upload.single("media"), adsController.updateAds);
router.get("/delete/:id",adminAuth, adsController.deleteAds);

module.exports = router;
